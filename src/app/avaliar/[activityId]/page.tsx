"use client"

import { useState, useEffect, use } from "react"
import { Star, CheckCircle2, AlertCircle, Sparkles, MessageSquare, User, Clock, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getActivityPublicDetails, submitActivityFeedback } from "@/server/actions/feedback"

export default function EvaluateActivityPage({ params }: { params: any }) {
  const resolvedParams = use(Promise.resolve(params)) as { activityId: string }
  const activityId = resolvedParams.activityId

  const [activity, setActivity] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [authorName, setAuthorName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    async function loadData() {
      if (!activityId) return
      const res = await getActivityPublicDetails(activityId)
      if (res.success && res.activity) {
        setActivity(res.activity)
      } else {
        setError(res.error || "Aula ou palestra não encontrada.")
      }
      setLoading(false)
    }
    loadData()
  }, [activityId])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (rating < 1) {
      alert("Por favor selecione pelo menos 1 estrela para avaliar.")
      return
    }
    setSubmitting(true)

    const res = await submitActivityFeedback(activityId, rating, comment, authorName)
    if (res.success) {
      setSubmitted(true)
    } else {
      alert(res.error || "Erro ao enviar sua avaliação.")
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Sparkles className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">Carregando formulário de avaliação...</p>
        </div>
      </div>
    )
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-card border-border shadow-xl rounded-2xl p-6 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground">Aula Não Encontrada</h2>
          <p className="text-sm text-muted-foreground mt-2">{error || "Não foi possível carregar a palestra solicitada."}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-card/50 to-background flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="max-w-lg w-full space-y-6">
        {/* Cabeçalho */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
            <Sparkles className="h-3.5 w-3.5" />
            {activity.eventName}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Avaliação de Palestra
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Sua opinião é fundamental para aprimorarmos nossas apresentações!
          </p>
        </div>

        {/* Card da Aula */}
        <Card className="bg-card/80 backdrop-blur border-border shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/60 pb-4">
            <CardTitle className="text-lg font-extrabold text-foreground leading-snug">
              {activity.title}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-primary" />
                {activity.startTime} - {activity.endTime}
              </span>
              {activity.room && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  {activity.room}
                </span>
              )}
            </div>

            {activity.speakers.length > 0 && (
              <div className="pt-3 flex flex-wrap gap-2">
                {activity.speakers.map((sp: any, i: number) => (
                  <span key={i} className="text-xs font-semibold text-foreground bg-background px-2.5 py-1 rounded-lg border border-border">
                    🎤 {sp.name}
                  </span>
                ))}
              </div>
            )}
          </CardHeader>

          <CardContent className="p-6">
            {submitted ? (
              <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="h-16 w-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 font-extrabold">
                  <CheckCircle2 className="h-10 w-10 shrink-0" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-extrabold text-foreground">Avaliação Enviada!</h3>
                  <p className="text-sm text-muted-foreground">Muito obrigado por compartilhar seu feedback conosco.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Seleção de Estrelas */}
                <div className="space-y-3 text-center">
                  <label className="text-sm font-bold text-foreground block">
                    Qual nota você dá para esta aula / palestra? *
                  </label>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = star <= (hoverRating || rating)
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="p-1 transition-transform hover:scale-125 focus:outline-none"
                        >
                          <Star
                            className={`h-9 w-9 transition-colors ${
                              isFilled ? "fill-amber-400 text-amber-400 drop-shadow-md" : "text-muted-foreground/30"
                            }`}
                          />
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-xs font-semibold text-primary h-4">
                    {hoverRating || rating
                      ? ["", "Péssima 😞", "Razoável 😐", "Boa 🙂", "Muito Boa 😀", "Excelente! 🚀"][hoverRating || rating]
                      : "Clique em uma estrela"}
                  </p>
                </div>

                {/* Comentário opcional */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-primary" />
                    Comentário ou Sugestão (opcional)
                  </label>
                  <Textarea
                    placeholder="O que você achou do conteúdo, oratória e aprendizado?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="bg-muted/30 focus:bg-background rounded-xl text-sm min-h-24 resize-none"
                  />
                </div>

                {/* Nome opcional */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-primary" />
                    Seu Nome (opcional - deixe em branco para anônimo)
                  </label>
                  <Input
                    placeholder="Ex: Maria Silva"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="bg-muted/30 focus:bg-background rounded-xl text-sm"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting || rating === 0}
                  className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20"
                >
                  {submitting ? "Enviando..." : "Enviar Avaliação"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground font-mono">
          Powered by Gerenciador de Eventos
        </p>
      </div>
    </div>
  )
}
