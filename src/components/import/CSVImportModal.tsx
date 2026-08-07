"use client"

import { useState } from "react"
import { FileSpreadsheet, Download, Upload, CheckCircle2, AlertCircle, RefreshCw, X, Table } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface CSVImportModalProps {
  isOpen: boolean
  onClose: () => void
  type: "speakers" | "attendees" | "schedule"
  onSuccess?: () => void
  importAction: (parsedRows: any[]) => Promise<{ success: boolean; message?: string; error?: string }>
}

export function CSVImportModal({ isOpen, onClose, type, onSuccess, importAction }: CSVImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parsedRows, setParsedRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const titles = {
    speakers: { title: "Importar Palestrantes via CSV", filename: "modelo_palestrantes.csv" },
    attendees: { title: "Importar Inscrições / Participantes via CSV", filename: "modelo_participantes.csv" },
    schedule: { title: "Importar Programação da Agenda via CSV", filename: "modelo_programacao.csv" }
  }

  // 1. Download do Modelo CSV preformatado
  const handleDownloadTemplate = () => {
    let csvHeader = ""
    let sampleData = ""

    if (type === "speakers") {
      csvHeader = "Nome,E-mail,Empresa,Cargo,Bio,AvatarURL"
      sampleData = `"Ana Souza","ana@empresa.com","Tech Corp","Diretora de IA","Especialista em visão computacional","https://i.pravatar.cc/150?u=ana"\n"Carlos Lima","carlos@startup.io","Innovate","CEO","Empreendedor serial",""`
    } else if (type === "attendees") {
      csvHeader = "Nome,E-mail,Telefone,Empresa,Cargo,TipoIngresso"
      sampleData = `"João Santos","joao@email.com","(11) 98888-7777","Dev Company","Desenvolvedor","STANDARD"\n"Mariana Costa","mariana@vip.com","(21) 99999-1111","Global Tech","Diretora","VIP"`
    } else if (type === "schedule") {
      csvHeader = "Data,HorarioInicio,HorarioFim,Titulo,Descricao,Sala,NomePalestrante"
      sampleData = `"2026-10-15","09:00","10:00","Keynote de Abertura: O Futuro da Tecnologia","Palestra de abertura oficial do evento.","Auditório Principal","Ana Souza"\n"2026-10-15","10:30","11:30","Workshop de IA Aplicada","Hands-on construindo modelos em nuvem.","Sala 102","Carlos Lima"`
    }

    const csvContent = `${csvHeader}\n${sampleData}`
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", titles[type].filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 2. Leitura e Parse do CSV do Usuário
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    setFile(selectedFile)
    setError("")

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        if (!text) return

        const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0)
        if (lines.length <= 1) {
          setError("O arquivo CSV está vazio ou possui apenas o cabeçalho.")
          return
        }

        // Detectar delimitador (vírgula ou ponto-e-vírgula)
        const firstLine = lines[0]
        const delimiter = firstLine.includes(";") ? ";" : ","

        const rawHeaders = firstLine.split(delimiter).map(h => h.replace(/^["']|["']$/g, "").trim())

        const rows: any[] = []
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(delimiter).map(v => v.replace(/^["']|["']$/g, "").trim())
          if (values.length === 0 || !values[0]) continue

          const rowObj: any = {}
          if (type === "speakers") {
            rowObj.name = values[0] || ""
            rowObj.email = values[1] || ""
            rowObj.company = values[2] || ""
            rowObj.role = values[3] || ""
            rowObj.bio = values[4] || ""
            rowObj.avatarUrl = values[5] || ""
          } else if (type === "attendees") {
            rowObj.name = values[0] || ""
            rowObj.email = values[1] || ""
            rowObj.phone = values[2] || ""
            rowObj.company = values[3] || ""
            rowObj.role = values[4] || ""
            rowObj.ticketType = values[5] || "STANDARD"
          } else if (type === "schedule") {
            rowObj.date = values[0] || ""
            rowObj.startTime = values[1] || ""
            rowObj.endTime = values[2] || ""
            rowObj.title = values[3] || ""
            rowObj.description = values[4] || ""
            rowObj.room = values[5] || ""
            rowObj.speakerName = values[6] || ""
          }
          rows.push(rowObj)
        }

        setParsedRows(rows)
      } catch (err: any) {
        console.error("Erro ao ler CSV:", err)
        setError("Erro ao ler o arquivo CSV. Verifique a formatação do arquivo.")
      }
    }
    reader.readAsText(selectedFile, "UTF-8")
  }

  // 3. Submeter para Importação Automática
  const handleImportSubmit = async () => {
    if (parsedRows.length === 0) return
    setLoading(true)
    setError("")

    const res = await importAction(parsedRows)

    if (res.success) {
      alert(res.message || "Importação concluída com sucesso!")
      onClose()
      if (onSuccess) onSuccess()
      window.location.reload()
    } else {
      setError(res.error || "Falha ao processar importação.")
    }
    setLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] bg-card border-border shadow-2xl rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
            <FileSpreadsheet className="h-6 w-6 text-emerald-500" />
            {titles[type].title}
          </DialogTitle>
          <DialogDescription>
            Baixe o modelo `.csv`, preencha as linhas com os seus dados e envie para criação automática.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Passo 1: Download do Template */}
          <div className="p-4 bg-muted/30 rounded-xl border border-border flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground block">Passo 1: Baixar Planilha Modelo</span>
              <span className="text-xs text-muted-foreground">Arquivo de exemplo no formato correto para preenchimento.</span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="rounded-xl font-semibold border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 text-xs shrink-0"
            >
              <Download className="mr-1.5 h-4 w-4" /> Baixar Modelo CSV
            </Button>
          </div>

          {/* Passo 2: Upload do Arquivo do Usuário */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground block">Passo 2: Selecionar Arquivo CSV Preenchido</label>

            <div className="border-2 border-dashed border-border/80 hover:border-primary/50 transition-colors p-6 rounded-2xl bg-muted/10 text-center flex flex-col items-center justify-center relative cursor-pointer">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload className="h-8 w-8 text-primary opacity-80 mb-2" />
              <p className="text-sm font-semibold text-foreground">
                {file ? file.name : "Clique para selecionar o arquivo .csv"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Formatos suportados: .csv em UTF-8</p>
            </div>
          </div>

          {/* Erro */}
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-xl border border-destructive/20 text-center font-medium">
              {error}
            </div>
          )}

          {/* Pré-visualização dos dados lidos */}
          {parsedRows.length > 0 && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> {parsedRows.length} linhas prontas para importação
                </span>
              </div>
              <p className="text-[11px] text-emerald-600/90 leading-tight">
                Os dados foram validados e serão inseridos no banco de dados automaticamente.
              </p>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={loading || parsedRows.length === 0}
              onClick={handleImportSubmit}
              className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white min-w-36 shadow-md shadow-emerald-600/20"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : `Importar ${parsedRows.length} Registros`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
