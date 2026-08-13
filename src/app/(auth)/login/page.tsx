import { LoginButtons } from "@/components/login-buttons";
import { getCurrentUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_request: "بيانات تسجيل الدخول غير مكتملة. حاول مرة أخرى.",
  invalid_state: "انتهت صلاحية جلسة الدخول. حاول مرة أخرى.",
  authentication_failed: "فشل تسجيل الدخول. حاول مرة أخرى.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/");

  const { error } = await searchParams;
  const errorMessage = error
    ? (ERROR_MESSAGES[error] ?? "حدث خطأ غير متوقع.")
    : null;

  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="font-handjet text-5xl font-extrabold tracking-tight text-accent">
            اقرأ
          </h1>
          <p className="mt-2 text-muted">
            سجّل الدخول لمتابعة مكتبتك القرائية.
          </p>
        </div>

        {errorMessage ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <LoginButtons />
      </div>
    </main>
  );
}
