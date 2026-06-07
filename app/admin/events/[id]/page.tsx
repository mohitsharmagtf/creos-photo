import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { EventForm } from "@/components/EventForm";
import { QrPanel } from "@/components/QrPanel";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { publicEventUrl } from "@/lib/qrcode";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: { _count: { select: { photos: true, faces: true, guestSearches: true } } }
  });
  if (!event) notFound();
  const link = publicEventUrl(event.slug);

  return (
    <AdminShell
      title={event.name}
      action={
        <Link
          href={`/admin/events/${event.id}/photos`}
          className="focus-ring rounded-lg bg-creo-blue px-5 py-3 font-black text-white"
        >
          Upload photos
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <EventForm
          action={`/api/admin/events/${event.id}`}
          method="PATCH"
          submitLabel="Save event"
          defaults={{
            name: event.name,
            eventDate: event.eventDate.toISOString().slice(0, 10),
            eventType: event.eventType,
            slug: event.slug,
            status: event.status,
            hasPin: Boolean(event.pinCodeHash)
          }}
        />
        <aside className="grid gap-4">
          <QrPanel eventId={event.id} eventLink={link} />
          <Link
            href={`/e/${event.slug}`}
            className="focus-ring rounded-lg border border-blue-200 bg-white px-4 py-3 text-center font-black text-creo-navy shadow-soft"
          >
            View public event
          </Link>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Photos" value={event._count.photos} />
            <Stat label="Faces" value={event._count.faces} />
            <Stat label="Searches" value={event._count.guestSearches} />
          </div>
        </aside>
      </div>
    </AdminShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-blue-100 bg-white p-4 text-center shadow-soft">
      <p className="text-2xl font-black text-creo-blue">{value}</p>
      <p className="text-sm font-bold text-slate-500">{label}</p>
    </div>
  );
}
