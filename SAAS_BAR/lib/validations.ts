import { z } from "zod";

/**
 * Schemas de validação usados nas Server Actions. Mantidos num único lugar
 * pra evitar duplicar regra de negócio (ex: tamanho máximo de nome) entre
 * front e back — mesmo schema pode ser reaproveitado num formulário
 * client-side se algum dia adicionarmos validação otimista lá.
 */

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Informe o e-mail.").email("E-mail inválido."),
  password: z.string().min(1, "Informe a senha."),
});

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome da categoria.")
    .max(80, "Nome muito longo (máx. 80 caracteres)."),
});

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome do produto.")
    .max(120, "Nome muito longo (máx. 120 caracteres)."),
  price: z.coerce
    .number({ message: "Informe um preço válido." })
    .positive("O preço deve ser maior que zero.")
    .max(100000, "Preço acima do limite permitido."),
  category_id: z.string().uuid("Categoria inválida."),
});

export const tableSchema = z.object({
  number: z.coerce
    .number({ message: "Informe o número da mesa." })
    .int("Número da mesa deve ser inteiro.")
    .positive("Número da mesa deve ser maior que zero."),
  sector: z
    .string()
    .trim()
    .min(1, "Informe o setor.")
    .max(60, "Nome do setor muito longo (máx. 60 caracteres)."),
  capacity: z.coerce
    .number({ message: "Informe a capacidade." })
    .int("Capacidade deve ser inteira.")
    .positive("Capacidade deve ser maior que zero.")
    .max(50, "Capacidade acima do limite permitido."),
});

export const cartItemSchema = z.object({
  productId: z.string().uuid("Produto inválido."),
  quantity: z.coerce
    .number()
    .int("Quantidade deve ser inteira.")
    .positive("Quantidade deve ser maior que zero.")
    .max(50, "Quantidade acima do limite permitido por item."),
  notes: z.string().trim().max(300, "Observação muito longa (máx. 300 caracteres)."),
});

export const sendOrderItemsSchema = z
  .array(cartItemSchema)
  .min(1, "Adicione ao menos um item antes de enviar.")
  .max(50, "Carrinho com itens demais — envie em lotes menores.");

export const paymentMethodSchema = z.enum([
  "CASH",
  "DEBIT_CARD",
  "CREDIT_CARD",
  "PIX",
  "OTHER",
]);

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const addPaymentSchema = z.object({
  method: paymentMethodSchema,
  amount: z.coerce
    .number({ message: "Informe um valor válido para o pagamento." })
    .positive("O valor do pagamento deve ser maior que zero.")
    .max(1000000, "Valor acima do limite permitido."),
});

// ────────────────────────────── Superadmin ──────────────────────────────

export const tenantNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe o nome do restaurante.")
    .max(120, "Nome muito longo (máx. 120 caracteres)."),
});

export const tenantStatusSchema = z.enum(["TRIAL", "ACTIVE", "SUSPENDED"]);
