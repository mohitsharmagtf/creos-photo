import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { publicEventUrl } from "@/lib/qrcode";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdmin();
  const events = await prisma.event.findMany({
    orderBy: { eventDate: "desc" },
    include: { _count: { select: { photos: true, faces: true } } }
  });

  return (
    <AdminShell
      title="Events"
      action={
        <Link href="/admin/events/new" className="focus-ring rounded-lg bg-creo-blue px-5 py-3 font-black text-white">
          New event
        </Link>
      }
    >
      <div className="grid gap-4">
        {events.map((event) => (
          <article key={event.id} className="rounded-lg border border-blue-100 bg-white p-4 shadow-soft">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-black text-creo-navy">{event.name}</h2>
                  <span className="rounded-full bg-creo-sky px-3 py-1 text-sm font-black capitalize text-creo-blue">
                    {event.status}
                  </span>
                </div>
                <p className="mt-1 text-slate-600">
                  {event.eventType} · {event.eventDate.toLocaleDateString()} · {event._count.photos} photos ·{" "}
                  {event._count.faces} faces
                </p>
                <p className="mt-2 break-all text-sm text-slate-500">{publicEventUrl(event.slug)}</p>
              </div>
              <Link
                href={`/admin/events/${event.id}`}
                className="focus-ring rounded-lg border border-blue-200 px-5 py-3 text-center font-black text-creo-navy"
              >
                Open
              </Link>
            </div>
          </article>
        ))}
        {events.length === 0 ? (
          <div className="rounded-lg border border-blue-100 bg-white p-8 text-center shadow-soft">
            <p className="text-lg font-bold text-slate-600">Create your first event to start indexing photos.</p>
          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}
