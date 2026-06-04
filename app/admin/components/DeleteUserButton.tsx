"use client";

export default function DeleteUserButton({ id }: { id: string }) {
  const remove = async () => {
    if (!confirm("Delete this user? This cannot be undone.")) return;

    await fetch(`/api/admin/users/${id}/delete`, {
      method: "POST",
    });

    location.reload();
  };

  return (
    <button
      onClick={remove}
      className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-slate-200 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 text-sm transition"
    >
      Delete
    </button>
  );
}