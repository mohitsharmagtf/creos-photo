"use client";

import { useState } from "react";

type EventFormProps = {
  action: string;
  method?: "POST" | "PATCH";
  submitLabel: string;
  defaults?: {
    name?: string;
    eventDate?: string;
    eventType?: string;
    slug?: string;
    status?: string;
    hasPin?: boolean;
  };
};

export function EventForm({ action, method = "POST", submitLabel, defaults }: EventFormProps) {
  const [coverName, setCoverName] = useState("");

  return (
    <form
      action={action}
      method="post"
      encType="multipart/form-data"
      className="grid gap-4 rounded-lg border border-blue-100 bg-white p-4 shadow-soft"
    >
      {method !== "POST" ? <input type="hidden" name="_method" value={method} /> : null}
      <label className="grid gap-2 font-bold text-creo-navy">
        Event name
        <input
          className="focus-ring rounded-lg border border-blue-100 px-4 py-3 font-normal"
          name="name"
          required
          defaultValue={defaults?.name}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 font-bold text-creo-navy">
          Event date
          <input
            className="focus-ring rounded-lg border border-blue-100 px-4 py-3 font-normal"
            name="eventDate"
            type="date"
            required
            defaultValue={defaults?.eventDate}
          />
        </label>
        <label className="grid gap-2 font-bold text-creo-navy">
          Event type
          <input
            className="focus-ring rounded-lg border border-blue-100 px-4 py-3 font-normal"
            name="eventType"
            placeholder="Wedding, school, sports day"
            required
            defaultValue={defaults?.eventType}
          />
        </label>
      </div>
      <label className="grid gap-2 font-bold text-creo-navy">
        Slug
        <input
          className="focus-ring rounded-lg border border-blue-100 px-4 py-3 font-normal"
          name="slug"
          required
          defaultValue={defaults?.slug}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 font-bold text-creo-navy">
          Optional PIN code
          <input
            className="focus-ring rounded-lg border border-blue-100 px-4 py-3 font-normal"
            name="pinCode"
            placeholder={defaults?.hasPin ? "Leave blank to keep current PIN" : "No PIN if blank"}
          />
        </label>
        <label className="grid gap-2 font-bold text-creo-navy">
          Status
          <select
            className="focus-ring rounded-lg border border-blue-100 px-4 py-3 font-normal"
            name="status"
            defaultValue={defaults?.status || "draft"}
          >
            <option value="draft">Draft</option>
            <option value="live">Live</option>
            <option value="closed">Closed</option>
          </select>
        </label>
      </div>
      <label className="grid gap-2 font-bold text-creo-navy">
        Cover image
        <input
          className="focus-ring rounded-lg border border-blue-100 px-4 py-3 font-normal"
          name="coverImage"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => setCoverName(event.target.files?.[0]?.name || "")}
        />
        {coverName ? <span className="text-sm text-slate-500">{coverName}</span> : null}
      </label>
      <button className="focus-ring rounded-lg bg-creo-blue px-6 py-4 text-lg font-black text-white">
        {submitLabel}
      </button>
    </form>
  );
}
