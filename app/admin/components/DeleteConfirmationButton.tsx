"use client";

import { useRouter } from "next/navigation";
import AdminIcon from "./AdminIcon";

export default function DeleteConfirmationButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    const confirmDelete = confirm(
      "Are you sure you want to delete this confirmation?"
    );

    if (!confirmDelete) return;

    await fetch(`/api/admin/delete-confirmation/${id}`, {
      method: "DELETE",
      credentials: "include", // 🔥 REQUIRED
    });

    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-200 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 text-xs font-semibold transition"
    >
      <AdminIcon name="trash" size={14} />
      Delete
    </button>
  );
}