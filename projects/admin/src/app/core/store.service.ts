import { Injectable, computed, inject, signal } from '@angular/core';
import { AppState, COLLECTIONS, CollKey, Collections, Meta, RsvpDoc } from './models';
import { FirebaseService, fs } from './firebase.service';
import { UiService } from './ui.service';
import { normalizeItem, normalizeMeta, seedState } from './seed';
import { clone, stable, uid } from './util';
import { weddingDay } from './domain';

const LS_KEY = 'boda-gestion-v2';
const LS_OLD = 'boda-gestion-v1';

type Doc = Record<string, unknown> & { id: string; _i?: number };

/**
 * Estado de la app y su sincronización.
 *
 * Con Firebase: admin/state guarda la configuración y cada lista es una subcolección
 * (admin/state/{lista}/{id}). Cada cambio se compara con lo último sincronizado y solo se
 * escriben los documentos que cambian. Lo que cambia en Firestore (otro dispositivo, la
 * consola) llega por onSnapshot y se aplica al momento: Firestore manda.
 *
 * Sin Firebase (no hay public/firebase-config.json): todo se guarda en este navegador.
 */
@Injectable({ providedIn: 'root' })
export class StoreService {
  private fb = inject(FirebaseService);
  private ui = inject(UiService);

  readonly state = signal<AppState>(seedState());
  /** Datos cargados (de Firebase o del navegador) */
  readonly ready = signal(false);
  readonly syncStatus = signal('');
  /** Respuestas del formulario de la web (colección rsvps) */
  readonly rsvps = signal<RsvpDoc[]>([]);
  readonly cloud = computed(() => this.fb.state() === 'ready');

  readonly meta = computed(() => this.state().meta);
  readonly config = computed(() => this.state().meta.config);
  readonly wedding = computed(() => weddingDay(this.config().weddingDate));
  readonly guests = computed(() => this.state().guests);
  readonly tables = computed(() => this.state().tables);

  private synced = {} as Record<CollKey, Map<string, string>>;
  private metaKey = '';
  private dirty = false;
  private timer?: ReturnType<typeof setTimeout>;
  private pendingSnap: Partial<Record<CollKey, Doc[]>> = {};
  private pendingMeta: Meta | null = null;
  private loaded = new Set<string>();
  private started = false;

  /** Aplica un cambio sobre una copia del estado y lo guarda. */
  update(fn: (s: AppState) => void): void {
    const next = clone(this.state());
    fn(next);
    for (const c of COLLECTIONS) {
      for (const x of next[c] as { id: string }[]) if (!x.id) x.id = uid();
    }
    this.state.set(next);
    this.persist();
  }

  list<K extends CollKey>(k: K): Collections[K] {
    return this.state()[k];
  }

  /** Arranca la carga cuando se sabe si hay Firebase (ver AppComponent). */
  start(): void {
    if (this.started) return;
    this.started = true;
    if (this.fb.state() === 'local') this.startLocal();
    else void this.startCloud().catch(e => {
      console.error(e);
      this.fb.fail(`No se pudieron cargar los datos (${(e as { code?: string }).code ?? (e as Error).message}).`);
    });
    // Al ocultar o cerrar la pestaña se guarda lo pendiente sin esperar
    addEventListener('pagehide', () => this.flush());
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') this.flush(); });
  }

  flush(): void {
    if (this.timer) void this.pushDiff();
  }

  // ───────────────────────── Modo local ─────────────────────────

  private startLocal(): void {
    try {
      const raw = localStorage.getItem(LS_KEY) ?? localStorage.getItem(LS_OLD);
      if (raw) this.state.set(this.fromPlain(JSON.parse(raw)));
    } catch { /* navegador sin almacenamiento */ }
    this.syncStatus.set('Solo en este navegador');
    this.ready.set(true);
  }

  /** Convierte una copia (formato plano antiguo o nuevo) en estado. */
  fromPlain(o: Record<string, unknown>): AppState {
    const s = seedState();
    const metaSrc = (o['meta'] && typeof o['meta'] === 'object') ? o['meta'] : o;
    s.meta = normalizeMeta(metaSrc);
    for (const k of COLLECTIONS) {
      const v = o[k];
      if (Array.isArray(v)) (s as unknown as Record<string, unknown>)[k] = v.map(x => normalizeItem(k, x as Record<string, unknown>));
    }
    return s;
  }

  /** Copia completa para descargar (Configuración → Descargar copia). */
  toPlain(): Record<string, unknown> {
    const s = this.state();
    return { app: 'gestion-boda', v: 4, meta: s.meta, ...Object.fromEntries(COLLECTIONS.map(k => [k, s[k]])) };
  }

