import Link from "next/link";
import { redirect } from "next/navigation";
import { clearSession } from "@/lib/auth";

export function AdminShell({
  children,
  title,
  action
}: {
  children: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}) {
  async function logout() {
    "use server";
    await clearSession();
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-blue-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/admin" className="text-xl font-black text-creo-blue">
            Creo Photo Finder
          </Link>
          <form action={logout}>
            <button className="focus-ring rounded-lg border border-blue-200 px-4 py-2 font-bold text-creo-navy">
              Log out
            </button>
          </form>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-black text-creo-navy">{title}</h1>
          {action}
        </div>
        {children}
      </section>
    </main>
  );
}
