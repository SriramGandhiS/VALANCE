import { __decorate } from "tslib";
// src/app/app.component.ts
import { Component, ViewChild } from '@angular/core';
import Lenis from '@studio-freight/lenis';
let AppComponent = class AppComponent {
    constructor(webglService, ngZone) {
        this.webglService = webglService;
        this.ngZone = ngZone;
        this.lenis = null;
        this.rafId = null;
    }
    ngAfterViewInit() {
        // 1. Initialize WebGL scene
        this.webglService.init(this.canvasRef.nativeElement);
        // 2. Initialize Lenis Smooth Scroll outside Angular Zone to optimize frame rate
        this.ngZone.runOutsideAngular(() => {
            this.lenis = new Lenis({
                duration: 1.4,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                orientation: 'vertical',
                gestureOrientation: 'vertical',
                smoothWheel: true,
                wheelMultiplier: 1.0,
            });
            // Bind Lenis scroll events to Three.js environment choreography
            this.lenis.on('scroll', (e) => {
                this.webglService.updateScroll(e.scroll, e.velocity);
            });
            const tick = (time) => {
                var _a;
                (_a = this.lenis) === null || _a === void 0 ? void 0 : _a.raf(time);
                this.rafId = requestAnimationFrame(tick);
            };
            this.rafId = requestAnimationFrame(tick);
        });
    }
    ngOnDestroy() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
        if (this.lenis) {
            this.lenis.destroy();
        }
    }
};
__decorate([
    ViewChild('webglCanvas', { static: true })
], AppComponent.prototype, "canvasRef", void 0);
AppComponent = __decorate([
    Component({
        selector: 'app-root',
        template: `
    <canvas id="webgl-background" #webglCanvas></canvas>
    <div class="app-shell">
      <router-outlet></router-outlet>
    </div>
  `,
    })
], AppComponent);
export { AppComponent };
//# sourceMappingURL=app.component.js.map