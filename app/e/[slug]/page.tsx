import { notFound } from "next/navigation";
import { GuestSearchForm } from "@/components/GuestSearchForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PublicEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event || event.status !== "live") notFound();

  return (
    <main className="min-h-screen bg-creo-sky">
      <section className="mx-auto grid min-h-screen w-full max-w-2xl content-center px-4 py-8">
        <div className="rounded-lg bg-white p-5 shadow-soft sm:p-7">
          <p className="text-sm font-black uppercase tracking-wide text-creo-red">
            Creo Photo Finder
          </p>
          <h1 className="mt-2 text-3xl font-black leading-tight text-creo-navy sm:text-4xl">
            {event.name}
          </h1>
          <p className="mt-2 text-slate-600">
            {event.eventType} · {event.eventDate.toLocaleDateString()}
          </p>
          <div className="mt-6">
            <GuestSearchForm slug={event.slug} needsPin={Boolean(event.pinCodeHash)} />
          </div>
          <div className="mt-6 rounded-lg bg-creo-sky p-4 text-sm leading-6 text-slate-700">
            <p className="font-black text-creo-navy">Privacy notice</p>
            <p className="mt-1">
              Your selfie is used only to search this event&apos;s CompreFace face data.
              Matches stay event-specific, and results show preview images only.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
