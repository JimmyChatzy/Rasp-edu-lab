import Link from "next/link";
import { notFound } from "next/navigation";
import CommentForm from "@/components/CommentForm";
import CommentList from "@/components/CommentList";
import ImageGallery from "@/components/ImageGallery";
import RichTextDisplay from "@/components/renderer/fields/RichTextDisplay";
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
        <RichTextDisplay content={scenario.description} className="mb-4" />

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

        {scenario.tinkercadLink && (
          <section className="border-t border-slate-100 pt-4 dark:border-slate-700">
            <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Tinkercad</h2>
            <a
              href={scenario.tinkercadLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded bg-blue-700 px-4 py-2 text-sm text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Άνοιγμα κυκλώματος στο Tinkercad ↗
            </a>
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
            <RichTextDisplay content={scenario.curriculumConnection ?? ""} />
          </div>
          <div>
            <h2 className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-300">Ιδέα</h2>
            <RichTextDisplay content={scenario.idea} />
          </div>
          <div>
            <h2 className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Περιεχόμενο / Βήματα
            </h2>
            <RichTextDisplay content={scenario.content} />
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
