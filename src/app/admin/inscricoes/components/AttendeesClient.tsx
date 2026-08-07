"use client"

import { useState } from "react"
import { Users, Search, Download, Trash2, Ticket, Mail, Phone, Building2, CheckCircle2, UserCheck, Send, Sparkles, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { deleteAttendee } from "@/server/actions/registration"
import { resendAttendeeTicket, sendMassEventEmail } from "@/server/actions/email"
import { CSVImportModal } from "@/components/import/CSVImportModal"
import { importAttendeesCSV } from "@/server/actions/import"
import { FileSpreadsheet } from "lucide-react"

interface AttendeesClientProps {
  initialAttendees: any[]
  eventName?: string
}

export function AttendeesClient({ initialAttendees, eventName }: AttendeesClientProps) {
  const [attendees, setAttendees] = useState(initialAttendees)
  const [searchQuery, setSearchQuery] = useState("")
  const [ticketFilter, setTicketFilter] = useState("ALL")
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null)

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isMassEmailOpen, setIsMassEmailOpen] = useState(false)
  const [massSubject, setMassSubject] = useState("")
  const [massMessage, setMassMessage] = useState("")
  const [sendingMass, setSendingMass] = useState(false)

  const filteredAttendees = attendees.filter(att => {
    const matchesSearch =
      att.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      att.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (att.company && att.company.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesTicket = ticketFilter === "ALL" || att.ticketType === ticketFilter

    return matchesSearch && matchesTicket
  })

  const handleResendEmail = async (id: string, email: string) => {
    setSendingEmailId(id)
    const res = await resendAttendeeTicket(id)
    if (res.success) {
      alert(`Ingresso reenviado com sucesso para ${email}!`)
    } else {
      alert(res.error || "Erro ao reenviar e-mail.")
    }
    setSendingEmailId(null)
  }

  const handleSendMassEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!massSubject.trim() || !massMessage.trim()) return

    const firstAttendee = attendees[0]
    if (!firstAttendee) {
      alert("Nenhum inscrito para disparar e-mails.")
      return
    }

    setSendingMass(true)
    const res = await sendMassEventEmail(firstAttendee.eventId, massSubject, massMessage)

    if (res.success) {
      alert(res.message || "Comunicado enviado com sucesso!")
      setIsMassEmailOpen(false)
      setMassSubject("")
      setMassMessage("")
    } else {
      alert(res.error || "Erro ao disparar e-mails em massa.")
    }
    setSendingMass(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja cancelar e remover esta inscrição?")) {
      const res = await deleteAttendee(id)
      if (res.success) {
        setAttendees(prev => prev.filter(a => a.id !== id))
      } else {
        alert(res.error || "Erro ao deletar inscrição")
      }
    }
  }

  const handleExportCSV = () => {
    if (filteredAttendees.length === 0) {
      alert("Nenhum inscrito para exportar.")
      return
    }

    const headers = ["Nome", "E-mail", "Telefone", "Empresa", "Cargo", "Tipo de Ingresso", "Data de Inscrição"]
    const rows = filteredAttendees.map(a => [
      `"${a.name}"`,
      `"${a.email}"`,
      `"${a.phone || ""}"`,
      `"${a.company || ""}"`,
      `"${a.role || ""}"`,
      `"${a.ticketType || "STANDARD"}"`,
      `"${new Date(a.createdAt).toLocaleString("pt-BR")}"`
    ])

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `inscritos_${eventName || "evento"}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const totalStandard = attendees.filter(a => a.ticketType === "STANDARD").length
  const totalVIP = attendees.filter(a => a.ticketType === "VIP").length

  return (
    <div className="space-y-6">
      {/* Cards de Métricas de Inscrições */}
      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="bg-card border-border shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Inscritos</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {String(attendees.length).padStart(2, "0")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Participantes confirmados</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ingressos Gerais</CardTitle>
            <Ticket className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {String(totalStandard).padStart(2, "0")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Categoria Standard</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ingressos VIP</CardTitle>
            <UserCheck className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {String(totalVIP).padStart(2, "0")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Participantes com acesso especial</p>
          </CardContent>
        </Card>
      </div>

      {/* Controles de Busca, Filtro, Exportar e Disparo de E-mail */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, e-mail ou empresa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-transparent focus:bg-background transition-colors rounded-xl"
            />
          </div>

          <select
            value={ticketFilter}
            onChange={(e) => setTicketFilter(e.target.value)}
            className="rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary h-10"
          >
            <option value="ALL">Todos os Ingressos</option>
            <option value="STANDARD">Ingresso Geral</option>
            <option value="VIP">Ingresso VIP</option>
            <option value="PRESS">Imprensa</option>
          </select>
        </div>

        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          <Button
            onClick={() => setIsImportModalOpen(true)}
            variant="outline"
            className="w-full sm:w-auto font-bold rounded-xl border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 text-xs"
          >
            <FileSpreadsheet className="mr-1.5 h-4 w-4" /> Importar CSV
          </Button>

          <Button
            onClick={() => setIsMassEmailOpen(true)}
            className="w-full sm:w-auto font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20 text-xs"
          >
            <Send className="mr-1.5 h-4 w-4" /> Disparar E-mail em Massa
          </Button>

          <Button onClick={handleExportCSV} variant="outline" className="w-full sm:w-auto font-semibold rounded-xl border-border text-xs">
            <Download className="mr-1.5 h-4 w-4 text-primary" /> Exportar (CSV)
          </Button>
        </div>
      </div>

      {/* Modal de Disparo em Massa */}
      <Dialog open={isMassEmailOpen} onOpenChange={setIsMassEmailOpen}>
        <DialogContent className="sm:max-w-[500px] border-border bg-card shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
              <Send className="h-5 w-5 text-purple-500" /> Disparar Comunicado aos Inscritos
            </DialogTitle>
            <DialogDescription>
              Envie um e-mail transacional para todos os {attendees.length} participantes inscritos no evento.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendMassEmail} className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">Assunto do E-mail *</label>
              <Input
                placeholder="Ex: Instruções importantes para o dia do evento"
                value={massSubject}
                onChange={(e) => setMassSubject(e.target.value)}
                required
                className="bg-muted/30 focus:bg-background rounded-xl text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">Mensagem / Conteúdo *</label>
              <Textarea
                placeholder="Escreva sua mensagem para a comunidade de participantes..."
                value={massMessage}
                onChange={(e) => setMassMessage(e.target.value)}
                required
                className="bg-muted/30 focus:bg-background rounded-xl text-sm min-h-32 resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsMassEmailOpen(false)} className="rounded-xl">
                Cancelar
              </Button>
              <Button type="submit" disabled={sendingMass} className="rounded-xl font-bold bg-purple-600 hover:bg-purple-700 text-white min-w-32 shadow-md shadow-purple-600/20">
                {sendingMass ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Enviar para Todos"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tabela de Inscritos */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <th className="p-4">Participante</th>
                <th className="p-4">Contatos</th>
                <th className="p-4">Empresa / Cargo</th>
                <th className="p-4">Tipo de Ingresso</th>
                <th className="p-4">Data Inscrição</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-sm">
              {filteredAttendees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground">
                    <UserCheck className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p className="font-semibold text-foreground">Nenhum participante inscrito encontrado</p>
                    <p className="text-xs mt-1">Os participantes inscritos via Landing Page aparecerão aqui automaticamente.</p>
                  </td>
                </tr>
              ) : (
                filteredAttendees.map(att => (
                  <tr key={att.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold flex items-center justify-center shrink-0">
                          {att.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{att.name}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{att.email}</span>
                      </div>
                      {att.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 opacity-70 shrink-0" />
                          <span>{att.phone}</span>
                        </div>
                      )}
                    </td>

                    <td className="p-4 text-xs text-muted-foreground">
                      {att.company ? (
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 opacity-70 shrink-0 text-primary" />
                          <span><strong className="text-foreground">{att.company}</strong> {att.role ? `(${att.role})` : ""}</span>
                        </div>
                      ) : (
                        <span className="opacity-50">—</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${
                        att.ticketType === "VIP"
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          : att.ticketType === "PRESS"
                          ? "bg-purple-500/10 text-purple-500 border-purple-500/20"
                          : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      }`}>
                        {att.ticketType || "STANDARD"}
                      </span>
                    </td>

                    <td className="p-4 text-xs text-muted-foreground">
                      {new Date(att.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleResendEmail(att.id, att.email)}
                          disabled={sendingEmailId === att.id}
                          className="h-8 w-8 text-primary hover:bg-primary/10 rounded-full"
                          title="Reenviar e-mail do ingresso"
                        >
                          {sendingEmailId === att.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(att.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-full"
                          title="Cancelar inscrição"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Importação CSV */}
      {isImportModalOpen && (
        <CSVImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          type="attendees"
          importAction={importAttendeesCSV}
        />
      )}
    </div>
  )
}
