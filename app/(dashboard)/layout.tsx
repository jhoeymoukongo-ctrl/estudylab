import { creerClientServeur } from "@/lib/supabase/server";
import Sidebar from "@/components/dashboard/Sidebar";
import MobileNav from "@/components/dashboard/MobileNav";
import Header from "@/components/dashboard/Header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName: string | undefined;
  let role: string | undefined;
  if (user) {
    const { data: profil } = await supabase
      .from("user_profiles")
      .select("display_name, role")
      .eq("user_id", user.id)
      .single();
    displayName = profil?.display_name ?? undefined;
    role = profil?.role ?? undefined;
  }
  const estAdmin = role === "admin" || role === "moderateur";

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar estAdmin={estAdmin} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header displayName={displayName} />
        <main className="flex-1 overflow-y-auto p-4 pb-20 sm:p-6 md:pb-6">
          {children}
        </main>
      </div>
      <MobileNav estAdmin={estAdmin} />
    </div>
  );
}
