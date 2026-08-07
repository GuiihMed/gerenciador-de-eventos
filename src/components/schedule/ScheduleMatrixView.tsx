"use client"

import { useState } from "react"
import { Clock, Star, QrCode } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const ROOM_COLORS = [
  {
    header: "bg-lime-600 text-white border-lime-700",
    cardBg: "bg-lime-500/10 border-lime-500/30 dark:bg-lime-950/40 text-foreground",
    pill: "bg-lime-600/20 text-lime-700 dark:text-lime-300 border-lime-600/30",
    timeBadge: "bg-lime-700 text-white"
  },
  {
    header: "bg-amber-600 text-white border-amber-700",
    cardBg: "bg-amber-500/10 border-amber-500/30 dark:bg-amber-950/40 text-foreground",
    pill: "bg-amber-600/20 text-amber-700 dark:text-amber-300 border-amber-600/30",
    timeBadge: "bg-amber-700 text-white"
  },
  {
    header: "bg-sky-600 text-white border-sky-700",
    cardBg: "bg-sky-500/10 border-sky-500/30 dark:bg-sky-950/40 text-foreground",
    pill: "bg-sky-600/20 text-sky-700 dark:text-sky-300 border-sky-600/30",
    timeBadge: "bg-sky-700 text-white"
  },
  {
    header: "bg-purple-600 text-white border-purple-700",
    cardBg: "bg-purple-500/10 border-purple-500/30 dark:bg-purple-950/40 text-foreground",
    pill: "bg-purple-600/20 text-purple-700 dark:text-purple-300 border-purple-600/30",
    timeBadge: "bg-purple-700 text-white"
  },
  {
    header: "bg-stone-500 text-white border-stone-600",
    cardBg: "bg-stone-500/10 border-stone-500/30 dark:bg-stone-900/40 text-foreground",
    pill: "bg-stone-600/20 text-stone-700 dark:text-stone-300 border-stone-600/30",
    timeBadge: "bg-stone-700 text-white"
  },
  {
    header: "bg-rose-600 text-white border-rose-700",
    cardBg: "bg-rose-500/10 border-rose-500/30 dark:bg-rose-950/40 text-foreground",
    pill: "bg-rose-600/20 text-rose-700 dark:text-rose-300 border-rose-600/30",
    timeBadge: "bg-rose-700 text-white"
  },
  {
    header: "bg-emerald-600 text-white border-emerald-700",
    cardBg: "bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-950/40 text-foreground",
    pill: "bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border-emerald-600/30",
    timeBadge: "bg-emerald-700 text-white"
  },
  {
    header: "bg-indigo-600 text-white border-indigo-700",
    cardBg: "bg-indigo-500/10 border-indigo-500/30 dark:bg-indigo-950/40 text-foreground",
    pill: "bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 border-indigo-600/30",
    timeBadge: "bg-indigo-700 text-white"
  }
]

interface ScheduleMatrixViewProps {
  day: any
  isEmbed?: boolean
  onQrClick?: (activity: any) => void
}

