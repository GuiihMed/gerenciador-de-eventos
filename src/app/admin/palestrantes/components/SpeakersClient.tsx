"use client"

import { useState } from "react"
import { Speaker } from "@prisma/client"
import { Search, Plus, UserCircle2, Briefcase, Mail, Edit, Trash2, FileSpreadsheet } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SpeakerFormModal } from "./SpeakerFormModal"
import { CSVImportModal } from "@/components/import/CSVImportModal"
import { deleteSpeaker } from "@/server/actions/speaker"
import { importSpeakersCSV } from "@/server/actions/import"

interface SpeakersClientProps {
  initialSpeakers: Speaker[]
}

export function SpeakersClient({ initialSpeakers }: SpeakersClientProps) {
  const [speakers, setSpeakers] = useState<Speaker[]>(initialSpeakers)
  const [searchQuery, setSearchQuery] = useState("")

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null)

  const filteredSpeakers = speakers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.company && s.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.role && s.role.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleOpenNew = () => {
    setEditingSpeaker(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (speaker: Speaker) => {
    setEditingSpeaker(speaker)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja remover este palestrante?")) {
      const res = await deleteSpeaker(id)
      if (res.success) {
        setSpeakers(prev => prev.filter(s => s.id !== id))
      } else {
        alert(res.error || "Erro ao deletar palestrante")
      }
    }
  }

  const handleSaved = (savedSpeaker: Speaker) => {
    if (editingSpeaker) {
      setSpeakers(prev => prev.map(s => s.id === savedSpeaker.id ? savedSpeaker : s))
    } else {
      setSpeakers(prev => [savedSpeaker, ...prev])
    }
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nome, email ou empresa..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50 border-transparent focus:bg-background transition-colors rounded-xl"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={() => setIsImportModalOpen(true)}
            variant="outline"
            className="w-full sm:w-auto font-bold rounded-xl border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 text-xs"
          >
            <FileSpreadsheet className="mr-1.5 h-4 w-4" /> Importar CSV
          </Button>

          <Button onClick={handleOpenNew} className="w-full sm:w-auto font-bold rounded-xl shadow-md shadow-primary/20 text-xs">
            <Plus className="mr-1.5 h-4 w-4" /> Novo Palestrante
          </Button>
        </div>
      </div>

      {filteredSpeakers.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-card/50 rounded-2xl border border-dashed border-border">
          <UserCircle2 className="h-16 w-16 text-muted-foreground opacity-30 mb-4" />
          <h3 className="text-xl font-semibold text-foreground">Nenhum palestrante encontrado</h3>
          <p className="text-muted-foreground max-w-sm mt-2">
            {searchQuery ? "Tente buscar com outros termos." : "Você ainda não possui palestrantes cadastrados. Clique no botão acima para começar ou importe via planilha CSV."}
          </p>
          {!searchQuery && (
            <div className="flex gap-2 mt-6">
              <Button onClick={() => setIsImportModalOpen(true)} variant="outline" className="rounded-xl border-emerald-500/30 text-emerald-500">
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Importar via CSV
              </Button>
              <Button onClick={handleOpenNew} className="rounded-xl font-bold">
                <Plus className="mr-2 h-4 w-4" /> Cadastrar Manualmente
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpeakers.map(speaker => (
            <Card key={speaker.id} className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300 group rounded-2xl overflow-hidden flex flex-col">
              <CardContent className="p-6 flex flex-col flex-grow relative">
                
                {/* Ações de Hover (Editar / Deletar) */}
                <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                  <Button variant="secondary" size="icon" className="h-8 w-8 bg-background shadow-sm hover:bg-muted text-foreground rounded-full" onClick={() => handleOpenEdit(speaker)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" className="h-8 w-8 shadow-sm rounded-full" onClick={() => handleDelete(speaker.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-background shadow-sm shrink-0">
                    {speaker.avatarUrl ? (
                      <img src={speaker.avatarUrl} alt={speaker.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-primary">{speaker.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground line-clamp-1">{speaker.name}</h3>
                    {(speaker.role || speaker.company) && (
                      <div className="flex items-center text-sm text-primary font-medium mt-0.5 line-clamp-1">
                        <Briefcase className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                        {speaker.role}{speaker.role && speaker.company ? " em " : ""}{speaker.company}
                      </div>
                    )}
                  </div>
                </div>

                {speaker.email && (
                  <div className="flex items-center text-sm text-muted-foreground mt-2">
                    <Mail className="h-4 w-4 mr-2 shrink-0 opacity-70" />
                    <span className="truncate">{speaker.email}</span>
                  </div>
                )}

                {speaker.bio && (
                  <p className="text-sm text-muted-foreground mt-4 line-clamp-3 leading-relaxed flex-grow">
                    {speaker.bio}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isModalOpen && (
        <SpeakerFormModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          speaker={editingSpeaker}
          onSaved={handleSaved}
        />
      )}

      {isImportModalOpen && (
        <CSVImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          type="speakers"
          importAction={importSpeakersCSV}
        />
      )}
    </div>
  )
}
