import { AdminShell } from "@/components/AdminShell";
import { EventForm } from "@/components/EventForm";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  await requireAdmin();
  return (
    <AdminShell title="New event">
      <EventForm action="/api/admin/events" submitLabel="Create event" />
    </AdminShell>
  );
}
