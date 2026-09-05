import Link from "next/link";

const FEATURES = [
  {
    title: "PDV rápido",
    description:
      "Fecha comanda com Pix, cartão ou dinheiro. O total é sempre recalculado no servidor — nunca fecha errado.",
  },
  {
    title: "Cozinha em tempo real",
    description:
      "O pedido aparece na tela da cozinha assim que o garçom envia, sem precisar apertar F5.",
  },
  {
    title: "Comanda mobile pro garçom",
    description:
      "Abre mesa, lança item, acompanha o status do pedido — tudo direto do celular, na palma da mão.",
  },
  {
    title: "Cardápio sempre atualizado",
    description:
      "Categoria, produto e preço editados no painel aparecem instantaneamente para todo mundo.",
  },
];

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0F1210] text-[#F5F3EE]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#262B25] px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8791A]">
            <svg width="18" height="18" viewBox="0 0 200 200" fill="none">
              <path
                d="M62 110 L90 138 L140 76"
                stroke="#F5F3EE"
                strokeWidth="22"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-lg font-bold">comando</span>
        </div>
        <Link
          href="/login"
          className="rounded-md border border-[#262B25] px-4 py-2 text-sm font-medium text-[#F5F3EE] transition hover:bg-[#171B18]"
        >
          Entrar
        </Link>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center gap-6 px-6 py-24 text-center">
        <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
          O comando do seu bar e restaurante, em tempo real
        </h1>
        <p className="max-w-xl text-lg text-[#8B948C]">
          PDV, cozinha e garçom conectados num só sistema. Sem planilha, sem
          papel, sem pedido perdido.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="rounded-md bg-[#E8791A] px-6 py-3 text-sm font-semibold text-[#171205] transition hover:opacity-90"
          >
            Testar grátis por 7 dias
          </Link>
          <a
            href="#precos"
            className="rounded-md border border-[#262B25] px-6 py-3 text-sm font-medium text-[#F5F3EE] transition hover:bg-[#171B18]"
          >
            Ver preços
          </a>
        </div>
      </section>

      {/* Mockup ilustrativo do KDS */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-3xl rounded-xl border border-[#262B25] bg-[#171B18] p-6 shadow-2xl">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#D64545]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#E8B58A]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#3FA34D]" />
            <span className="ml-3 text-xs text-[#5B635C]">Cozinha — tempo real</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { mesa: "Mesa 4", item: "2x Picanha", status: "Preparando", color: "#E8B58A" },
              { mesa: "Mesa 7", item: "1x Caipirinha", status: "Pronto", color: "#3FA34D" },
              { mesa: "Mesa 2", item: "3x Porção fritas", status: "Enviado", color: "#8B948C" },
            ].map((card) => (
              <div
                key={card.mesa}
                className="rounded-lg border border-[#262B25] bg-[#0F1210] p-3 text-left"
              >
                <p className="text-sm font-semibold">{card.mesa}</p>
                <p className="text-xs text-[#8B948C]">{card.item}</p>
                <span
                  className="mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{ backgroundColor: `${card.color}22`, color: card.color }}
                >
                  {card.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-[#262B25] px-6 py-20">
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-[#262B25] bg-[#171B18] p-5"
            >
              <h3 className="mb-2 text-base font-semibold">{feature.title}</h3>
              <p className="text-sm text-[#8B948C]">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Preço */}
      <section id="precos" className="border-t border-[#262B25] px-6 py-20">
        <div className="mx-auto flex max-w-sm flex-col items-center gap-4 rounded-xl border border-[#E8791A]/40 bg-[#171B18] p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#E8791A]">
            Plano único
          </p>
          <p className="text-4xl font-bold">
            R$99<span className="text-base font-normal text-[#8B948C]">/mês</span>
          </p>
          <ul className="flex flex-col gap-2 text-sm text-[#8B948C]">
            <li>PDV, KDS e comanda inclusos</li>
            <li>Mesas e cardápio ilimitados</li>
            <li>Suporte por WhatsApp</li>
          </ul>
          <Link
            href="/login"
            className="mt-2 w-full rounded-md bg-[#E8791A] px-6 py-3 text-sm font-semibold text-[#171205] transition hover:opacity-90"
          >
            Começar agora
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#262B25] px-6 py-8 text-center text-xs text-[#5B635C]">
        © {new Date().getFullYear()} Comando — Gestão de bares e restaurantes
      </footer>
    </div>
  );
}
