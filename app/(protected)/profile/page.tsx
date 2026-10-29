import { ProfileForm } from "@/features/profile/ProfileForm";
import { requireUser } from "@/lib/strapi/guard";

export default async function ProfilePage() {
  const me = await requireUser();

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-2 text-2xl font-semibold text-slate-800 dark:text-slate-100">Το προφίλ μου</h1>
      <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
        Όνομα χρήστη: <span className="font-medium">{me.username}</span> · {me.email}
      </p>
      <ProfileForm username={me.username} fullName={me.fullName ?? ""} />
    </div>
  );
}
