import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') {
    redirect('/nao-autorizado')
  }

  return (
    <div className="min-h-screen bg-[#0F1210] text-[#F5F3EE] flex flex-col">
      <header className="border-b border-[#262B25] bg-[#171B18] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Painel Administrativo</h1>
          <p className="text-xs text-[#8B948C]">Gerenciamento do Estabelecimento</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">{profile?.full_name}</span>
          <form action="/auth/signout" method="post">
            <button type="submit" className="text-xs bg-[#D64545] hover:opacity-90 px-3 py-1.5 rounded-lg text-white transition font-medium">
              Sair
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}