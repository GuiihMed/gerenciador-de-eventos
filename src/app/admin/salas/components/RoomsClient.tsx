"use client"

import { useState } from "react"
import { DoorOpen, Tags, Layers, Plus, Search, Edit3, Trash2, MapPin, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { createTaxonomyValue, updateTaxonomyValue, deleteTaxonomyValue } from "@/server/actions/taxonomy"

interface RoomsClientProps {
  initialTaxonomies: {
    rooms: any[]
    tracks: any[]
    formats: any[]
  }
}

export function RoomsClient({ initialTaxonomies }: RoomsClientProps) {
  const [activeTab, setActiveTab] = useState<"room" | "track" | "format">("room")
  const [taxonomies, setTaxonomies] = useState(initialTaxonomies)
  const [searchQuery, setSearchQuery] = useState("")

  // Modal State
  const [isOpen, setIsOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any | null>(null)
  const [labelInput, setLabelInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const currentList =
    activeTab === "room"
      ? taxonomies.rooms
      : activeTab === "track"
      ? taxonomies.tracks
      : taxonomies.formats

  const filteredList = currentList.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleOpenNew = () => {
    setEditingItem(null)
    setLabelInput("")
    setError("")
    setIsOpen(true)
  }

  const handleOpenEdit = (item: any) => {
    setEditingItem(item)
    setLabelInput(item.label)
    setError("")
    setIsOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja remover este item?")) {
      const res = await deleteTaxonomyValue(id)
      if (res.success) {
        setTaxonomies(prev => ({
          ...prev,
          [activeTab === "room" ? "rooms" : activeTab === "track" ? "tracks" : "formats"]: prev[
            activeTab === "room" ? "rooms" : activeTab === "track" ? "tracks" : "formats"
          ].filter(i => i.id !== id)
        }))
      } else {
        alert(res.error || "Erro ao deletar item.")
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!labelInput.trim()) return
    setLoading(true)
    setError("")

    if (editingItem) {
      const res = await updateTaxonomyValue(editingItem.id, labelInput)
      if (res.success && res.value) {
        setTaxonomies(prev => ({
          ...prev,
          [activeTab === "room" ? "rooms" : activeTab === "track" ? "tracks" : "formats"]: prev[
            activeTab === "room" ? "rooms" : activeTab === "track" ? "tracks" : "formats"
          ].map(i => i.id === editingItem.id ? { ...i, label: res.value.label } : i)
        }))
        setIsOpen(false)
      } else {
        setError(res.error || "Erro ao atualizar item.")
      }
    } else {
      const res = await createTaxonomyValue(activeTab, labelInput)
      if (res.success && res.value) {
        setTaxonomies(prev => ({
          ...prev,
          [activeTab === "room" ? "rooms" : activeTab === "track" ? "tracks" : "formats"]: [
            res.value,
            ...prev[activeTab === "room" ? "rooms" : activeTab === "track" ? "tracks" : "formats"]
          ]
        }))
        setIsOpen(false)
      } else {
        setError(res.error || "Erro ao criar item.")
      }
    }

    setLoading(false)
  }

  const tabLabels = {
    room: { name: "Salas & Auditórios", singular: "Sala", icon: DoorOpen },
    track: { name: "Trilhas & Temas", singular: "Trilha", icon: Tags },
    format: { name: "Formatos de Sessão", singular: "Formato", icon: Layers }
  }

  return (
    <div className="space-y-6">
      {/* Abas Superiores */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border/80 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 bg-muted/40 p-1.5 rounded-xl border border-border/60">
          {(["room", "track", "format"] as const).map(tab => {
            const isActive = activeTab === tab
            const TabIcon = tabLabels[tab].icon
            return (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSearchQuery(""); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-bold"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                <TabIcon className="h-4 w-4" />
                <span>{tabLabels[tab].name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                  isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-background text-muted-foreground"
                }`}>
                  {taxonomies[tab === "room" ? "rooms" : tab === "track" ? "tracks" : "formats"].length}
                </span>
              </button>
            )
          })}
        </div>

        <Button onClick={handleOpenNew} className="w-full sm:w-auto font-bold rounded-xl shadow-md shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" /> Novo {tabLabels[activeTab].singular}
        </Button>
      </div>

      {/* Barra de Busca */}
      <div className="bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder={`Buscar por ${tabLabels[activeTab].singular.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50 border-transparent focus:bg-background transition-colors rounded-xl"
          />
        </div>
      </div>

      {/* Modal de Criação / Edição */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] border-border bg-card shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
              <DoorOpen className="h-5 w-5 text-primary" />
              {editingItem ? `Editar ${tabLabels[activeTab].singular}` : `Novo ${tabLabels[activeTab].singular}`}
            </DialogTitle>
            <DialogDescription>
              {`Cadastre o nome do item que será exibido na programação oficial do evento.`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-xl border border-destructive/20 text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="label" className="text-foreground font-semibold">Nome / Rótulo *</Label>
              <Input
                id="label"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                required
                placeholder={activeTab === "room" ? "Ex: Palco Principal, Auditório A" : activeTab === "track" ? "Ex: Inteligência Artificial, Inovação" : "Ex: Keynote, Workshop"}
                className="bg-muted/30 focus:bg-background rounded-xl font-semibold text-base"
              />
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="rounded-xl font-bold min-w-32 shadow-md shadow-primary/20">
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lista de Itens em Cards */}
      {filteredList.length === 0 ? (
        <div className="py-20 text-center bg-card/40 rounded-2xl border border-dashed border-border flex flex-col items-center justify-center">
          <DoorOpen className="h-16 w-16 text-muted-foreground opacity-30 mb-4" />
          <h3 className="text-xl font-semibold text-foreground">Nenhum item cadastrado nesta categoria</h3>
          <p className="text-muted-foreground max-w-sm mt-2">
            {searchQuery ? "Tente buscar por outro termo." : `Clique no botão 'Novo ${tabLabels[activeTab].singular}' acima para cadastrar.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map(item => (
            <Card key={item.id} className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300 group rounded-2xl overflow-hidden flex flex-col">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <h4 className="font-bold text-lg text-foreground line-clamp-1">{item.label}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium pl-6">
                    {item._count?.activities || 0} {item._count?.activities === 1 ? 'sessão vinculada' : 'sessões vinculadas'}
                  </p>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full shadow-sm"
                    onClick={() => handleOpenEdit(item)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 rounded-full shadow-sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
