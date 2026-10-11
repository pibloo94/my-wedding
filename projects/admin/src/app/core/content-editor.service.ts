import { Injectable, computed, inject, signal } from '@angular/core';
import { FirebaseService, fs } from './firebase.service';
import { StoreService } from './store.service';
import { UiService } from './ui.service';
import { Content, DEFAULT_CONTENT, contentErrors, contentKey, contentWarnings, diffContent, normContent } from './content-model';
import { clone, isoDate, today, uid } from './util';

export interface HistoryItem {
  id: string;
  version: number;
  json: string;
  publishedAt: string;
  by?: string;
  summary?: string;
}

/**
 * Contenido de la web: borrador compartido (admin/contentDraft), publicado (content/published)
 * e historial (admin/contentHistory/items).
 *
 * El borrador sigue a lo publicado —también si se cambia desde la consola de Firebase— salvo
 * que tenga cambios propios sin publicar: entonces se avisa (conflict) y se elige.
 */
@Injectable({ providedIn: 'root' })
export class ContentEditorService {
  private fb = inject(FirebaseService);
  private store = inject(StoreService);
  private ui = inject(UiService);

  readonly draft = signal<Content | null>(null);
  readonly published = signal<Content | null>(null);
  readonly pubVersion = signal(0);
  readonly pubAt = signal('');
  readonly history = signal<HistoryItem[]>([]);
  readonly loaded = signal(false);
  readonly conflict = signal(false);
  readonly saving = signal(false);

  readonly base = computed(() => this.published() ?? DEFAULT_CONTENT);
  readonly diff = computed(() => { const d = this.draft(); return d ? diffContent(this.base(), d) : []; });
  readonly errors = computed(() => { const d = this.draft(); return d ? contentErrors(d) : []; });
  readonly warnings = computed(() => { const d = this.draft(); return d ? contentWarnings(d) : []; });

  private baseKey = '';
  private dirty = false;
  private timer?: ReturnType<typeof setTimeout>;
  private gotPub = false;
  private gotDraft = false;
  private draftDoc: { content: Content; baseKey: string } | null = null;
  private started = false;

  start(): void {
    if (this.started || !this.fb.db) return;
    this.started = true;
    const db = this.fb.db;
    fs.onSnapshot(fs.doc(db, 'content', 'published'), d => {
      const x = d.data() as { json?: string; version?: number; publishedAt?: string } | undefined;
      this.gotPub = true;
      if (x?.json) {
        try {
          const pub = normContent(JSON.parse(x.json));
          this.published.set(pub);
          this.store.webFacts.set({ n1: pub.hero.name1, n2: pub.hero.name2, iso: pub.hero.countdownIso });
          this.pubVersion.set(x.version || 0);
          this.pubAt.set(x.publishedAt || '');
        } catch { /* JSON ilegible: se ignora */ }
      }
      this.reconcile();
    }, e => console.warn('content', e));
    fs.onSnapshot(fs.doc(db, 'admin', 'contentDraft'), d => {
      const x = d.data() as { json?: string; baseKey?: string } | undefined;
      this.gotDraft = true;
      this.draftDoc = null;
      if (x?.json) {
        try { this.draftDoc = { content: normContent(JSON.parse(x.json)), baseKey: x.baseKey || '' }; } catch { /* ignorar */ }
      }
      this.reconcile();
    }, e => console.warn('draft', e));
    fs.onSnapshot(fs.collection(db, 'admin', 'contentHistory', 'items'), qs => {
      this.history.set(qs.docs.map(d => ({ ...(d.data() as Omit<HistoryItem, 'id'>), id: d.id })).sort((a, b) => (b.version || 0) - (a.version || 0)));
    }, e => console.warn('history', e));
  }

  private reconcile(): void {
    if (!this.gotPub || !this.gotDraft) return;
    if (!this.dirty) {
      const pubKey = contentKey(this.base());
      const doc = this.draftDoc;
      if (!doc) {
        this.draft.set(clone(this.base()));
        this.baseKey = pubKey;
        this.conflict.set(false);
      } else {
        this.draft.set(doc.content);
        this.baseKey = doc.baseKey || pubKey;
        if (this.baseKey !== pubKey) {
          const dk = contentKey(doc.content);
          if (dk === this.baseKey || dk === pubKey) {
            // Sin cambios propios: el borrador pasa a lo publicado
            this.draft.set(clone(this.base()));
            this.baseKey = pubKey;
            this.conflict.set(false);
            if (this.loaded()) void this.saveDraft();
          } else {
            this.conflict.set(true);
          }
        } else {
          this.conflict.set(false);
        }
      }
    }
    this.loaded.set(true);
  }

  /** Cambia el borrador y lo guarda (con un pequeño retardo para agrupar pulsaciones). */
  edit(fn: (d: Content) => void): void {
    const cur = this.draft();
    if (!cur) return;
    const next = clone(cur);
    fn(next);
    this.draft.set(next);
    this.touch();
  }

