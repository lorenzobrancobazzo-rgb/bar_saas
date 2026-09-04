export default function NaoAutorizadoPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#0F1210] px-4 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-[#F2A38F]">
        Acesso não autorizado
      </p>
      <p className="max-w-sm text-sm text-[#8B948C]">
        Sua conta não tem permissão para acessar nenhuma área do sistema, ou
        ainda não foi vinculada a um restaurante. Fale com quem administra
        sua conta.
      </p>
      <form action="/auth/signout" method="post" className="mt-2">
        <button
          type="submit"
          className="rounded-md border border-[#262B25] px-4 py-2 text-sm text-[#F5F3EE] transition hover:bg-[#171B18]"
        >
          Sair e tentar com outra conta
        </button>
      </form>
    </div>
  );
}