export function ScheduleMatrixView({ day, isEmbed = false, onQrClick }: ScheduleMatrixViewProps) {
  if (!day || !day.blocks || day.blocks.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground bg-card rounded-2xl border border-border">
        Nenhuma atividade cadastrada neste dia.
      </div>
    )
  }

  // 1. Extrair todas as salas distintas presentes no dia
  const roomMap = new Map<string, string>() // roomLabel -> roomId/label
  day.blocks.forEach((block: any) => {
    block.activities.forEach((act: any) => {
      const roomLabel = act.taxonomies?.[0]?.taxonomyValue?.label || "Sem Sala"
      if (!roomMap.has(roomLabel)) {
        roomMap.set(roomLabel, roomLabel)
      }
    })
  })

  const roomsList = Array.from(roomMap.keys())

  // Se não houver salas definidas, coloca uma padrão
  if (roomsList.length === 0) {
    roomsList.push("Programação Geral")
  }

  // Formatar data de cabeçalho: Ex "06/08/2026 (Quinta-feira)"
  const dateObj = new Date(day.date)
  const formattedDate = dateObj.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  })
  const weekday = dateObj.toLocaleDateString("pt-BR", { weekday: "long" })
  const formattedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1)

  return (
    <div className="space-y-6">
      {/* Título da Data superior igual à imagem */}
      <div className="border-b border-border/80 pb-3 flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          {formattedDate} <span className="text-muted-foreground font-semibold text-xl sm:text-2xl">({formattedWeekday})</span>
        </h2>
      </div>

      {/* Grid Matriz com Scroll Horizontal Responsivo */}
      <div className="overflow-x-auto border border-border rounded-2xl bg-card shadow-lg print:border-black">
        <div className="min-w-[850px] w-full">
          {/* Cabeçalho das Salas */}
          <div className="grid grid-cols-[100px_repeat(auto-fit,minmax(200px,1fr))] border-b border-border sticky top-0 z-10 bg-card">
            {/* Coluna da esquerda do horário */}
            <div className="p-3 bg-muted/60 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground border-r border-border flex items-center justify-center">
              Horário
            </div>

            {/* Colunas das Salas */}
            <div className="col-span-1 grid grid-flow-col auto-cols-fr divide-x divide-border">
              {roomsList.map((roomName, idx) => {
                const colorScheme = ROOM_COLORS[idx % ROOM_COLORS.length]
                return (
                  <div
                    key={roomName}
                    className={cn(
                      "p-3 text-center text-sm font-extrabold uppercase tracking-wider shadow-sm",
                      colorScheme.header
                    )}
                  >
                    {roomName}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Linhas de Blocos de Horário */}
          <div className="divide-y divide-border/60">
            {day.blocks.map((block: any) => {
              return (
                <div key={block.id} className="grid grid-cols-[100px_repeat(auto-fit,minmax(200px,1fr))] min-h-[140px]">
                  {/* Horário da esquerda */}
                  <div className="p-3 text-center font-bold text-xs text-foreground bg-muted/20 border-r border-border flex flex-col justify-start pt-4 space-y-1">
                    <span className="text-sm font-black text-primary">{block.startTime}</span>
                    <span className="text-[10px] text-muted-foreground">até {block.endTime}</span>
                  </div>

                  {/* Células por Sala */}
                  <div className="col-span-1 grid grid-flow-col auto-cols-fr divide-x divide-border/60">
                    {roomsList.map((roomName, roomIdx) => {
                      const colorScheme = ROOM_COLORS[roomIdx % ROOM_COLORS.length]

                      // Encontrar atividades desse bloco nesta sala
                      const roomActivities = block.activities.filter((act: any) => {
                        const actRoom = act.taxonomies?.[0]?.taxonomyValue?.label || "Sem Sala"
                        return actRoom === roomName || (roomsList.length === 1 && roomName === "Programação Geral")
                      })

                      return (
                        <div key={roomName} className="p-2.5 flex flex-col gap-2.5 bg-background/50 hover:bg-muted/10 transition-colors">
                          {roomActivities.length === 0 ? (
                            <div className="h-full min-h-[100px] flex items-center justify-center opacity-10 text-xs italic font-medium">
                              —
                            </div>
                          ) : (
                            roomActivities.map((act: any) => {
                              const speakers = act.speakers?.map((s: any) => s.speaker) || []

                              return (
                                <div
                                  key={act.id}
                                  className={cn(
                                    "p-3 rounded-xl border transition-all flex flex-col justify-between space-y-3 shadow-sm",
                                    colorScheme.cardBg
                                  )}
                                >
                                  {/* Badge de Horário + Tags */}
                                  <div className="space-y-1.5">
                                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
                                      <span className={cn("px-2 py-0.5 rounded-md text-[10px] uppercase font-extrabold flex items-center gap-1", colorScheme.timeBadge)}>
                                        <Clock className="h-3 w-3" />
                                        {act.startTime} - {act.endTime}
                                      </span>
                                    </div>

                                    {/* Título da Aula */}
                                    <h4 className="font-extrabold text-xs sm:text-sm text-foreground leading-snug">
                                      {act.title}
                                    </h4>

                                    {/* Descrição se houver */}
                                    {act.description && (
                                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                                        {act.description}
                                      </p>
                                    )}
                                  </div>

                                  {/* Lista de Palestrantes com Avatar & Cargo */}
                                  {speakers.length > 0 && (
                                    <div className="space-y-2 pt-1 border-t border-border/40">
                                      {speakers.map((sp: any) => (
                                        <div key={sp.id} className="flex items-center gap-2 text-xs">
                                          <div className="h-7 w-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary shrink-0 overflow-hidden text-[11px]">
                                            {sp.avatarUrl ? (
                                              <img src={sp.avatarUrl} alt={sp.name} className="h-full w-full object-cover" />
                                            ) : (
                                              sp.name.charAt(0).toUpperCase()
                                            )}
                                          </div>
                                          <div className="flex flex-col leading-tight min-w-0">
                                            <span className="font-bold text-foreground truncate text-[11px]">
                                              {sp.name}
                                            </span>
                                            {sp.role && (
                                              <span className="text-[10px] text-muted-foreground uppercase font-medium truncate">
                                                {sp.role}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Botões de Ação na Célula */}
                                  <div className="flex items-center justify-end gap-1 pt-1 print:hidden">
                                    <Link
                                      href={`/avaliar/${act.id}`}
                                      target="_blank"
                                      className="p-1 rounded-md text-amber-500 hover:bg-amber-500/10 transition-colors"
                                      title="Avaliar palestra"
                                    >
                                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                    </Link>
                                    {onQrClick && (
                                      <button
                                        type="button"
                                        onClick={() => onQrClick(act)}
                                        className="p-1 rounded-md text-primary hover:bg-primary/10 transition-colors"
                                        title="QR Code de Avaliação"
                                      >
                                        <QrCode className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )
                            })
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
