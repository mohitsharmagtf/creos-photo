"use client";

import { useState } from "react";

export function GuestSearchForm({ slug, needsPin }: { slug: string; needsPin: boolean }) {
  const [pinOk, setPinOk] = useState(!needsPin);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function verifyPin(formData: FormData) {
    setBusy(true);
    setMessage("");
    const response = await fetch(`/api/events/${slug}/pin`, { method: "POST", body: formData });
    setBusy(false);
    if (response.ok) {
      setPinOk(true);
      return;
    }
    setMessage("That PIN did not match this event.");
  }

  async function search(formData: FormData) {
    setBusy(true);
    setMessage("Searching event photos...");
    const response = await fetch(`/api/events/${slug}/search`, { method: "POST", body: formData });
    const payload = await response.json();
    if (!response.ok) {
      setBusy(false);
      setMessage(payload.error || "Search failed. Please try again.");
      return;
    }
    window.location.href = `/e/${slug}/results?searchId=${payload.searchId}`;
  }

  if (!pinOk) {
    return (
      <form action={verifyPin} className="grid gap-4">
        <label className="grid gap-2 text-lg font-bold text-creo-navy">
          Event PIN
          <input
            className="focus-ring rounded-lg border border-blue-100 px-4 py-4 text-xl"
            name="pin"
            inputMode="numeric"
            required
          />
        </label>
        {message ? <p className="font-bold text-creo-red">{message}</p> : null}
        <button
          disabled={busy}
          className="focus-ring rounded-lg bg-creo-blue px-6 py-5 text-xl font-black text-white disabled:opacity-60"
        >
          Continue
        </button>
      </form>
    );
  }

  return (
    <form action={search} className="grid gap-5">
      <label className="flex items-start gap-3 rounded-lg border border-blue-100 bg-white p-4 text-slate-700">
        <input className="mt-1 h-5 w-5" name="consent" type="checkbox" value="yes" required />
        <span>I consent to my selfie being used only to find my photos from this event.</span>
      </label>
      <label className="grid gap-2 text-lg font-bold text-creo-navy">
        Upload a clear selfie
        <input
          className="focus-ring rounded-lg border border-blue-100 bg-white px-4 py-4"
          name="selfie"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="user"
          required
        />
      </label>
      <p className="text-sm leading-6 text-slate-600">
        Your selfie is used only to search this event. You can delete it after
        search, and the app can also delete it automatically when configured.
      </p>
      {message ? <p className="font-bold text-creo-blue">{message}</p> : null}
      <button
        disabled={busy}
        className="focus-ring rounded-lg bg-creo-blue px-6 py-5 text-xl font-black text-white disabled:opacity-60"
      >
        Find my photos
      </button>
    </form>
  );
}
