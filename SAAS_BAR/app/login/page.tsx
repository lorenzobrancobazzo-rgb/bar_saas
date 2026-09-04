import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0F1210] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8791A]">
            <svg width="24" height="24" viewBox="0 0 200 200" fill="none">
              <path
                d="M62 110 L90 138 L140 76"
                stroke="#F5F3EE"
                strokeWidth="20"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[#F5F3EE]">comando</h1>
          <p className="text-sm text-[#8B948C]">Entre com sua conta para continuar</p>
        </div>

        <div className="rounded-xl border border-[#262B25] bg-[#171B18] p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