  private persist(): void {
    if (!this.cloud()) {
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(this.state()));
      } catch {
        this.ui.toast('Este navegador no deja guardar datos. Descarga una copia antes de cerrar.');
      }
      return;
    }
    this.dirty = true;
    this.syncStatus.set('Guardando…');
    clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.pushDiff(), 400);
  }

  // ───────────────────────── Firebase ─────────────────────────

  private async startCloud(): Promise<void> {
    const db = this.fb.db!;
    const metaRef = fs.doc(db, 'admin', 'state');
    COLLECTIONS.forEach(c => (this.synced[c] = new Map()));
    const first = await fs.getDoc(metaRef);
    if (!first.exists()) {
      // Primera vez: se suben los datos iniciales
      await this.pushDiff();
      this.ui.toast('Primera vez: datos iniciales guardados en Firebase');
    }

    fs.onSnapshot(metaRef, d => {
      this.loaded.add('meta');
      const x = d.data();
      if (x) {
        const m = normalizeMeta(x);
        if (this.dirty) this.pendingMeta = m;
        else this.applyMeta(m);
      }
      this.maybeReady();
    }, () => this.syncStatus.set('Sin conexión'));

    for (const c of COLLECTIONS) {
      fs.onSnapshot(fs.collection(db, 'admin', 'state', c), qs => {
        this.loaded.add(c);
        const arr = qs.docs.map(d => d.data() as Doc).sort((a, b) => (a._i ?? 0) - (b._i ?? 0));
        if (this.dirty) this.pendingSnap[c] = arr;
        else this.applyColl(c, arr);
        this.maybeReady();
      }, () => this.syncStatus.set('Sin conexión'));
    }

    fs.onSnapshot(fs.collection(db, 'rsvps'), qs => {
      this.loaded.add('rsvps');
      this.rsvps.set(qs.docs.map(d => ({ ...(d.data() as Omit<RsvpDoc, 'id'>), id: d.id })));
      this.maybeReady();
    }, e => console.warn('rsvps', e));
  }

  private applyMeta(m: Meta): void {
    this.metaKey = stable(m);
    this.state.update(s => ({ ...s, meta: m }));
  }

  private applyColl(c: CollKey, arr: Doc[]): void {
    this.synced[c] = new Map(arr.map(x => [x.id, stable(x)]));
    const items = arr.map(({ _i, ...x }) => normalizeItem(c, x));
    this.state.update(s => ({ ...s, [c]: items }));
  }

  private maybeReady(): void {
    if (this.ready() || this.loaded.size < COLLECTIONS.length + 2) return;
    this.ready.set(true);
    this.syncStatus.set('Sincronizado');
  }

  /** Escribe en Firestore solo lo que ha cambiado desde la última sincronización. */
  private async pushDiff(): Promise<void> {
    clearTimeout(this.timer);
    this.timer = undefined;
    const db = this.fb.db;
    if (!db) return;
    const s = this.state();
    let batch = fs.writeBatch(db);
    let n = 0;
    const commits: Promise<void>[] = [];
    const written = new Set<CollKey>();
    const flush = () => {
      if (n) {
        commits.push(batch.commit());
        batch = fs.writeBatch(db);
        n = 0;
      }
    };
    const count = () => { if (++n >= 450) flush(); };

    for (const c of COLLECTIONS) {
      const cur = new Map<string, string>();
      (s[c] as { id: string }[]).forEach((x, i) => cur.set(x.id, stable({ ...x, _i: i })));
      const prev = this.synced[c] ?? new Map<string, string>();
      cur.forEach((js, id) => {
        if (prev.get(id) !== js) {
          batch.set(fs.doc(db, 'admin', 'state', c, id), JSON.parse(js));
          written.add(c);
          count();
        }
      });
      prev.forEach((_, id) => {
        if (!cur.has(id)) {
          batch.delete(fs.doc(db, 'admin', 'state', c, id));
          written.add(c);
          count();
        }
      });
      this.synced[c] = cur;
    }
    const mj = stable(s.meta);
    let metaWritten = false;
    if (mj !== this.metaKey) {
      batch.set(fs.doc(db, 'admin', 'state'), JSON.parse(mj));
      this.metaKey = mj;
      metaWritten = true;
      count();
    }
    flush();
    this.dirty = false;

    // Cambios remotos que llegaron mientras había cambios locales sin subir
    for (const c of Object.keys(this.pendingSnap) as CollKey[]) {
      if (!written.has(c)) this.applyColl(c, this.pendingSnap[c]!);
    }
    this.pendingSnap = {};
    if (this.pendingMeta && !metaWritten) this.applyMeta(this.pendingMeta);
    this.pendingMeta = null;

    try {
      await Promise.all(commits);
      this.syncStatus.set('Sincronizado');
    } catch (e) {
      console.error(e);
      this.syncStatus.set('Error al guardar');
      this.ui.toast(`No se pudo guardar en Firebase (${(e as { code?: string }).code ?? (e as Error).message}). Revisa la conexión.`);
    }
  }

  /** Sustituye todos los datos (restaurar copia, borrar todo). */
  replaceAll(next: AppState): void {
    this.state.set(next);
    this.persist();
  }
}
