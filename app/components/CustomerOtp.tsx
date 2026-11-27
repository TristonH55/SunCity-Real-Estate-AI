"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { MAX_CODE_RESENDS } from "@/lib/customer";

// Public customer sign up / log in: details → SMS code → logged in.
// Resend: available straight away, max 2; then "Start again" goes back to the
// first screen with the details kept. Codes are SMS only.
export default function CustomerOtp({ mode }: { mode: "signup" | "login" }) {
  const [step, setStep] = useState<"details" | "code">("details");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [resends, setResends] = useState(0);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const sendCode = async (): Promise<boolean> => {
    setError(null);
    setErrorCode(null);
    setInfo(null);
    setBusy(true);
    try {
      const res = await fetch("/api/customer/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, phone, email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Couldn't send the code. Please try again.");
        setErrorCode(data.code ?? null);
        return false;
      }
      return true;
    } catch {
      setError("Couldn't send the code. Please try again.");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const submitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signup" && (!firstName.trim() || !lastName.trim())) {
      setError("Please enter your first and last name.");
      return;
    }
    if (await sendCode()) {
      setCode("");
      setResends(0);
      setStep("code");
    }
  };

  const resend = async () => {
    if (resends >= MAX_CODE_RESENDS) return;
    if (await sendCode()) {
      setResends((n) => n + 1);
      setInfo("New code sent");
    }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    const res = await signIn("customer-otp", {
      mode,
      phone,
      code: code.trim(),
      firstName,
      lastName,
      email,
      redirect: false,
    });
    if (!res || !res.ok) {
      setBusy(false);
      setError("That code isn't right or has expired. Please check it and try again.");
      return;
    }
    // Full load so the new login is picked up everywhere.
    window.location.href = "/pricing";
  };

  const backToDetails = () => {
    setStep("details");
    setError(null);
    setInfo(null);
    setCode("");
  };

  if (step === "code") {
    return (
      <form onSubmit={verify} className="space-y-5">
        <p className="text-sm text-slate-300">
          We&apos;ve texted a 6-digit code to <strong className="text-white">{phone}</strong>.
        </p>
        {error && <ErrorBox>{error}</ErrorBox>}
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="6-digit code"
          required
          autoFocus
          className="glass-input text-center text-2xl tracking-[0.5em]"
        />
        <button disabled={busy || code.length < 4} className="btn-primary w-full">
          {busy ? "Checking…" : mode === "signup" ? "Verify & create account" : "Log in"}
        </button>

        <div className="flex items-center justify-between text-sm">
          {resends < MAX_CODE_RESENDS ? (
            <button
              type="button"
              onClick={resend}
              disabled={busy}
              className="text-[#ff5a2c] font-medium hover:underline disabled:opacity-50"
            >
              Resend code
            </button>
          ) : (
            <span className="text-slate-400">
              Didn&apos;t get the code?{" "}
              <button
                type="button"
                onClick={backToDetails}
                className="text-[#ff5a2c] font-medium hover:underline"
              >
                Start again
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={backToDetails}
            className="text-slate-400 hover:text-white hover:underline"
          >
            Wrong number? Change it
          </button>
        </div>
        {info && <p className="text-sm text-emerald-300">{info}</p>}
      </form>
    );
  }

  return (
    <form onSubmit={submitDetails} className="space-y-5">
      {error && (
        <ErrorBox>
          {error}
          {errorCode === "exists" && (
            <>
              {" "}
              <Link href="/login?customer=1" className="underline font-semibold">
                Log in
              </Link>
            </>
          )}
          {errorCode === "missing" && (
            <>
              {" "}
              <Link href="/signup" className="underline font-semibold">
                Sign up
              </Link>
            </>
          )}
        </ErrorBox>
      )}
      {mode === "signup" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              autoComplete="given-name"
              required
              className="glass-input"
            />
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              autoComplete="family-name"
              required
              className="glass-input"
            />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            required
            className="glass-input"
          />
        </>
      )}
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Mobile (04xx xxx xxx)"
        autoComplete="tel"
        inputMode="tel"
        required
        className="glass-input"
      />
      <button disabled={busy} className="btn-primary w-full">
        {busy ? "Sending…" : "Send code"}
      </button>
      <p className="text-xs text-slate-500 text-center">
        We&apos;ll text you a 6-digit code to confirm your mobile.
      </p>
    </form>
  );
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
      {children}
    </p>
  );
}
