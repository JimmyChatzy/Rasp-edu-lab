import type { Comment } from "@/lib/types";

interface CommentListProps {
  comments: Comment[];
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("el-GR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Δεν υπάρχουν σχόλια ακόμα. Συνδεθείτε για να αφήσετε σχόλιο.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {comments.map((comment) => (
        <li
          key={comment.id}
          className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="mb-2 flex items-center justify-between gap-2 text-sm">
            <span className="font-medium text-slate-800 dark:text-slate-200">{comment.authorName}</span>
            <time className="text-slate-500 dark:text-slate-400">{formatDate(comment.createdAt)}</time>
          </div>
          <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{comment.text}</p>
        </li>
      ))}
    </ul>
  );
}
