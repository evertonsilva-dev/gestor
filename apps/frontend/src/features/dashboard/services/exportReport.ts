import { jsPDF } from 'jspdf'
import { strToU8, zipSync } from 'fflate'
import type { DashboardData } from '@/types/domain'
import { formatShortDate } from '@/lib/dateFormat'

const sentimentLabel = {
  positive: 'Favorável',
  neutral: 'Neutro',
  negative: 'Crítico',
} as const

const profileLabel = {
  militante: 'Apoiador',
  simpatizante: 'Simpatizante',
  detrator: 'Opositor',
} as const

const recommendationLabel = {
  insight: 'Insight',
  action: 'Ação',
  example: 'Exemplo',
} as const

export async function downloadExcelReport(data: DashboardData): Promise<void> {
  if (!data.selectedPeriod) throw new Error('Não há período publicado para exportar.')

  const audienceByProfile = new Map(data.audience.map((item) => [item.profile, item]))
  const audienceRows = (['militante', 'simpatizante', 'detrator'] as const)
    .map((profile) => {
      const item = audienceByProfile.get(profile)
      return [profileLabel[profile], item?.count ?? 0, (item?.percentage ?? 0) / 100] as Array<string | number>
    })
  const sentimentRows = data.sentimentByChannel.map((row) => [
    row.channelName,
    row.positive,
    row.neutral,
    row.negative,
    row.positive + row.neutral + row.negative,
  ])
  const sheets: Array<{
    name: string
    headers: string[]
    rows: Array<Array<string | number>>
    hasFilter?: boolean
    styles?: Record<string, number>
    fixedWidths?: number[]
  }> = [
    {
      name: 'Painel',
      headers: [],
      rows: [
        ['ARQUEA TECNOLOGIA | RELATÓRIO DE MONITORAMENTO'],
        [data.organization.name],
        [`Período: ${formatShortDate(data.selectedPeriod.startDate)} a ${formatShortDate(data.selectedPeriod.endDate)}`],
        [`Publicado em: ${formatShortDate(data.selectedPeriod.publishedAt)}`],
        [],
        ['Notícias monitoradas', data.metrics.newsCount, '', 'Comentários analisados', data.metrics.commentCount],
        [],
        ['Sentimento por canal', '', '', '', '', '', '', '', 'Perfil do público'],
      ],
      styles: {
        A1: 2,
        A2: 3,
        A3: 3,
        A4: 3,
        A6: 4,
        B6: 5,
        D6: 4,
        E6: 5,
        A8: 1,
        I8: 1,
      },
      fixedWidths: [24, 12, 4, 24, 12, ...Array.from({ length: 11 }, () => 12)],
    },
    {
      name: 'Resumo',
      headers: ['Indicador', 'Resultado'],
      rows: [
        ['Organização', data.organization.name],
        ['Período inicial', formatShortDate(data.selectedPeriod.startDate)],
        ['Período final', formatShortDate(data.selectedPeriod.endDate)],
        ['Publicado em', formatShortDate(data.selectedPeriod.publishedAt)],
        ['Última publicação', data.lastPublishedAt ? formatShortDate(data.lastPublishedAt) : 'Ainda não publicado'],
        ['Atualização em andamento', data.updateInProgress ? 'Sim' : 'Não'],
        ['Notícias monitoradas', data.metrics.newsCount],
        ['Comentários analisados', data.metrics.commentCount],
      ],
      hasFilter: true,
    },
    {
      name: 'Sentimentos',
      headers: ['Canal', 'Favorável', 'Neutro', 'Crítico', 'Total'],
      rows: sentimentRows,
      hasFilter: true,
    },
    {
      name: 'Público',
      headers: ['Perfil', 'Quantidade', 'Percentual'],
      rows: audienceRows,
      hasFilter: true,
      styles: { C2: 6, C3: 6, C4: 6 },
    },
    {
      name: 'Notícias',
      headers: ['Canal', 'Notícia', 'Sentimento', 'Fonte'],
      rows: data.news.map((row) => [
        row.channelName,
        row.title,
        sentimentLabel[row.sentiment],
        row.sourceUrl ?? '',
      ]),
      hasFilter: true,
    },
    {
      name: 'Comentários',
      headers: ['Canal', 'Notícia relacionada', 'Comentário', 'Perfil', 'Sentimento'],
      rows: data.comments.map((row) => [
        row.channelName,
        row.newsTitle ?? '',
        row.content,
        profileLabel[row.profile],
        sentimentLabel[row.sentiment],
      ]),
      hasFilter: true,
    },
    {
      name: 'Recomendações',
      headers: ['Categoria', 'Conteúdo'],
      rows: data.recommendations.map((row) => [recommendationLabel[row.category], row.content]),
      hasFilter: true,
    },
  ]

  const worksheetXml = (sheet: (typeof sheets)[number], index: number) => {
    const allRows = sheet.headers.length > 0 ? [sheet.headers, ...sheet.rows] : sheet.rows
    const xmlRows = allRows.map((row, rowIndex) => {
      const rowNumber = rowIndex + 1
      const cells = row.map((value, columnIndex) => {
        const reference = `${columnReference(columnIndex + 1)}${rowNumber}`
        const style = sheet.styles?.[reference] ?? (sheet.headers.length > 0 && rowIndex === 0 ? 1 : undefined)
        const styleAttribute = style === undefined ? '' : ` s="${style}"`
        if (typeof value === 'number' && Number.isFinite(value)) {
          return `<c r="${reference}"${styleAttribute}><v>${value}</v></c>`
        }
        return `<c r="${reference}" t="inlineStr"${styleAttribute}><is><t xml:space="preserve">${escapeXml(String(value))}</t></is></c>`
      }).join('')
      return `<row r="${rowNumber}">${cells}</row>`
    }).join('')
    const columnCount = Math.max(sheet.headers.length, ...allRows.map((row) => row.length), 1)
    const columnWidths = Array.from({ length: columnCount }, (_, columnIndex) => {
      const width = sheet.fixedWidths?.[columnIndex] ?? Math.min(
        60,
        Math.max(
          12,
          String(sheet.headers[columnIndex] ?? '').length + 2,
          ...sheet.rows.map((row) => String(row[columnIndex] ?? '').length + 2),
        ),
      )
      return `<col min="${columnIndex + 1}" max="${columnIndex + 1}" width="${width}" customWidth="1"/>`
    }).join('')
    const lastColumn = columnReference(columnCount)
    const lastRow = Math.max(allRows.length, 1)
    const filter = sheet.hasFilter
      ? `<autoFilter ref="A1:${lastColumn}${lastRow}"/>`
      : ''
    const views = sheet.headers.length > 0
      ? '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A2" sqref="A2"/></sheetView></sheetViews>'
      : '<sheetViews><sheetView workbookViewId="0"/></sheetViews>'
    const drawing = index === 0 ? '<drawing r:id="rId1"/>' : ''
    const relationships = index === 0
      ? ' xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"'
      : ''

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"${relationships}><dimension ref="A1:${lastColumn}${lastRow}"/>${views}<cols>${columnWidths}</cols><sheetData>${xmlRows}</sheetData>${filter}${drawing}</worksheet>`
  }

  const sheetEntries = sheets.map((sheet, index) => {
    const sheetNumber = index + 1
    return `<sheet name="${escapeXml(sheet.name)}" sheetId="${sheetNumber}" r:id="rId${sheetNumber}"/>`
  }).join('')
  const relationships = sheets.map((_, index) => {
    const sheetNumber = index + 1
    return `<Relationship Id="rId${sheetNumber}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${sheetNumber}.xml"/>`
  }).join('') + `<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>`
  const contentOverrides = sheets.map((_, index) => {
    const sheetNumber = index + 1
    return `<Override PartName="/xl/worksheets/sheet${sheetNumber}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
  }).join('')
  const chartContentOverrides = [
    '<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>',
    '<Override PartName="/xl/charts/chart1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>',
    '<Override PartName="/xl/charts/chart2.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>',
    '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>',
  ].join('')
  const archive: Record<string, Uint8Array> = {
    '[Content_Types].xml': strToU8(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${contentOverrides}${chartContentOverrides}</Types>`,
    ),
    '_rels/.rels': strToU8(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    ),
    'xl/workbook.xml': strToU8(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView activeTab="0"/></bookViews><sheets>${sheetEntries}</sheets><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>`,
    ),
    'xl/_rels/workbook.xml.rels': strToU8(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${relationships}</Relationships>`,
    ),
    'xl/styles.xml': strToU8(stylesXml()),
    'xl/worksheets/_rels/sheet1.xml.rels': strToU8(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/></Relationships>',
    ),
    'xl/drawings/drawing1.xml': strToU8(drawingXml()),
    'xl/drawings/_rels/drawing1.xml.rels': strToU8(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart2.xml"/></Relationships>',
    ),
    'xl/charts/chart1.xml': strToU8(sentimentChartXml(data.sentimentByChannel)),
    'xl/charts/chart2.xml': strToU8(audienceChartXml(audienceRows)),
  }

  sheets.forEach((sheet, index) => {
    archive[`xl/worksheets/sheet${index + 1}.xml`] = strToU8(worksheetXml(sheet, index))
  })

  const content = zipSync(archive)
  const blob = new Blob([content], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `monitoramento-${data.selectedPeriod.endDate}.xlsx`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

function columnReference(column: number): string {
  let value = column
  let reference = ''

  while (value > 0) {
    const remainder = (value - 1) % 26
    reference = String.fromCharCode(65 + remainder) + reference
    value = Math.floor((value - 1) / 26)
  }

  return reference
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function stylesXml(): string {
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    + '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
    + '<numFmts count="1"><numFmt numFmtId="164" formatCode="0%"/></numFmts>'
    + '<fonts count="3"><font><sz val="11"/><name val="Calibri"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Calibri"/></font><font><b/><color rgb="FF3A1C30"/><sz val="16"/><name val="Calibri"/></font></fonts>'
    + '<fills count="4"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF3A1C30"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFDF9F5"/><bgColor indexed="64"/></patternFill></fill></fills>'
    + '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
    + '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
    + '<cellXfs count="7"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center"/></xf><xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="0" fontId="0" fillId="3" borderId="0" xfId="0" applyFill="1"/><xf numFmtId="0" fontId="0" fillId="3" borderId="0" xfId="0" applyFill="1" applyAlignment="1"><alignment vertical="center"/></xf><xf numFmtId="0" fontId="2" fillId="3" borderId="0" xfId="0" applyFont="1" applyFill="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs>'
    + '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>'
}

function chartStringReference(formula: string, values: string[]): string {
  const points = values.map((value, index) => `<c:pt idx="${index}"><c:v>${escapeXml(value)}</c:v></c:pt>`).join('')
  return `<c:strRef><c:f>${formula}</c:f><c:strCache><c:ptCount val="${values.length}"/>${points}</c:strCache></c:strRef>`
}

function chartNumberReference(formula: string, values: number[]): string {
  const points = values.map((value, index) => `<c:pt idx="${index}"><c:v>${value}</c:v></c:pt>`).join('')
  return `<c:numRef><c:f>${formula}</c:f><c:numCache><c:formatCode>General</c:formatCode><c:ptCount val="${values.length}"/>${points}</c:numCache></c:numRef>`
}

function chartSeries(
  nameFormula: string,
  name: string,
  categoryFormula: string,
  valueFormula: string,
  categories: string[],
  values: number[],
  index: number,
  color: string,
): string {
  return `<c:ser><c:idx val="${index}"/><c:order val="${index}"/><c:tx>${chartStringReference(nameFormula, [name])}</c:tx><c:spPr><a:solidFill><a:srgbClr val="${color}"/></a:solidFill><a:ln><a:noFill/></a:ln></c:spPr><c:cat>${chartStringReference(categoryFormula, categories)}</c:cat><c:val>${chartNumberReference(valueFormula, values)}</c:val></c:ser>`
}

function sentimentChartXml(rows: DashboardData['sentimentByChannel']): string {
  const lastRow = rows.length + 1
  const categories = rows.map((row) => row.channelName)
  const series = [
    { column: 'B', label: 'Favorável', color: 'D28C6E', values: rows.map((row) => row.positive) },
    { column: 'C', label: 'Neutro', color: 'F2B06F', values: rows.map((row) => row.neutral) },
    { column: 'D', label: 'Crítico', color: 'F36D60', values: rows.map((row) => row.negative) },
  ].map((item, index) => chartSeries(
    `'Sentimentos'!$${item.column}$1`,
    item.label,
    `'Sentimentos'!$A$2:$A$${lastRow}`,
    `'Sentimentos'!$${item.column}$2:$${item.column}$${lastRow}`,
    categories,
    item.values,
    index,
    item.color,
  )).join('')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><c:lang val="pt-BR"/><c:chart><c:plotArea><c:layout/><c:barChart><c:barDir val="bar"/><c:grouping val="stacked"/><c:varyColors val="0"/>${series}<c:overlap val="100"/><c:gapWidth val="65"/><c:axId val="123456"/><c:axId val="654321"/></c:barChart><c:catAx><c:axId val="123456"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:delete val="0"/><c:axPos val="l"/><c:majorTickMark val="none"/><c:minorTickMark val="none"/><c:tickLblPos val="nextTo"/><c:crossAx val="654321"/><c:crosses val="autoZero"/><c:auto val="1"/><c:lblAlgn val="ctr"/><c:lblOffset val="100"/></c:catAx><c:valAx><c:axId val="654321"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:delete val="0"/><c:axPos val="b"/><c:majorGridlines/><c:numFmt formatCode="0" sourceLinked="0"/><c:majorTickMark val="none"/><c:minorTickMark val="none"/><c:tickLblPos val="nextTo"/><c:crossAx val="123456"/><c:crosses val="autoZero"/><c:crossBetween val="between"/></c:valAx></c:plotArea><c:legend><c:legendPos val="b"/><c:layout/><c:overlay val="0"/></c:legend><c:plotVisOnly val="1"/><c:dispBlanksAs val="gap"/></c:chart><c:spPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:ln><a:noFill/></a:ln></c:spPr></c:chartSpace>`
}

function audienceChartXml(rows: Array<Array<string | number>>): string {
  const categories = rows.map((row) => String(row[0]))
  const values = rows.map((row) => Number(row[1]))
  const colors = ['3A1C30', 'D28C6E', 'F36D60']
  const dataPoints = colors.map((color, index) => `<c:dPt><c:idx val="${index}"/><c:spPr><a:solidFill><a:srgbClr val="${color}"/></a:solidFill><a:ln><a:noFill/></a:ln></c:spPr></c:dPt>`).join('')
  const lastRow = rows.length + 1
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><c:lang val="pt-BR"/><c:chart><c:plotArea><c:layout/><c:doughnutChart><c:varyColors val="1"/><c:ser><c:idx val="0"/><c:order val="0"/><c:cat>${chartStringReference(`'Público'!$A$2:$A$${lastRow}`, categories)}</c:cat><c:val>${chartNumberReference(`'Público'!$B$2:$B$${lastRow}`, values)}</c:val>${dataPoints}</c:ser><c:dLbls><c:showLegendKey val="0"/><c:showPercent val="1"/><c:showLeaderLines val="1"/></c:dLbls><c:holeSize val="58"/><c:firstSliceAng val="270"/></c:doughnutChart></c:plotArea><c:legend><c:legendPos val="b"/><c:layout/><c:overlay val="0"/></c:legend><c:plotVisOnly val="1"/></c:chart><c:spPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:ln><a:noFill/></a:ln></c:spPr></c:chartSpace>`
}

function drawingXml(): string {
  const anchor = (fromColumn: number, toColumn: number, chartId: string, chartName: string) => (
    `<xdr:twoCellAnchor editAs="oneCell"><xdr:from><xdr:col>${fromColumn}</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>9</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from><xdr:to><xdr:col>${toColumn}</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>26</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to><xdr:graphicFrame macro=""><xdr:nvGraphicFramePr><xdr:cNvPr id="${chartId === 'rId1' ? 2 : 3}" name="${chartName}"/><xdr:cNvGraphicFramePr/></xdr:nvGraphicFramePr><xdr:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></xdr:xfrm><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart"><c:chart xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="${chartId}"/></a:graphicData></a:graphic></xdr:graphicFrame><xdr:clientData/></xdr:twoCellAnchor>`
  )
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">${anchor(0, 8, 'rId1', 'Sentimento por canal')}${anchor(8, 16, 'rId2', 'Perfil do público')}</xdr:wsDr>`
}

export function downloadPdfReport(data: DashboardData) {
  if (!data.selectedPeriod) throw new Error('Não há período publicado para exportar.')

  const pdf = new jsPDF()
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const left = 18
  const contentWidth = pageWidth - left * 2
  const bottom = pageHeight - 18
  const setFillColor = (color: readonly [number, number, number]) => {
    pdf.setFillColor(color[0], color[1], color[2])
  }
  const colors = {
    ink: [58, 28, 48] as const,
    muted: [116, 95, 105] as const,
    navy: [58, 28, 48] as const,
    border: [234, 223, 217] as const,
    positive: [210, 140, 110] as const,
    neutral: [242, 176, 111] as const,
    negative: [243, 109, 96] as const,
  }
  let y = 20

  const newPage = () => {
    pdf.addPage()
    y = 20
  }

  const ensureSpace = (height: number) => {
    if (y + height > bottom) newPage()
  }

  const addText = (
    text: string,
    size = 9,
    color: readonly [number, number, number] = colors.ink,
    style: 'normal' | 'bold' = 'normal',
    indent = 0,
  ) => {
    pdf.setFont('helvetica', style)
    pdf.setFontSize(size)
    pdf.setTextColor(...color)
    const lines = pdf.splitTextToSize(text, contentWidth - indent) as string[]
    const lineHeight = size * 0.48

    for (const line of lines) {
      ensureSpace(lineHeight)
      pdf.text(line, left + indent, y)
      y += lineHeight
    }
  }

  const addSection = (title: string) => {
    ensureSpace(15)
    y += 3
    pdf.setFillColor(...colors.navy)
    pdf.roundedRect(left, y - 4, 2, 7, 1, 1, 'F')
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(11)
    pdf.setTextColor(...colors.navy)
    pdf.text(title.toLocaleUpperCase('pt-BR'), left + 6, y + 1)
    y += 8
  }

  const drawLegendItem = (label: string, color: readonly [number, number, number], x: number) => {
    setFillColor(color)
    pdf.roundedRect(x, y - 2.5, 3, 3, 0.7, 0.7, 'F')
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.setTextColor(...colors.muted)
    pdf.text(label, x + 5, y)
  }

  pdf.setFillColor(...colors.navy)
  pdf.rect(0, 0, pageWidth, 64, 'F')
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(17)
  pdf.setTextColor(255, 255, 255)
  pdf.text('ARQUEA TECNOLOGIA | MONITORAMENTO', left, 20)
  pdf.setFontSize(12)
  pdf.text(data.organization.name, left, 33)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.setTextColor(220, 226, 234)
  pdf.text(`Comentários coletados entre ${formatShortDate(data.selectedPeriod.startDate)} e ${formatShortDate(data.selectedPeriod.endDate)}`, left, 44)
  pdf.text(`Publicado em: ${formatShortDate(data.selectedPeriod.publishedAt)}`, left, 53)
  y = 77

  const metricGap = 6
  const metricWidth = (contentWidth - metricGap) / 2
  const drawMetric = (x: number, label: string, value: number) => {
    pdf.setFillColor(253, 249, 245)
    pdf.setDrawColor(...colors.border)
    pdf.roundedRect(x, y - 6, metricWidth, 23, 3, 3, 'FD')
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(15)
    pdf.setTextColor(...colors.navy)
    pdf.text(String(value), x + 5, y + 3)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.setTextColor(...colors.muted)
    pdf.text(label, x + 5, y + 12)
  }
  drawMetric(left, 'Notícias monitoradas', data.metrics.newsCount)
  drawMetric(left + metricWidth + metricGap, 'Comentários analisados', data.metrics.commentCount)
  y += 27

  addSection('Sentimentos por canal')
  if (data.sentimentByChannel.length === 0) {
    addText('Nenhum canal cadastrado para este período.', 9, colors.muted)
  } else {
    drawLegendItem('Favorável', colors.positive, left)
    drawLegendItem('Neutro', colors.neutral, left + 38)
    drawLegendItem('Crítico', colors.negative, left + 72)
    y += 6

    const maxTotal = Math.max(...data.sentimentByChannel.map((row) => row.positive + row.neutral + row.negative), 1)
    const labelWidth = 43
    const totalWidth = 18
    const barX = left + labelWidth
    const barWidth = contentWidth - labelWidth - totalWidth

    for (const channel of data.sentimentByChannel) {
      const channelLines = pdf.splitTextToSize(channel.channelName, labelWidth - 3) as string[]
      const rowHeight = Math.max(8, channelLines.length * 4)
      ensureSpace(rowHeight + 1)
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(8)
      pdf.setTextColor(...colors.ink)
      pdf.text(channelLines, left, y)
      const total = channel.positive + channel.neutral + channel.negative
      let segmentX = barX
      for (const [value, color] of [
        [channel.positive, colors.positive],
        [channel.neutral, colors.neutral],
        [channel.negative, colors.negative],
      ] as const) {
        const segmentWidth = total === 0 ? 0 : (value / maxTotal) * barWidth
        if (segmentWidth > 0) {
          setFillColor(color)
          pdf.rect(segmentX, y - 2.5, segmentWidth, 4, 'F')
          segmentX += segmentWidth
        }
      }
      pdf.setTextColor(...colors.muted)
      pdf.text(String(total), left + contentWidth - 3, y, { align: 'right' })
      y += rowHeight + 1
    }
  }

  addSection('Categorização do público')
  const audienceByProfile = new Map(data.audience.map((group) => [group.profile, group]))
  const audienceGroups = (['militante', 'simpatizante', 'detrator'] as const)
    .map((profile) => audienceByProfile.get(profile) ?? { profile, count: 0, percentage: 0 })
  const maxAudience = Math.max(...audienceGroups.map((group) => group.count), 1)
  const audienceBarX = left + 43
  const audienceBarWidth = contentWidth - 75
  for (const group of audienceGroups) {
    ensureSpace(9)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.setTextColor(...colors.ink)
    pdf.text(profileLabel[group.profile], left, y)
    pdf.setFillColor(247, 248, 250)
    pdf.roundedRect(audienceBarX, y - 2.5, audienceBarWidth, 4, 1, 1, 'F')
    const barColors = {
      militante: colors.positive,
      simpatizante: colors.neutral,
      detrator: colors.negative,
    } as const
    const width = (group.count / maxAudience) * audienceBarWidth
    if (width > 0) {
      setFillColor(barColors[group.profile])
      pdf.roundedRect(audienceBarX, y - 2.5, width, 4, 1, 1, 'F')
    }
    pdf.setTextColor(...colors.muted)
    pdf.text(`${group.count} (${group.percentage}%)`, left + contentWidth, y, { align: 'right' })
    y += 9
  }

  addSection(`Notícias (${data.news.length})`)
  if (data.news.length === 0) addText('Nenhuma notícia registrada neste período.', 9, colors.muted)
  for (const news of data.news) {
    addText(news.title, 9, colors.ink, 'bold')
    addText(`${news.channelName} | ${sentimentLabel[news.sentiment]}`, 8, colors.muted, 'normal', 3)
    if (news.sourceUrl) addText(`Fonte: ${news.sourceUrl}`, 8, colors.muted, 'normal', 3)
    y += 3
  }

  addSection(`Comentários analisados (${data.comments.length})`)
  if (data.comments.length === 0) addText('Nenhum comentário registrado neste período.', 9, colors.muted)
  for (const comment of data.comments) {
    addText(comment.content, 9, colors.ink, 'bold')
    addText(
      `${comment.channelName}${comment.newsTitle ? ` | ${comment.newsTitle}` : ''} | ${profileLabel[comment.profile]} | ${sentimentLabel[comment.sentiment]}`,
      8,
      colors.muted,
      'normal',
      3,
    )
    y += 3
  }

  addSection(`Inteligência estratégica (${data.recommendations.length})`)
  if (data.recommendations.length === 0) addText('Nenhuma recomendação cadastrada neste período.', 9, colors.muted)
  for (const item of data.recommendations) {
    addText(recommendationLabel[item.category], 9, colors.ink, 'bold')
    addText(item.content, 9, colors.muted, 'normal', 3)
    y += 3
  }

  const pageCount = pdf.getNumberOfPages()
  for (let page = 1; page <= pageCount; page += 1) {
    pdf.setPage(page)
    pdf.setDrawColor(...colors.border)
    pdf.line(left, pageHeight - 12, pageWidth - left, pageHeight - 12)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.setTextColor(...colors.muted)
    pdf.text(data.organization.name, left, pageHeight - 7)
    pdf.text(`Página ${page} de ${pageCount}`, pageWidth - left, pageHeight - 7, { align: 'right' })
  }

  pdf.save(`monitoramento-${data.selectedPeriod.endDate}.pdf`)
}
