"use client"

import { useState } from "react"
import { X, User, Mail, Phone, Briefcase, Ticket, CheckCircle2, QrCode, Printer, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { registerAttendee } from "@/server/actions/registration"

interface RegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  eventId: string
  eventName: string
}

export function RegistrationModal({ isOpen, onClose, eventId, eventName }: RegistrationModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [attendee, setAttendee] = useState<any | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      company: formData.get("company") as string,
      role: formData.get("role") as string,
      ticketType: formData.get("ticketType") as string,
    }

    if (!data.name || !data.email) {
      setError("Nome e E-mail são obrigatórios.")
      setLoading(false)
      return
    }

    const res = await registerAttendee(eventId, data)

    if (res.success && res.attendee) {
      setAttendee(res.attendee)
    } else {
      if (res.attendee) {
        // Já inscrito anteriormente, exibe o ingresso
        setAttendee(res.attendee)
      } else {
        setError(res.error || "Erro ao realizar inscrição.")
      }
    }

    setLoading(false)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header do Modal */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            {attendee ? "Seu Ingresso Confirmado!" : `Inscrição: ${eventName}`}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Se a inscrição foi concluída: Exibe o Ingresso Digital / Crachá */}
        {attendee ? (
          <div className="p-6 space-y-6 overflow-y-auto text-center">
            <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20 flex flex-col items-center gap-2">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              <h3 className="font-bold text-lg">Inscrição Confirmada com Sucesso!</h3>
              <p className="text-xs opacity-90">Apresente este comprovante no credenciamento do evento.</p>
            </div>

            {/* Card do Ingresso Digital */}
            <div className="bg-card border-2 border-primary/30 rounded-2xl p-6 shadow-xl relative overflow-hidden space-y-4 print:border-black">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-[10px] font-bold uppercase rounded-bl-xl tracking-wider">
                {attendee.ticketType || "STANDARD"}
              </div>

              <div className="text-left space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Participante</span>
                <h4 className="text-xl font-extrabold text-foreground">{attendee.name}</h4>
                <p className="text-xs text-muted-foreground font-medium">{attendee.email}</p>
                {attendee.company && (
                  <p className="text-xs text-primary font-semibold mt-1">
                    {attendee.role ? `${attendee.role} na ` : ""}{attendee.company}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-dashed border-border flex flex-col items-center justify-center space-y-2">
                {/* Simulação Visual do QR Code com SVG */}
                <div className="p-3 bg-white rounded-xl shadow-inner border border-gray-200 flex flex-col items-center">
                  <QrCode className="h-28 w-28 text-black" />
                  <span className="text-[9px] font-mono text-gray-500 mt-1 uppercase tracking-wider">
                    {attendee.qrCodeToken.slice(0, 18)}...
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-center pt-2">
              <Button onClick={handlePrint} variant="outline" className="rounded-xl font-semibold text-xs">
                <Printer className="h-4 w-4 mr-2" /> Imprimir Ingresso
              </Button>
              <Button onClick={onClose} className="rounded-xl font-bold text-xs shadow-md shadow-primary/20">
                Concluir
              </Button>
            </div>
          </div>
        ) : (
          /* Formulário de Inscrição */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-xl border border-destructive/20 text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Nome Completo *
              </Label>
              <Input id="name" name="name" required placeholder="Ex: Maria Oliveira" className="bg-muted/30 focus:bg-background rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" /> E-mail de Contato *
              </Label>
              <Input id="email" name="email" type="email" required placeholder="Ex: maria@empresa.com" className="bg-muted/30 focus:bg-background rounded-xl" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground flex items-center gap-2 text-xs">
                  <Phone className="h-3.5 w-3.5 opacity-70" /> Telefone / WhatsApp
                </Label>
                <Input id="phone" name="phone" placeholder="(11) 99999-9999" className="bg-muted/30 focus:bg-background rounded-xl text-sm" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ticketType" className="text-foreground flex items-center gap-2 text-xs">
                  <Ticket className="h-3.5 w-3.5 opacity-70" /> Tipo de Ingresso
                </Label>
                <select id="ticketType" name="ticketType" className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary h-10">
                  <option value="STANDARD">Inscrição Geral (Gratuito)</option>
                  <option value="VIP">Acesso VIP</option>
                  <option value="PRESS">Imprensa / Mídia</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company" className="text-foreground flex items-center gap-2 text-xs">
                  <Briefcase className="h-3.5 w-3.5 opacity-70" /> Empresa
                </Label>
                <Input id="company" name="company" placeholder="Ex: Tech Company" className="bg-muted/30 focus:bg-background rounded-xl text-sm" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-foreground flex items-center gap-2 text-xs">
                  <Briefcase className="h-3.5 w-3.5 opacity-70" /> Cargo / Função
                </Label>
                <Input id="role" name="role" placeholder="Ex: Gerente de TI" className="bg-muted/30 focus:bg-background rounded-xl text-sm" />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-border mt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="rounded-xl">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="rounded-xl font-bold shadow-md shadow-primary/20 min-w-36">
                {loading ? "Processando..." : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Garantir Inscrição
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
