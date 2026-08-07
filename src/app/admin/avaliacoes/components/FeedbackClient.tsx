"use client"

import { useState } from "react"
import { Star, MessageSquare, Award, Users, Search, QrCode } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { EvaluationQRCodeModal } from "@/components/schedule/EvaluationQRCodeModal"

interface FeedbackClientProps {
  summary: {
    totalFeedbacks: number
    overallAverage: number
  }
  activities: any[]
  eventName?: string
}

export function FeedbackClient({ summary, activities, eventName }: FeedbackClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null)
  const [qrModalActivity, setQrModalActivity] = useState<any | null>(null)

  const filteredActivities = activities.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.speakers.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Cards de Métricas Gerais de Avaliação */}
      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="bg-card border-border shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Média Geral do Evento</CardTitle>
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-foreground flex items-baseline gap-2">
              {summary.overallAverage.toFixed(1)}
              <span className="text-sm text-muted-foreground font-normal">/ 5.0</span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(summary.overallAverage)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total de Avaliações</CardTitle>
            <MessageSquare className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-foreground">{summary.totalFeedbacks}</div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">Respostas enviadas por alunos</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aulas Avaliadas</CardTitle>
            <Award className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-foreground">
              {activities.filter(a => a.feedbackCount > 0).length} / {activities.length}
            </div>
            <p className="text-xs text-emerald-500 mt-2 font-medium">Sessões com feedback registrado</p>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar aula ou palestrante..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50 border-transparent focus:bg-background transition-colors rounded-xl"
          />
        </div>
      </div>

      {/* Lista de Aulas e Notas */}
      {filteredActivities.length === 0 ? (
        <div className="py-16 text-center bg-card/40 rounded-2xl border border-dashed border-border">
          <MessageSquare className="h-12 w-12 text-muted-foreground opacity-30 mx-auto mb-3" />
          <h3 className="font-semibold text-foreground text-lg">Nenhuma palestra encontrada</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredActivities.map(act => (
            <Card key={act.id} className="bg-card border-border shadow-sm rounded-2xl overflow-hidden flex flex-col justify-between">
              <CardHeader className="p-6 bg-muted/20 border-b border-border/60">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-primary block mb-1">{act.time}</span>
                    <CardTitle className="text-lg font-bold text-foreground leading-snug">{act.title}</CardTitle>
                    <p className="text-xs text-muted-foreground font-medium mt-1">🎤 {act.speakers}</p>
                  </div>

                  <div className="text-right shrink-0 bg-background/80 p-3 rounded-xl border border-border">
                    <div className="flex items-center gap-1 font-extrabold text-xl text-foreground">
                      <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                      {act.avgRating.toFixed(1)}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-bold block mt-0.5">
                      {act.feedbackCount} {act.feedbackCount === 1 ? 'voto' : 'votos'}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                {/* Botões de Ação */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQrModalActivity(act)}
                    className="flex-1 rounded-xl font-bold text-xs"
                  >
                    <QrCode className="mr-1.5 h-4 w-4 text-primary" /> Gerar QR Code
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedActivity(selectedActivity?.id === act.id ? null : act)}
                    className="flex-1 rounded-xl font-bold text-xs"
                  >
                    <MessageSquare className="mr-1.5 h-4 w-4" /> Comentários ({act.feedbacks.length})
                  </Button>
                </div>

                {/* Comentários expandidos */}
                {selectedActivity?.id === act.id && (
                  <div className="pt-3 border-t border-border space-y-3 animate-in fade-in duration-200">
                    <h5 className="text-xs font-bold text-foreground uppercase tracking-wider">Feedbacks dos Alunos:</h5>
                    {act.feedbacks.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">Nenhum comentário por extenso registrado ainda.</p>
                    ) : (
                      act.feedbacks.map((f: any) => (
                        <div key={f.id} className="p-3 bg-muted/30 rounded-xl border border-border/60 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground">{f.authorName || "Anônimo"}</span>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`h-3 w-3 ${
                                    s <= f.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {f.comment && <p className="text-muted-foreground text-xs pt-1">{f.comment}</p>}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de QR Code da Aula */}
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
