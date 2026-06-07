import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/admin");
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-creo-sky px-4">
      <section className="w-full max-w-md rounded-lg bg-white p-6 shadow-soft">
        <p className="text-sm font-black uppercase tracking-wide text-creo-red">Admin</p>
        <h1 className="mt-2 text-3xl font-black text-creo-navy">Creo Photo Finder</h1>
        <form action="/api/admin/login" method="post" className="mt-6 grid gap-4">
          <label className="grid gap-2 font-bold text-creo-navy">
            Email
            <input
              className="focus-ring rounded-lg border border-blue-100 px-4 py-3 font-normal"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </label>
          <label className="grid gap-2 font-bold text-creo-navy">
            Password
            <input
              className="focus-ring rounded-lg border border-blue-100 px-4 py-3 font-normal"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          {params.error ? <p className="font-bold text-creo-red">Invalid email or password.</p> : null}
          <button className="focus-ring rounded-lg bg-creo-blue px-6 py-4 text-lg font-black text-white">
            Log in
          </button>
        </form>
      </section>
    </main>
  );
}
