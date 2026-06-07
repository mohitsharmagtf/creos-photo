"use client";

import { useState } from "react";

export function DeleteSelfieButton({ searchId }: { searchId: string }) {
  const [deleted, setDeleted] = useState(false);
  const [busy, setBusy] = useState(false);

  async function deleteSelfie() {
    setBusy(true);
    const response = await fetch(`/api/guest-searches/${searchId}/selfie`, { method: "POST" });
    setBusy(false);
    if (response.ok) setDeleted(true);
  }

  if (deleted) {
    return <p className="rounded-lg bg-green-50 p-3 font-bold text-green-700">Selfie deleted.</p>;
  }

  return (
    <button
      onClick={deleteSelfie}
      disabled={busy}
      className="focus-ring rounded-lg border border-blue-200 px-4 py-3 font-black text-creo-navy disabled:opacity-60"
    >
      Delete selfie
    </button>
  );
}
