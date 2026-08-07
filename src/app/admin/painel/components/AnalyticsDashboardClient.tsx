"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, Layers, DoorOpen, Calendar, MapPin, Ticket, Award, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react"

interface AnalyticsDashboardClientProps {
  event: any
  metrics: {
    totalAttendees: number
    totalSpeakers: number
    totalActivities: number
    totalRooms: number
  }
  ticketBreakdown: {
    standard: number
    vip: number
    press: number
  }
  topSpeakers: any[]
  roomOccupancy: any[]
}

export function AnalyticsDashboardClient({
  event,
  metrics,
  ticketBreakdown,
  topSpeakers,
  roomOccupancy
}: AnalyticsDashboardClientProps) {
  const totalTickets = metrics.totalAttendees || 1 // Evita divisão por zero
  const standardPct = Math.round((ticketBreakdown.standard / totalTickets) * 100) || 0
  const vipPct = Math.round((ticketBreakdown.vip / totalTickets) * 100) || 0
  const pressPct = Math.round((ticketBreakdown.press / totalTickets) * 100) || 0

  const maxRoomActivities = Math.max(...roomOccupancy.map(r => r.activityCount), 1)

  return (
    <div className="space-y-8">
      {/* Event Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
              Evento Ativo
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            {event?.name || "Meu Evento"}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
            {event?.startDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                {new Date(event.startDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            )}
            {event?.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                {event.location}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 bg-muted/20 p-3 rounded-xl border border-border">
          <TrendingUp className="h-5 w-5 text-emerald-500 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-foreground block">{metrics.totalAttendees} Inscritos</span>
            <span className="text-muted-foreground">Engajamento Ativo</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Inscrições Totais</CardTitle>
            <Ticket className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">{String(metrics.totalAttendees).padStart(2, "0")}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Participantes cadastrados</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Palestrantes</CardTitle>
            <Users className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">{String(metrics.totalSpeakers).padStart(2, "0")}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Especialistas confirmados</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sessões na Agenda</CardTitle>
            <Layers className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">{String(metrics.totalActivities).padStart(2, "0")}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Palestras & Workshops</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Salas & Auditórios</CardTitle>
            <DoorOpen className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">{String(metrics.totalRooms).padStart(2, "0")}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Locais em uso</p>
          </CardContent>
        </Card>
      </div>

      {/* Relatórios Visuais */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Distribuição por Tipo de Ingresso */}
        <Card className="bg-card border-border shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" />
              Distribuição por Categoria de Ingresso
            </CardTitle>
            <CardDescription>Proporção de inscritos entre Geral, VIP e Imprensa.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Barra de Progresso Multi-cor */}
            <div className="h-4 w-full bg-muted/40 rounded-full overflow-hidden flex">
              <div style={{ width: `${standardPct}%` }} className="bg-emerald-500 h-full transition-all" />
              <div style={{ width: `${vipPct}%` }} className="bg-amber-500 h-full transition-all" />
              <div style={{ width: `${pressPct}%` }} className="bg-purple-500 h-full transition-all" />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-medium text-foreground">
                  <div className="h-3 w-3 rounded-full bg-emerald-500" /> Ingresso Geral (Standard)
                </span>
                <span className="font-bold text-foreground">{ticketBreakdown.standard} ({standardPct}%)</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-medium text-foreground">
                  <div className="h-3 w-3 rounded-full bg-amber-500" /> Ingresso VIP
                </span>
                <span className="font-bold text-foreground">{ticketBreakdown.vip} ({vipPct}%)</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-medium text-foreground">
                  <div className="h-3 w-3 rounded-full bg-purple-500" /> Imprensa / Mídia
                </span>
                <span className="font-bold text-foreground">{ticketBreakdown.press} ({pressPct}%)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Distribuição de Palestras por Sala */}
        <Card className="bg-card border-border shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <DoorOpen className="h-5 w-5 text-primary" />
              Alocação de Palestras por Sala
            </CardTitle>
            <CardDescription>Quantidade de sessões agendadas em cada auditório.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {roomOccupancy.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                Nenhuma sala cadastrada no evento ainda.
              </div>
            ) : (
              roomOccupancy.map(room => {
                const pct = Math.round((room.activityCount / maxRoomActivities) * 100)
                return (
                  <div key={room.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                      <span>{room.label}</span>
                      <span className="text-primary">{room.activityCount} {room.activityCount === 1 ? 'sessão' : 'sessões'}</span>
                    </div>
                    <div className="h-2.5 w-full bg-muted/40 rounded-full overflow-hidden">
                      <div style={{ width: `${pct}%` }} className="bg-primary h-full rounded-full transition-all" />
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Palestrantes Mais Populares */}
      <Card className="bg-card border-border shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            Palestrantes Mais Ativos no Evento
          </CardTitle>
          <CardDescription>Especialistas com maior volume de palestras agendadas.</CardDescription>
        </CardHeader>
        <CardContent>
          {topSpeakers.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Nenhum palestrante cadastrado ainda.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {topSpeakers.map(sp => (
                <div key={sp.id} className="p-4 bg-muted/20 rounded-xl border border-border flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold flex items-center justify-center shrink-0">
                    {sp.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <h5 className="font-bold text-sm text-foreground truncate">{sp.name}</h5>
                    <p className="text-xs text-muted-foreground truncate">{sp.role || "Palestrante"}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {sp._count.activities} {sp._count.activities === 1 ? 'palestra' : 'palestras'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
