# Deploying to Debian 12 with Apache and MariaDB

This guide installs the whole platform on one Debian 12 (bookworm) server:

```
Browser ──https──> Apache :443 ─┬─ example.gr      ──> Next.js  127.0.0.1:3000
                                └─ cms.example.gr  ──> Strapi   127.0.0.1:1337 ──> MariaDB 127.0.0.1:3306
```

- **Apache** is the only public entry point. It handles HTTPS (Let's Encrypt) and forwards requests.
- **Next.js** (the site) and **Strapi** (admin panel, API, uploaded files) run as systemd services and listen on localhost only.
- **MariaDB** stores the Strapi data. Uploaded files live in `strapi/public/uploads`.
- The browser loads pictures directly from `https://cms.example.gr/uploads/...`. All other calls go from Next.js to Strapi on the server.

Replace `example.gr` and `cms.example.gr` with your real domain everywhere below. The commands run as a user with `sudo` unless they say otherwise.

Ready-made config files are in [`deploy/`](deploy/):

| File | Goes to |
|---|---|
| `deploy/apache/raspedu-frontend.conf` | `/etc/apache2/sites-available/` |
| `deploy/apache/raspedu-cms.conf` | `/etc/apache2/sites-available/` |
| `deploy/systemd/raspedu-strapi.service` | `/etc/systemd/system/` |
| `deploy/systemd/raspedu-frontend.service` | `/etc/systemd/system/` |
| `deploy/backup.sh` | `/usr/local/bin/raspedu-backup` |

---

## 0. Requirements

- Debian 12, x86-64 or arm64. A Raspberry Pi 4/5 with Raspberry Pi OS (bookworm) works too, but the builds are slow.
- **At least 4 GB RAM** for building the Strapi admin panel, or 2 GB plus swap (step 2.4).
- About 5 GB of free disk space.
- Two DNS **A records** pointing to the server: `example.gr` (and `www.example.gr` if you want it) and `cms.example.gr`.
- Ports 80 and 443 open towards the server.

---

## 1. On your development machine

### 1.1 Export the Strapi data

The export carries scenarios, tab layouts, website users with their roles and permissions, media files and the Content Manager settings (field labels, sizes, layouts the scenario form reads). It does **not** carry admin panel accounts, so you create a new admin on the server (step 6.5).

```bash
cd raspberry-pi-edu/strapi
npx strapi export --no-encrypt -f raspedu-export
# creates raspedu-export.tar.gz
```

> The export contains password hashes of the website users. Delete the file from both machines when the migration is done.

### 1.2 Get the code onto the server

**Important:** in the GitHub repository, `strapi/` is a *gitlink*: a pointer to a separate local git repository with no remote. A `git clone` of the GitHub repository gives an **empty `strapi` folder**. Use one of these:

**Option A: copy the folder with rsync (simplest)**

```bash
cd raspberry-pi-edu/..
rsync -az --info=progress2 \
  --exclude node_modules --exclude .next \
  --exclude strapi/node_modules --exclude strapi/dist --exclude strapi/.tmp \
  --exclude strapi/.cache --exclude strapi/.strapi --exclude strapi/build \
  --exclude strapi/public/uploads \
  --exclude .env --exclude .env.local --exclude strapi/.env \
  --exclude local.db \
  raspberry-pi-edu/ youruser@SERVER:/tmp/raspedu/
scp raspberry-pi-edu/strapi/raspedu-export.tar.gz youruser@SERVER:/tmp/
```

The uploads are excluded because they travel inside the export.

**Option B: fix the repository (better long term)**

Push `strapi/` to its own GitHub repository and register it as a real submodule (`git submodule add <url> strapi`), or remove the gitlink and commit the Strapi files into the main repository. Then the server can `git clone --recurse-submodules` and updates become a `git pull`.

---

## 2. Prepare the server

### 2.1 Base packages

```bash
sudo apt update && sudo apt full-upgrade -y
sudo apt install -y curl ca-certificates gnupg git build-essential python3 ufw rsync
```

`build-essential` and `python3` are only needed if a native npm module (e.g. `better-sqlite3`, `sharp`) has no prebuilt binary for your CPU.

### 2.2 Node.js 22 LTS

Debian 12 ships Node 18, which is too old (Next.js 16 needs ≥ 20.9). Install Node 22 from NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # v22.x
npm -v
```

### 2.3 A dedicated system user

The apps run as `raspedu`, never as root:

```bash
sudo adduser --system --group --home /opt/raspedu --shell /usr/sbin/nologin raspedu
```

### 2.4 Swap (only if the server has less than 4 GB RAM)

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 2.5 Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'WWW Full'      # 80 + 443
sudo ufw enable
sudo ufw status
```

Ports 3000, 1337 and 3306 stay closed: the services listen on 127.0.0.1 only.

---

## 3. MariaDB

### 3.1 Install and secure

Debian 12 ships MariaDB 10.11, which Strapi 5 supports.

```bash
sudo apt install -y mariadb-server
sudo mariadb-secure-installation
```

Answers: current root password: *Enter*; switch to unix_socket authentication: **n** (it is already used on Debian); change root password: **n**; remove anonymous users: **Y**; disallow root login remotely: **Y**; remove test database: **Y**; reload privileges: **Y**.

Debian's MariaDB listens on 127.0.0.1 only by default (`bind-address` in `/etc/mysql/mariadb.conf.d/50-server.cnf`). Leave it that way.

### 3.2 Database and user

Choose a strong password (e.g. `openssl rand -base64 24`) and keep it for step 6.1.

```bash
sudo mariadb
```

```sql
CREATE DATABASE raspedu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'raspedu'@'localhost' IDENTIFIED BY 'STRONG-PASSWORD';
CREATE USER 'raspedu'@'127.0.0.1' IDENTIFIED BY 'STRONG-PASSWORD';
GRANT ALL PRIVILEGES ON raspedu.* TO 'raspedu'@'localhost';
GRANT ALL PRIVILEGES ON raspedu.* TO 'raspedu'@'127.0.0.1';
FLUSH PRIVILEGES;
EXIT;
```

`utf8mb4` is required for Greek text and emoji. The two user entries cover connections through `localhost` and `127.0.0.1`.

Test the login:

```bash
mariadb -u raspedu -p -h 127.0.0.1 raspedu -e "SELECT @@character_set_database, VERSION();"
```

---

## 4. Apache

### 4.1 Install and enable the proxy modules

```bash
sudo apt install -y apache2
sudo a2enmod proxy proxy_http headers ssl rewrite
```

### 4.2 Add the two sites

Copy the files from `deploy/apache/` (after step 5 they are in `/opt/raspedu/deploy/apache/`), then **edit `ServerName`/`ServerAlias`** to your domains:

```bash
sudo cp /opt/raspedu/deploy/apache/raspedu-frontend.conf /etc/apache2/sites-available/
sudo cp /opt/raspedu/deploy/apache/raspedu-cms.conf      /etc/apache2/sites-available/
sudo nano /etc/apache2/sites-available/raspedu-frontend.conf
sudo nano /etc/apache2/sites-available/raspedu-cms.conf

sudo a2dissite 000-default
sudo a2ensite raspedu-frontend raspedu-cms
sudo apache2ctl configtest     # must print "Syntax OK"
sudo systemctl reload apache2
```

Two settings matter for this app:

- `ProxyPreserveHost On`: Next.js Server Actions (saving a scenario, login, profile) compare the browser's `Origin` with the `Host` header. Without it every form fails.
- `X-Forwarded-Proto`: tells Strapi the request came over HTTPS, so its admin login cookies work.

You add HTTPS in step 8, once the apps are running.

---

## 5. Put the code in place

```bash
sudo rsync -a /tmp/raspedu/ /opt/raspedu/
sudo mkdir -p /opt/raspedu/strapi/public/uploads
sudo chown -R raspedu:raspedu /opt/raspedu
```

(With option B in step 1.2, run `sudo -u raspedu git clone --recurse-submodules <repo-url> /opt/raspedu` instead.)

From here on, build commands run **as the `raspedu` user**:

```bash
sudo -u raspedu -s
cd /opt/raspedu
```

---

## 6. Strapi

### 6.1 Configuration file

```bash
cd /opt/raspedu/strapi
cp .env.example .env
chmod 600 .env
nano .env
```

Generate each secret with `openssl rand -base64 32`. `APP_KEYS` takes four of them, separated by commas. **Use new secrets on the server**, not the ones from your development machine.

```dotenv
HOST=127.0.0.1
PORT=1337
PUBLIC_URL=https://cms.example.gr
IS_PROXIED=true

APP_KEYS="key1,key2,key3,key4"
API_TOKEN_SALT=...
ADMIN_JWT_SECRET=...
TRANSFER_TOKEN_SALT=...
JWT_SECRET=...
ENCRYPTION_KEY=...

DATABASE_CLIENT=mysql
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
DATABASE_NAME=raspedu
DATABASE_USERNAME=raspedu
DATABASE_PASSWORD=STRONG-PASSWORD

# Optional: email the reviewer when a teacher submits a scenario
REVIEW_NOTIFY_EMAIL=reviewer@example.gr
STRAPI_ADMIN_URL=https://cms.example.gr
SMTP_HOST=smtp.example.gr
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=no-reply@example.gr
```

> Changing `JWT_SECRET` later logs every website user out. That is harmless: they log in again.

### 6.2 Install and build

```bash
npm ci
NODE_ENV=production npm run build
```

The build compiles the TypeScript and the admin panel and takes a few minutes.

### 6.3 Import the data

```bash
NODE_ENV=production npx strapi import -f /tmp/raspedu-export.tar.gz --force
```

On the first run Strapi creates all tables in MariaDB, then fills them. `--force` skips the "this deletes existing data" question; the database is empty anyway.

### 6.4 Start Strapi as a service

Leave the `raspedu` shell (`exit`), then:

```bash
sudo cp /opt/raspedu/deploy/systemd/raspedu-strapi.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now raspedu-strapi
sudo systemctl status raspedu-strapi
curl -s http://127.0.0.1:1337/_health -o /dev/null -w '%{http_code}\n'   # 204
```

Logs: `journalctl -u raspedu-strapi -f`.

At startup Strapi grants the API permissions the app needs (see `strapi/src/index.ts`).

### 6.5 Create the admin account (do this immediately)

Until an admin exists, **anyone** who opens `/admin` can register as the first admin. Create it from the command line before going public:

```bash
cd /opt/raspedu/strapi
sudo -u raspedu NODE_ENV=production npx strapi admin:create-user \
  --firstname Όνομα --lastname Επώνυμο --email admin@example.gr
```

It asks for the password. (Passing `--password` also works, but leaves it in your shell history.)

### 6.6 Check the imported data

```bash
# published scenarios (the public list)
curl -s 'http://127.0.0.1:1337/api/scenario-designs' | head -c 300; echo
# the form schema and its tabs
curl -s "http://127.0.0.1:1337/api/scenario-design/schema/gol1wvlw5o4paor1719wo41w" | head -c 300; echo
```

The second call must return `fields` **and** a non-empty `tabs` list. If it says not found, the schema entry has a different `documentId`: open the admin → Content Manager → ScenarioDesign → the "Raspberry PI για μικράκια" entry, copy the id from the address bar, and use it as `SCENARIO_SCHEMA_ID` in step 7.1.

---

## 7. Next.js frontend

### 7.1 Configuration file

```bash
sudo -u raspedu -s
cd /opt/raspedu
cp .env.example .env.local
chmod 600 .env.local
nano .env.local
```

```dotenv
STRAPI_URL=http://127.0.0.1:1337
NEXT_PUBLIC_STRAPI_URL=https://cms.example.gr
SCENARIO_SCHEMA_ID=gol1wvlw5o4paor1719wo41w
```

`NEXT_PUBLIC_STRAPI_URL` is written into the JavaScript **at build time**. If you change it, build again (7.2).

### 7.2 Install and build

```bash
npm ci
npm run build
exit
```

### 7.3 Start the site as a service

```bash
sudo cp /opt/raspedu/deploy/systemd/raspedu-frontend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now raspedu-frontend
sudo systemctl status raspedu-frontend
curl -s http://127.0.0.1:3000/ -o /dev/null -w '%{http_code}\n'   # 200
```

Logs: `journalctl -u raspedu-frontend -f`.

---

## 8. HTTPS with Let's Encrypt

DNS must already point to the server.

```bash
sudo apt install -y certbot python3-certbot-apache
sudo certbot --apache -d example.gr -d www.example.gr -d cms.example.gr
```

Choose **redirect** when asked. Certbot creates the `:443` versions of both sites (copying the proxy settings) and renews the certificates automatically. Test the renewal:

```bash
sudo certbot renew --dry-run
```

HTTPS is **required**: in production the login cookie is marked `Secure`, so logging in does not work over plain http.

---

## 9. Final checks

| Check | Expected |
|---|---|
| `https://example.gr` | Homepage with the published scenarios and their pictures |
| Click a scenario | Detail page with "Συγγραφέας", text and pictures |
| `https://cms.example.gr/admin` | Strapi login; log in with the admin from 6.5 |
| Log in on the site with an existing account | Dashboard "Τα σενάρια μου" lists that user's scenarios |
| New scenario → upload a picture in a rich-text field → save | Saved, picture visible, size buttons work |
| Dashboard → submit → approve in the admin (reviewStatus = published) | Scenario appears on the homepage |
| Profile page → set full name | Name shows in the navbar and as author |

---

## 10. Backups

The database and the uploads folder must be backed up together.

```bash
sudo cp /opt/raspedu/deploy/backup.sh /usr/local/bin/raspedu-backup
sudo chmod 750 /usr/local/bin/raspedu-backup
sudo /usr/local/bin/raspedu-backup          # test run
ls -lh /var/backups/raspedu
sudo crontab -e
# add:
30 3 * * * /usr/local/bin/raspedu-backup
```

It keeps 14 days of backups in `/var/backups/raspedu`. Copy them off the server too (another machine, cloud storage): a backup on the same disk does not survive a disk failure.

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

## 11. Updating the site later

```bash
# 1. bring the new code (rsync as in 1.2, or git pull with option B)
sudo chown -R raspedu:raspedu /opt/raspedu

# 2. rebuild
sudo -u raspedu -s
cd /opt/raspedu/strapi && npm ci && NODE_ENV=production npm run build
cd /opt/raspedu && npm ci && npm run build
exit

# 3. restart
sudo systemctl restart raspedu-strapi raspedu-frontend
```

Run a backup first. Strapi updates the database tables itself on startup when the content types changed.

**Schema changes happen in development only.** In production the Strapi Content-Type Builder is disabled. Add or change fields on your machine (`npm run develop`), then deploy the code. Content, the tab layout and the Content Manager labels are edited directly in the production admin.

---

## 12. Troubleshooting

| Symptom | Cause and fix |
|---|---|
| `502 Bad Gateway` | The service behind Apache is down: `systemctl status raspedu-strapi raspedu-frontend`, then `journalctl -u ...`. |
| Strapi does not start: `ER_ACCESS_DENIED` | Wrong `DATABASE_*` values in `strapi/.env`, or the MariaDB user from 3.2 is missing. |
| Strapi does not start: `ECONNREFUSED 127.0.0.1:3306` | MariaDB is down: `systemctl status mariadb`. |
| Build killed / "JavaScript heap out of memory" | Not enough RAM: add swap (2.4). |
| Pictures broken on the site | `NEXT_PUBLIC_STRAPI_URL` is wrong or was changed without rebuilding the frontend. |
| Forms fail, logs show an Origin/Host mismatch | `ProxyPreserveHost On` missing in the Apache site. |
| Login on the site does nothing | The site is served over http: finish step 8. |
| Admin login loops back to the login page | `IS_PROXIED=true` or `PUBLIC_URL` missing in `strapi/.env`, or `X-Forwarded-Proto` missing in Apache. |
| "Failed to find Server Action" right after an update | The browser has the old page open: reload it. |
| The scenario form shows only the Save button | The schema has no tabs: check 6.6 and `SCENARIO_SCHEMA_ID`. |
| Greek text turns into `???` | The database was not created with `utf8mb4` (3.2). |
