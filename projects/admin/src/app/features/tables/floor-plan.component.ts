import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { StoreService } from '../../core/store.service';
import { UiService } from '../../core/ui.service';
import { FloorZone, Table } from '../../core/models';
import { SeatInfo, seatList } from '../../core/domain';
import { colorOf, initials, isoDate, today, uid } from '../../core/util';
import { downloadBlob } from '../../core/files';
import { PLAN_SCALE, tableGeometry } from '../../shared/table-geometry';
import { TableGlyphComponent } from '../../shared/table-figure.component';
import { IconComponent } from '../../shared/icon.component';
import { buildPlanSvg, printPlan, svgToPng } from './plan-export';

type Sel = { kind: 'table' | 'zone'; id: string } | null;
interface Drag { kind: 'table' | 'zone'; id: string; px: number; py: number; ox: number; oy: number; moved: boolean; pointer: number; }

const GRID = 10;
const snap = (v: number) => Math.round(v / GRID) * GRID;

/**
 * Plano del salón: las mesas se colocan arrastrándolas (ratón o dedo) y la posición se guarda
 * en Firebase al soltar. También se mueven con las flechas del teclado.
 */
@Component({
  selector: 'adm-floor-plan',
  imports: [TableGlyphComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './floor-plan.component.html',
  styleUrl: './floor-plan.component.scss'
})
export class FloorPlanComponent {
  private store = inject(StoreService);
  private ui = inject(UiService);
  private svgRef = viewChild<ElementRef<SVGSVGElement>>('svg');

  protected plan = computed(() => this.store.meta().plan);
  protected tables = this.store.tables;
  protected placed = computed(() => this.tables().filter(t => t.x != null && t.y != null));
  protected unplaced = computed(() => this.tables().filter(t => t.x == null || t.y == null));
  protected seats = computed(() => {
    const gs = this.store.guests();
    return new Map<string, SeatInfo[]>(this.tables().map(t => [t.id, seatList(t, gs, colorOf, initials)]));
  });

  protected sel = signal<Sel>(null);
  /** Posiciones mientras se arrastra (se guardan al soltar) */
  protected live = signal<Record<string, { x: number; y: number }>>({});
  /** 0 = ajustar al ancho; si no, píxeles por unidad */
  protected zoom = signal(0);
  private drag: Drag | null = null;

  /**
   * Mientras se arrastra, el movimiento se escucha en la ventana (no se «captura» el puntero en el
   * plano): así el clic posterior llega a la mesa o zona pulsada y queda seleccionada.
   */
  private onMove = (e: PointerEvent) => this.move(e);
  private onUp = (e: PointerEvent) => this.up(e);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopListening());
  }

  private stopListening(): void {
    removeEventListener('pointermove', this.onMove);
    removeEventListener('pointerup', this.onUp);
    removeEventListener('pointercancel', this.onUp);
  }

  protected selTable = computed(() => { const s = this.sel(); return s?.kind === 'table' ? this.tables().find(t => t.id === s.id) ?? null : null; });
  protected selZone = computed(() => { const s = this.sel(); return s?.kind === 'zone' ? this.plan().zones.find(z => z.id === s.id) ?? null : null; });
  protected svgWidth = computed(() => (this.zoom() ? `${Math.round(this.plan().width * this.zoom())}px` : '100%'));

  protected pos(kind: 'table' | 'zone', id: string, x: number, y: number): { x: number; y: number } {
    return this.live()[kind + id] ?? { x, y };
  }

  protected tableTransform(t: Table): string {
    const p = this.pos('table', t.id, t.x ?? 0, t.y ?? 0);
    return `translate(${p.x} ${p.y}) rotate(${t.rot || 0}) scale(${PLAN_SCALE})`;
  }

  protected seatsOf(t: Table): SeatInfo[] {
    return this.seats().get(t.id) ?? [];
  }

  // ───────── Arrastrar ─────────

  private toPlan(e: PointerEvent): { x: number; y: number } {
    const svg = this.svgRef()!.nativeElement;
    const m = svg.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  }

  protected down(e: PointerEvent, kind: 'table' | 'zone', id: string, x: number, y: number): void {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as SVGGElement).focus({ preventScroll: true });
    const p = this.toPlan(e);
    this.drag = { kind, id, px: p.x, py: p.y, ox: x, oy: y, moved: false, pointer: e.pointerId };
    this.stopListening();
    addEventListener('pointermove', this.onMove);
    addEventListener('pointerup', this.onUp);
    addEventListener('pointercancel', this.onUp);
    this.sel.set({ kind, id });
  }

  private move(e: PointerEvent): void {
    const d = this.drag;
    if (!d || e.pointerId !== d.pointer) return;
    const p = this.toPlan(e);
    const dx = p.x - d.px, dy = p.y - d.py;
    if (!d.moved && Math.hypot(dx, dy) < 4) return;
    d.moved = true;
    const { width, height } = this.plan();
    const x = Math.max(0, Math.min(width, snap(d.ox + dx)));
    const y = Math.max(0, Math.min(height, snap(d.oy + dy)));
    this.live.update(l => ({ ...l, [d.kind + d.id]: { x, y } }));
  }

  private up(e: PointerEvent): void {
    const d = this.drag;
    if (!d || e.pointerId !== d.pointer) return;
    this.drag = null;
    this.stopListening();
    const p = this.live()[d.kind + d.id];
    if (d.moved && p) this.commit(d.kind, d.id, p.x, p.y);
    this.live.update(l => { const n = { ...l }; delete n[d.kind + d.id]; return n; });
  }

  private commit(kind: 'table' | 'zone', id: string, x: number, y: number): void {
    this.store.update(s => {
      if (kind === 'table') {
        const t = s.tables.find(v => v.id === id);
        if (t) { t.x = x; t.y = y; }
      } else {
        const z = s.meta.plan.zones.find(v => v.id === id);
        if (z) { z.x = x; z.y = y; }
      }
    });
  }

  protected key(e: KeyboardEvent, kind: 'table' | 'zone', id: string, x: number, y: number): void {
    const step = e.shiftKey ? 50 : GRID;
    const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    const mv = moves[e.key];
    this.sel.set({ kind, id });
    if (mv) {
      e.preventDefault();
      const { width, height } = this.plan();
      this.commit(kind, id, Math.max(0, Math.min(width, x + mv[0])), Math.max(0, Math.min(height, y + mv[1])));
    } else if (kind === 'table' && (e.key === 'r' || e.key === 'R')) {
      e.preventDefault();
      this.rotate(e.key === 'R' ? -15 : 15);
    } else if (kind === 'table' && e.key === 'Enter') {
      e.preventDefault();
      this.ui.open({ kind: 'table', id });
    }
  }

  protected clearSel(): void {
    if (!this.drag) this.sel.set(null);
  }

  // ───────── Acciones ─────────

  protected rotate(deg: number): void {
    const t = this.selTable();
    if (!t) return;
    this.store.update(s => {
      const x = s.tables.find(v => v.id === t.id);
      if (x) x.rot = (((x.rot || 0) + deg) % 360 + 360) % 360;
    });
  }

  protected openTable(id: string): void {
    this.ui.open({ kind: 'table', id });
  }

  protected removeFromPlan(): void {
    const t = this.selTable();
    if (!t) return;
    this.store.update(s => {
      const x = s.tables.find(v => v.id === t.id);
      if (x) { x.x = null; x.y = null; }
    });
    this.sel.set(null);
  }

  /** Radio aproximado que ocupa una mesa en el plano (para no solaparlas al colocarlas). */
  private radius(t: Table): number {
    const b = tableGeometry(t, this.seatsOf(t), false).box;
    return Math.max(b[2], b[3]) / 2 * PLAN_SCALE;
  }

  /** Coloca las mesas sin posición en huecos libres, de arriba abajo. */
  protected placeAll(only?: Table): void {
    const { width, height, zones } = this.plan();
    const taken = this.placed().map(t => ({ x: t.x!, y: t.y!, r: this.radius(t) }));
    const todo = only ? [only] : this.unplaced();
    const spots: Record<string, { x: number; y: number }> = {};
    let failed = 0;
    for (const t of todo) {
      const r = this.radius(t) + 12;
      let found: { x: number; y: number } | null = null;
      for (let y = r + 20; y <= height - r && !found; y += 20) {
        for (let x = r + 20; x <= width - r && !found; x += 20) {
          const freeT = taken.every(o => Math.hypot(o.x - x, o.y - y) >= o.r + r);
          const freeZ = zones.every(z => x + r < z.x || x - r > z.x + z.w || y + r < z.y || y - r > z.y + z.h);
          if (freeT && freeZ) found = { x: snap(x), y: snap(y) };
        }
      }
      if (!found) { failed++; continue; }
      spots[t.id] = found;
      taken.push({ ...found, r });
    }
    if (Object.keys(spots).length) {
      this.store.update(s => {
        for (const t of s.tables) if (spots[t.id]) { t.x = spots[t.id]!.x; t.y = spots[t.id]!.y; }
      });
    }
    if (failed) this.ui.toast(`No caben ${failed === 1 ? '1 mesa' : failed + ' mesas'}: agranda el salón o mueve las demás.`);
  }

  protected async editRoom(): Promise<void> {
    const p = this.plan();
    const v = await this.ui.form('Salón', [
      { k: 'title', l: 'Nombre (sale en la descarga)', full: true },
      { k: 'width', l: 'Ancho', type: 'number', min: 600, max: 5000, h: 'En unidades del plano. Una mesa redonda de 10 ocupa unas 215.' },
      { k: 'height', l: 'Fondo', type: 'number', min: 400, max: 5000 }
    ], { title: p.title, width: p.width, height: p.height });
    if (!v) return;
    this.store.update(s => {
      s.meta.plan.title = String(v['title'] || '');
      s.meta.plan.width = Math.max(600, Math.min(5000, Number(v['width']) || p.width));
      s.meta.plan.height = Math.max(400, Math.min(5000, Number(v['height']) || p.height));
    });
  }

  protected async addZone(): Promise<void> {
    const v = await this.zoneForm({ label: '', w: 240, h: 160 }, 'Añadir zona');
    if (!v) return;
    const p = this.plan();
    this.store.update(s => s.meta.plan.zones.push({ id: uid(), label: v.label, w: v.w, h: v.h, x: snap((p.width - v.w) / 2), y: snap((p.height - v.h) / 2) }));
  }

  protected async editZone(): Promise<void> {
    const z = this.selZone();
    if (!z) return;
    const v = await this.zoneForm(z, 'Editar zona');
    if (!v) return;
    this.store.update(s => { const x = s.meta.plan.zones.find(q => q.id === z.id); if (x) Object.assign(x, v); });
  }

  private async zoneForm(z: Pick<FloorZone, 'label' | 'w' | 'h'>, title: string): Promise<{ label: string; w: number; h: number } | null> {
    const v = await this.ui.form(title, [
      { k: 'label', l: 'Nombre', r: true, full: true, list: () => ['Pista de baile', 'Entrada', 'Barra', 'Mesa de dulces', 'DJ', 'Photocall'] },
      { k: 'w', l: 'Ancho', type: 'number', min: 40, max: 2000 },
      { k: 'h', l: 'Fondo', type: 'number', min: 30, max: 2000 }
    ], { ...z }, title === 'Añadir zona' ? 'Añadir' : 'Guardar');
    if (!v) return null;
    return { label: String(v['label']), w: Math.max(40, Number(v['w']) || 200), h: Math.max(30, Number(v['h']) || 120) };
  }

  protected async removeZone(): Promise<void> {
    const z = this.selZone();
    if (!z || !await this.ui.confirm(`¿Quitar la zona «${z.label}» del plano?`, 'Quitar', { danger: true })) return;
    this.store.update(s => { s.meta.plan.zones = s.meta.plan.zones.filter(q => q.id !== z.id); });
    this.sel.set(null);
  }

  protected zoomBy(f: number): void {
    const el = this.svgRef()?.nativeElement;
    const cur = this.zoom() || (el ? el.getBoundingClientRect().width / this.plan().width : 0.5);
    this.zoom.set(Math.max(0.2, Math.min(2, cur * f)));
  }

  // ───────── Descargar ─────────

  private exportData() {
    const p = this.plan();
    return buildPlanSvg(p, this.tables(), this.store.guests(), p.title || 'Plano de mesas');
  }

  protected async downloadPng(): Promise<void> {
    if (this.unplaced().length && !await this.ui.confirm(`Hay ${this.unplaced().length} mesas sin colocar: no saldrán en el dibujo, solo en la lista.`, 'Descargar igualmente')) return;
    try {
      const blob = await svgToPng(this.exportData());
      downloadBlob(`plano-mesas-${isoDate(today())}.png`, blob);
      this.ui.toast('Plano descargado');
    } catch (e) {
      this.ui.toast((e as Error).message);
    }
  }

  protected print(): void {
    if (!printPlan(this.exportData(), this.plan().title || 'Plano de mesas')) this.ui.toast('El navegador ha bloqueado la ventana. Permite las ventanas emergentes para esta página.');
  }
}
