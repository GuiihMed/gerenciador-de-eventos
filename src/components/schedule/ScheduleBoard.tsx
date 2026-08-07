"use client"

import { Printer, MapPin, Users, Clock, Search, Star, QrCode, LayoutGrid, List } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useState } from "react"
import { EvaluationQRCodeModal } from "@/components/schedule/EvaluationQRCodeModal"
import { ScheduleMatrixView } from "@/components/schedule/ScheduleMatrixView"

type Speaker = { id: string; name: string; role: string | null; avatarUrl: string | null }
type Room = { label: string }
type Activity = {
  id: string
  title: string
  description: string | null
  startTime: string
  endTime: string
  capacity: number | null
  speakers: { speaker: Speaker }[]
  taxonomies: { taxonomyValue: Room }[]
}

type TimeBlock = {
  id: string
  startTime: string
  endTime: string
  activities: Activity[]
}

type ScheduleDay = {
  id: string
  date: string
  label: string | null
  blocks: TimeBlock[]
}

export function ScheduleBoard({ 
  days, 
  isEmbed = false 
}: { 
  days: ScheduleDay[], 
  isEmbed?: boolean 
}) {
  const handlePrint = () => {
    window.print()
  }

  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"matrix" | "list">("matrix")
  const [qrModalActivity, setQrModalActivity] = useState<any | null>(null)

  // Filtro de Atividades
  const filteredDays = days.map(day => {
    const term = searchTerm.toLowerCase()
    const blocks = day.blocks.map(block => {
      const activities = block.activities.filter(act => {
        if (!term) return true
        const matchTitle = act.title.toLowerCase().includes(term)
        const matchDesc = act.description?.toLowerCase().includes(term)
        const matchSpeaker = act.speakers.some(s => s.speaker.name.toLowerCase().includes(term))
        return matchTitle || matchDesc || matchSpeaker
      })
      return { ...block, activities }
    }).filter(block => block.activities.length > 0)
    return { ...day, blocks }
  }).filter(day => day.blocks.length > 0)

  return (
    <div className={cn(isEmbed ? "p-4 sm:p-8 bg-background min-h-screen" : "")}>
      <div className={cn("space-y-10", isEmbed ? "max-w-6xl mx-auto" : "")}>
        {/* Barra Superior / Controles */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-card p-6 rounded-2xl border border-border shadow-sm print:hidden">
          
          {!isEmbed ? (
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Grade de Programação</h1>
              <p className="text-muted-foreground mt-1 text-sm">Monte a agenda do seu evento e visualize como os participantes verão.</p>
            </div>
          ) : (
            <div className="flex-1 w-full relative max-w-sm">
               <h1 className="text-xl font-bold tracking-tight text-foreground mb-2 hidden md:block">Programação Oficial</h1>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {/* Seletor de Modo de Visualização */}
            <div className="flex items-center p-1 bg-muted rounded-xl border border-border shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setViewMode("matrix")}
                className={cn(
                  "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-initial",
                  viewMode === "matrix"
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Matriz de Salas
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-initial",
                  viewMode === "list"
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List className="h-3.5 w-3.5" />
                Lista / Cards
              </button>
            </div>

            {/* Busca */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text"
                placeholder="Buscar aula ou palestrante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
              />
            </div>
            
            <button 
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl shadow-md shadow-primary/20 hover:bg-primary/90 transition-all font-semibold text-sm w-full sm:w-auto shrink-0"
            >
              <Printer className="h-4 w-4" />
              Imprimir PDF
            </button>
          </div>
        </div>

        {/* Header do PDF - só aparece na impressão */}
        <div className="hidden print:block text-center mb-8">
          <h1 className="text-4xl font-extrabold text-black uppercase tracking-wide">Programação Oficial</h1>
          <hr className="mt-6 border-t border-gray-300" />
        </div>

        {/* Conteúdo da Programação */}
        <div className="space-y-16 print:space-y-12">
          {filteredDays.length === 0 ? (
            <div className="text-center text-muted-foreground py-12 bg-card rounded-xl border border-border print:hidden">
              Nenhuma atividade encontrada com o termo "{searchTerm}".
            </div>
          ) : viewMode === "matrix" ? (
            /* VISÃO EM MATRIZ DE GRADE POR SALAS */
            filteredDays.map(day => (
              <ScheduleMatrixView
                key={day.id}
                day={day}
                isEmbed={isEmbed}
                onQrClick={(act) => setQrModalActivity(act)}
              />
            ))
          ) : (
            /* VISÃO EM LISTA TRADICIONAL */
            filteredDays.map(day => (
              <div key={day.id} className="space-y-6">
                
                {/* Cabeçalho do Dia */}
                <div className="border-b-2 border-border print:border-black pb-3">
                  <h2 className="text-2xl font-bold text-primary print:text-black flex items-center gap-2">
                    <CalendarIcon className="h-6 w-6 print:hidden" /> 
                    {day.label} - {new Date(day.date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                  </h2>
                </div>

                <div className="space-y-10 print:space-y-8">
                  {day.blocks.map(block => (
                    <div key={block.id} className="space-y-8">
                      
                      {block.activities.map(activity => {
                        const roomName = activity.taxonomies.length > 0 ? activity.taxonomies[0].taxonomyValue.label : null
                        const allSpeakers = activity.speakers.map(s => s.speaker)
                        const mainSpeakers = allSpeakers.filter(s => s.role !== 'Moderador')
                        const moderators = allSpeakers.filter(s => s.role === 'Moderador')
                        const displaySpeakers = mainSpeakers.length > 0 ? mainSpeakers : allSpeakers

                        return (
                          <div key={activity.id} className="group relative break-inside-avoid">
                            
                            <div className={cn(
                              "transition-all print:p-0 print:border-none print:bg-transparent print:shadow-none",
                              !isEmbed ? "bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md" : "pb-6 border-b border-border/50 last:border-0"
                            )}>
                              
                              {/* Meta Informações + Botão de Avaliar */}
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <div className={cn("flex flex-wrap items-center gap-1.5 font-semibold text-primary print:text-gray-700", isEmbed ? "text-xs" : "text-xs sm:text-sm")}>
                                  <span>{activity.startTime} – {activity.endTime}</span>
                                  
                                  {roomName && (
                                    <>
                                      <span className="text-muted-foreground print:text-gray-500 font-normal">|</span>
                                      <span className="text-muted-foreground print:text-gray-700">{roomName}</span>
                                    </>
                                  )}

                                  {activity.capacity && (
                                    <>
                                      <span className="text-muted-foreground print:text-gray-500 font-normal">|</span>
                                      <span className="text-muted-foreground print:text-gray-700">Vagas: {activity.capacity}</span>
                                    </>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 print:hidden">
                                  <Link
                                    href={`/avaliar/${activity.id}`}
                                    target="_blank"
                                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30 transition-colors"
                                  >
                                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> Avaliar Aula
                                  </Link>
                                  <button
                                    onClick={() => setQrModalActivity(activity)}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-lg border border-primary/30 transition-colors"
                                  >
                                    <QrCode className="h-3.5 w-3.5" /> QR Code
                                  </button>
                                </div>
                              </div>

                              {/* Tema da sala */}
                              <h3 className={cn("font-bold text-foreground leading-tight print:text-black mb-1.5", isEmbed ? "text-lg sm:text-xl" : "text-xl sm:text-2xl")}>
                                {activity.title}
                              </h3>
                              
                              {/* Sub-tema */}
                              {activity.description && (
                                <p className={cn("text-muted-foreground print:text-gray-600 leading-relaxed mb-4", isEmbed ? "text-sm" : "text-base")}>
                                  {activity.description}
                                </p>
                              )}

                              {/* Palestrantes e Moderadores */}
                              {(displaySpeakers.length > 0 || moderators.length > 0) && (
                                <div className="flex flex-col gap-4">
                                  {displaySpeakers.map(speaker => (
                                    <div key={speaker.id} className="flex items-center gap-4">
                                    <div className={cn("rounded-full overflow-hidden bg-muted border border-border shrink-0 print:border-gray-300 print:bg-white flex items-center justify-center", isEmbed ? "h-10 w-10" : "h-12 w-12")}>
                                        {speaker.avatarUrl ? (
                                          <img src={speaker.avatarUrl} alt={speaker.name} className="h-full w-full object-cover" />
                                        ) : (
                                          <span className={cn("font-bold text-muted-foreground print:text-gray-500", isEmbed ? "text-base" : "text-lg")}>
                                            {speaker.name.charAt(0)}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex flex-col">
                                        <Link 
                                          href={isEmbed ? `/incorporar/${speaker.id}` : `/admin/palestrantes/${speaker.id}`}
                                          className={cn("font-bold text-foreground hover:text-primary transition-colors print:text-black print:no-underline", isEmbed ? "text-sm" : "text-base")}
                                        >
                                          {speaker.name}
                                        </Link>
                                        {speaker.role && (
                                          <span className="text-[11px] sm:text-xs text-muted-foreground print:text-gray-500 uppercase tracking-widest mt-0.5">
                                            {speaker.role}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}

                                  {/* Moderadores */}
                                  {moderators.length > 0 && (
                                    <div className={cn("flex flex-wrap items-center gap-1.5 text-muted-foreground print:text-gray-600 mt-1", isEmbed ? "text-xs" : "text-sm")}>
                                      <span className="font-medium">Moderadores:</span>
                                      {moderators.map((mod, idx) => (
                                        <span key={mod.id}>
                                          <Link 
                                            href={isEmbed ? `/incorporar/${mod.id}` : `/admin/palestrantes/${mod.id}`}
                                            className="font-semibold text-foreground hover:text-primary transition-colors print:text-gray-800 print:no-underline"
                                          >
                                            {mod.name}
                                          </Link>
                                          {idx < moderators.length - 1 && ", "}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}

                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal do QR Code de Avaliação */}
      {qrModalActivity && (
        <EvaluationQRCodeModal
          isOpen={!!qrModalActivity}
          onClose={() => setQrModalActivity(null)}
          activity={qrModalActivity}
        />
      )}
    </div>
  )
}

function CalendarIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}
