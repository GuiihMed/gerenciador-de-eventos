import { prisma } from "@/lib/prisma"
import { UsersClient } from "./components/UsersClient"

export default async function SuperAdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      lastLoginAt: true,
      password: true, // we select it just to know if they have one set, we won't show it obviously
    }
  })

  // Formatamos as datas antes de mandar pro client
  const formattedUsers = users.map(user => ({
    ...user,
    hasPassword: !!user.password,
    createdAt: user.createdAt.toISOString(),
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestão de Usuários</h1>
        <p className="text-muted-foreground mt-1">Controle de acessos, senhas e histórico dos organizadores na plataforma Gerenciador de Eventos.</p>
      </div>

      <UsersClient initialUsers={formattedUsers} />
    </div>
  )
}
