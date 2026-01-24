import { createClient } from "@/utils/supabase/server";
import { IntroSequence } from "@/components/home/IntroSequence";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/cycle-sync');
  }

  return (
    <main className="min-h-screen bg-white text-rove-charcoal font-sans selection:bg-rove-red/20">
      <IntroSequence isLoggedIn={false} />
    </main>
  );
}
