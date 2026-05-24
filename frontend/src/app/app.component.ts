// src/app/app.component.ts
import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy, NgZone } from '@angular/core';
import { WebGLService } from './core/services/webgl.service';
import Lenis from '@studio-freight/lenis';

@Component({
  selector: 'app-root',
  template: `
    <canvas id="webgl-background" #webglCanvas></canvas>
    <div class="app-shell">
      <router-outlet></router-outlet>
    </div>
  `,
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild('webglCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private lenis: Lenis | null = null;
  private rafId: number | null = null;

  constructor(
    private webglService: WebGLService,
    private ngZone: NgZone
  ) {}

  ngAfterViewInit(): void {
    // 1. Initialize WebGL scene
    this.webglService.init(this.canvasRef.nativeElement);

    // 2. Initialize Lenis Smooth Scroll outside Angular Zone to optimize frame rate
    this.ngZone.runOutsideAngular(() => {
      this.lenis = new Lenis({
        duration: 1.4,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Premium exponential ease-out
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
      });

      // Bind Lenis scroll events to Three.js environment choreography
      this.lenis.on('scroll', (e: any) => {
        this.webglService.updateScroll(e.scroll, e.velocity);
      });

      const tick = (time: number) => {
        this.lenis?.raf(time);
        this.rafId = requestAnimationFrame(tick);
      };

      this.rafId = requestAnimationFrame(tick);
    });
  }

  ngOnDestroy(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    if (this.lenis) {
      this.lenis.destroy();
    }
  }
}
