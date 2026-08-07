"use client"

import { useState } from "react"
import { Speaker, TaxonomyValue } from "@prisma/client"
import { X, Save, Clock, MapPin, Users, FileText, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { createActivity, updateActivity, createRoom } from "@/server/actions/schedule"

interface ActivityFormModalProps {
  isOpen: boolean
  onClose: () => void
  timeBlockId: string
  defaultStartTime: string
  defaultEndTime: string
  speakers: Speaker[]
  rooms: TaxonomyValue[]
  activityToEdit?: any
  onSaved: () => void
}

export function ActivityFormModal({
  isOpen,
  onClose,
  timeBlockId,
  defaultStartTime,
  defaultEndTime,
  speakers,
  rooms: initialRooms,
  activityToEdit,
  onSaved
}: ActivityFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [rooms, setRooms] = useState<TaxonomyValue[]>(initialRooms)
  const [newRoomName, setNewRoomName] = useState("")
  const [showAddRoom, setShowAddRoom] = useState(false)

  // Selection states
  const [selectedSpeakerIds, setSelectedSpeakerIds] = useState<string[]>(
    activityToEdit ? activityToEdit.speakers.map((s: any) => s.speaker.id) : []
  )
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    activityToEdit && activityToEdit.taxonomies.length > 0
      ? activityToEdit.taxonomies[0].taxonomyValue.id
      : rooms[0]?.id || ""
  )

  if (!isOpen) return null

  const handleToggleSpeaker = (id: string) => {
    setSelectedSpeakerIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return
    const res = await createRoom(newRoomName.trim())
    if (res.success && res.room) {
      setRooms(prev => [...prev, res.room])
      setSelectedRoomId(res.room.id)
      setNewRoomName("")
      setShowAddRoom(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      timeBlockId,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      startTime: formData.get("startTime") as string,
      endTime: formData.get("endTime") as string,
      capacity: formData.get("capacity") ? Number(formData.get("capacity")) : undefined,
      speakerIds: selectedSpeakerIds,
      roomTaxonomyValueId: selectedRoomId,
    }

    if (!data.title || !data.startTime || !data.endTime) {
      setError("Título e horários são obrigatórios.")
      setLoading(false)
      return
    }

    try {
      const res = activityToEdit
        ? await updateActivity(activityToEdit.id, data)
        : await createActivity(data)

      if (res.success) {
        onSaved()
        onClose()
      } else {
        setError(res.error || "Erro ao salvar sessão")
      }
    } catch (err: any) {
      setError("Erro interno no servidor.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-2xl rounded-2xl shadow-2xl border border-border flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            {activityToEdit ? "Editar Sessão/Palestra" : "Nova Sessão/Palestra"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-xl border border-destructive/20 text-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground font-medium">
              Título da Sessão / Atividade <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              defaultValue={activityToEdit?.title || ""}
              placeholder="Ex: Keynote de Abertura: O Futuro da Inteligência Artificial"
              required
              className="bg-muted/30 focus:bg-background rounded-xl text-base font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-foreground">Início *</Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                defaultValue={activityToEdit?.startTime || defaultStartTime}
                required
                className="bg-muted/30 focus:bg-background rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-foreground">Fim *</Label>
              <Input
                id="endTime"
                name="endTime"
                type="time"
                defaultValue={activityToEdit?.endTime || defaultEndTime}
                required
                className="bg-muted/30 focus:bg-background rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity" className="text-foreground">Vagas (Opcional)</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                defaultValue={activityToEdit?.capacity || ""}
                placeholder="Ex: 150"
                className="bg-muted/30 focus:bg-background rounded-xl"
              />
            </div>
          </div>

          {/* Seleção de Sala */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Sala ou Local
              </Label>
              <Button type="button" variant="link" size="sm" className="h-auto p-0 text-primary" onClick={() => setShowAddRoom(!showAddRoom)}>
                + Nova Sala
              </Button>
            </div>

            {showAddRoom && (
              <div className="flex gap-2 p-3 bg-muted/40 rounded-xl mb-2">
                <Input
                  placeholder="Nome da sala (ex: Auditório B)"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="bg-background rounded-lg text-sm"
                />
                <Button type="button" onClick={handleCreateRoom} size="sm" className="rounded-lg">
                  Salvar
                </Button>
              </div>
            )}

            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Nenhuma sala selecionada</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>{room.label}</option>
              ))}
            </select>
          </div>

          {/* Seleção de Palestrantes */}
          <div className="space-y-2">
            <Label className="text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Palestrantes Vinculados
            </Label>
            {speakers.length === 0 ? (
              <p className="text-sm text-muted-foreground bg-muted/20 p-3 rounded-xl">
                Nenhum palestrante cadastrado ainda. Você pode cadastrar em "Palestrantes" no menu.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-border rounded-xl bg-muted/20">
                {speakers.map(speaker => {
                  const isSelected = selectedSpeakerIds.includes(speaker.id)
                  return (
                    <div
                      key={speaker.id}
                      onClick={() => handleToggleSpeaker(speaker.id)}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all border ${
                        isSelected 
                          ? "bg-primary/10 border-primary/40 text-foreground font-semibold" 
                          : "bg-card border-transparent text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // controlado pelo onClick da div
                        className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className="text-sm truncate">{speaker.name}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 opacity-70" /> Descrição da Sessão
            </Label>
            <textarea
              id="description"
              name="description"
              defaultValue={activityToEdit?.description || ""}
              placeholder="Resumo sobre o conteúdo da palestra..."
              rows={3}
              className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>
        </form>

        <div className="p-6 border-t border-border flex justify-end gap-3 bg-muted/20">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="rounded-xl">
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={(e) => {
              const form = e.currentTarget.closest('.bg-card')?.querySelector('form')
              if (form) form.requestSubmit()
            }}
            disabled={loading}
            className="rounded-xl font-bold min-w-32 shadow-md shadow-primary/20"
          >
            {loading ? "Salvando..." : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Sessão
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
