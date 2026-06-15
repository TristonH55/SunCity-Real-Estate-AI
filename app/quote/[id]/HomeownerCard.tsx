"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomeownerCard({
  quoteId,
  name,
  address,
  phone: initialPhone,
  email: initialEmail,
}: {
  quoteId: string;
  name: string;
  address: string;
  phone: string;
  email: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail || "");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialEmail || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [phone, setPhone] = useState(initialPhone || "");
  const [phoneEditing, setPhoneEditing] = useState(false);
  const [phoneDraft, setPhoneDraft] = useState(initialPhone || "");
  const [phoneSaving, setPhoneSaving] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const [sending, setSending] = useState(false);
  const [sendOk, setSendOk] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const save = async () => {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/quote/${quoteId}/update-contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: draft }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmail(data.email);
        setEditing(false);
        router.refresh();
      } else {
        setError(data.error || "Failed to save email.");
      }
    } catch {
      setError("Failed to save email.");
    } finally {
      setSaving(false);
    }
  };

  const savePhone = async () => {
    setPhoneError(null);
    setPhoneSaving(true);
    try {
      const res = await fetch(`/api/quote/${quoteId}/update-contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneDraft }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPhone(data.phone ?? phoneDraft);
        setPhoneEditing(false);
        router.refresh();
      } else {
        setPhoneError(data.error || "Failed to save phone.");
      }
    } catch {
      setPhoneError("Failed to save phone.");
    } finally {
      setPhoneSaving(false);
    }
  };

  const sendEmail = async () => {
    setSendError(null);
    setSendOk(false);
    setSending(true);
    try {
      const res = await fetch(`/api/quote/${quoteId}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSendOk(true);
      } else {
        setSendError(data.error || "Failed to send.");
      }
    } catch {
      setSendError("Failed to send.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="glass-card p-5 mb-5">
      <h2 className="text-lg font-semibold text-[#ff5a2c] mb-4">Homeowner</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-slate-400">Name</p>
          <p className="text-white">{name || "—"}</p>
        </div>
        <div>
          <p className="text-slate-400">Phone</p>
          {!phoneEditing ? (
            <div className="flex items-center gap-2">
              <p className="text-white break-all">{phone || "—"}</p>
              <button
                type="button"
                onClick={() => {
                  setPhoneDraft(phone);
                  setPhoneError(null);
                  setPhoneEditing(true);
                }}
                aria-label="Edit phone"
                title="Edit phone"
                className="text-slate-400 hover:text-white transition shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="tel"
                value={phoneDraft}
                onChange={(e) => setPhoneDraft(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:border-[#db231f] focus:ring-2 focus:ring-[#db231f]/30 transition"
                placeholder="0400 000 000"
              />
              <button
                type="button"
                onClick={savePhone}
                disabled={phoneSaving}
                className="btn-primary px-3 py-1.5 text-xs"
              >
                {phoneSaving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPhoneEditing(false);
                  setPhoneError(null);
                }}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>
          )}
          {phoneError && <p className="text-red-300 text-xs mt-1">{phoneError}</p>}
        </div>
        <div className="sm:col-span-2">
          <p className="text-slate-400">Address</p>
          <p className="text-white">{address || "—"}</p>
        </div>

        <div className="sm:col-span-2">
          <p className="text-slate-400">Email</p>
          {!editing ? (
            <div className="flex items-center gap-2">
              <p className="text-white break-all">{email || "—"}</p>
              <button
                type="button"
                onClick={() => {
                  setDraft(email);
                  setError(null);
                  setEditing(true);
                }}
                aria-label="Edit email"
                title="Edit email"
                className="text-slate-400 hover:text-white transition shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="email"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:border-[#db231f] focus:ring-2 focus:ring-[#db231f]/30 transition"
                placeholder="homeowner@email.com"
              />
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="btn-primary px-3 py-1.5 text-xs"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setError(null);
                }}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>
          )}
          {error && <p className="text-red-300 text-xs mt-1">{error}</p>}
        </div>
      </div>

      <div className="mt-5 border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={sendEmail}
          disabled={sending || editing || !email}
          className="btn-primary"
        >
          {sending ? "Sending…" : "Email quote to homeowner"}
        </button>
        {!email && (
          <p className="text-slate-400 text-xs mt-2">
            Add a homeowner email above to enable sending.
          </p>
        )}
        {sendOk && (
          <p className="text-green-300 text-xs mt-2">✓ Sent to {email}</p>
        )}
        {sendError && (
          <p className="text-red-300 text-xs mt-2">{sendError}</p>
        )}
      </div>
    </div>
  );
}
