import { Injectable, NgZone, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { getGPUTier } from 'detect-gpu';

@Injectable({
  providedIn: 'root'
})
export class WebGLService implements OnDestroy {
  private canvas: HTMLCanvasElement | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private mesh: THREE.Mesh | null = null;
  private shaderMaterial: THREE.ShaderMaterial | null = null;
  
  private animationFrameId: number | null = null;
  private gpuTier = 2; // Default to medium
  private clock = new THREE.Clock();
  
  // Smooth mouse coordinates
  private mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  private scroll = { current: 0, target: 0, speed: 0 };
  private isLowTier = false;

  constructor(private ngZone: NgZone) {
    this.trackMouse();
  }

  async init(canvas: HTMLCanvasElement): Promise<void> {
    this.canvas = canvas;
    
    // 1. Detect GPU performance
    try {
      const gpu = await getGPUTier();
      this.gpuTier = gpu.tier || 2;
      this.isLowTier = this.gpuTier < 2;
      console.log(`[WebGLService] Detected GPU Tier: ${this.gpuTier}. Low Tier fallback active: ${this.isLowTier}`);
    } catch (e) {
      console.warn('[WebGLService] GPU detection failed, using defaults.', e);
    }

    if (this.isLowTier) {
      // For low-tier/mobile, render a static gradient background to maximize performance.
      this.canvas.style.background = 'linear-gradient(135deg, #f5f4f0 0%, #eae8df 100%)';
      return;
    }

    // 2. Initialize Three.js Scene
    this.ngZone.runOutsideAngular(() => {
      this.setupThree();
      this.createMesh();
      this.onResize();
      this.animate();
      
      window.addEventListener('resize', this.onResizeBound);
    });
  }

  private trackMouse(): void {
    window.addEventListener('mousemove', (e) => {
      // Normalize mouse to -1 to 1
      this.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    });
  }

  updateScroll(scrollTop: number, velocity: number = 0): void {
    this.scroll.target = scrollTop;
    this.scroll.speed = velocity;
  }

  private setupThree(): void {
    if (!this.canvas) return;

    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    // Position camera looking down on the plane
    this.camera.position.set(0, -6, 8);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: this.gpuTier > 2, // Only antialias on top tier GPU
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private createMesh(): void {
    if (!this.scene) return;

    // Plane geometry with higher subdivisions for high tier
    const segments = this.gpuTier > 2 ? 120 : 60;
    const geometry = new THREE.PlaneGeometry(24, 24, segments, segments);

    // Custom Shaders for elegant morphing landscape
    const vertexShader = `
      uniform float uTime;
      uniform float uScroll;
      varying vec2 vUv;
      varying float vElevation;

      // Description : Array and textureless GLSL 2D/3D/4D simplex 
      //               noise functions.
      //      Author : Ian McEwan, Ashima Arts.
      //  Maintainer : ijm
      //     Lastmod : 20110822 (ijm)
      //     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
      //               Distributed under the MIT License. See LICENSE file.
      //               https://github.com/ashima/webgl-noise

      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

      float snoise(vec3 v) { 
        const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

        // First corner
        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 =   v - i + dot(i, C.xxx) ;

        // Other corners
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );

        //   x0 = x0 - 0.0 + 0.0 * C.xxx;
        //   x1 = x0 - i1  + 1.0 * C.xxx;
        //   x2 = x0 - i2  + 2.0 * C.xxx;
        //   x3 = x0 - 1.0 + 3.0 * C.xxx;
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
        vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

        // Permutations
        i = mod289(i); 
        vec4 p = permute( permute( permute( 
                   i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                 + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                 + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

        // Gradients: 7x7 points over a square, mapped onto an octahedron.
        // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
        float n_ = 0.142857142857; // 1.0/7.0
        vec3  ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );

        //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
        //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);

        //Normalise gradients
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

        // Mix final noise value
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                      dot(p2,x2), dot(p3,x3) ) );
      }

      void main() {
        vUv = uv;
        vec3 pos = position;
        
        // Fractal Brownian Motion for rich landscape topography
        float noise = snoise(vec3(pos.x * 0.12, pos.y * 0.12 - uScroll * 0.0004, uTime * 0.06));
        float noise2 = snoise(vec3(pos.x * 0.3, pos.y * 0.3, uTime * 0.12)) * 0.35;
        
        // Add elevation
        pos.z += (noise + noise2) * 1.6;
        vElevation = pos.z;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    const fragmentShader = `
      varying vec2 vUv;
      varying float vElevation;

      void main() {
        // High-end editorial color scheme
        // Base Warm Paper: #f5f4f0 -> rgb(245, 244, 240)
        // Deep Forest Green: #2e5339 -> rgb(46, 83, 57)
        // Clay Terracotta Accent: #b85c37 -> rgb(184, 92, 55)

        vec3 colorPaper = vec3(0.96, 0.95, 0.94);
        vec3 colorForest = vec3(0.24, 0.38, 0.28);
        vec3 colorClay = vec3(0.72, 0.42, 0.30);
        
        vec3 finalColor = colorPaper;
        
        // Valle shading: Forest Green
        if (vElevation < 0.0) {
          float factor = clamp(abs(vElevation) / 1.5, 0.0, 1.0);
          finalColor = mix(colorPaper, colorForest, factor * 0.25);
        } else {
          // Ridge highlight: Clay Terracotta
          float factor = clamp(vElevation / 2.0, 0.0, 1.0);
          finalColor = mix(colorPaper, colorClay, factor * 0.14);
        }
        
        // Soft ambient shadowing from top-right down
        float lighting = dot(normalize(vec3(1.0, 1.0, 1.0)), vec3(0.0, 0.0, 1.0));
        finalColor *= (0.94 + lighting * 0.06);
        
        // Vignette effect to draw eyes center-left
        float dist = distance(vUv, vec2(0.35, 0.5));
        finalColor = mix(finalColor, finalColor * 0.92, clamp(dist, 0.0, 1.0));

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    this.shaderMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0 }
      },
      wireframe: false,
      transparent: true
    });

    this.mesh = new THREE.Mesh(geometry, this.shaderMaterial);
    // Rotate slightly so it sits at an angle
    this.mesh.rotation.x = -Math.PI / 3.5;
    this.mesh.position.y = 0;
    this.mesh.position.z = -1;
    this.scene.add(this.mesh);
  }

  private animate(): void {
    if (this.isLowTier) return;

    this.animationFrameId = requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    // Smooth mouse inertia
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.08;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.08;

    // Smooth scroll inertia
    this.scroll.current += (this.scroll.target - this.scroll.current) * 0.08;

    // Apply uniforms
    if (this.shaderMaterial) {
      this.shaderMaterial.uniforms['uTime'].value = elapsed;
      // Scroll velocity affects shader displacement
      this.shaderMaterial.uniforms['uScroll'].value = this.scroll.current;
    }

    // Camera movement based on scroll and mouse parallax
    if (this.camera) {
      // Scroll moves camera down the track slightly
      const scrollYOffset = this.scroll.current * 0.0006;
      this.camera.position.x = this.mouse.x * 1.5;
      this.camera.position.y = -6 - scrollYOffset + (this.mouse.y * 0.8);
      
      // Keep looking at target with tiny delay
      this.camera.lookAt(this.mouse.x * 0.2, -scrollYOffset * 0.8, 0);
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  private onResize = (): void => {
    if (!this.canvas || !this.renderer || !this.camera) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };

  private onResizeBound = this.onResize;

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    window.removeEventListener('resize', this.onResizeBound);
    
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.shaderMaterial) {
      this.shaderMaterial.dispose();
    }
    if (this.mesh) {
      this.mesh.geometry.dispose();
    }
  }
}
