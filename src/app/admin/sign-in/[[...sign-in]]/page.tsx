import { SignIn } from "@clerk/nextjs";

export default function AdminSignIn() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <SignIn path="/admin/sign-in" routing="path" forceRedirectUrl="/admin" signUpUrl="/admin/sign-in" />
    </main>
  );
}
