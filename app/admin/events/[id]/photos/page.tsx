import Link from "next/link";
import { FaceProcessingStatus } from "@prisma/client";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EventPhotosPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      photos: {
        orderBy: { createdAt: "desc" },
        include: { faces: true }
      }
    }
  });
  if (!event) notFound();

  return (
    <AdminShell
      title={`${event.name} photos`}
      action={
        <Link href={`/admin/events/${event.id}`} className="focus-ring rounded-lg border border-blue-200 px-5 py-3 font-black text-creo-navy">
          Event settings
        </Link>
      }
    >
      <form
        action={`/api/admin/events/${event.id}/photos`}
        method="post"
        encType="multipart/form-data"
        className="mb-6 grid gap-4 rounded-lg border border-blue-100 bg-white p-4 shadow-soft"
      >
        <label className="grid gap-2 text-lg font-bold text-creo-navy">
          Upload event photos
          <input
            className="focus-ring rounded-lg border border-blue-100 px-4 py-4"
            name="photos"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            required
          />
        </label>
        <button className="focus-ring rounded-lg bg-creo-blue px-6 py-4 text-lg font-black text-white">
          Upload and index faces
        </button>
      </form>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {event.photos.map((photo) => {
          const status = summarizeStatus(photo.faces.map((face) => face.processingStatus));
          return (
            <article key={photo.id} className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-soft">
              <img
                src={`/api/previews/${photo.id}`}
                alt={photo.fileName}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="p-4">
                <p className="truncate font-bold text-creo-navy">{photo.fileName}</p>
                <p className="mt-1 text-sm text-slate-600">{photo.faces.length} face records</p>
                <p className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-black capitalize ${statusClass(status)}`}>
                  {status}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </AdminShell>
  );
}

function summarizeStatus(statuses: FaceProcessingStatus[]) {
  if (statuses.includes("failed")) return "failed";
  if (statuses.includes("processing") || statuses.includes("pending")) return "processing";
  return "completed";
}

function statusClass(status: string) {
  if (status === "failed") return "bg-red-50 text-creo-red";
  if (status === "processing") return "bg-yellow-50 text-yellow-700";
  return "bg-green-50 text-green-700";
}
