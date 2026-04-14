import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';

interface CountdownUnit {
  value: number;
  label: string;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './hero.html',
  styleUrl: './hero.scss'
})
export class HeroComponent implements OnInit, OnDestroy {
  private weddingDate = new Date('2027-04-04T12:00:00');
  private intervalId: ReturnType<typeof setInterval> | null = null;

  countdown = signal<CountdownUnit[]>([
    { value: 0, label: 'Días' },
    { value: 0, label: 'Horas' },
    { value: 0, label: 'Minutos' },
    { value: 0, label: 'Segundos' }
  ]);

  expired = signal(false);

  ngOnInit(): void {
    this.updateCountdown();
    this.intervalId = setInterval(() => this.updateCountdown(), 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private updateCountdown(): void {
    const now = new Date().getTime();
    const target = this.weddingDate.getTime();
    const diff = target - now;

    if (diff <= 0) {
      this.expired.set(true);
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      return;
    }

    this.countdown.set([
      { value: Math.floor(diff / (1000 * 60 * 60 * 24)), label: 'Días' },
      { value: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)), label: 'Horas' },
      { value: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)), label: 'Minutos' },
      { value: Math.floor((diff % (1000 * 60)) / 1000), label: 'Segundos' }
    ]);
  }

  scrollToRsvp(): void {
    const el = document.getElementById('rsvp');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  scrollToEvents(): void {
    const el = document.getElementById('eventos');
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }
}
