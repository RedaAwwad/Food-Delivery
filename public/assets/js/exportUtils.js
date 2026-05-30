/** Client-side report export (CSV, Excel-compatible, print/PDF). */

function escapeCsvCell(value) {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsv(rows) {
  return rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
}

export function downloadBlob(content, filename, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

export function downloadCsv(filename, rows) {
  const bom = "\uFEFF";
  downloadBlob(bom + toCsv(rows), filename.endsWith(".csv") ? filename : `${filename}.csv`, "text/csv;charset=utf-8");
}

export function downloadExcel(filename, rows) {
  const table = rows
    .map((row) => `<tr>${row.map((c) => `<td>${String(c ?? "").replace(/</g, "&lt;")}</td>`).join("")}</tr>`)
    .join("");
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head><meta charset="UTF-8"></head><body><table border="1">${table}</table></body></html>`;
  const name = filename.replace(/\.xlsx?$/i, "") + ".xls";
  downloadBlob(html, name, "application/vnd.ms-excel");
}

export function downloadJson(filename, data) {
  const json = JSON.stringify(data, null, 2);
  downloadBlob(json, filename.endsWith(".json") ? filename : `${filename}.json`, "application/json");
}

export function printAsPdf(title, bodyHtml) {
  const win = window.open("", "_blank", "noopener,noreferrer");
  if (!win) throw new Error("Pop-up blocked — allow pop-ups to export PDF");
  win.document.write(`<!DOCTYPE html>
<html><head>
  <meta charset="UTF-8"/>
  <title>${title}</title>
  <style>
    body { font-family: Inter, system-ui, sans-serif; padding: 28px; color: #111; font-size: 13px; }
    h1 { font-size: 20px; margin: 0 0 4px; }
    .meta { color: #666; margin-bottom: 24px; font-size: 12px; }
    h2 { font-size: 14px; margin: 20px 0 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
    th { background: #f5f5f5; }
    @media print { body { padding: 12px; } }
  </style>
</head><body>
  <h1>${title}</h1>
  <p class="meta">Generated ${new Date().toLocaleString()}</p>
  ${bodyHtml}
</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 350);
}

export function stamp() {
  const d = new Date();
  return d.toISOString().slice(0, 10) + "_" + d.toTimeString().slice(0, 5).replace(":", "");
}
