# Installing Raspberry Pi Edu on a server with Apache and MariaDB

This guide sets up the whole platform on a Linux server that **already runs Apache and MariaDB**. It is written for Debian/Ubuntu (`apt`, `a2ensite`, `systemctl`). You need `sudo`.

You don't need to know anything about the project beforehand. Run the steps in order.

---

## How it fits together

```
Browser ──https──> Apache :443 ─┬─ example.gr      ──> Next.js (the site)        127.0.0.1:3000
                                └─ cms.example.gr  ──> Strapi (admin + API)      127.0.0.1:1337 ──> MariaDB
```

The project has **two parts, in two separate Git repositories**:

| Part | Repository | What it is | Installed in |
|---|---|---|---|
| Frontend | `https://github.com/JimmyChatzy/Rasp-edu-lab` | The public website (Next.js). Contains this guide and the config files in `deploy/`. | `/opt/raspedu/frontend` |
| CMS | `https://github.com/JimmyChatzy/Strapi-for-raspbEduLab` | Strapi: admin panel, API, user accounts, uploaded pictures | `/opt/raspedu/strapi` |

- **Apache** is the only public entry point. It handles HTTPS and forwards requests to the two Node.js apps.
- The two apps run as **systemd services** under their own user (`raspedu`) and listen on `127.0.0.1` only.
- **MariaDB** stores Strapi's data in its own database (`raspedu`). Your existing databases are not touched.
- Uploaded pictures are stored in `/opt/raspedu/strapi/public/uploads`. Browsers load them from `https://cms.example.gr/uploads/...`.

Your existing Apache sites keep working. This guide only **adds** two virtual hosts.

### What you need from the project owner

