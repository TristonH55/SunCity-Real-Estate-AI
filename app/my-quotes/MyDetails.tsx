"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Details = { firstName: string; lastName: string; email: string; phone: string };

// Name/email edit, and a mobile change that needs a new SMS code.
export default function MyDetails({ initial }: { initial: Details }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [changing, setChanging] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [phoneBusy, setPhoneBusy] = useState(false);
  const [phoneMsg, setPhoneMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/customer/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName, email: form.email }),
      });
      const data = await res.json().catch(() => ({}));
      setMsg(res.ok ? { ok: true, text: "Details saved" } : { ok: false, text: data.error || "Couldn't save." });
      if (res.ok) router.refresh();
    } catch {
      setMsg({ ok: false, text: "Couldn't save. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const sendCode = async () => {
    setPhoneBusy(true);
    setPhoneMsg(null);
    try {
      const res = await fetch("/api/customer/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "change", phone: newPhone }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setCodeSent(true);
        setPhoneMsg({ ok: true, text: "Code sent to your new mobile" });
      } else {
        setPhoneMsg({ ok: false, text: data.error || "Couldn't send the code." });
      }
    } catch {
      setPhoneMsg({ ok: false, text: "Couldn't send the code." });
    } finally {
      setPhoneBusy(false);
    }
  };

  const confirmPhone = async () => {
    setPhoneBusy(true);
    setPhoneMsg(null);
    try {
      const res = await fetch("/api/customer/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: newPhone, code }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setForm((f) => ({ ...f, phone: data.phone }));
        setChanging(false);
        setCodeSent(false);
        setNewPhone("");
        setCode("");
        setMsg({ ok: true, text: "Mobile updated" });
        router.refresh();
      } else {
        setPhoneMsg({ ok: false, text: data.error || "Couldn't update your mobile." });
      }
    } catch {
      setPhoneMsg({ ok: false, text: "Couldn't update your mobile." });
    } finally {
      setPhoneBusy(false);
    }
  };

  return (
    <div className="glass-card p-5 space-y-5">
      <h2 className="text-lg font-semibold">My details</h2>

      <form onSubmit={save} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            placeholder="First name"
            className="glass-input"
          />
          <input
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            placeholder="Last name"
            className="glass-input"
          />
        </div>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email"
          className="glass-input"
        />
        <div className="flex items-center gap-3">
          <button disabled={saving} className="btn-primary">
            {saving ? "Saving…" : "Save details"}
          </button>
          {msg && <span className={`text-sm ${msg.ok ? "text-emerald-300" : "text-red-400"}`}>{msg.text}</span>}
        </div>
      </form>

      <div className="border-t border-white/10 pt-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500">Mobile (used to log in)</p>
            <p className="font-medium">{form.phone}</p>
          </div>
          {!changing && (
            <button
              type="button"
              onClick={() => setChanging(true)}
              className="text-sm text-[#ff5a2c] font-medium hover:underline"
            >
              Change mobile
            </button>
          )}
        </div>

        {changing && (
          <div className="space-y-3 rounded-lg border border-white/10 p-4">
            <input
              type="tel"
              value={newPhone}
              onChange={(e) => {
                setNewPhone(e.target.value);
                setCodeSent(false);
              }}
              placeholder="New mobile (04xx xxx xxx)"
              className="glass-input"
            />
            {codeSent && (
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="6-digit code"
                className="glass-input tracking-[0.3em]"
              />
            )}
            <div className="flex items-center gap-3 flex-wrap">
              {codeSent ? (
                <button type="button" onClick={confirmPhone} disabled={phoneBusy || code.length < 4} className="btn-primary">
                  {phoneBusy ? "Checking…" : "Confirm new mobile"}
                </button>
              ) : (
                <button type="button" onClick={sendCode} disabled={phoneBusy || !newPhone.trim()} className="btn-primary">
                  {phoneBusy ? "Sending…" : "Send code"}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setChanging(false);
                  setCodeSent(false);
                  setNewPhone("");
                  setCode("");
                  setPhoneMsg(null);
                }}
                className="text-sm text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
            {phoneMsg && (
              <p className={`text-sm ${phoneMsg.ok ? "text-emerald-300" : "text-red-400"}`}>{phoneMsg.text}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
