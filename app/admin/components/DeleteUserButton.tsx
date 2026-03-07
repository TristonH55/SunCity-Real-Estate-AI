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
      className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-red-700 text-sm"
    >
      Delete
    </button>
  );
}