1. Access to the two repositories above. If they are private, you also need a GitHub account with access to them and a [personal access token](https://github.com/settings/tokens) to use as the password when cloning.
2. The **data export file** `raspedu-export.tar.gz`. It contains the scenarios, user accounts, the form layout and the uploaded pictures. It is sent separately because it contains password hashes. **Delete it once the import worked.**
3. The **two domain names**. This guide uses `example.gr` for the site and `cms.example.gr` for Strapi. **Replace them with the real names everywhere.** Both need DNS A/AAAA records pointing to this server.
4. Optionally, SMTP details for the email that goes to reviewers when a teacher submits a scenario.

---

## 1. Check the server

### 1.1 Versions and free ports

```bash
cat /etc/os-release | head -2
mariadb --version            # or: mysql --version
apache2 -v
free -h                      # RAM
df -h /opt                   # disk
sudo ss -ltnp | grep -E ':3000|:1337'   # must print nothing
```

| Requirement | Why |
|---|---|
| MariaDB **10.3 or newer**, 10.6+ recommended (10.11 / 11.x are fine) | Strapi 5 |
| **4 GB RAM**, or 2 GB plus swap (1.2) | Building the Strapi admin panel |
| About **5 GB** free disk | Code, `node_modules`, builds |
| Ports **3000 and 1337 free** | The two apps. If something already uses them, change `PORT` in step 4.1 and the port numbers in step 5.3, step 6 and both Apache files. |
| Ports 80 and 443 open from the internet | Apache, Let's Encrypt |

### 1.2 Swap (only if the server has less than 4 GB RAM)

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 1.3 Base packages

```bash
sudo apt update
sudo apt install -y curl ca-certificates gnupg git build-essential python3
```

`build-essential` and `python3` are only used when a native npm module (`sharp`, `better-sqlite3`) has no prebuilt binary for your CPU.

### 1.4 Node.js 22 LTS

The distribution's Node.js is usually too old (Next.js needs ≥ 20.9). Install Node 22 from NodeSource **system-wide** (not with `nvm`: the services run as another user and need `node` in `/usr/bin`):

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v      # v22.x
which node   # /usr/bin/node
```

If Node.js is already installed, check that `node -v` is between 20.9 and 24 and that `which node` prints `/usr/bin/node`.

---

## 2. Get the code

### 2.1 Service user

Both apps run as `raspedu`, never as root:

```bash
sudo adduser --system --group --home /opt/raspedu --shell /usr/sbin/nologin raspedu
```

### 2.2 Clone the two repositories

```bash
sudo -u raspedu git clone https://github.com/JimmyChatzy/Rasp-edu-lab.git           /opt/raspedu/frontend
sudo -u raspedu git clone https://github.com/JimmyChatzy/Strapi-for-raspbEduLab.git /opt/raspedu/strapi
sudo -u raspedu mkdir -p /opt/raspedu/strapi/public/uploads
ls /opt/raspedu    # frontend  strapi
```

If Git asks for a password, use your GitHub personal access token.

### 2.3 Copy the data export onto the server

From the machine where you have the file:

```bash
scp raspedu-export.tar.gz youruser@SERVER:/tmp/
```

Then on the server:

```bash
sudo chown raspedu:raspedu /tmp/raspedu-export.tar.gz
sudo chmod 600 /tmp/raspedu-export.tar.gz
```

---

## 3. MariaDB: database and user

MariaDB is already running, so you only add a database and a user for this app.

Generate a strong password and keep it for step 4.1:

```bash
openssl rand -base64 24
```

Log in as the MariaDB admin. On Debian/Ubuntu this is usually `sudo mariadb`. If your root account uses a password, use `mariadb -u root -p` instead.

```sql
CREATE DATABASE raspedu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'raspedu'@'localhost' IDENTIFIED BY 'STRONG-PASSWORD';
CREATE USER 'raspedu'@'127.0.0.1' IDENTIFIED BY 'STRONG-PASSWORD';
GRANT ALL PRIVILEGES ON raspedu.* TO 'raspedu'@'localhost';
GRANT ALL PRIVILEGES ON raspedu.* TO 'raspedu'@'127.0.0.1';
FLUSH PRIVILEGES;
EXIT;
```

- If a database or user named `raspedu` already exists, choose another name and use it in step 4.1 and in `deploy/backup.sh`.
- `utf8mb4` is required. Without it, Greek text turns into `???`.

Test the new login:

```bash
mariadb -u raspedu -p -h 127.0.0.1 raspedu -e "SELECT @@character_set_database, VERSION();"
# utf8mb4 | 10.x / 11.x
```

---

## 4. Strapi (CMS)

Run the commands in this section **as the `raspedu` user**:

```bash
sudo -u raspedu -s
cd /opt/raspedu/strapi
```

### 4.1 Configuration file

```bash
cp .env.example .env
chmod 600 .env
nano .env
```

Replace the whole content with the block below. Generate **each** secret with `openssl rand -base64 32`. `APP_KEYS` takes four of them, separated by commas.

```dotenv
HOST=127.0.0.1
PORT=1337
PUBLIC_URL=https://cms.example.gr
IS_PROXIED=true

APP_KEYS="secret1,secret2,secret3,secret4"
API_TOKEN_SALT=secret
ADMIN_JWT_SECRET=secret
TRANSFER_TOKEN_SALT=secret
JWT_SECRET=secret
ENCRYPTION_KEY=secret

DATABASE_CLIENT=mysql
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
DATABASE_NAME=raspedu
DATABASE_USERNAME=raspedu
DATABASE_PASSWORD=STRONG-PASSWORD

# Optional: email reviewers when a teacher submits a scenario. Leave REVIEW_NOTIFY_EMAIL empty to turn it off.
REVIEW_NOTIFY_EMAIL=
STRAPI_ADMIN_URL=https://cms.example.gr
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

Notes:

- `DATABASE_CLIENT=mysql` is correct for MariaDB.
- For email: `REVIEW_NOTIFY_EMAIL` takes one or more addresses, comma-separated. `SMTP_FROM` usually has to equal `SMTP_USER`. With Gmail, use an App Password (Google Account → Security → App passwords) as `SMTP_PASS`. If your provider only offers port 465, add `secure: true` next to `host` in `config/plugins.ts`.

### 4.2 Install and build

```bash
npm ci
NODE_ENV=production npm run build
```

The build takes a few minutes, longer on a Raspberry Pi. If it is killed or reports "heap out of memory", add swap (1.2).

### 4.3 Import the data

```bash
NODE_ENV=production npx strapi import -f /tmp/raspedu-export.tar.gz --force
```

Strapi creates all tables in the `raspedu` database and fills them. `--force` skips the "this deletes existing data" question. The database is empty, so nothing is lost.

When it finishes, delete the export: `rm /tmp/raspedu-export.tar.gz`.

Leave the `raspedu` shell:

```bash
exit
```

### 4.4 Start Strapi as a service

```bash
sudo cp /opt/raspedu/frontend/deploy/systemd/raspedu-strapi.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now raspedu-strapi
sudo systemctl status raspedu-strapi
curl -s http://127.0.0.1:1337/_health -o /dev/null -w '%{http_code}\n'   # 204
```

The first start can take about 30 seconds. Logs: `journalctl -u raspedu-strapi -f`.

### 4.5 Create the admin account (do this right away)

The export does **not** contain admin panel accounts. Until an admin exists, **anyone** who opens `/admin` can register as the first one. Create it now:

```bash
cd /opt/raspedu/strapi
sudo -u raspedu NODE_ENV=production npx strapi admin:create-user \
  --firstname Όνομα --lastname Επώνυμο --email admin@example.gr
```

It asks for the password.

### 4.6 Check the imported data

```bash
# published scenarios (the public list): JSON with a "data" array
curl -s 'http://127.0.0.1:1337/api/scenario-designs' | head -c 300; echo
# the scenario form: must contain "fields" and a non-empty "tabs" list
curl -s 'http://127.0.0.1:1337/api/scenario-design/schema/gol1wvlw5o4paor1719wo41w' | head -c 300; echo
```

If the second call returns "not found", the form entry has a different id. Open the admin later (step 7), go to Content Manager → ScenarioDesign → the entry "Raspberry PI για μικράκια", copy the id from the address bar, and use it as `SCENARIO_SCHEMA_ID` in step 5.1.

---

## 5. Frontend (Next.js)

```bash
sudo -u raspedu -s
cd /opt/raspedu/frontend
```

### 5.1 Configuration file

```bash
cp .env.example .env.local
chmod 600 .env.local
nano .env.local
```

```dotenv
STRAPI_URL=http://127.0.0.1:1337
NEXT_PUBLIC_STRAPI_URL=https://cms.example.gr
SCENARIO_SCHEMA_ID=gol1wvlw5o4paor1719wo41w
```

| Variable | Meaning |
|---|---|
| `STRAPI_URL` | How the site talks to Strapi on the server itself. Keep `127.0.0.1`. |
| `NEXT_PUBLIC_STRAPI_URL` | The public Strapi address that browsers use for pictures. It is written into the JavaScript **at build time**: after changing it, build again (5.2) and restart. |
| `SCENARIO_SCHEMA_ID` | The id of the entry that holds the scenario form (see 4.6). |

### 5.2 Install and build

```bash
npm ci
npm run build
exit
```

### 5.3 Start the site as a service

```bash
sudo cp /opt/raspedu/frontend/deploy/systemd/raspedu-frontend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now raspedu-frontend
sudo systemctl status raspedu-frontend
curl -s http://127.0.0.1:3000/ -o /dev/null -w '%{http_code}\n'   # 200
```

Logs: `journalctl -u raspedu-frontend -f`.

---

## 6. Apache

### 6.1 Enable the proxy modules

Enabling a module that is already on does no harm:

```bash
sudo a2enmod proxy proxy_http headers ssl rewrite
```

### 6.2 Add the two sites

```bash
sudo cp /opt/raspedu/frontend/deploy/apache/raspedu-frontend.conf /etc/apache2/sites-available/
sudo cp /opt/raspedu/frontend/deploy/apache/raspedu-cms.conf      /etc/apache2/sites-available/
sudo nano /etc/apache2/sites-available/raspedu-frontend.conf   # ServerName / ServerAlias -> your site domain
sudo nano /etc/apache2/sites-available/raspedu-cms.conf        # ServerName -> your CMS domain

sudo a2ensite raspedu-frontend raspedu-cms
sudo apache2ctl configtest     # must print "Syntax OK"
sudo systemctl reload apache2
```

- **Leave your existing sites enabled.** Apache chooses the site by domain name (`ServerName`), so the new sites do not affect the old ones. Make sure no existing site already uses the same `ServerName`.
- Do not remove `ProxyPreserveHost On`. The site's forms (login, saving a scenario, profile) compare the browser's `Origin` with the `Host` header and fail without it.
- `X-Forwarded-Proto` tells Strapi that the request came over HTTPS. Its admin login needs this.
- **Without subdomains:** both apps need their own (sub)domain. Running Strapi under a path such as `example.gr/cms` is not supported by this setup.

### 6.3 HTTPS with Let's Encrypt

HTTPS is **required**. In production the login cookie is marked `Secure`, so logging in on the site does not work over plain http.

DNS for both domains must already point to the server:

```bash
sudo apt install -y certbot python3-certbot-apache   # skip if certbot is already installed
sudo certbot --apache -d example.gr -d www.example.gr -d cms.example.gr
sudo certbot renew --dry-run
```

Choose **redirect** when asked. Certbot creates the `:443` copies of both sites, including the proxy settings, and renews the certificates automatically.

If you already have your own certificates, create `<VirtualHost *:443>` blocks yourself instead. Copy everything inside the `:80` blocks and add your `SSLEngine on` / `SSLCertificateFile` / `SSLCertificateKeyFile` lines.

---

## 7. Final checks

| Check | Expected |
|---|---|
| `https://example.gr` | Homepage with the published scenarios and their pictures |
| Click a scenario | Detail page with "Συγγραφέας", text and pictures |
| `https://cms.example.gr/admin` | Strapi login. Log in with the admin from 4.5. |
| Log in on the site with an existing account (ask the project owner for a test account) | Dashboard "Τα σενάρια μου" lists that user's scenarios |
| Register a new account on the site, then create a scenario and upload a picture in a text field | Saved, picture visible |
| Dashboard → submit → in the admin set `reviewStatus` to published | Scenario appears on the homepage |
| Profile page → set full name | Name shows in the navbar and as author |
| `sudo reboot`, wait, open the site | Everything starts by itself |

---

## 8. Backups

The database and the uploads folder belong together. Back up both.

```bash
sudo cp /opt/raspedu/frontend/deploy/backup.sh /usr/local/bin/raspedu-backup
sudo chmod 750 /usr/local/bin/raspedu-backup
sudo /usr/local/bin/raspedu-backup          # test run
ls -lh /var/backups/raspedu
```

The script runs as root and logs in to MariaDB through the unix socket, which is the Debian default. **If your MariaDB root uses a password**, create `/root/.my.cnf` (mode 600) so the script can log in:

```ini
[client]
user=root
password=ROOT-PASSWORD
```

Schedule it nightly with `sudo crontab -e`:

```
30 3 * * * /usr/local/bin/raspedu-backup
```

It keeps 14 days of backups in `/var/backups/raspedu`. Copy them off the server too: a backup on the same disk does not survive a disk failure. If your server already has a backup system, just include the database `raspedu` and the folder `/opt/raspedu/strapi/public/uploads`.

**Restore:**

```bash
sudo systemctl stop raspedu-frontend raspedu-strapi
gunzip -c /var/backups/raspedu/db_YYYY-MM-DD_HHMM.sql.gz | sudo mariadb raspedu
sudo rm -rf /opt/raspedu/strapi/public/uploads
sudo tar -xzf /var/backups/raspedu/uploads_YYYY-MM-DD_HHMM.tar.gz -C /opt/raspedu/strapi/public
sudo chown -R raspedu:raspedu /opt/raspedu/strapi/public/uploads
sudo systemctl start raspedu-strapi raspedu-frontend
```

---

## 9. Updating to a new version

Run a backup first. Then:

```bash
sudo -u raspedu -s

cd /opt/raspedu/strapi
git pull
npm ci
NODE_ENV=production npm run build

cd /opt/raspedu/frontend
git pull
npm ci
npm run build

exit
sudo systemctl restart raspedu-strapi raspedu-frontend
```

If `deploy/` changed, copy the changed files again (step 4.4, 5.3 or 6.2).

When the content types change, Strapi updates the database tables by itself on startup. In production the Content-Type Builder is disabled: **fields are changed by the developers**, not on the server. Content, the form's tab layout and the field labels can be edited in the production admin.

---

## 10. Troubleshooting

| Symptom | Cause and fix |
|---|---|
| `502 Bad Gateway` / `503 Service Unavailable` | The app behind Apache is down: `systemctl status raspedu-strapi raspedu-frontend`, then `journalctl -u raspedu-strapi -n 100`. |
| Strapi: `ER_ACCESS_DENIED` | Wrong `DATABASE_*` values in `/opt/raspedu/strapi/.env`, or the user from step 3 is missing. |
| Strapi: `ECONNREFUSED 127.0.0.1:3306` | MariaDB is down, or listens only on a socket/other port: `systemctl status mariadb`, check `port` / `skip-networking` in `/etc/mysql/`. |
| Strapi: `EADDRINUSE` | Port 1337 (or 3000 for the frontend) is taken. See 1.1. |
| Service fails with `status=203/EXEC` | `node` is not in `/usr/bin` (e.g. installed with nvm). Install it as in 1.4. |
| Build killed / "JavaScript heap out of memory" | Not enough RAM: add swap (1.2). |
| Pictures broken on the site | `NEXT_PUBLIC_STRAPI_URL` is wrong, or was changed without rebuilding the frontend (5.2). |
| Forms fail, the log shows an Origin/Host mismatch | `ProxyPreserveHost On` is missing in the Apache site. |
| Login on the site does nothing | The site is served over http: finish 6.3. |
| Admin login loops back to the login page | `IS_PROXIED=true` or `PUBLIC_URL` missing in `strapi/.env`, or `X-Forwarded-Proto` missing in Apache. |
| Upload fails with "Request Entity Too Large" | Raise `LimitRequestBody` in `raspedu-cms.conf` (default there: 100 MB). |
| "Failed to find Server Action" right after an update | The browser still has the old page open: reload it. |
| The scenario form shows only the Save button | The form entry has no tabs or the id is wrong: see 4.6 and `SCENARIO_SCHEMA_ID`. |
| Greek text shows as `???` | The database was not created with `utf8mb4` (step 3). |
| Opening the domain shows another site | `ServerName` in the new site file doesn't match the domain, or another site uses the same name: `sudo apache2ctl -S`. |
