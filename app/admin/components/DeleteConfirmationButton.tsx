"use client";

import { useRouter } from "next/navigation";

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
      className="text-red-400 hover:text-red-300 hover:underline"
    >
      Delete
    </button>
  );
}