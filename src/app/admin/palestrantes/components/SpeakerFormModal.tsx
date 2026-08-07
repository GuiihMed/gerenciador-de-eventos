import { useState } from "react"
import { Speaker } from "@prisma/client"
import { X, Save, User, Mail, Briefcase, FileText, Image as ImageIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { createSpeaker, updateSpeaker } from "@/server/actions/speaker"

interface SpeakerFormModalProps {
  isOpen: boolean
  onClose: () => void
  speaker: Speaker | null
  onSaved: (speaker: Speaker) => void
}

export function SpeakerFormModal({ isOpen, onClose, speaker, onSaved }: SpeakerFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      company: formData.get("company") as string,
      role: formData.get("role") as string,
      bio: formData.get("bio") as string,
      avatarUrl: formData.get("avatarUrl") as string,
    }

    if (!data.name) {
      setError("O nome é obrigatório")
      setLoading(false)
      return
    }

    try {
      const res = speaker 
        ? await updateSpeaker(speaker.id, data) 
        : await createSpeaker(data)

      if (res.success && res.speaker) {
        onSaved(res.speaker)
      } else {
        setError(res.error || "Erro ao salvar palestrante")
      }
    } catch (err) {
      setError("Erro interno ao conectar com servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-2xl rounded-2xl shadow-2xl border border-border flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {speaker ? "Editar Palestrante" : "Novo Palestrante"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-xl border border-destructive/20 text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground flex items-center gap-2">
                <User className="h-4 w-4 opacity-70" /> Nome Completo <span className="text-destructive">*</span>
              </Label>
              <Input id="name" name="name" defaultValue={speaker?.name || ""} placeholder="Ex: João da Silva" required className="bg-muted/30 focus:bg-background rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground flex items-center gap-2">
                <Mail className="h-4 w-4 opacity-70" /> E-mail
              </Label>
              <Input id="email" name="email" type="email" defaultValue={speaker?.email || ""} placeholder="Ex: joao@empresa.com" className="bg-muted/30 focus:bg-background rounded-xl" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="company" className="text-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4 opacity-70" /> Empresa
              </Label>
              <Input id="company" name="company" defaultValue={speaker?.company || ""} placeholder="Ex: Tech Corp" className="bg-muted/30 focus:bg-background rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4 opacity-70" /> Cargo
              </Label>
              <Input id="role" name="role" defaultValue={speaker?.role || ""} placeholder="Ex: CEO, Diretor..." className="bg-muted/30 focus:bg-background rounded-xl" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatarUrl" className="text-foreground flex items-center gap-2">
              <ImageIcon className="h-4 w-4 opacity-70" /> Foto de Perfil (URL)
            </Label>
            <Input id="avatarUrl" name="avatarUrl" defaultValue={speaker?.avatarUrl || ""} placeholder="https://..." className="bg-muted/30 focus:bg-background rounded-xl" />
            <p className="text-xs text-muted-foreground mt-1">Cole aqui o link da imagem do palestrante (Opcional).</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 opacity-70" /> Minibiografia
            </Label>
            <textarea 
              id="bio" 
              name="bio" 
              defaultValue={speaker?.bio || ""} 
              placeholder="Fale um pouco sobre a experiência do palestrante..." 
              rows={4}
              className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
          </div>
        </form>

        <div className="p-6 border-t border-border flex justify-end gap-3 bg-muted/20">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="rounded-xl">
            Cancelar
          </Button>
          <Button type="button" onClick={(e) => {
            const form = e.currentTarget.closest('.bg-card')?.querySelector('form')
            if (form) form.requestSubmit()
          }} disabled={loading} className="rounded-xl font-bold min-w-32 shadow-md shadow-primary/20">
            {loading ? "Salvando..." : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
