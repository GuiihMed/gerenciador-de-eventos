"use client"

import { useState, useRef, useEffect } from "react"
import { QrCode, Search, CheckCircle2, AlertTriangle, XCircle, UserCheck, Users, Clock, Sparkles, RefreshCw, Camera, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { validateQRCodeToken, toggleManualCheckIn } from "@/server/actions/checkin"

interface CheckInClientProps {
  initialAttendees: any[]
  initialStats: {
    total: number
    checkedIn: number
    pending: number
    percentage: number
  }
  eventName?: string
}

export function CheckInClient({ initialAttendees, initialStats, eventName }: CheckInClientProps) {
  const [attendees, setAttendees] = useState(initialAttendees)
  const [stats, setStats] = useState(initialStats)
  const [qrToken, setQrToken] = useState("")
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<{
    status: "IDLE" | "SUCCESS" | "ALREADY_CHECKED_IN" | "NOT_FOUND" | "ERROR"
    message: string
    attendee?: any
  }>({ status: "IDLE", message: "" })

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"ALL" | "CHECKED_IN" | "PENDING">("ALL")

  // Camera Scanner Modal State
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // Gerenciar início e término da Câmera
  const startCamera = async () => {
    try {
      setIsCameraOpen(true)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      })
      setMediaStream(stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err: any) {
      console.error("Erro ao acessar a câmera:", err)
      alert("Não foi possível acessar a câmera do dispositivo. Verifique as permissões de acesso.")
      setIsCameraOpen(false)
    }
  }

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop())
      setMediaStream(null)
    }
    setIsCameraOpen(false)
  }

  const handleScanSubmit = async (tokenToValidate?: string) => {
    const token = tokenToValidate || qrToken
    if (!token.trim()) return

    setScanning(true)
    setScanResult({ status: "IDLE", message: "" })

    const res = await validateQRCodeToken(token)

    if (res.success && res.attendee) {
      setScanResult({
        status: "SUCCESS",
        message: res.message,
        attendee: res.attendee
      })
      setAttendees(prev => prev.map(a => a.id === res.attendee.id ? res.attendee : a))
      setStats(prev => {
        const newCheckedIn = prev.checkedIn + 1
        return {
          ...prev,
          checkedIn: newCheckedIn,
          pending: prev.total - newCheckedIn,
          percentage: Math.round((newCheckedIn / prev.total) * 100)
        }
      })
    } else {
      setScanResult({
        status: (res.status as any) || "NOT_FOUND",
        message: res.message || "Erro ao processar o ingresso.",
        attendee: res.attendee
      })
    }

    setQrToken("")
    setScanning(false)
    if (isCameraOpen) stopCamera()
  }

  const handleManualToggle = async (attendeeId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus
    const res = await toggleManualCheckIn(attendeeId, nextStatus)

    if (res.success && res.attendee) {
      setAttendees(prev => prev.map(a => a.id === attendeeId ? res.attendee : a))
      setStats(prev => {
        const newCheckedIn = nextStatus ? prev.checkedIn + 1 : prev.checkedIn - 1
        return {
          ...prev,
          checkedIn: newCheckedIn,
          pending: prev.total - newCheckedIn,
          percentage: Math.round((newCheckedIn / prev.total) * 100)
        }
      })
    } else {
      alert(res.error || "Erro ao atualizar check-in manual.")
    }
  }

  const filteredAttendees = attendees.filter(a => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.company && a.company.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus =
      statusFilter === "ALL"
        ? true
        : statusFilter === "CHECKED_IN"
        ? a.isCheckedIn
        : !a.isCheckedIn

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-8">
      {/* Cards de estatísticas */}
      <div className="grid gap-6 sm:grid-cols-4">
        <Card className="bg-card border-border shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total de Inscritos</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">{String(stats.total).padStart(2, "0")}</div>
            <p className="text-xs text-muted-foreground mt-1">Inscrições confirmadas</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Presentes no Evento</CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-emerald-500">{String(stats.checkedIn).padStart(2, "0")}</div>
            <p className="text-xs text-emerald-500 mt-1 font-medium">{stats.percentage}% de presença</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ainda Ausentes</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">{String(stats.pending).padStart(2, "0")}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Aguardando credenciamento</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm rounded-2xl flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Taxa de Ocupação</CardTitle>
            <Sparkles className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold text-foreground">{stats.percentage}%</div>
            <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
              <div style={{ width: `${stats.percentage}%` }} className="bg-emerald-500 h-full transition-all duration-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Terminal de Credenciamento Rápido com opção de Câmera */}
      <Card className="bg-card border-2 border-primary/30 shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className="bg-primary/10 border-b border-primary/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <QrCode className="h-6 w-6 text-primary" />
                Terminal de Credenciamento Rápido (Leitor de QR Code)
              </CardTitle>
              <CardDescription className="mt-1">
                Bipe com scanner físico, cole o código ou acione a câmera do dispositivo.
              </CardDescription>
            </div>

            <Button
              onClick={startCamera}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 shrink-0"
            >
              <Camera className="mr-2 h-5 w-5" /> Ler QR Code via Câmera
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <form onSubmit={(e) => { e.preventDefault(); handleScanSubmit(); }} className="flex gap-3">
            <div className="relative flex-1">
              <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
              <Input
                ref={inputRef}
                value={qrToken}
                onChange={(e) => setQrToken(e.target.value)}
                placeholder="Cole ou bipe o código do QR Code do participante..."
                className="pl-10 bg-muted/30 focus:bg-background rounded-xl font-mono text-sm h-12"
              />
            </div>
            <Button type="submit" disabled={scanning} className="h-12 px-6 rounded-xl font-bold text-sm shadow-md shadow-primary/20">
              {scanning ? <RefreshCw className="h-5 w-5 animate-spin" /> : "Validar Entrada"}
            </Button>
          </form>

          {/* Banner de Resultado da Bipagem */}
          {scanResult.status !== "IDLE" && (
            <div className={`p-6 rounded-2xl border transition-all animate-in fade-in duration-300 ${
              scanResult.status === "SUCCESS"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                : scanResult.status === "ALREADY_CHECKED_IN"
                ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                : "bg-destructive/10 border-destructive/30 text-destructive"
            }`}>
              <div className="flex items-start gap-4">
                {scanResult.status === "SUCCESS" ? (
                  <CheckCircle2 className="h-10 w-10 shrink-0 text-emerald-500 mt-1" />
                ) : scanResult.status === "ALREADY_CHECKED_IN" ? (
                  <AlertTriangle className="h-10 w-10 shrink-0 text-amber-500 mt-1" />
                ) : (
                  <XCircle className="h-10 w-10 shrink-0 text-destructive mt-1" />
                )}

                <div className="space-y-2 flex-1">
                  <h3 className="text-xl font-extrabold">{scanResult.message}</h3>

                  {scanResult.attendee && (
                    <div className="p-4 bg-background/80 rounded-xl border border-border text-foreground space-y-1 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-base">{scanResult.attendee.name}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                          {scanResult.attendee.ticketType || "STANDARD"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{scanResult.attendee.email}</p>
                      {scanResult.attendee.company && (
                        <p className="text-xs text-primary font-semibold mt-1">
                          {scanResult.attendee.company} {scanResult.attendee.role ? `(${scanResult.attendee.role})` : ""}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal do Leitor de Câmera ao Vivo */}
      <Dialog open={isCameraOpen} onOpenChange={(open) => !open && stopCamera()}>
        <DialogContent className="sm:max-w-[480px] bg-card border-border shadow-2xl rounded-2xl p-6 text-center">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center justify-center gap-2 text-foreground">
              <Camera className="h-6 w-6 text-emerald-500" />
              Leitor de Câmera ao Vivo
            </DialogTitle>
            <DialogDescription>
              Aproxime o QR Code do ingresso da câmera para validar a entrada.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-square border-4 border-emerald-500/50 shadow-inner flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-12 border-2 border-emerald-400 border-dashed rounded-2xl animate-pulse pointer-events-none" />
            </div>

            <div className="p-3 bg-muted/40 rounded-xl border border-border text-xs text-muted-foreground">
              Insira o código manualmente se a câmera não reconhecer automaticamente.
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleScanSubmit(); }} className="flex gap-2">
              <Input
                placeholder="Código lido..."
                value={qrToken}
                onChange={(e) => setQrToken(e.target.value)}
                className="rounded-xl font-mono text-sm"
              />
              <Button type="submit" className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white">
                Confirmar
              </Button>
            </form>

            <Button variant="outline" onClick={stopCamera} className="w-full rounded-xl">
              Fechar Câmera
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tabela de Credenciamento Manual */}
      <Card className="bg-card border border-border shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base font-bold text-foreground">Credenciamento Manual & Busca de Participantes</CardTitle>
          <CardDescription>Use se o participante não estiver com o QR Code impresso no celular.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, e-mail ou empresa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50 border-transparent focus:bg-background transition-colors rounded-xl"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary h-10"
            >
              <option value="ALL">Todos os Inscritos</option>
              <option value="CHECKED_IN">Já Credenciados (Presentes)</option>
              <option value="PENDING">Pendentes (Ausentes)</option>
            </select>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-4">Participante</th>
                    <th className="p-4">E-mail</th>
                    <th className="p-4">Tipo de Ingresso</th>
                    <th className="p-4">Status de Entrada</th>
                    <th className="p-4 text-right">Ação de Credenciamento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-sm">
                  {filteredAttendees.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        Nenhum participante encontrado.
                      </td>
                    </tr>
                  ) : (
                    filteredAttendees.map(att => (
                      <tr key={att.id} className="hover:bg-muted/10 transition-colors">
                        <td className="p-4 font-bold text-foreground">{att.name}</td>
                        <td className="p-4 text-xs text-muted-foreground">{att.email}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                            {att.ticketType || "STANDARD"}
                          </span>
                        </td>
                        <td className="p-4">
                          {att.isCheckedIn ? (
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                              <CheckCircle2 className="h-4 w-4" /> Presente ({new Date(att.checkedInAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })})
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground opacity-60">
                              <Clock className="h-4 w-4" /> Ausente
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            size="sm"
                            variant={att.isCheckedIn ? "outline" : "default"}
                            onClick={() => handleManualToggle(att.id, att.isCheckedIn)}
                            className={`rounded-xl font-bold text-xs ${
                              att.isCheckedIn
                                ? "border-destructive/30 text-destructive hover:bg-destructive/10"
                                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                            }`}
                          >
                            {att.isCheckedIn ? "Desfazer Entrada" : "Confirmar Presença"}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
