function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export async function exportToPdf(title: string, subtitle: string, columns: string[], rows: (string | number)[][], filename: string) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")])
  const doc = new jsPDF()
  doc.setFontSize(14)
  doc.text(title, 14, 16)
  doc.setFontSize(10)
  doc.setTextColor(120)
  doc.text(subtitle, 14, 22)
  autoTable(doc, {
    head: [columns],
    body: rows.map((r) => r.map((c) => String(c))),
    startY: 28,
    headStyles: { fillColor: [15, 138, 95] },
    styles: { fontSize: 9 },
  })
  doc.save(filename)
}

export async function exportToExcel(title: string, columns: string[], rows: (string | number)[][], filename: string) {
  const { default: ExcelJS } = await import("exceljs")
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet(title.slice(0, 31))
  sheet.addRow(columns)
  sheet.getRow(1).font = { bold: true }
  for (const row of rows) sheet.addRow(row)
  sheet.columns.forEach((col) => {
    let max = 10
    col.eachCell?.({ includeEmpty: true }, (cell) => {
      max = Math.max(max, String(cell.value ?? "").length + 2)
    })
    col.width = max
  })
  const buffer = await workbook.xlsx.writeBuffer()
  triggerDownload(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), filename)
}
