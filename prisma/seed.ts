import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando o Seed do Banco de Dados...')

  // Limpar tabelas caso necessário
  await prisma.activityTaxonomy.deleteMany()
  await prisma.activitySpeaker.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.timeBlock.deleteMany()
  await prisma.scheduleDay.deleteMany()
  await prisma.taxonomyValue.deleteMany()
  await prisma.taxonomy.deleteMany()
  await prisma.eventSpeaker.deleteMany()
  await prisma.speaker.deleteMany()
  await prisma.event.deleteMany()
  await prisma.tenant.deleteMany()

  // 1. Criar um Tenant (Cliente organizador)
  const tenant = await prisma.tenant.create({
    data: {
      name: 'MedAcademy Eventos',
      domain: 'medacademy.mestre.app',
    },
  })

  // 2. Criar o Evento Principal
  const event = await prisma.event.create({
    data: {
      tenantId: tenant.id,
      name: 'Simpósio de Enfermagem Intensiva 2026',
      startDate: new Date('2026-09-10T08:00:00Z'),
      endDate: new Date('2026-09-12T18:00:00Z'),
      location: 'Centro de Convenções',
    }
  })

  // 3. Criar Taxonomia de Salas
  const roomTaxonomy = await prisma.taxonomy.create({
    data: { tenantId: tenant.id, name: 'Salas', type: 'room' }
  })

  // 4. Criar os Palestrantes/Coordenadores (Baseado na Imagem)
  const franco = await prisma.speaker.create({ data: { tenantId: tenant.id, name: 'Franco Costa', role: 'Coordenação' } })
  const fernanda = await prisma.speaker.create({ data: { tenantId: tenant.id, name: 'Fernanda Karolina', role: 'Coordenação' } })
  const laercia = await prisma.speaker.create({ data: { tenantId: tenant.id, name: 'Laércia Martins', role: 'Coordenação' } })
  const viviane = await prisma.speaker.create({ data: { tenantId: tenant.id, name: 'Viviane Gusmão', role: 'Coordenação' } })
  const giane = await prisma.speaker.create({ data: { tenantId: tenant.id, name: 'Giane Araújo', role: 'Coordenação' } })

  // 5. Criar Dia da Agenda
  const day1 = await prisma.scheduleDay.create({
    data: { eventId: event.id, date: new Date('2026-09-10T00:00:00Z'), label: 'Dia 1' }
  })
  
  const blockMorning = await prisma.timeBlock.create({
    data: { scheduleDayId: day1.id, startTime: '08:00', endTime: '12:00' }
  })

  // --- SALA 1 ---
  const sala1 = await prisma.taxonomyValue.create({
    data: { taxonomyId: roomTaxonomy.id, label: 'Sala 1 - Monitorização Hemodinâmica' }
  })
  
  const act1 = await prisma.activity.create({
    data: {
      timeBlockId: blockMorning.id,
      title: 'Monitorização Hemodinâmica 4.0 na Decisão do Paciente Crítico',
      description: 'Uma oficina prática, dinâmica e centrada em dados, trazendo o futuro da monitorização hemodinâmica para a beira do leito.',
      startTime: '08:00', endTime: '10:00', capacity: 15, status: 'PUBLISHED'
    }
  })
  await prisma.activityTaxonomy.create({ data: { activityId: act1.id, taxonomyValueId: sala1.id } })
  await prisma.activitySpeaker.create({ data: { activityId: act1.id, speakerId: franco.id } })

  const act1b = await prisma.activity.create({
    data: {
      timeBlockId: blockMorning.id,
      title: 'Discussão de Casos Clínicos: Choque Séptico e Suporte Hemodinâmico',
      description: 'Análise aprofundada de casos reais com uso de ultrassonografia point-of-care.',
      startTime: '10:30', endTime: '12:00', capacity: 15, status: 'PUBLISHED'
    }
  })
  await prisma.activityTaxonomy.create({ data: { activityId: act1b.id, taxonomyValueId: sala1.id } })
  await prisma.activitySpeaker.create({ data: { activityId: act1b.id, speakerId: franco.id } })

  const act1c = await prisma.activity.create({
    data: {
      timeBlockId: blockMorning.id,
      title: 'Parâmetros Macro e Micro-hemodinâmicos: O que realmente importa?',
      description: 'Desmistificando variáveis complexas na beira do leito para o enfermeiro intensivista.',
      startTime: '13:30', endTime: '15:00', capacity: 15, status: 'PUBLISHED'
    }
  })
  await prisma.activityTaxonomy.create({ data: { activityId: act1c.id, taxonomyValueId: sala1.id } })
  await prisma.activitySpeaker.create({ data: { activityId: act1c.id, speakerId: franco.id } })

  const act1d = await prisma.activity.create({
    data: {
      timeBlockId: blockMorning.id,
      title: 'Workshop Hands-on: Calibração e Interpretação de Dispositivos',
      description: 'Estações práticas de manuseio de equipamentos de monitorização invasiva e não-invasiva.',
      startTime: '15:30', endTime: '17:30', capacity: 15, status: 'PUBLISHED'
    }
  })
  await prisma.activityTaxonomy.create({ data: { activityId: act1d.id, taxonomyValueId: sala1.id } })
  await prisma.activitySpeaker.create({ data: { activityId: act1d.id, speakerId: franco.id } })

  // --- SALA 2 ---
  const sala2 = await prisma.taxonomyValue.create({
    data: { taxonomyId: roomTaxonomy.id, label: 'Sala 2 - Cuidado de Superfície' }
  })
  
  const act2 = await prisma.activity.create({
    data: {
      timeBlockId: blockMorning.id,
      title: 'Cuidado de Superfície – Estratégias Modernas para Prevenção de LPP',
      description: 'Workshop aplicado com tecnologias emergentes, protocolos atualizados e raciocínio clínico preventivo.',
      startTime: '08:00', endTime: '10:00', capacity: 30, status: 'PUBLISHED'
    }
  })
  await prisma.activityTaxonomy.create({ data: { activityId: act2.id, taxonomyValueId: sala2.id } })
  await prisma.activitySpeaker.create({ data: { activityId: act2.id, speakerId: fernanda.id } })

  const act2b = await prisma.activity.create({
    data: {
      timeBlockId: blockMorning.id,
      title: 'Tecnologias Avançadas em Curativos para o Paciente Crítico',
      description: 'Como escolher as melhores coberturas no contexto da UTI moderna.',
      startTime: '10:30', endTime: '12:00', capacity: 30, status: 'PUBLISHED'
    }
  })
  await prisma.activityTaxonomy.create({ data: { activityId: act2b.id, taxonomyValueId: sala2.id } })
  await prisma.activitySpeaker.create({ data: { activityId: act2b.id, speakerId: fernanda.id } })
  
  const act2c = await prisma.activity.create({
    data: {
      timeBlockId: blockMorning.id,
      title: 'Prevenção de Lesões Relacionadas a Dispositivos Médicos',
      description: 'Protocolos de fixação segura e proteção de áreas de pressão sob tubos e cateteres.',
      startTime: '13:30', endTime: '15:00', capacity: 30, status: 'PUBLISHED'
    }
  })
  await prisma.activityTaxonomy.create({ data: { activityId: act2c.id, taxonomyValueId: sala2.id } })
  await prisma.activitySpeaker.create({ data: { activityId: act2c.id, speakerId: fernanda.id } })

  const act2d = await prisma.activity.create({
    data: {
      timeBlockId: blockMorning.id,
      title: 'Mobilização Precoce vs Risco de Cisalhamento',
      description: 'O equilíbrio entre reabilitação intensiva e proteção do tegumento.',
      startTime: '15:30', endTime: '17:30', capacity: 30, status: 'PUBLISHED'
    }
  })
  await prisma.activityTaxonomy.create({ data: { activityId: act2d.id, taxonomyValueId: sala2.id } })
  await prisma.activitySpeaker.create({ data: { activityId: act2d.id, speakerId: fernanda.id } })

  // --- SALA 3 ---
  const sala3 = await prisma.taxonomyValue.create({
    data: { taxonomyId: roomTaxonomy.id, label: 'Sala 3 - Gestão 5.0 na UTI' }
  })

  const act3 = await prisma.activity.create({
    data: {
      timeBlockId: blockMorning.id,
      title: 'Gestão 5.0 na UTI – Liderança Inteligente, Conflitos e Alta Performance',
      description: 'Oficina imersiva e moderna, unindo indicadores, inteligência emocional e liderança baseada em evidências.',
      startTime: '10:00', endTime: '12:00', capacity: 30, status: 'PUBLISHED'
    }
  })
  await prisma.activityTaxonomy.create({ data: { activityId: act3.id, taxonomyValueId: sala3.id } })
  await prisma.activitySpeaker.create({ data: { activityId: act3.id, speakerId: laercia.id } })

  const act3b = await prisma.activity.create({
    data: {
      timeBlockId: blockMorning.id,
      title: 'Dashboard Assistencial: Traduzindo Dados em Qualidade e Segurança',
      description: 'Como implementar e monitorar KPIs de enfermagem em tempo real na UTI.',
      startTime: '13:30', endTime: '15:00', capacity: 30, status: 'PUBLISHED'
    }
  })
  await prisma.activityTaxonomy.create({ data: { activityId: act3b.id, taxonomyValueId: sala3.id } })
  await prisma.activitySpeaker.create({ data: { activityId: act3b.id, speakerId: laercia.id } })

  const act3c = await prisma.activity.create({
    data: {
      timeBlockId: blockMorning.id,
      title: 'Gestão de Leitos e Fluxo do Paciente Crítico',
      description: 'Estratégias de Lean Healthcare aplicadas ao giro rápido e seguro de leitos intensivos.',
      startTime: '15:30', endTime: '17:00', capacity: 30, status: 'PUBLISHED'
    }
  })
  await prisma.activityTaxonomy.create({ data: { activityId: act3c.id, taxonomyValueId: sala3.id } })
  await prisma.activitySpeaker.create({ data: { activityId: act3c.id, speakerId: laercia.id } })

  // --- SALA 4 ---
  const sala4 = await prisma.taxonomyValue.create({
    data: { taxonomyId: roomTaxonomy.id, label: 'Sala 4 - Fast-Infuse' }
  })

  const act4 = await prisma.activity.create({
    data: {
      timeBlockId: blockMorning.id,
      title: 'Fast-Infuse: Gestão Inteligente da Terapia Infusional',
      description: 'Oficina prática sobre seleção/manutenção de acessos venosos, prevenção e cultura de segurança.',
      startTime: '10:00', endTime: '12:00', capacity: 15, status: 'PUBLISHED'
    }
  })
  await prisma.activityTaxonomy.create({ data: { activityId: act4.id, taxonomyValueId: sala4.id } })
  await prisma.activitySpeaker.create({ data: { activityId: act4.id, speakerId: viviane.id } })
  
  const act4b = await prisma.activity.create({
    data: {
      timeBlockId: blockMorning.id,
      title: 'Farmacologia Prática das Drogas Vasoativas',
      description: 'Cálculos rápidos, diluições seguras e interações críticas na infusão contínua.',
      startTime: '13:30', endTime: '15:00', capacity: 15, status: 'PUBLISHED'
    }
  })
  await prisma.activityTaxonomy.create({ data: { activityId: act4b.id, taxonomyValueId: sala4.id } })
  await prisma.activitySpeaker.create({ data: { activityId: act4b.id, speakerId: viviane.id } })

  const act4c = await prisma.activity.create({
    data: {
      timeBlockId: blockMorning.id,
      title: 'Prevenção de Infiltração e Extravasamento de Fármacos Vesicantes',
      description: 'Protocolos de ação rápida e resgate tecidual em incidentes infusionais.',
      startTime: '15:30', endTime: '17:00', capacity: 15, status: 'PUBLISHED'
    }
  })
  await prisma.activityTaxonomy.create({ data: { activityId: act4c.id, taxonomyValueId: sala4.id } })
  await prisma.activitySpeaker.create({ data: { activityId: act4c.id, speakerId: viviane.id } })

  // --- SALA 5 ---
  const sala5 = await prisma.taxonomyValue.create({
    data: { taxonomyId: roomTaxonomy.id, label: 'Sala 5 - Terapias Extracorpóreas' }
  })

  const act5 = await prisma.activity.create({
    data: {
      timeBlockId: blockMorning.id,
      title: 'Terapias Extracorpóreas Contínuas (CRRT) e Plataforma Multi Órgãos',
      description: 'Casos práticos de CRRT para Enfermagem Intensiva.',
      startTime: '08:00', endTime: '12:00', capacity: 15, status: 'PUBLISHED'
    }
  })
  await prisma.activityTaxonomy.create({ data: { activityId: act5.id, taxonomyValueId: sala5.id } })
  await prisma.activitySpeaker.create({ data: { activityId: act5.id, speakerId: giane.id } })

  const act5b = await prisma.activity.create({
    data: {
      timeBlockId: blockMorning.id,
      title: 'ECMO no Paciente Adulto: O Papel do Enfermeiro Especialista',
      description: 'Monitorização do circuito, controle de coagulação e complicações da membrana.',
      startTime: '13:30', endTime: '15:30', capacity: 15, status: 'PUBLISHED'
    }
  })
  await prisma.activityTaxonomy.create({ data: { activityId: act5b.id, taxonomyValueId: sala5.id } })
  await prisma.activitySpeaker.create({ data: { activityId: act5b.id, speakerId: giane.id } })
  
  const act5c = await prisma.activity.create({
    data: {
      timeBlockId: blockMorning.id,
      title: 'Pulsoterapia e Plasmaférese em Quadros Neurológicos Agudos',
      description: 'Desafios assistenciais e gestão da circulação extracorpórea de curto prazo.',
      startTime: '16:00', endTime: '18:00', capacity: 15, status: 'PUBLISHED'
    }
  })
  await prisma.activityTaxonomy.create({ data: { activityId: act5c.id, taxonomyValueId: sala5.id } })
  await prisma.activitySpeaker.create({ data: { activityId: act5c.id, speakerId: giane.id } })

  console.log('✅ Seed executado com sucesso! Dados reais inseridos no banco.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
