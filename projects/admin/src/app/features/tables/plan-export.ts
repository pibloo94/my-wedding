/**
 * Plano del salón para descargar: un SVG autónomo con el salón, las mesas (con iniciales y
 * nombre) y, debajo, la lista de quién se sienta en cada mesa. Se convierte a PNG o se imprime.
 */
import { FloorPlan, Guest, Table } from '../../core/models';
import { SeatInfo, dietText, hasDiet, members, seatList, attending } from '../../core/domain';
import { colorOf, initials } from '../../core/util';
import { PLAN_SCALE, tableGeometry } from '../../shared/table-geometry';

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const SANS = "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";
const SERIF = "Butler, Georgia, 'Times New Roman', serif";

function glyph(t: Table, seats: SeatInfo[]): string {
  const g = tableGeometry(t, seats, false);
  let s = g.shape === 'rect'
    ? `<rect x="${-g.w / 2}" y="${-g.h / 2}" width="${g.w}" height="${g.h}" rx="10" fill="#EFE7D6" stroke="#D8C6A4" stroke-width="1.5"/>`
    : `<circle r="${g.r}" fill="#EFE7D6" stroke="#D8C6A4" stroke-width="1.5"/>`;
  for (const c of g.chairs) {
    if (!c.seat) {
      s += `<circle cx="${c.x}" cy="${c.y}" r="${g.chairR}" fill="#fff" stroke="#D8C6A4" stroke-width="1.4" stroke-dasharray="3 2.4"/>`;
      continue;
    }
    s += `<circle cx="${c.x}" cy="${c.y}" r="${g.chairR}" fill="${c.seat.color}" stroke="${c.over ? '#7d3216' : '#fff'}" stroke-width="1.6"/>`;
    s += `<text x="${c.x}" y="${c.y + 2.5}" fill="#fff" font-size="7" font-weight="600" text-anchor="middle" font-family="${SANS}">${esc(c.seat.initials)}</text>`;
    if (c.seat.diet) s += `<circle cx="${c.x + g.chairR * .72}" cy="${c.y - g.chairR * .72}" r="3" fill="#CD8A52" stroke="#fff" stroke-width="1.2"/>`;
  }
  const name = t.name.length > 13 ? t.name.slice(0, 12) + '…' : t.name;
  s += `<text x="0" y="-3" text-anchor="middle" font-family="${SERIF}" font-size="12.5" fill="#5E6A49">${esc(name)}</text>`;
  s += `<text x="0" y="11" text-anchor="middle" font-family="${SANS}" font-size="8.5" font-weight="600" fill="${g.used > g.cap ? '#97492A' : '#6E6F59'}">${g.used}/${g.cap}</text>`;
  return s;
}

export interface PlanExport { svg: string; width: number; height: number; }

export function buildPlanSvg(plan: FloorPlan, tables: Table[], guests: Guest[], title: string): PlanExport {
  const W = plan.width, H = plan.height;
  const pad = 40, head = 90;
  const seatsOf = (t: Table) => seatList(t, guests, colorOf, initials);

  // Plano
  let body = `<rect x="${pad}" y="${head}" width="${W}" height="${H}" rx="18" fill="#FBF7EF" stroke="#D8C6A4" stroke-width="2"/>`;
  for (const z of plan.zones) {
    body += `<rect x="${pad + z.x}" y="${head + z.y}" width="${z.w}" height="${z.h}" rx="12" fill="#E7DCC4" fill-opacity=".45" stroke="#D8C6A4" stroke-dasharray="6 5"/>`;
    body += `<text x="${pad + z.x + z.w / 2}" y="${head + z.y + z.h / 2 + 6}" text-anchor="middle" font-family="${SERIF}" font-size="18" fill="#86876F">${esc(z.label)}</text>`;
  }
  for (const t of tables) {
    if (t.x == null || t.y == null) continue;
    body += `<g transform="translate(${pad + t.x} ${head + t.y}) rotate(${t.rot || 0}) scale(${PLAN_SCALE})">${glyph(t, seatsOf(t))}</g>`;
  }

  // Lista por mesa, en tres columnas
  const colW = (W - 40) / 3, lineH = 20;
  let y0 = head + H + 60;
  let legend = `<text x="${pad}" y="${y0}" font-family="${SERIF}" font-size="26" fill="#5E6A49">Quién se sienta en cada mesa</text>`;
  y0 += 26;
  const cols = [y0, y0, y0];
  const ordered = [...tables].sort((a, b) => a.name.localeCompare(b.name, 'es', { numeric: true }));
  for (const t of ordered) {
    const ppl: string[] = [];
    for (const g of attending(guests)) for (const m of members(g)) if (m.table === t.id) {
      ppl.push(m.name + (m.role === 'niño' && m.age != null ? ` (${m.age})` : '') + (hasDiet(m) ? ` · ${dietText(m).replace(/^\d+ años · ?/, '')}` : ''));
    }
    const c = cols.indexOf(Math.min(...cols));
    const x = pad + c * (colW + 20);
    let y = cols[c]! + 30;
    legend += `<text x="${x}" y="${y}" font-family="${SERIF}" font-size="19" fill="#43473A">${esc(t.name)} <tspan font-family="${SANS}" font-size="13" fill="#6E6F59">${ppl.length}/${t.cap}</tspan></text>`;
    y += 8;
    for (const p of ppl.length ? ppl : ['(vacía)']) {
      y += lineH;
      const txt = p.length > 52 ? p.slice(0, 51) + '…' : p;
      legend += `<text x="${x + 2}" y="${y}" font-family="${SANS}" font-size="13.5" fill="#4C4E40">${esc(txt)}</text>`;
    }
    cols[c] = y + 10;
  }
  const totalH = Math.max(...cols) + pad;
  const width = W + pad * 2;
  const header = `<text x="${pad}" y="56" font-family="${SERIF}" font-size="34" fill="#5E6A49">${esc(title)}</text>`
    + `<text x="${width - pad}" y="56" text-anchor="end" font-family="${SANS}" font-size="14" fill="#86876F">Punto naranja: menú especial o alergias</text>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${totalH}" viewBox="0 0 ${width} ${totalH}">`
    + `<rect width="100%" height="100%" fill="#ffffff"/>${header}${body}${legend}</svg>`;
  return { svg, width, height: totalH };
}

/** SVG → PNG (a 2×). */
export function svgToPng(e: PlanExport, scale = 2): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(new Blob([e.svg], { type: 'image/svg+xml;charset=utf-8' }));
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = e.width * scale;
      c.height = e.height * scale;
      const ctx = c.getContext('2d')!;
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      c.toBlob(b => (b ? resolve(b) : reject(new Error('No se pudo crear la imagen'))), 'image/png');
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo dibujar el plano')); };
    img.src = url;
  });
}

/** Abre el plano en una ventana nueva lista para imprimir o guardar como PDF. */
export function printPlan(e: PlanExport, title: string): boolean {
  const w = window.open('', '_blank');
  if (!w) return false;
  w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${esc(title)}</title>
    <style>@page{size:A3 portrait;margin:10mm}html,body{margin:0;background:#fff}svg{width:100%;height:auto;display:block}</style></head>
    <body>${e.svg}<script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script></body></html>`);
  w.document.close();
  return true;
}
