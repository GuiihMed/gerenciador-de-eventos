"use client"

import { useState } from "react"
import { Calendar as CalendarIcon, Clock, Plus, Trash2, Edit3, MapPin, Users, AlertCircle, Layers, Globe, Code2, Printer, QrCode, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ActivityFormModal } from "./ActivityFormModal"
import { EmbedCodeModal } from "@/components/schedule/EmbedCodeModal"
import { EvaluationQRCodeModal } from "@/components/schedule/EvaluationQRCodeModal"
import {
  createScheduleDay,
  deleteScheduleDay,
  createTimeBlock,
  deleteTimeBlock,
  deleteActivity
} from "@/server/actions/schedule"

import { CSVImportModal } from "@/components/import/CSVImportModal"
import { importScheduleCSV } from "@/server/actions/import"
import { ScheduleMatrixView } from "@/components/schedule/ScheduleMatrixView"
import { FileSpreadsheet, LayoutGrid, List } from "lucide-react"

interface ScheduleManagerClientProps {
  initialEvent: any
  speakers: any[]
  rooms: any[]
}

export function ScheduleManagerClient({ initialEvent, speakers, rooms }: ScheduleManagerClientProps) {
  const [eventData, setEventData] = useState(initialEvent)
  const [selectedDayId, setSelectedDayId] = useState<string>(
    initialEvent?.days?.[0]?.id || ""
  )

  // View mode: 'manage' | 'matrix'
  const [viewMode, setViewMode] = useState<"manage" | "matrix">("manage")

  // Embed, QR Code & Import Modals
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [evalQrModalActivity, setEvalQrModalActivity] = useState<any | null>(null)

  // Forms rápidas
  const [showAddDay, setShowAddDay] = useState(false)
  const [newDayDate, setNewDayDate] = useState("")
  const [newDayLabel, setNewDayLabel] = useState("")

  const [showAddBlockDayId, setShowAddBlockDayId] = useState<string | null>(null)
  const [newBlockStart, setNewBlockStart] = useState("09:00")
  const [newBlockEnd, setNewBlockEnd] = useState("10:00")

  // Modal de Atividade
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    timeBlockId: string
    defaultStartTime: string
    defaultEndTime: string
    activityToEdit?: any
  }>({
    isOpen: false,
    timeBlockId: "",
    defaultStartTime: "09:00",
    defaultEndTime: "10:00"
  })

  const currentDay = eventData?.days?.find((d: any) => d.id === selectedDayId) || eventData?.days?.[0]

  const handleReload = () => {
    window.location.reload()
  }

  const handlePrintPDF = () => {
    window.print()
  }

  // Handlers para Dias
  const handleAddDay = async () => {
    if (!newDayDate) return
    const res = await createScheduleDay(newDayDate, newDayLabel)
    if (res.success && res.day) {
      setShowAddDay(false)
      setNewDayDate("")
      setNewDayLabel("")
      handleReload()
    }
  }

  const handleDeleteDay = async (id: string) => {
    if (confirm("Tem certeza que deseja remover este dia da programação?")) {
      await deleteScheduleDay(id)
      handleReload()
    }
  }

  // Handlers para Blocos
  const handleAddBlock = async (dayId: string) => {
    const res = await createTimeBlock(dayId, newBlockStart, newBlockEnd)
    if (res.success) {
      setShowAddBlockDayId(null)
      handleReload()
    }
  }

  const handleDeleteBlock = async (id: string) => {
    if (confirm("Remover este bloco de horário?")) {
      await deleteTimeBlock(id)
      handleReload()
    }
  }

  // Handlers para Atividades
  const handleDeleteActivity = async (id: string) => {
    if (confirm("Remover esta sessão?")) {
      await deleteActivity(id)
      handleReload()
    }
  }

  return (
    <div className="space-y-8">
      {/* Barra de Ações do Evento: Ver Página Pública, PDF & Incorporar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-primary/10 border border-primary/20 p-4 rounded-2xl print:hidden">
        <div>
          <h3 className="font-bold text-foreground flex items-center gap-2 text-base">
            <Globe className="h-5 w-5 text-primary" />
            Programação do Evento: <span className="text-primary">{eventData?.name}</span>
          </h3>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            className="rounded-xl font-bold border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 text-xs"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1.5" />
            Importar Agenda (CSV)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrintPDF}
            className="rounded-xl font-semibold bg-background border-border hover:bg-muted text-xs"
          >
            <Printer className="h-4 w-4 mr-1.5 text-primary" />
            Exportar PDF / Imprimir
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/evento/${eventData?.id}`, '_blank')}
            className="rounded-xl font-semibold bg-background border-border hover:bg-muted text-xs"
          >
            <Globe className="h-4 w-4 mr-1.5 text-primary" />
            Ver Página Pública
          </Button>

          <Button
            size="sm"
            onClick={() => setIsEmbedModalOpen(true)}
            className="rounded-xl font-semibold text-xs shadow-sm"
          >
            <Code2 className="h-4 w-4 mr-1.5" />
            Incorporar (iFrame)
          </Button>
        </div>
      </div>

      {/* Abas de Dias da Programação */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border/80 shadow-sm print:hidden">
        <div className="flex flex-wrap items-center gap-2 bg-muted/40 p-1.5 rounded-xl border border-border/60">
          {eventData?.days?.map((day: any, idx: number) => {
            const isActive = (currentDay?.id === day.id)
            return (
              <button
                key={day.id}
                onClick={() => setSelectedDayId(day.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-bold"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                <CalendarIcon className="h-4 w-4" />
                {day.label || `Dia ${idx + 1}`}
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-background text-muted-foreground"
                }`}>
                  {new Date(day.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                </span>
              </button>
            )
          })}

          {!showAddDay ? (
            <Button variant="outline" size="sm" onClick={() => setShowAddDay(true)} className="rounded-lg border-dashed text-xs font-semibold">
              <Plus className="h-4 w-4 mr-1" /> Adicionar Dia
            </Button>
          ) : (
            <div className="flex items-center gap-2 bg-background p-1.5 rounded-lg border border-border">
              <Input
                type="date"
                value={newDayDate}
                onChange={(e) => setNewDayDate(e.target.value)}
                className="h-8 text-xs rounded-md"
              />
              <Input
                placeholder="Rótulo (ex: Dia 1)"
                value={newDayLabel}
                onChange={(e) => setNewDayLabel(e.target.value)}
                className="h-8 text-xs rounded-md w-28"
              />
              <Button size="sm" onClick={handleAddDay} className="h-8 text-xs font-bold rounded-md">Salvar</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAddDay(false)} className="h-8 w-8 p-0 rounded-md">
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Seletor de Modo de Visualização Admin */}
          <div className="flex items-center p-1 bg-muted rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setViewMode("manage")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "manage"
                  ? "bg-background text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              Editar Blocos
            </button>

            <button
              type="button"
              onClick={() => setViewMode("matrix")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "matrix"
                  ? "bg-background text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Visão Matriz (Salas)
            </button>
          </div>

          {currentDay && (
            <Button variant="ghost" size="sm" onClick={() => handleDeleteDay(currentDay.id)} className="text-destructive hover:bg-destructive/10 font-bold text-xs">
              <Trash2 className="h-4 w-4 mr-1" /> Excluir Dia
            </Button>
          )}
        </div>
      </div>

      {!currentDay ? (
        <div className="py-20 text-center bg-card/40 rounded-2xl border border-dashed border-border flex flex-col items-center justify-center">
          <Layers className="h-16 w-16 text-muted-foreground opacity-30 mb-4" />
          <h3 className="text-xl font-semibold text-foreground">Nenhum dia cadastrado no evento</h3>
          <p className="text-muted-foreground max-w-sm mt-2">Clique no botão "Adicionar Dia" acima para criar a programação do primeiro dia do seu evento.</p>
        </div>
      ) : viewMode === "matrix" ? (
        <ScheduleMatrixView
          day={currentDay}
          onQrClick={(act) => setEvalQrModalActivity(act)}
        />
      ) : (
        <div className="space-y-8">
          
          {/* Adicionar Bloco de Horário */}
          <div className="flex items-center justify-between border-b border-border pb-4 print:hidden">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Blocos de Horários & Palestras
            </h2>

            {showAddBlockDayId !== currentDay.id ? (
              <Button size="sm" onClick={() => setShowAddBlockDayId(currentDay.id)} className="rounded-xl shadow-sm">
                <Plus className="h-4 w-4 mr-1" /> Novo Bloco de Horário
              </Button>
            ) : (
              <div className="flex items-center gap-2 bg-card p-2 rounded-xl border border-border shadow-sm">
                <Input type="time" value={newBlockStart} onChange={(e) => setNewBlockStart(e.target.value)} className="h-8 text-xs w-24 bg-background" />
                <span className="text-xs text-muted-foreground">até</span>
                <Input type="time" value={newBlockEnd} onChange={(e) => setNewBlockEnd(e.target.value)} className="h-8 text-xs w-24 bg-background" />
                <Button size="sm" onClick={() => handleAddBlock(currentDay.id)} className="h-8 text-xs rounded-lg">Criar Bloco</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowAddBlockDayId(null)} className="h-8 w-8 p-0"><X className="h-4 w-4" /></Button>
              </div>
            )}
          </div>

          {/* Lista de Blocos de Horário */}
          {currentDay.blocks?.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground bg-card/20 rounded-xl border border-border">
              Nenhum bloco de horário neste dia. Adicione um intervalo (ex: 09:00 - 10:00) para incluir palestras.
            </div>
          ) : (
            currentDay.blocks?.map((block: any) => (
              <div key={block.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
                
                {/* Header do Bloco */}
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-lg text-sm border border-primary/20">
                      {block.startTime} — {block.endTime}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      ({block.activities?.length || 0} {block.activities?.length === 1 ? 'sessão' : 'sessões'})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 print:hidden">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setModalState({
                        isOpen: true,
                        timeBlockId: block.id,
                        defaultStartTime: block.startTime,
                        defaultEndTime: block.endTime
                      })}
                      className="rounded-xl font-semibold"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Sessão
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDeleteBlock(block.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Lista de Sessões do Bloco */}
                {block.activities?.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border/50">
                    Nenhuma sessão neste horário. Clique em "+ Add Sessão" para colocar a primeira palestra.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {block.activities.map((activity: any) => {
                      const roomName = activity.taxonomies?.[0]?.taxonomyValue?.label
                      const activitySpeakers = activity.speakers?.map((s: any) => s.speaker) || []

                      return (
                        <Card key={activity.id} className="bg-muted/20 border-border shadow-none hover:border-primary/40 transition-colors relative group">
                          <CardContent className="p-5 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-1">
                                  <span>{activity.startTime} - {activity.endTime}</span>
                                  {roomName && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-1 text-muted-foreground">
                                        <MapPin className="h-3 w-3" /> {roomName}
                                      </span>
                                    </>
                                  )}
                                </div>
                                <h4 className="font-bold text-base text-foreground leading-snug">{activity.title}</h4>
                              </div>

                              {/* Ações e QR Code */}
                              <div className="flex items-center gap-1 print:hidden">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEvalQrModalActivity(activity)}
                                  className="h-8 px-2 rounded-xl text-xs font-semibold text-amber-500 border-amber-500/30 hover:bg-amber-500/10"
                                >
                                  <QrCode className="h-3.5 w-3.5 mr-1" /> QR Avaliação
                                </Button>

                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                  <Button
                                    size="icon"
                                    variant="secondary"
                                    className="h-8 w-8 rounded-full shadow-sm"
                                    onClick={() => setModalState({
                                      isOpen: true,
                                      timeBlockId: block.id,
                                      defaultStartTime: activity.startTime,
                                      defaultEndTime: activity.endTime,
                                      activityToEdit: activity
                                    })}
                                  >
                                    <Edit3 className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="destructive"
                                    className="h-8 w-8 rounded-full shadow-sm"
                                    onClick={() => handleDeleteActivity(activity.id)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {activity.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                {activity.description}
                              </p>
                            )}

                            {activitySpeakers.length > 0 && (
                              <div className="pt-2 border-t border-border/40 flex flex-wrap items-center gap-2">
                                {activitySpeakers.map((sp: any) => (
                                  <div key={sp.id} className="flex items-center gap-1.5 bg-background px-2.5 py-1 rounded-full border border-border text-xs font-medium text-foreground">
                                    <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary">
                                      {sp.name.charAt(0)}
                                    </div>
                                    <span>{sp.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Form de Atividades */}
      {modalState.isOpen && (
        <ActivityFormModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
          timeBlockId={modalState.timeBlockId}
          defaultStartTime={modalState.defaultStartTime}
          defaultEndTime={modalState.defaultEndTime}
          speakers={speakers}
          rooms={rooms}
          activityToEdit={modalState.activityToEdit}
          onSaved={handleReload}
        />
      )}

      {/* Modal de Código iFrame / Compartilhar */}
      {isEmbedModalOpen && (
        <EmbedCodeModal
          isOpen={isEmbedModalOpen}
          onClose={() => setIsEmbedModalOpen(false)}
          eventId={eventData?.id}
        />
      )}

      {/* Modal do QR Code de Avaliação */}
      {evalQrModalActivity && (
        <EvaluationQRCodeModal
          isOpen={!!evalQrModalActivity}
          onClose={() => setEvalQrModalActivity(null)}
          activity={evalQrModalActivity}
        />
      )}

      {/* Modal de Importação CSV de Programação */}
      {isImportModalOpen && (
        <CSVImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          type="schedule"
          importAction={importScheduleCSV}
        />
      )}
    </div>
  )
}

function X(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  )
}
