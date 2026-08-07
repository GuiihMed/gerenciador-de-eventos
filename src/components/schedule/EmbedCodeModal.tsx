"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Code2, Copy, Check, ExternalLink, Globe } from "lucide-react"

interface EmbedCodeModalProps {
  isOpen: boolean
  onClose: () => void
  eventId: string
}

export function EmbedCodeModal({ isOpen, onClose, eventId }: EmbedCodeModalProps) {
  const [origin, setOrigin] = useState("")
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedIframe, setCopiedIframe] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin)
    }
  }, [])

  const publicUrl = `${origin}/evento/${eventId}`
  const embedUrl = `${origin}/incorporar/${eventId}/programacao`
  const iframeCode = `<iframe src="${embedUrl}" width="100%" height="800px" frameborder="0" style="border:0; width:100%; min-height:700px;" allowfullscreen></iframe>`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleCopyIframe = () => {
    navigator.clipboard.writeText(iframeCode)
    setCopiedIframe(true)
    setTimeout(() => setCopiedIframe(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] border-border bg-card shadow-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
            <Code2 className="h-5 w-5 text-primary" />
            Incorporar & Compartilhar Programação
          </DialogTitle>
          <DialogDescription>
            Use os links abaixo para embutir a agenda no seu site ou compartilhar diretamente com os participantes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Link Público */}
          <div className="space-y-2">
            <Label className="text-foreground flex items-center justify-between text-sm font-semibold">
              <span className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" /> Link Público do Evento
              </span>
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Testar no Navegador <ExternalLink className="h-3 w-3" />
              </a>
            </Label>
            <div className="flex gap-2">
              <Input value={publicUrl} readOnly className="bg-muted/40 text-xs rounded-xl font-mono" />
              <Button size="sm" onClick={handleCopyLink} className="rounded-xl shrink-0 font-semibold">
                {copiedLink ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 mr-1" />}
                {copiedLink ? "Copiado!" : "Copiar Link"}
              </Button>
            </div>
          </div>

          {/* Código iFrame */}
          <div className="space-y-2">
            <Label className="text-foreground flex items-center gap-2 text-sm font-semibold">
              <Code2 className="h-4 w-4 text-primary" /> Código HTML iFrame (Para embutir no seu site)
            </Label>
            <textarea
              value={iframeCode}
              readOnly
              rows={4}
              className="w-full bg-muted/40 text-xs font-mono p-3 rounded-xl border border-border text-foreground focus:outline-none resize-none"
            />
            <Button size="sm" onClick={handleCopyIframe} className="w-full rounded-xl font-bold shadow-md shadow-primary/20">
              {copiedIframe ? <Check className="h-4 w-4 mr-2 text-emerald-400" /> : <Copy className="h-4 w-4 mr-2" />}
              {copiedIframe ? "Código iFrame Copiado!" : "Copiar Código iFrame"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
