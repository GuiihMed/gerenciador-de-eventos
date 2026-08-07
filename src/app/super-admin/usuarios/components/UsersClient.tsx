"use client"

import { useState } from "react"
import { Key, Mail, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { resetUserPasswordAdmin, sendResetEmailMock } from "@/server/actions/auth"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

type User = {
  id: string
  name: string | null
  email: string
  hasPassword: boolean
  createdAt: string
  lastLoginAt: string | null
}

export function UsersClient({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState(initialUsers)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleEditPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser || !newPassword) return

    setLoading(true)
    setMessage("")
    try {
      await resetUserPasswordAdmin(selectedUser.id, newPassword)
      setMessage("Senha alterada com sucesso!")
      setTimeout(() => {
        setSelectedUser(null)
        setNewPassword("")
        setMessage("")
      }, 2000)
    } catch (err) {
      setMessage("Erro ao alterar senha.")
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = async (userId: string) => {
    try {
      await sendResetEmailMock(userId)
      alert("E-mail de recuperação enviado com sucesso! (Ação Mockada)")
    } catch (err) {
      alert("Erro ao enviar e-mail.")
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Nunca acessou"
    return format(new Date(dateStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="p-4 text-sm font-semibold text-muted-foreground">Usuário</th>
              <th className="p-4 text-sm font-semibold text-muted-foreground">Senha Atual</th>
              <th className="p-4 text-sm font-semibold text-muted-foreground">Cadastro</th>
              <th className="p-4 text-sm font-semibold text-muted-foreground">Último Acesso</th>
              <th className="p-4 text-sm font-semibold text-muted-foreground text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">Nenhum usuário cadastrado.</td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{user.name || "Sem nome"}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="bg-background px-3 py-1 rounded-md text-xs font-mono tracking-widest text-muted-foreground border border-border">
                      {user.hasPassword ? "••••••••" : "N/A"}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {formatDate(user.lastLoginAt)}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSendEmail(user.id)}
                      className="border-border text-muted-foreground hover:text-foreground"
                      title="Enviar e-mail de recuperação"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                      className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20"
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Editar Senha
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Editar Senha */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              Forçar Nova Senha
            </DialogTitle>
            <DialogDescription>
              Atenção: Você está alterando a senha do usuário <strong>{selectedUser?.email}</strong> diretamente pelo painel Super Admin.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditPassword} className="space-y-4 mt-4">
            {message && (
              <div className="p-3 text-sm text-green-500 bg-green-500/10 rounded-md border border-green-500/20 text-center">
                {message}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-foreground">Nova Senha (tampada/criptografada no banco)</Label>
              <Input 
                id="newPassword" 
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha..."
                required
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setSelectedUser(null)}>Cancelar</Button>
              <Button type="submit" disabled={loading || !newPassword}>
                {loading ? "Salvando..." : "Salvar Senha Segura"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
