/**
 * Markdown sencillo → HTML, para mostrar la documentación del repositorio dentro de la app
 * (docs/ENTORNOS.md). Cubre lo que usan esos documentos: títulos, párrafos, citas, listas
 * (también anidadas), tablas, bloques de código, separadores, negrita, código y enlaces.
 * Todo el texto se escapa; Angular vuelve a sanear el resultado al pintarlo con [innerHTML].
 */
const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

const REPO = 'https://github.com/pibloo94/my-wedding/blob/main/';

/** Enlaces relativos del repositorio (../firestore.rules) → GitHub; los absolutos se mantienen. */
function href(url: string, base: string): string {
  if (/^https?:\/\//.test(url)) return url;
  if (url.startsWith('#')) return url;
  const parts = (base + url).split('/');
  const out: string[] = [];
  for (const p of parts) {
    if (p === '..') out.pop();
    else if (p !== '.' && p !== '') out.push(p);
  }
  return REPO + out.join('/');
}

function inline(s: string, base: string): string {
  const codes: string[] = [];
  let t = s.replace(/`([^`]+)`/g, (_, c: string) => `\u0000${codes.push(esc(c)) - 1}\u0000`);
  t = esc(t);
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, txt: string, url: string) =>
    `<a href="${esc(href(url.replace(/&amp;/g, '&'), base))}" target="_blank" rel="noopener noreferrer">${txt}</a>`);
  t = t.replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, (_, p: string, url: string) => `${p}<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
  t = t.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  return t.replace(/\u0000(\d+)\u0000/g, (_, i: string) => `<code>${codes[+i]}</code>`);
}

/** `base`: carpeta del documento dentro del repositorio («docs/»), para resolver sus enlaces. */
export function markdownToHtml(md: string, base = ''): string {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let i = 0;
  const isTable = (l: string) => /^\s*\|.*\|\s*$/.test(l);
  const isList = (l: string) => /^\s*([-*]|\d+\.)\s+/.test(l);

  while (i < lines.length) {
    const l = lines[i]!;
    if (!l.trim()) { i++; continue; }

    if (l.startsWith('```')) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i]!.startsWith('```')) buf.push(lines[i++]!);
      i++;
      out.push(`<pre><code>${esc(buf.join('\n'))}</code></pre>`);
      continue;
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(l);
    if (h) { out.push(`<h${h[1]!.length + 1}>${inline(h[2]!, base)}</h${h[1]!.length + 1}>`); i++; continue; }
    if (/^---+\s*$/.test(l)) { out.push('<hr>'); i++; continue; }
    if (l.startsWith('>')) {
      const buf: string[] = [];
      while (i < lines.length && lines[i]!.startsWith('>')) buf.push(lines[i++]!.replace(/^>\s?/, ''));
      out.push(`<blockquote><p>${inline(buf.join(' '), base)}</p></blockquote>`);
      continue;
    }

    if (isTable(l)) {
      const rows: string[][] = [];
      while (i < lines.length && isTable(lines[i]!)) {
        const cells = lines[i]!.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
        if (!cells.every(c => /^:?-{2,}:?$/.test(c))) rows.push(cells);
        i++;
      }
      const [head, ...body] = rows;
      out.push('<div class="md-table"><table>'
        + (head ? `<thead><tr>${head.map(c => `<th>${inline(c, base)}</th>`).join('')}</tr></thead>` : '')
        + `<tbody>${body.map(r => `<tr>${r.map(c => `<td>${inline(c, base)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }

    if (isList(l)) {
      // Lista con niveles por sangría (2 o más espacios = un nivel más)
      const items: { depth: number; ordered: boolean; text: string }[] = [];
      while (i < lines.length && (isList(lines[i]!) || (/^\s{2,}\S/.test(lines[i]!) && items.length))) {
        const ln = lines[i]!;
        const m = /^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(ln);
        if (m) items.push({ depth: Math.floor(m[1]!.length / 2), ordered: /\d/.test(m[2]!), text: m[3]! });
        else items[items.length - 1]!.text += ' ' + ln.trim();
        i++;
      }
      let html = '';
      const stack: boolean[] = [];
      for (const it of items) {
        while (stack.length > it.depth + 1) html += `</li></${stack.pop() ? 'ol' : 'ul'}>`;
        if (stack.length < it.depth + 1) {
          while (stack.length < it.depth + 1) { stack.push(it.ordered); html += it.ordered ? '<ol>' : '<ul>'; }
        } else {
          html += '</li>';
        }
        html += `<li>${inline(it.text, base)}`;
      }
      while (stack.length) html += `</li></${stack.pop() ? 'ol' : 'ul'}>`;
      out.push(html);
      continue;
    }

    const buf: string[] = [];
    while (i < lines.length && lines[i]!.trim() && !isTable(lines[i]!) && !isList(lines[i]!) && !/^(#{1,4}\s|```|---+\s*$|>)/.test(lines[i]!)) buf.push(lines[i++]!.trim());
    out.push(`<p>${inline(buf.join(' '), base)}</p>`);
  }
  return out.join('\n');
}
