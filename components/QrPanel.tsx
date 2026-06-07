"use client";

import { useState } from "react";

export function QrPanel({ eventId, eventLink }: { eventId: string; eventLink: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(eventLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-soft">
      <h2 className="text-xl font-black text-creo-navy">Event QR code</h2>
      <img
        src={`/api/qr/${eventId}`}
        alt="Event QR code"
        className="mt-4 aspect-square w-full rounded-lg border border-blue-100 bg-white object-contain p-3"
      />
      <p className="mt-3 break-all rounded-lg bg-creo-sky p-3 text-sm text-creo-navy">{eventLink}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <a
          href={`/api/qr/${eventId}?download=1`}
          className="focus-ring rounded-lg bg-creo-blue px-4 py-3 text-center font-black text-white"
        >
          Download
        </a>
        <button
          onClick={copyLink}
          className="focus-ring rounded-lg border border-blue-200 px-4 py-3 font-black text-creo-navy"
        >
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
