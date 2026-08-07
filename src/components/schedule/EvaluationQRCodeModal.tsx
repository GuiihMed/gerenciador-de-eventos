"use client"

import { useState, useEffect } from "react"
import { QrCode, Copy, Check, ExternalLink, Sparkles, Star } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface EvaluationQRCodeModalProps {
  isOpen: boolean
  onClose: () => void
  activity: {
    id: string
    title: string
    speakers?: string
  }
}

export function EvaluationQRCodeModal({ isOpen, onClose, activity }: EvaluationQRCodeModalProps) {
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin)
    }
  }, [])

  const evalUrl = `${origin}/avaliar/${activity.id}`
  const qrCodeImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(evalUrl)}`

  const handleCopy = () => {
    navigator.clipboard.writeText(evalUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] bg-card border-border shadow-2xl rounded-2xl p-6 text-center">
        <DialogHeader>
          <div className="mx-auto bg-amber-500/10 text-amber-500 p-3 rounded-full w-fit mb-2 border border-amber-500/20">
            <Star className="h-6 w-6 fill-amber-500 text-amber-500" />
          </div>
          <DialogTitle className="text-xl font-extrabold text-foreground">
            QR Code de Avaliação da Aula
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1 line-clamp-2">
            Projete este QR Code no final da palestra &quot;{activity.title}&quot; para os participantes avaliarem instantaneamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4 flex flex-col items-center">
          {/* QR Code gigante em container com borda neon/destaque */}
          <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-primary/30 flex items-center justify-center">
            <img
              src={qrCodeImgUrl}
              alt="QR Code de Avaliação"
              className="h-56 w-56 object-contain"
            />
          </div>

          <div className="w-full space-y-3">
            <div className="p-3 bg-muted/40 rounded-xl border border-border flex items-center justify-between text-xs font-mono">
              <span className="truncate pr-2 text-muted-foreground">{evalUrl}</span>
              <Button size="sm" variant="ghost" onClick={handleCopy} className="shrink-0 h-8 px-2 font-sans font-bold text-xs">
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                <span className="ml-1">{copied ? "Copiado!" : "Copiar"}</span>
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl font-bold text-xs"
                onClick={() => window.open(evalUrl, "_blank")}
              >
                <ExternalLink className="mr-1.5 h-4 w-4" /> Abrir no Navegador
              </Button>
              <Button
                onClick={onClose}
                className="flex-1 rounded-xl font-bold text-xs shadow-md shadow-primary/20"
              >
                Concluído
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
