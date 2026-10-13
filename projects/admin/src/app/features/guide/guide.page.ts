import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeaderComponent } from '../../shared/page-header.component';
import { SetupGuideComponent } from './setup-guide.component';

/** Guía de configuración y entornos, siempre a mano (Configuración → Guía). */
@Component({
  selector: 'adm-guide-page',
  imports: [PageHeaderComponent, SetupGuideComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <adm-page-header title="Guía de configuración" sub="Entornos dev y prod: qué hay que preparar en Firebase y cómo comprobarlo" />
    <adm-setup-guide />`
})
export class GuidePage {}
