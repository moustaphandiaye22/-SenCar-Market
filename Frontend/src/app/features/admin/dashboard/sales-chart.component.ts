import { Component, Input, ElementRef, ViewChild, AfterViewInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-sales-chart',
  standalone: true,
  template: `
    <div class="w-full h-64 relative">
      <canvas #chartCanvas></canvas>
    </div>
  `
})
export class SalesChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() data: any[] = [];
  
  private chart: Chart | undefined;

  ngAfterViewInit() {
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && !changes['data'].firstChange) {
      if (this.chart) {
        this.updateChart();
      } else {
        this.initChart();
      }
    }
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private initChart() {
    if (!this.chartCanvas) return;
    
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Gradient that flows from a solid primary color to transparent at the bottom
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    // Let's use Sen-Car green (e.g. #10b981)
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: this.getChartData(),
      options: {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          line: {
            tension: 0.4 // This makes it a smooth curve instead of sharp lines
          },
          point: {
            radius: 4,
            hoverRadius: 6,
            backgroundColor: '#10b981',
            borderWidth: 2,
            borderColor: '#ffffff'
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            titleColor: '#fff',
            bodyColor: '#fff',
            padding: 12,
            displayColors: false,
            callbacks: {
              label: (context) => {
                const value = context.raw as number;
                return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(value);
              }
            }
          }
        },
        scales: {
          x: {
            border: { display: false },
            grid: { display: false },
            ticks: { color: '#9ca3af', font: { size: 12, family: "'Inter', sans-serif" } }
          },
          y: {
            border: { display: false, dash: [5, 5] },
            grid: { color: '#f3f4f6' },
            ticks: {
              color: '#9ca3af',
              font: { size: 12, family: "'Inter', sans-serif" },
              callback: (value) => {
                if (value === 0) return '0';
                return (Number(value) / 1000000) + 'M';
              }
            },
            beginAtZero: true
          }
        }
      }
    });
  }

  private updateChart() {
    if (!this.chart) return;
    this.chart.data = this.getChartData();
    this.chart.update();
  }

  private getChartData() {
    return {
      labels: this.data.map((d: any) => d.month),
      datasets: [{
        label: 'Revenus',
        data: this.data.map((d: any) => Number(d.amount)),
        borderColor: '#10b981', // green-500
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true
      }]
    };
  }
}

