"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function registerUser(data: FormData) {
  const name = (data.get("name") as string || "").trim()
  const email = (data.get("email") as string || "").trim().toLowerCase()
  const password = (data.get("password") as string || "").trim()
  const tenantName = (data.get("tenantName") as string || "").trim()

  if (!email || !password || !name || !tenantName) {
    return { error: "Todos os campos são obrigatórios." }
  }

  try {
    // Verifica se email já existe
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: email } }
    })

    if (existingUser) {
      return { error: "Este e-mail já possui uma conta cadastrada. Por favor, clique na aba 'Fazer Login' ao lado para acessar." }
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Cria o domínio baseado no nome + sufixo único se necessário
    const baseSlug = tenantName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'evento'
    const domain = `${baseSlug}-${Date.now().toString().slice(-4)}.gerenciador.app`

    // Cria o Tenant e o Usuário juntos
    await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
          domain,
        }
      })

      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        }
      })

      // Linka o usuário ao tenant como ADMIN (Dono)
      await tx.tenantUser.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          role: "ADMIN"
        }
      })
    })

    return { success: true }
  } catch (error: any) {
    console.error("Erro ao registrar usuário:", error)
    return { error: error.message || "Erro interno ao criar conta. Tente novamente." }
  }
}

export async function resetUserPasswordAdmin(userId: string, newPasswordRaw: string) {
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(newPasswordRaw, salt)

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  })

  return { success: true }
}

export async function sendResetEmailMock(userId: string) {
  console.log(`[MOCK EMAIL] Enviando email de recuperação para o usuário ID: ${userId}`)
  return { success: true }
}
