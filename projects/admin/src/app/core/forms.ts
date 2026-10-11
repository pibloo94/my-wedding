/** Formularios de alta y edición de cada lista. */
import { CollKey } from './models';
import { FieldDef } from './ui.service';
import { PHASES, TASK_CATS } from './domain';

export interface CollForm {
  /** Nombre en singular, para los títulos («Añadir proveedor») */
  t: string;
  def: () => Record<string, unknown>;
  fields: (ctx: FormContext) => FieldDef[];
}

/** Datos que algunos formularios necesitan para sus sugerencias. */
export interface FormContext {
  vendors: string[];
  people: string[];
  currentPhase: string;
}

export const LOG_STATUSES = ['Previsto', 'Hecho en el repositorio', 'Publicado (sin comprobar)', 'Publicado (comprobado en la web)', 'Descartado'];

export const FORMS: Partial<Record<CollKey, CollForm>> = {
  tables: {
    t: 'mesa', def: () => ({ cap: 10, shape: 'redonda' }),
    fields: () => [
      { k: 'name', l: 'Nombre de la mesa', r: true, full: true, h: 'Ej.: Mesa 1, Presidencial, Familia de Daniela…' },
      { k: 'shape', l: 'Forma', type: 'select', o: [['redonda', 'Redonda'], ['rectangular', 'Rectangular'], ['presidencial', 'Presidencial (un lado)']] },
      { k: 'cap', l: 'Sillas', type: 'number', min: 1, max: 30 },
      { k: 'notes', l: 'Notas', type: 'textarea', full: true }
    ]
  },
  expenses: {
    t: 'gasto', def: () => ({ cat: 'Otros', payments: [] }),
    fields: ctx => [
      { k: 'concept', l: 'Concepto', r: true, full: true },
      { k: 'cat', l: 'Categoría', list: () => ['Espacio', 'Catering', 'Fotografía y vídeo', 'Música', 'Flores y decoración', 'Vestuario', 'Papelería', 'Transporte', 'Alojamiento', 'Otros'] },
      { k: 'vendor', l: 'Proveedor', list: () => ctx.vendors },
      { k: 'est', l: 'Previsto (€)', type: 'number' },
      { k: 'act', l: 'Contratado (€)', type: 'number' },
      { k: 'due', l: 'Próximo vencimiento', type: 'date' },
      { k: 'notes', l: 'Notas', type: 'textarea', full: true }
    ]
  },
  vendors: {
    t: 'proveedor', def: () => ({ status: 'Contactado', contract: 'Sin contrato' }),
    fields: () => [
      { k: 'name', l: 'Nombre', r: true, full: true },
      { k: 'cat', l: 'Categoría', list: () => ['Espacio', 'Catering', 'Fotografía y vídeo', 'Música', 'Flores y decoración', 'Peluquería y maquillaje', 'Transporte', 'Papelería', 'Otros'] },
      { k: 'status', l: 'Estado', type: 'select', o: ['Por confirmar', 'Contactado', 'Presupuesto recibido', 'Contratado', 'Descartado'] },
      { k: 'contract', l: 'Contrato', type: 'select', o: ['Sin datos', 'Sin contrato', 'Pendiente de firma', 'Firmado'] },
      { k: 'price', l: 'Precio (€)', type: 'number' },
      { k: 'contact', l: 'Persona de contacto' },
      { k: 'phone', l: 'Teléfono' },
      { k: 'email', l: 'Correo', type: 'email', full: true },
      { k: 'link', l: 'Enlace al contrato', type: 'url', full: true, h: 'URL de Drive, Dropbox… (la app no guarda archivos)' },
      { k: 'notes', l: 'Notas', type: 'textarea', full: true }
    ]
  },
  tasks: {
    t: 'tarea', def: () => ({ offset: 60, cat: 'General', done: false, due: '', who: '', notes: '' }),
    fields: ctx => [
      { k: 'title', l: 'Tarea', r: true, full: true },
      { k: 'phase', l: 'Fase', type: 'select', o: PHASES.map(p => [p[0], p[1]] as [string, string]) },
      { k: 'who', l: 'Responsable', list: () => ctx.people },
      { k: 'offset', l: 'Días antes de la boda', type: 'number', h: 'Negativo = después. Se recalcula si cambia la fecha.' },
      { k: 'due', l: 'Fecha fija (opcional)', type: 'date', h: 'Si la rellenas, manda sobre el cálculo automático.' },
      { k: 'cat', l: 'Categoría', type: 'select', o: TASK_CATS },
      { k: 'notes', l: 'Notas', type: 'textarea', full: true }
    ]
  },
  inspo: {
    t: 'idea', def: () => ({}),
    fields: () => [
      { k: 'title', l: 'Título', r: true, full: true },
      { k: 'url', l: 'Enlace', type: 'url', full: true },
      { k: 'note', l: 'Nota', type: 'textarea', full: true }
    ]
  },
  webResources: {
    t: 'recurso', def: () => ({ type: 'Enlace' }),
    fields: () => [
      { k: 'title', l: 'Título', r: true, full: true },
      { k: 'url', l: 'URL', type: 'url', full: true },
      { k: 'type', l: 'Tipo', type: 'select', o: ['Enlace', 'Código', 'Documentación', 'Gráficos', 'Otro'] },
      { k: 'note', l: 'Nota', type: 'textarea', full: true }
    ]
  },
  webLog: {
    t: 'cambio', def: () => ({ status: 'Previsto' }),
    fields: () => [
      { k: 'date', l: 'Fecha', type: 'date' },
      { k: 'status', l: 'Estado', type: 'select', o: LOG_STATUSES },
      { k: 'section', l: 'Sección', full: true },
      { k: 'field', l: 'Campo', full: true },
      { k: 'from', l: 'Texto anterior', type: 'textarea', full: true },
      { k: 'to', l: 'Texto nuevo', type: 'textarea', full: true },
      { k: 'change', l: 'Nota', type: 'textarea', full: true }
    ]
  }
};
