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

// Funções Utilitárias para Parse Inteligente de CSV (Excel-proof)

// 1. Remover acentos e caracteres especiais de cabeçalhos
function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z0-9]/g, "") // Mantém apenas letras e números
}

// 2. Parser de linha de CSV considerando aspas duplas, aspas simples e caracteres escapados
function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"' || char === "'") {
      if (inQuotes && line[i + 1] === char) {
        current += char // Aspa duplicada dentro de campo entre aspas ("" -> ")
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result.map(v => v.replace(/^["']|["']$/g, "").trim())
}

// 3. Detecção Automática do Delimitador (Vírgula, Ponto e Vírgula, Tabulação)
function detectDelimiter(text: string): string {
  const firstLines = text.split(/\r\n|\r|\n/).slice(0, 5).join("\n")
  const semicolons = (firstLines.match(/;/g) || []).length
  const commas = (firstLines.match(/,/g) || []).length
  const tabs = (firstLines.match(/\t/g) || []).length

  if (semicolons >= commas && semicolons >= tabs) return ";"
  if (tabs > commas && tabs > semicolons) return "\t"
  return ","
}

export function CSVImportModal({ isOpen, onClose, type, onSuccess, importAction }: CSVImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parsedRows, setParsedRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const titles = {
    speakers: { title: "Importar Palestrantes via CSV / Excel", filename: "modelo_palestrantes.csv" },
    attendees: { title: "Importar Inscrições / Participantes via CSV / Excel", filename: "modelo_participantes.csv" },
    schedule: { title: "Importar Programação da Agenda via CSV / Excel", filename: "modelo_programacao.csv" }
  }

  // 1. Download do Modelo CSV preformatado (Usando Ponto e Vírgula e BOM para total compatibilidade com Excel PT-BR)
  const handleDownloadTemplate = () => {
    let csvHeader = ""
    let sampleData = ""

    if (type === "speakers") {
      csvHeader = "Nome;E-mail;Empresa;Cargo;Bio;AvatarURL"
      sampleData = `"Ana Souza";"ana@empresa.com";"Tech Corp";"Diretora de IA";"Especialista em visão computacional";"https://i.pravatar.cc/150?u=ana"\n"Carlos Lima";"carlos@startup.io";"Innovate";"CEO";"Empreendedor serial";""`
    } else if (type === "attendees") {
      csvHeader = "Nome;E-mail;Telefone;Empresa;Cargo;TipoIngresso"
      sampleData = `"João Santos";"joao@email.com";"(11) 98888-7777";"Dev Company";"Desenvolvedor";"STANDARD"\n"Mariana Costa";"mariana@vip.com";"(21) 99999-1111";"Global Tech";"Diretora";"VIP"`
    } else if (type === "schedule") {
      csvHeader = "Data;HorarioInicio;HorarioFim;Titulo;Descricao;Sala;NomePalestrante"
      sampleData = `"2026-10-15";"09:00";"10:00";"Keynote de Abertura: O Futuro da Tecnologia";"Palestra de abertura oficial do evento.";"Auditório Principal";"Ana Souza"\n"2026-10-15";"10:30";"11:30";"Workshop de IA Aplicada";"Hands-on construindo modelos em nuvem.";"Sala 102";"Carlos Lima"`
    }

    const csvContent = `${csvHeader}\n${sampleData}`
    // Adiciona BOM UTF-8 (\ufeff) para o Excel abrir com acentuação e colunas corretas
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", titles[type].filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 2. Leitura e Parse Inteligente do CSV do Usuário
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    setFile(selectedFile)
    setError("")

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        let text = event.target?.result as string
        if (!text) return

        // 1. Limpar UTF-8 BOM
        text = text.replace(/^\uFEFF/, "")

        // 2. Normalizar quebras de linha (Windows \r\n, Mac antigo \r, Linux \n)
        const lines = text.split(/\r\n|\r|\n/).filter(line => line.trim().length > 0)

        if (lines.length <= 1) {
          setError("O arquivo CSV está vazio ou possui apenas o cabeçalho.")
          return
        }

        // 3. Detectar delimitador (; ou , ou tab)
        const delimiter = detectDelimiter(text)

        // 4. Mapear Cabeçalho
        const rawHeaderLine = lines[0]
        const headers = parseCSVLine(rawHeaderLine, delimiter).map(normalizeHeader)

        // Mapeamento dinâmico por nome de coluna
        const rows: any[] = []

        for (let i = 1; i < lines.length; i++) {
          const rawLine = lines[i]
          if (!rawLine.trim()) continue

          const values = parseCSVLine(rawLine, delimiter)
          if (values.length === 0 || (values.length === 1 && !values[0])) continue

          const rowObj: any = {}

          if (type === "speakers") {
            // Mapeamento por nome de coluna ou fallback por posição
            const getVal = (possibleKeys: string[], fallbackIdx: number) => {
              for (const k of possibleKeys) {
                const idx = headers.findIndex(h => h.includes(k))
                if (idx !== -1 && values[idx] !== undefined) return values[idx]
              }
              return values[fallbackIdx] || ""
            }

            rowObj.name = getVal(["nome", "name", "palestrante"], 0)
            rowObj.email = getVal(["email", "mail", "contato"], 1)
            rowObj.company = getVal(["empresa", "company", "organizacao"], 2)
            rowObj.role = getVal(["cargo", "role", "funcao"], 3)
            rowObj.bio = getVal(["bio", "biografia", "descricao"], 4)
            rowObj.avatarUrl = getVal(["avatar", "foto", "imagem", "url"], 5)
          } else if (type === "attendees") {
            const getVal = (possibleKeys: string[], fallbackIdx: number) => {
              for (const k of possibleKeys) {
                const idx = headers.findIndex(h => h.includes(k))
                if (idx !== -1 && values[idx] !== undefined) return values[idx]
              }
              return values[fallbackIdx] || ""
            }

            rowObj.name = getVal(["nome", "name", "participante", "inscrito"], 0)
            rowObj.email = getVal(["email", "mail", "contato"], 1)
            rowObj.phone = getVal(["telefone", "phone", "celular", "whatsapp", "fone"], 2)
            rowObj.company = getVal(["empresa", "company", "organizacao"], 3)
            rowObj.role = getVal(["cargo", "role", "funcao"], 4)
            rowObj.ticketType = getVal(["tipoingresso", "ingresso", "ticket"], 5) || "STANDARD"
          } else if (type === "schedule") {
            const getVal = (possibleKeys: string[], fallbackIdx: number) => {
              for (const k of possibleKeys) {
                const idx = headers.findIndex(h => h.includes(k))
                if (idx !== -1 && values[idx] !== undefined) return values[idx]
              }
              return values[fallbackIdx] || ""
            }

            rowObj.date = getVal(["data", "date", "dia"], 0)
            rowObj.startTime = getVal(["horarioinicio", "inicio", "horainicio", "start"], 1)
            rowObj.endTime = getVal(["horariofim", "fim", "horafim", "end"], 2)
            rowObj.title = getVal(["titulo", "palestra", "sessao", "title"], 3)
            rowObj.description = getVal(["descricao", "description", "detalhes"], 4)
            rowObj.room = getVal(["sala", "room", "auditorio", "local"], 5)
            rowObj.speakerName = getVal(["nomepalestrante", "palestrante", "speaker"], 6)
          }

          // Validação básica da linha
          if (type === "speakers" && !rowObj.name) continue
          if (type === "attendees" && (!rowObj.name || !rowObj.email)) continue
          if (type === "schedule" && !rowObj.title) continue

          rows.push(rowObj)
        }

        if (rows.length === 0) {
          setError("Nenhum registro válido foi encontrado no arquivo. Verifique se os nomes das colunas ou os dados estão preenchidos.")
          return
        }

        setParsedRows(rows)
      } catch (err: any) {
        console.error("Erro ao ler CSV:", err)
        setError("Erro ao ler o arquivo CSV. Verifique se o arquivo está no formato correto (CSV/Excel).")
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
      alert(res.message || "Importação realizada com sucesso!")
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
            Baixe o modelo `.csv`, preencha no Excel / Google Sheets e envie para criação automática no sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Passo 1: Download do Template */}
          <div className="p-4 bg-muted/30 rounded-xl border border-border flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground block">Passo 1: Baixar Planilha Modelo</span>
              <span className="text-xs text-muted-foreground">Arquivo de exemplo compatível com Excel (vírgula ou ponto-e-vírgula).</span>
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
            <label className="text-xs font-bold text-foreground block">Passo 2: Selecionar Arquivo CSV / Excel Preenchido</label>

            <div className="border-2 border-dashed border-border/80 hover:border-primary/50 transition-colors p-6 rounded-2xl bg-muted/10 text-center flex flex-col items-center justify-center relative cursor-pointer">
              <input
                type="file"
                accept=".csv, .txt, text/csv, application/vnd.ms-excel"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload className="h-8 w-8 text-primary opacity-80 mb-2" />
              <p className="text-sm font-semibold text-foreground">
                {file ? file.name : "Clique ou arraste o arquivo .csv gerado pelo Excel"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Compatível com Excel, Numbers, Google Sheets e CSV (UTF-8 / ANSI)</p>
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
                  <CheckCircle2 className="h-4 w-4" /> {parsedRows.length} linhas validadas para importação
                </span>
              </div>
              <p className="text-[11px] text-emerald-600/90 leading-tight">
                Os dados foram reconhecidos com sucesso e serão inseridos no banco de dados.
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
