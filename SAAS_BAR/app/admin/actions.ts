'use server'

import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/auth'
import { categorySchema, productSchema, tableSchema } from '@/lib/validations'

// ───────────────────────────── Categorias ─────────────────────────────

export async function createCategory(formData: FormData) {
  const parsed = categorySchema.safeParse({ name: formData.get('name') })
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Dados inválidos.')

  const { supabase, tenantId } = await requireRole(['ADMIN'])
  const { error } = await supabase.from('categories').insert({
    tenant_id: tenantId,
    name: parsed.data.name,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function updateCategory(formData: FormData) {
  const id = formData.get('id') as string
  const parsed = categorySchema.safeParse({ name: formData.get('name') })
  if (!id) throw new Error('Categoria inválida.')
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Dados inválidos.')

  const { supabase } = await requireRole(['ADMIN'])
  const { error } = await supabase
    .from('categories')
    .update({ name: parsed.data.name })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function deleteCategory(formData: FormData) {
  const id = formData.get('id') as string
  if (!id) throw new Error('Categoria inválida.')

  const { supabase } = await requireRole(['ADMIN'])
  const { error } = await supabase.from('categories').delete().eq('id', id)

  if (error) {
    throw new Error(
      'Não foi possível excluir. Verifique se não há produtos usando esta categoria.'
    )
  }
  revalidatePath('/admin')
}

// ────────────────────────────── Produtos ───────────────────────────────

export async function createProduct(formData: FormData) {
  const parsed = productSchema.safeParse({
    name: formData.get('name'),
    price: formData.get('price'),
    category_id: formData.get('category_id'),
  })
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Dados inválidos.')

  const { supabase, tenantId } = await requireRole(['ADMIN'])
  const { error } = await supabase.from('products').insert({
    tenant_id: tenantId,
    ...parsed.data,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function updateProduct(formData: FormData) {
  const id = formData.get('id') as string
  const parsed = productSchema.safeParse({
    name: formData.get('name'),
    price: formData.get('price'),
    category_id: formData.get('category_id'),
  })
  if (!id) throw new Error('Produto inválido.')
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Dados inválidos.')

  const { supabase } = await requireRole(['ADMIN'])
  const { error } = await supabase.from('products').update(parsed.data).eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function toggleProductActive(formData: FormData) {
  const id = formData.get('id') as string
  const isActive = formData.get('is_active') === 'true'
  if (!id) throw new Error('Produto inválido.')

  const { supabase } = await requireRole(['ADMIN'])
  // Desativar em vez de excluir de fato: preserva o histórico de
  // order_items que já referenciam este produto.
  const { error } = await supabase
    .from('products')
    .update({ is_active: !isActive })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

// ─────────────────────────────── Mesas ──────────────────────────────────

export async function createTable(formData: FormData) {
  const parsed = tableSchema.safeParse({
    number: formData.get('number'),
    sector: formData.get('sector'),
    capacity: formData.get('capacity'),
  })
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Dados inválidos.')

  const { supabase, tenantId } = await requireRole(['ADMIN'])
  const { error } = await supabase.from('tables').insert({
    tenant_id: tenantId,
    ...parsed.data,
    status: 'FREE',
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function updateTable(formData: FormData) {
  const id = formData.get('id') as string
  const parsed = tableSchema.safeParse({
    number: formData.get('number'),
    sector: formData.get('sector'),
    capacity: formData.get('capacity'),
  })
  if (!id) throw new Error('Mesa inválida.')
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Dados inválidos.')

  const { supabase } = await requireRole(['ADMIN'])
  const { error } = await supabase.from('tables').update(parsed.data).eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function deleteTable(formData: FormData) {
  const id = formData.get('id') as string
  if (!id) throw new Error('Mesa inválida.')

  const { supabase } = await requireRole(['ADMIN'])
  const { error } = await supabase.from('tables').delete().eq('id', id)

  if (error) {
    throw new Error(
      'Não foi possível excluir. Esta mesa já tem pedidos vinculados a ela.'
    )
  }
  revalidatePath('/admin')
}
