import { listCodes } from "@ls/orchestrator";
import { AdminCodes, AdminLogin } from "@/components/AdminCodes";
import { Logo } from "@/components/icons";
import { adminAllowed } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Lesson Studio · Codes" };

/** Owner-only page to create and manage access codes. Moves into the Lab app in M10. */
export default async function AdminPage() {
  const allowed = await adminAllowed();
  const codes = allowed ? await listCodes() : [];
  return (
    <main className="page" style={{ minHeight: "100vh" }}>
      <div className="page-inner" style={{ maxWidth: 880, gap: 24 }}>
        <div className="brand"><Logo />Access codes</div>
        {allowed ? <AdminCodes codes={codes} /> : <AdminLogin />}
      </div>
    </main>
  );
}
