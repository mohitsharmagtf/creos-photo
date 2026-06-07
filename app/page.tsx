import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-creo-sky">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-5 py-10">
        <div className="max-w-2xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-creo-red">
            Creo Photo Finder
          </p>
          <h1 className="text-4xl font-black leading-tight text-creo-navy sm:text-6xl">
            AI event photo finding for guests on their phones.
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-700">
            Create an event, upload photos, index faces with CompreFace, share a QR
            code, and let guests find only their matched photos with a consented selfie.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admin/login"
              className="focus-ring rounded-lg bg-creo-blue px-7 py-4 text-center text-lg font-bold text-white shadow-soft"
            >
              Admin login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