  private touch(): void {
    this.dirty = true;
    this.saving.set(true);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.saveDraft(), 700);
  }

  private async saveDraft(): Promise<void> {
    clearTimeout(this.timer);
    const db = this.fb.db;
    if (!db) return;
    try {
      await fs.setDoc(fs.doc(db, 'admin', 'contentDraft'), {
        json: JSON.stringify(this.draft()), baseKey: this.baseKey, updatedAt: new Date().toISOString(), by: this.fb.user()?.email ?? ''
      });
    } catch (e) {
      this.ui.toast(`No se pudo guardar el borrador (${(e as { code?: string }).code ?? (e as Error).message})`);
    }
    this.dirty = false;
    this.saving.set(false);
  }

  async discard(): Promise<void> {
    if (!this.diff().length) {
      this.ui.toast('No hay cambios que descartar');
      return;
    }
    if (!await this.ui.confirm('Se perderán los cambios del borrador y volverá a coincidir con lo publicado.', 'Descartar cambios', { danger: true })) return;
    this.resetToPublished();
  }

  usePublished(): void {
    this.resetToPublished();
    this.ui.toast('El borrador ahora coincide con lo publicado');
  }

  keepMine(): void {
    this.baseKey = contentKey(this.base());
    this.conflict.set(false);
    this.touch();
    this.ui.toast('Se mantiene tu borrador; los cambios se comparan con lo publicado ahora');
  }

  private resetToPublished(): void {
    this.draft.set(clone(this.base()));
    this.baseKey = contentKey(this.base());
    this.conflict.set(false);
    this.touch();
  }

  async restore(h: HistoryItem): Promise<void> {
    if (!await this.ui.confirm(`El borrador se sustituirá por la versión ${h.version}. La web no cambia hasta que publiques.`, 'Cargar en el borrador')) return;
    try {
      this.draft.set(normContent(JSON.parse(h.json)));
      this.touch();
      this.ui.toast(`Versión ${h.version} cargada en el borrador`);
    } catch {
      this.ui.toast('No se pudo leer esa versión');
    }
  }

  /** Publica el borrador completo. Devuelve true si se publicó. */
  async publish(): Promise<boolean> {
    if (this.conflict()) {
      this.ui.toast('Primero elige: usar lo publicado o mantener tu borrador');
      return false;
    }
    if (this.errors().length) {
      this.ui.toast('Corrige los avisos en rojo antes de publicar');
      return false;
    }
    const df = this.diff();
    if (!df.length && this.published()) {
      this.ui.toast('No hay cambios que publicar');
      return false;
    }
    const n = df.length;
    if (!await this.ui.confirm(`Se publicará${n === 1 ? '' : 'n'} ${n || 'todos los'} cambio${n === 1 ? '' : 's'} en la web. Los invitados los verán al recargar la página.`, 'Publicar', { title: 'Publicar en la web' })) return false;

    const db = this.fb.db!;
    const v = this.pubVersion() + 1;
    const now = new Date().toISOString();
    const by = this.fb.user()?.email ?? '';
    const draft = this.draft()!;
    const json = JSON.stringify(draft);
    const summary = df.slice(0, 3).map(x => x.label.split(' · ').pop()).join(', ') + (df.length > 3 ? ` y ${df.length - 3} más` : '');
    try {
      const b = fs.writeBatch(db);
      b.set(fs.doc(db, 'content', 'published'), { json, version: v, publishedAt: now, by });
      b.set(fs.doc(db, 'admin', 'contentHistory', 'items', 'v' + String(v).padStart(4, '0')), { json, version: v, publishedAt: now, by, summary });
      this.baseKey = contentKey(draft);
      this.conflict.set(false);
      b.set(fs.doc(db, 'admin', 'contentDraft'), { json, baseKey: this.baseKey, updatedAt: now, by });
      await b.commit();
    } catch (e) {
      this.ui.toast(`No se pudo publicar (${(e as { code?: string }).code ?? (e as Error).message})`);
      return false;
    }
    // Comprobación: leer lo publicado como lo lee la web (API pública, sin sesión)
    let ok = false;
    try {
      const r = await fetch(this.fb.publicDocUrl('content/published'), { cache: 'no-store' });
      if (r.ok) {
        const j = await r.json() as { fields?: { json?: { stringValue?: string } } };
        ok = j.fields?.json?.stringValue === json;
      }
    } catch { /* sin comprobar */ }
    this.store.update(s => s.webLog.push({
      id: uid(), date: isoDate(today()), section: 'Contenido de la web', field: 'Versión ' + v, from: '',
      to: summary || 'Primera publicación', change: `${n} cambio${n === 1 ? '' : 's'} publicados desde la app`,
      status: ok ? 'Publicado (comprobado en la web)' : 'Publicado (sin comprobar)'
    }));
    this.ui.toast(ok ? `Versión ${v} publicada y comprobada. Recarga la web para verla.` : `Versión ${v} publicada. No se pudo comprobar la lectura pública; revisa la web.`);
    return true;
  }
}
