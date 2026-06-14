import Link from "next/link";
import { notFound } from "next/navigation";
import CommentForm from "@/components/CommentForm";
import CommentList from "@/components/CommentList";
import ImageGallery from "@/components/ImageGallery";
import { getSession } from "@/lib/auth";
import { getCommentsByScenarioId, getScenarioById } from "@/lib/data";

interface ScenarioPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(value: string | undefined) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("el-GR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function ScenarioPage({ params }: ScenarioPageProps) {
  const { id } = await params;
  const scenario = await getScenarioById(id);

  if (!scenario) {
    notFound();
  }

  const [comments, session] = await Promise.all([
    getCommentsByScenarioId(id),
    getSession(),
  ]);

  return (
    <div>
      <Link href="/" className="mb-4 inline-block text-sm text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300">
        ← Επιστροφή στη λίστα
      </Link>

      <article className="mb-8 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-3 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-800 dark:text-slate-300">Τάξη {scenario.gradeLevel}</span>
          <span className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-800 dark:text-slate-300">
            Δυσκολία {scenario.difficulty}/5
          </span>
          <span className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-800 dark:text-slate-300">
            {scenario.duration} λεπτά
          </span>
          <span className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-800 dark:text-slate-300">
            {formatDate(scenario.createdAt)}
          </span>
        </div>

        <h1 className="mb-3 text-2xl font-semibold text-slate-800 dark:text-slate-100">
          {scenario.title}
        </h1>
        <p className="mb-4 text-slate-600 dark:text-slate-400">{scenario.description}</p>

        <div className="mb-4 flex flex-wrap gap-2">
          {scenario.subjects.map((subject) => (
            <span
              key={subject}
              className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              {subject}
            </span>
          ))}
        </div>

        {scenario.authorName && (
          <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Από: {scenario.authorName}</p>
        )}

        {scenario.images && scenario.images.length > 0 && (
          <section className="border-t border-slate-100 pt-4 dark:border-slate-700">
            <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Εικόνες</h2>
            <ImageGallery images={scenario.images} />
          </section>
        )}

        <section className="space-y-4 border-t border-slate-100 pt-4 dark:border-slate-700">
          <div>
            <h2 className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-300">Εξοπλισμός</h2>
            <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-400">
              {scenario.equipment}
            </p>
          </div>
          <div>
            <h2 className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Σύνδεση με πρόγραμμα σπουδών
            </h2>
            <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-400">
              {scenario.curriculumConnection}
            </p>
          </div>
          <div>
            <h2 className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-300">Ιδέα</h2>
            <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-400">{scenario.idea}</p>
          </div>
          <div>
            <h2 className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Περιεχόμενο / Βήματα
            </h2>
            <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-400">
              {scenario.content}
            </p>
          </div>
        </section>
      </article>

      <section className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">Σχόλια</h2>
        <div className="mb-6">
          <CommentList comments={comments} />
        </div>
        <CommentForm
          scenarioId={scenario.id}
          isLoggedIn={Boolean(session)}
          userName={session?.name}
        />
      </section>
    </div>
  );
}
