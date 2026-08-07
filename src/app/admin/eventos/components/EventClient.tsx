"use client"

import { useState } from "react"
import { Plus, Trash2, Calendar, MapPin, Edit, Image as ImageIcon, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createEvent, updateEvent, deleteEvent } from "@/server/actions/event"

export function EventClient({ initialEvents }: { initialEvents: any[] }) {
  const [events, setEvents] = useState(initialEvents)
  const [isOpen, setIsOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  function handleOpenNew() {
    setEditingEvent(null)
    setError("")
    setIsOpen(true)
  }

  function handleOpenEdit(event: any) {
    setEditingEvent(event)
    setError("")
    setIsOpen(true)
  }

  // Format ISO date to YYYY-MM-THH:mm for datetime-local input
  function formatForInput(dateStr: string) {
    if (!dateStr) return ""
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ""
    return d.toISOString().slice(0, 16)
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    const formData = new FormData(e.currentTarget)

    const payload = {
      name: formData.get("name") as string,
      location: formData.get("location") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      visualIdentity: formData.get("visualIdentity") as string,
    }

    if (editingEvent) {
      const res = await updateEvent(editingEvent.id, payload)
      if (res.success && res.event) {
        setEvents(events.map(item => item.id === res.event.id ? res.event : item))
        setIsOpen(false)
      } else {
        setError(res.error || "Erro ao atualizar evento")
      }
    } else {
      const res = await createEvent(payload)
      if (res.success && res.event) {
        setEvents([res.event, ...events])
        setIsOpen(false)
      } else {
        setError(res.error || "Erro ao criar evento")
      }
    }

    setIsSubmitting(false)
  }

  async function handleDelete(id: string) {
    if (confirm("Tem certeza que deseja excluir este evento? Todos os horários e sessões vinculados serão removidos.")) {
      const res = await deleteEvent(id)
      if (res.success) {
        setEvents(events.filter(e => e.id !== id))
      } else {
        alert(res.error || "Erro ao deletar evento")
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div>
          <p className="text-sm font-medium text-foreground">Total de Eventos: <span className="text-primary font-bold">{events.length}</span></p>
        </div>

        <Button onClick={handleOpenNew} className="font-semibold rounded-xl shadow-md shadow-primary/20">
          <Plus className="h-4 w-4 mr-2" /> Novo Evento
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] border-border bg-card shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
              <Sparkles className="h-5 w-5 text-primary" />
              {editingEvent ? "Editar Evento" : "Criar Novo Evento"}
            </DialogTitle>
            <DialogDescription>
              {editingEvent ? "Modifique os detalhes e a identidade visual do seu evento." : "Adicione as informações base para criar a programação deste evento."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-4 pt-2">
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-xl border border-destructive/20 text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Nome do Evento *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={editingEvent?.name || ""}
                required
                placeholder="Ex: Tech Summit 2026"
                className="bg-muted/30 focus:bg-background rounded-xl font-semibold"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-foreground">Localização / Endereço</Label>
              <Input
                id="location"
                name="location"
                defaultValue={editingEvent?.location || ""}
                placeholder="Ex: Centro de Convenções Anhembi, SP"
                className="bg-muted/30 focus:bg-background rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-foreground">Data e Hora de Início *</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="datetime-local"
                  defaultValue={editingEvent ? formatForInput(editingEvent.startDate) : ""}
                  required
                  className="bg-muted/30 focus:bg-background rounded-xl text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-foreground">Data e Hora de Fim *</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="datetime-local"
                  defaultValue={editingEvent ? formatForInput(editingEvent.endDate) : ""}
                  required
                  className="bg-muted/30 focus:bg-background rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visualIdentity" className="text-foreground flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" /> Logo / Banner do Evento (URL)
              </Label>
              <Input
                id="visualIdentity"
                name="visualIdentity"
                defaultValue={editingEvent?.visualIdentity || ""}
                placeholder="https://sua-imagem.com/logo-evento.png"
                className="bg-muted/30 focus:bg-background rounded-xl text-sm"
              />
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-xl font-bold min-w-32 shadow-md shadow-primary/20">
                {isSubmitting ? "Salvando..." : (editingEvent ? "Salvar Alterações" : "Criar Evento")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-muted-foreground border border-dashed rounded-2xl border-border bg-card/40 text-center">
            <Calendar className="h-16 w-16 mb-4 opacity-20" />
            <h3 className="text-xl font-semibold text-foreground">Nenhum evento cadastrado</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">Clique no botão "Novo Evento" acima para cadastrar seu primeiro evento na plataforma.</p>
          </div>
        ) : (
          events.map((event) => (
            <Card key={event.id} className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden relative flex flex-col rounded-2xl">
              {/* Event Image Banner or Placeholder Header */}
              <div className="h-32 bg-muted/40 w-full relative overflow-hidden flex items-center justify-center border-b border-border">
                {event.visualIdentity ? (
                  <img src={event.visualIdentity} alt={event.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-muted-foreground/40">
                    <Calendar className="h-10 w-10 mb-1" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Gerenciador de Eventos</span>
                  </div>
                )}

                {/* Quick Actions Hover Overlay */}
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-background shadow-md hover:bg-muted" onClick={() => handleOpenEdit(event)}>
                    <Edit className="h-4 w-4 text-foreground" />
                  </Button>
                  <Button variant="destructive" size="icon" className="h-8 w-8 rounded-full shadow-md" onClick={() => handleDelete(event.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-foreground line-clamp-1" title={event.name}>
                    {event.name}
                  </h3>
                  {event.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>
                      {new Date(event.startDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold text-[11px] border border-primary/20">
                    Ativo
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
