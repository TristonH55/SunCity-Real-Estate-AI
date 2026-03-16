"use client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);

    const res = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    // if (res?.error) {
    //   setError("Invalid credentials or account not approved");
    //   setLoading(false);
    //   return;
    // }
    ///new
    if (!res || !res.ok) {
      setError("Invalid credentials or account not approved");
      setLoading(false);
      return;
    }
    
    router.replace("/pricing");
    
    // refresh session then redirect
    router.replace("/pricing");
    router.refresh();



    router.push("/pricing");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-gray-900">Sign in</h1>

        {error && <p className="text-red-600">{error}</p>}

        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full border border-gray-300 p-3 rounded text-gray-900 placeholder-gray-500"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="w-full border border-gray-300 p-3 rounded text-gray-900 placeholder-gray-500"
        />

        <button
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded font-semibold hover:bg-gray-800 transition"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <p className="text-sm text-gray-700 text-center pt-2">
          Don’t have an account?{" "}
          <Link
            href="/register"
            className="text-blue-600 font-medium hover:underline"
          >
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
}
