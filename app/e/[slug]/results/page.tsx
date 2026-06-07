import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteSelfieButton } from "@/components/DeleteSelfieButton";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ResultsPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ searchId?: string }>;
}) {
  const { slug } = await params;
  const { searchId } = await searchParams;
  if (!searchId) notFound();

  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event) notFound();

  const search = await prisma.guestSearch.findFirst({
    where: { id: searchId, eventId: event.id }
  });
  if (!search) notFound();

  const photos = search.matchedPhotoIds.length
    ? await prisma.photo.findMany({
        where: { id: { in: search.matchedPhotoIds }, eventId: event.id },
        orderBy: { createdAt: "desc" }
      })
    : [];

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto w-full max-w-5xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-creo-red">
              Creo Photo Finder
            </p>
            <h1 className="mt-1 text-3xl font-black text-creo-navy">Your matched photos</h1>
          </div>
          <Link
            href={`/e/${event.slug}`}
            className="focus-ring rounded-lg border border-blue-200 px-4 py-3 text-center font-black text-creo-navy"
          >
            Try another selfie
          </Link>
        </div>

        {!search.selfieDeleted && search.selfieKey ? (
          <div className="mb-5">
            <DeleteSelfieButton searchId={search.id} />
          </div>
        ) : null}

        {photos.length === 0 ? (
          <div className="rounded-lg border border-blue-100 bg-white p-6 text-center shadow-soft">
            <p className="text-lg font-bold text-slate-700">
              No matching photos found. Try another clear selfie with your face facing the camera.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <article key={photo.id} className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-soft">
                <img
                  src={`/api/previews/${photo.id}`}
                  alt="Matched event preview"
                  className="aspect-[4/3] w-full object-cover"
                />
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
