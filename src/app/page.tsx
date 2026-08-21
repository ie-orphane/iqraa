import { getCurrentUser } from "@/lib/auth-server";
import { LandingPage } from "@/components/landing-page";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="flex min-h-full flex-1 flex-col">
      <LandingPage isAuthenticated={Boolean(user)} />
    </main>
  );
}
