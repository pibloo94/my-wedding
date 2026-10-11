/** Descargar y abrir archivos desde el navegador. */

export function downloadBlob(name: string, blob: Blob): void {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export function downloadText(name: string, text: string, type: string): void {
  // BOM para que Excel abra bien las tildes del CSV
  downloadBlob(name, new Blob(['﻿' + text], { type: type + ';charset=utf-8' }));
}

export function pickTextFile(accept: string): Promise<string | null> {
  return new Promise(resolve => {
    const i = document.createElement('input');
    i.type = 'file';
    i.accept = accept;
    i.onchange = () => {
      const f = i.files?.[0];
      if (!f) return resolve(null);
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => resolve(null);
      r.readAsText(f);
    };
    i.click();
  });
}

const csvCell = (v: unknown): string => {
  const s = String(v ?? '');
  return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};

export const toCsv = (rows: unknown[][]): string => rows.map(r => r.map(csvCell).join(',')).join('\n');

/** CSV con separador , o ; (el que más aparezca en la cabecera) y comillas. */
export function parseCsv(text: string): string[][] {
  const t = text.replace(/^﻿/, '');
  const first = t.split(/\r?\n/)[0] || '';
  const sep = (first.match(/;/g) || []).length > (first.match(/,/g) || []).length ? ';' : ',';
  const rows: string[][] = [];
  let r: string[] = [], f = '', q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i]!;
    if (q) {
      if (c === '"') {
        if (t[i + 1] === '"') { f += '"'; i++; } else q = false;
      } else f += c;
    } else if (c === '"') q = true;
    else if (c === sep) { r.push(f); f = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && t[i + 1] === '\n') i++;
      r.push(f); f = ''; rows.push(r); r = [];
    } else f += c;
  }
  if (f !== '' || r.length) { r.push(f); rows.push(r); }
  return rows.filter(x => x.some(y => y.trim()));
}
