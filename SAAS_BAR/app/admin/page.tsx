import {
  createCategory,
  updateCategory,
  deleteCategory,
  createProduct,
  updateProduct,
  toggleProductActive,
  createTable,
  updateTable,
  deleteTable,
} from './actions'
import { createClient } from '@/lib/supabase/server'

export default async function AdminPage() {
  const supabase = await createClient()

  const [categoriesRes, productsRes, tablesRes] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('products').select('*, categories(name)').order('name'),
    supabase.from('tables').select('*').order('number'),
  ])

  const categories = categoriesRes.data || []
  const products = productsRes.data || []
  const tables = tablesRes.data || []

  const inputClass =
    'bg-[#1F2420] border border-[#262B25] rounded-lg px-3 py-2 text-sm text-white'

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Seção de Mesas */}
      <section className="bg-[#171B18] border border-[#262B25] rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold border-b border-[#262B25] pb-2">Cadastrar Mesa</h2>
        <form action={createTable} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input name="number" type="number" placeholder="Número da Mesa" required className={inputClass} />
          <input name="sector" type="text" placeholder="Setor (ex: Salão, Varanda)" required className={inputClass} />
          <input name="capacity" type="number" placeholder="Capacidade (Pessoas)" required className={inputClass} />
          <button type="submit" className="bg-[#E8791A] hover:opacity-90 text-[#171205] font-semibold rounded-lg text-sm px-4 py-2 transition">
            + Adicionar Mesa
          </button>
        </form>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {tables.map((t) => (
            <details key={t.id} className="bg-[#1F2420] rounded-lg border border-[#262B25] group">
              <summary className="p-3 cursor-pointer flex items-center justify-between list-none">
                <div>
                  <span className="text-base font-bold">Mesa {t.number}</span>
                  <p className="text-xs text-[#8B948C]">{t.sector} ({t.capacity} p.) · {t.status}</p>
                </div>
                <span className="text-[#5B635C] text-xs group-open:hidden">editar</span>
              </summary>
              <div className="p-3 pt-0 space-y-2 border-t border-[#262B25]">
                <form action={updateTable} className="grid grid-cols-3 gap-2 pt-3">
                  <input type="hidden" name="id" value={t.id} />
                  <input name="number" type="number" defaultValue={t.number} required className={inputClass} />
                  <input name="sector" type="text" defaultValue={t.sector} required className={inputClass} />
                  <input name="capacity" type="number" defaultValue={t.capacity} required className={inputClass} />
                  <button type="submit" className="col-span-3 bg-[#2C322C] hover:opacity-80 text-white text-xs font-medium rounded-lg px-3 py-1.5 transition">
                    Salvar alterações
                  </button>
                </form>
                <form action={deleteTable}>
                  <input type="hidden" name="id" value={t.id} />
                  <button type="submit" className="w-full bg-[#1A1413] hover:opacity-80 text-[#F2A38F] text-xs font-medium rounded-lg px-3 py-1.5 transition">
                    Excluir mesa
                  </button>
                </form>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Seção de Categorias */}
      <section className="bg-[#171B18] border border-[#262B25] rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold border-b border-[#262B25] pb-2">Cadastrar Categoria</h2>
        <form action={createCategory} className="flex gap-4">
          <input name="name" type="text" placeholder="Nome da Categoria (ex: Bebidas, Sobremesas)" required className={`flex-1 ${inputClass}`} />
          <button type="submit" className="bg-[#E8791A] hover:opacity-90 text-[#171205] font-semibold rounded-lg text-sm px-4 py-2 transition">
            + Adicionar Categoria
          </button>
        </form>
        <div className="flex flex-wrap gap-2 pt-2">
          {categories.map((c) => (
            <details key={c.id} className="bg-[#1F2420] border border-[#262B25] rounded-full group">
              <summary className="px-3 py-1 cursor-pointer text-xs font-medium text-[#8B948C] list-none">
                {c.name}
              </summary>
              <div className="p-3 space-y-2 border-t border-[#262B25] min-w-[220px]">
                <form action={updateCategory} className="flex gap-2">
                  <input type="hidden" name="id" value={c.id} />
                  <input name="name" type="text" defaultValue={c.name} required className={`flex-1 ${inputClass}`} />
                  <button type="submit" className="bg-[#2C322C] hover:opacity-80 text-white text-xs font-medium rounded-lg px-3 transition">
                    Salvar
                  </button>
                </form>
                <form action={deleteCategory}>
                  <input type="hidden" name="id" value={c.id} />
                  <button type="submit" className="w-full bg-[#1A1413] hover:opacity-80 text-[#F2A38F] text-xs font-medium rounded-lg px-3 py-1.5 transition">
                    Excluir categoria
                  </button>
                </form>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Seção de Produtos */}
      <section className="bg-[#171B18] border border-[#262B25] rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold border-b border-[#262B25] pb-2">Cadastrar Produto</h2>
        <form action={createProduct} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input name="name" type="text" placeholder="Nome do Produto" required className={inputClass} />
          <input name="price" type="number" step="0.01" placeholder="Preço (R$)" required className={inputClass} />
          <select name="category_id" required className={inputClass}>
            <option value="">Selecione Categoria</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button type="submit" className="bg-[#E8791A] hover:opacity-90 text-[#171205] font-semibold rounded-lg text-sm px-4 py-2 transition">
            + Adicionar Produto
          </button>
        </form>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {products.map((p) => (
            <details key={p.id} className="bg-[#1F2420] rounded-lg border border-[#262B25] group">
              <summary className="p-3 cursor-pointer flex justify-between items-center list-none">
                <div>
                  <p className="font-semibold text-sm">
                    {p.name} {!p.is_active && <span className="text-[#F2A38F] text-[10px] ml-1">(inativo)</span>}
                  </p>
                  <p className="text-xs text-[#8B948C]">{p.categories?.name || 'Sem Categoria'}</p>
                </div>
                <span className="text-[#E8791A] font-bold text-sm">R$ {Number(p.price).toFixed(2)}</span>
              </summary>
              <div className="p-3 pt-0 space-y-2 border-t border-[#262B25]">
                <form action={updateProduct} className="grid grid-cols-2 gap-2 pt-3">
                  <input type="hidden" name="id" value={p.id} />
                  <input name="name" type="text" defaultValue={p.name} required className={`col-span-2 ${inputClass}`} />
                  <input name="price" type="number" step="0.01" defaultValue={p.price} required className={inputClass} />
                  <select name="category_id" defaultValue={p.category_id} required className={inputClass}>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <button type="submit" className="col-span-2 bg-[#2C322C] hover:opacity-80 text-white text-xs font-medium rounded-lg px-3 py-1.5 transition">
                    Salvar alterações
                  </button>
                </form>
                <form action={toggleProductActive}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="is_active" value={String(p.is_active)} />
                  <button type="submit" className="w-full bg-[#3D2E1B] hover:opacity-80 text-[#E8B58A] text-xs font-medium rounded-lg px-3 py-1.5 transition">
                    {p.is_active ? 'Desativar (sai do cardápio)' : 'Reativar produto'}
                  </button>
                </form>
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}
