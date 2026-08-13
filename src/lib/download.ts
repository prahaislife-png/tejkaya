export function downloadText(filename: string, contents: string, type = "text/plain"): void {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function openPrintable(title: string, innerHtml: string): void {
  const win = window.open("", "_blank", "noopener,noreferrer,width=800,height=900");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
    <style>
      body{font-family:Georgia,serif;color:#161410;background:#faf6ef;padding:2.5rem;line-height:1.5;max-width:40rem;margin:0 auto}
      h1{font-weight:500} h2{font-size:1.2rem;margin-top:1.8rem}
      .muted{color:#6e675c;font-size:.85rem}
      table{width:100%;border-collapse:collapse;font-size:.9rem}
      th,td{border-bottom:1px solid #e8dfd0;padding:.4rem .2rem;text-align:left}
    </style></head><body>${innerHtml}</body></html>`);
  win.document.close();
  win.focus();
  win.print();
}
