"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function registerUser(data: FormData) {
  const name = data.get("name") as string
  const email = data.get("email") as string
  const password = data.get("password") as string
  const tenantName = data.get("tenantName") as string

  if (!email || !password || !name || !tenantName) {
    return { error: "Todos os campos são obrigatórios." }
  }

  // Verifica se email já existe
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return { error: "E-mail já está em uso." }
  }

  // Hash da senha (tampada)
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  // Cria o domínio baseado no nome
  const domain = `${tenantName.toLowerCase().replace(/[^a-z0-9]/g, '')}.gerenciador.app`

  try {
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
  } catch (error) {
    console.error("Erro ao registrar:", error)
    return { error: "Erro interno ao criar conta." }
  }
}

export async function resetUserPasswordAdmin(userId: string, newPasswordRaw: string) {
  // Apenas simulando checagem de Admin. No real, checaria a sessão.
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(newPasswordRaw, salt)

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  })

  return { success: true }
}

export async function sendResetEmailMock(userId: string) {
  // Simulando envio de email
  console.log(`[MOCK EMAIL] Enviando email de recuperação para o usuário ID: ${userId}`)
  return { success: true }
}
