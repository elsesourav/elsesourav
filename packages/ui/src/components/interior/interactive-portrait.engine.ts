import * as THREE from 'three';

export interface InteractivePortraitEngineOptions {
  canvas: HTMLCanvasElement;
  imageDarkSrc: string;
  imageLightSrc: string;
  isDark: boolean;
  effectsLevel?: 'high' | 'medium' | 'low';
  onLoaded?: () => void;
}

interface PixelData {
  homeX: number;
  homeY: number;
  currentX: number;
  currentY: number;
  vx: number;
  vy: number;
  size: number;
  baseColor: THREE.Color;
  lightColor: THREE.Color;
  phase: number;
  scatterMult: number;
  isDot: boolean;
}

const HALO_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const HALO_FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uIsDark;
  varying vec2 vUv;

  void main() {
    vec2 center = vec2(0.5, 0.5);
    vec2 p = vUv - center;
    float dist = length(p);
    float ringRadius = 0.42;
    float ringWidth = 0.016;

    float halo = exp(-pow(abs(dist - ringRadius) / ringWidth, 2.0));
    float softGlow = exp(-pow(abs(dist - ringRadius) / (ringWidth * 4.2), 1.6)) * 0.4;
    float intensity = halo + softGlow;

    if (intensity < 0.01) {
      discard;
    }

    float angle = atan(p.y, p.x);
    float normAngle = (angle + 3.14159265) / (2.0 * 3.14159265);

    // Cyan/Blue on the left (angle ~ pi), Violet/Purple on the right (angle ~ 0)
    vec3 cyanDark = vec3(0.0, 0.94, 1.0);
    vec3 purpleDark = vec3(0.72, 0.22, 1.0);
    vec3 cyanLight = vec3(0.02, 0.71, 0.83);
    vec3 purpleLight = vec3(0.49, 0.23, 0.93);

    vec3 colDark = mix(purpleDark, cyanDark, smoothstep(0.15, 0.85, normAngle));
    vec3 colLight = mix(purpleLight, cyanLight, smoothstep(0.15, 0.85, normAngle));
    vec3 finalCol = mix(colLight, colDark, uIsDark);

    float alpha = intensity * (uIsDark > 0.5 ? 0.92 : 0.75);
    gl_FragColor = vec4(finalCol, alpha);
  }
`;

export class InteractivePortraitEngine {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private isDark: boolean;
  private effectsLevel: 'high' | 'medium' | 'low';
  private onLoaded?: () => void;

  private portraitMesh?: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  private darkTexture?: THREE.Texture;
  private lightTexture?: THREE.Texture;
  private haloMesh?: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private haloUniforms: { uTime: { value: number }; uIsDark: { value: number } };

  private pixelMesh?: THREE.InstancedMesh;
  private pixels: PixelData[] = [];
  private dummy = new THREE.Object3D();

  private animFrameId: number | null = null;
  private isRunning = false;
  private clock = new THREE.Clock();

  private pointer = new THREE.Vector2(-999, -999);
  private targetPointer = new THREE.Vector2(-999, -999);
  private isPointerDown = false;
  private shockwaves: { x: number; y: number; radius: number; maxRadius: number; force: number }[] = [];

  constructor(options: InteractivePortraitEngineOptions) {
    this.canvas = options.canvas;
    this.isDark = options.isDark;
    this.effectsLevel = options.effectsLevel || 'high';
    this.onLoaded = options.onLoaded;

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    this.camera.position.z = 1;

    const dpr = this.effectsLevel === 'low' ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.5);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: this.effectsLevel !== 'low',
      powerPreference: 'high-performance',
      stencil: false,
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(dpr);

    const initW = Math.max(this.canvas.clientWidth || 0, 360);
    const initH = Math.max(this.canvas.clientHeight || 0, 360);
    this.renderer.setSize(initW, initH, false);

    this.haloUniforms = {
      uTime: { value: 0 },
      uIsDark: { value: this.isDark ? 1.0 : 0.0 },
    };

    this.initHalo();
    this.initPixels();
    this.loadTextures(options.imageDarkSrc, options.imageLightSrc);
  }

  private initHalo(): void {
    const geo = new THREE.PlaneGeometry(1.68, 1.68);
    const mat = new THREE.ShaderMaterial({
      vertexShader: HALO_VERTEX_SHADER,
      fragmentShader: HALO_FRAGMENT_SHADER,
      uniforms: this.haloUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    this.haloMesh = new THREE.Mesh(geo, mat);
    this.haloMesh.position.set(0, 0.14, -0.05);
    this.scene.add(this.haloMesh);
  }

  private initPixels(): void {
    const isLow = this.effectsLevel === 'low';
    const isMed = this.effectsLevel === 'medium';
    const targetCount = isLow ? 90 : isMed ? 180 : 320;

    const cyanTonesDark = [
      new THREE.Color('#00f0ff'),
      new THREE.Color('#0891b2'),
      new THREE.Color('#0284c7'),
      new THREE.Color('#38bdf8'),
    ];
    const purpleTonesDark = [
      new THREE.Color('#a855f7'),
      new THREE.Color('#9333ea'),
      new THREE.Color('#c084fc'),
      new THREE.Color('#e879f9'),
    ];

    const cyanTonesLight = [
      new THREE.Color('#0284c7'),
      new THREE.Color('#0d9488'),
      new THREE.Color('#059669'),
      new THREE.Color('#0369a1'),
    ];
    const purpleTonesLight = [
      new THREE.Color('#6366f1'),
      new THREE.Color('#7c3aed'),
      new THREE.Color('#4f46e5'),
      new THREE.Color('#8b5cf6'),
    ];

    this.pixels = [];

    // 1. Edge disintegration clusters matching reference
    for (let i = 0; i < targetCount; i++) {
      const isLeft = Math.random() < 0.5;
      const isHair = Math.random() < 0.24;

      let x: number;
      let y: number;
      let size: number;
      const isDot = Math.random() < 0.15;

      if (isHair) {
        // Upper head/curls edge
        x = (Math.random() - 0.5) * 0.72;
        y = 0.44 + Math.random() * 0.32;
        size = isDot ? 0.012 : 0.02 + Math.random() * 0.03;
      } else if (isLeft) {
        // Left flank / shoulder / hoodie
        const t = Math.random();
        x = -0.32 - t * 0.48 + (Math.random() - 0.5) * 0.08;
        y = -0.78 + Math.random() * 0.78;
        size = isDot ? 0.014 : 0.028 + Math.random() * 0.046;
        if (Math.random() < 0.08) size = 0.078; // Glitch macro-block
      } else {
        // Right flank / shoulder / hoodie
        const t = Math.random();
        x = 0.32 + t * 0.48 + (Math.random() - 0.5) * 0.08;
        y = -0.78 + Math.random() * 0.78;
        size = isDot ? 0.014 : 0.028 + Math.random() * 0.046;
        if (Math.random() < 0.08) size = 0.078; // Glitch macro-block
      }

      // Quantize to pixel grid for crisp digital aesthetic
      const gridSnap = 0.018;
      x = Math.round(x / gridSnap) * gridSnap;
      y = Math.round(y / gridSnap) * gridSnap;

      const darkPalette = x < 0 ? cyanTonesDark : purpleTonesDark;
      const lightPalette = x < 0 ? cyanTonesLight : purpleTonesLight;

      const baseColor = darkPalette[Math.floor(Math.random() * darkPalette.length)]!;
      const lightColor = lightPalette[Math.floor(Math.random() * lightPalette.length)]!;

      this.pixels.push({
        homeX: x,
        homeY: y,
        currentX: x,
        currentY: y,
        vx: 0,
        vy: 0,
        size,
        baseColor,
        lightColor,
        phase: Math.random() * Math.PI * 2,
        scatterMult: 0.6 + Math.random() * 0.8,
        isDot,
      });
    }

    // 2. Ambient digital matrix points in background
    const dotCount = isLow ? 24 : 64;
    for (let i = 0; i < dotCount; i++) {
      const x = (Math.random() - 0.5) * 1.7;
      const y = (Math.random() - 0.5) * 1.7;
      const darkPalette = x < 0 ? cyanTonesDark : purpleTonesDark;
      const lightPalette = x < 0 ? cyanTonesLight : purpleTonesLight;

      this.pixels.push({
        homeX: x,
        homeY: y,
        currentX: x,
        currentY: y,
        vx: 0,
        vy: 0,
        size: 0.009,
        baseColor: darkPalette[0]!,
        lightColor: lightPalette[0]!,
        phase: Math.random() * Math.PI * 2,
        scatterMult: 0.35,
        isDot: true,
      });
    }

    const totalInstances = this.pixels.length;
    const geo = new THREE.PlaneGeometry(1, 1);
    const mat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
    });

    this.pixelMesh = new THREE.InstancedMesh(geo, mat, totalInstances);
    this.updatePixelColors();

    this.pixelMesh.position.z = 0.04;
    this.scene.add(this.pixelMesh);
  }

  private updatePixelColors(): void {
    if (!this.pixelMesh) return;
    for (let i = 0; i < this.pixels.length; i++) {
      const p = this.pixels[i]!;
      const col = this.isDark ? p.baseColor : p.lightColor;
      this.pixelMesh.setColorAt(i, col);
    }
    if (this.pixelMesh.instanceColor) {
      this.pixelMesh.instanceColor.needsUpdate = true;
    }
  }

  private loadTextures(darkSrc: string, lightSrc: string): void {
    const loader = new THREE.TextureLoader();

    const handleLoaded = (tex: THREE.Texture, isDarkTex: boolean) => {
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;

      if (isDarkTex) {
        this.darkTexture = tex;
      } else {
        this.lightTexture = tex;
      }

      if ((this.isDark && isDarkTex) || (!this.isDark && !isDarkTex)) {
        this.createPortraitMesh();
        this.onLoaded?.();
      } else if (this.portraitMesh) {
        this.updatePortraitTexture();
      }
    };

    loader.load(
      darkSrc,
      (tex) => handleLoaded(tex, true),
      undefined,
      () => {
        // Fallback: still notify so canvas displays halo & pixels
        this.onLoaded?.();
      }
    );

    loader.load(
      lightSrc,
      (tex) => handleLoaded(tex, false),
      undefined,
      undefined
    );
  }

  private updatePortraitTexture(): void {
    if (!this.portraitMesh) return;
    const tex = this.isDark ? this.darkTexture : this.lightTexture;
    if (tex) {
      this.portraitMesh.material.map = tex;
      this.portraitMesh.material.needsUpdate = true;
    }
  }

  private createPortraitMesh(): void {
    if (this.portraitMesh) {
      this.updatePortraitTexture();
      return;
    }
    const activeTex = this.isDark ? this.darkTexture : this.lightTexture;
    if (!activeTex) return;

    const geo = new THREE.PlaneGeometry(1.92, 1.92);
    const mat = new THREE.MeshBasicMaterial({
      map: activeTex,
      transparent: true,
      depthWrite: false,
    });
    this.portraitMesh = new THREE.Mesh(geo, mat);
    this.portraitMesh.position.set(0, 0, 0);
    this.scene.add(this.portraitMesh);
  }

  public setPointer(normX: number, normY: number, isDown: boolean): void {
    this.targetPointer.set(normX, normY);
    this.isPointerDown = isDown;
  }

  public burst(normX?: number, normY?: number): void {
    const bx = normX ?? (this.pointer.x > -900 ? this.pointer.x : 0);
    const by = normY ?? (this.pointer.y > -900 ? this.pointer.y : 0);
    this.shockwaves.push({
      x: bx,
      y: by,
      radius: 0.05,
      maxRadius: 0.95,
      force: 0.16,
    });
  }

  public setTheme(isDark: boolean): void {
    this.isDark = isDark;
    this.haloUniforms.uIsDark.value = isDark ? 1.0 : 0.0;
    if (this.portraitMesh) {
      this.portraitMesh.material.map = isDark ? this.darkTexture || null : this.lightTexture || null;
      this.portraitMesh.material.needsUpdate = true;
    }
    this.updatePixelColors();
  }

  public setEffectsLevel(level: 'high' | 'medium' | 'low'): void {
    this.effectsLevel = level;
    const dpr = level === 'low' ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.5);
    this.renderer.setPixelRatio(dpr);
  }

  public resize(width: number, height: number): void {
    this.renderer.setSize(width, height, false);
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.clock.start();
    this.tick();
  }

  public pause(): void {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private tick = (): void => {
    if (!this.isRunning) return;
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const elapsedTime = this.clock.getElapsedTime();

    this.haloUniforms.uTime.value = elapsedTime;

    // Smooth pointer tracking
    if (this.targetPointer.x > -900) {
      if (this.pointer.x < -900) {
        this.pointer.copy(this.targetPointer);
      } else {
        this.pointer.lerp(this.targetPointer, 0.22);
      }
    } else {
      this.pointer.set(-999, -999);
    }

    // Update shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i]!;
      sw.radius += dt * 1.8;
      if (sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
      }
    }

    // Update pixel physics
    const influenceRadius = 0.44;
    const springK = 8.5;
    const damping = 0.88;

    if (this.pixelMesh) {
      for (let i = 0; i < this.pixels.length; i++) {
        const p = this.pixels[i]!;

        // 1. Pointer interaction repulsion
        if (this.pointer.x > -900) {
          const dx = p.currentX - this.pointer.x;
          const dy = p.currentY - this.pointer.y;
          const dist = Math.hypot(dx, dy);

          if (dist < influenceRadius && dist > 0.001) {
            const force = (1.0 - dist / influenceRadius) * 0.09 * p.scatterMult;
            const nx = dx / dist;
            const ny = dy / dist;
            p.vx += nx * force;
            p.vy += ny * force;

            // Swirl turbulence
            p.vx += -ny * force * 0.28;
            p.vy += nx * force * 0.28;
          }
        }

        // 2. Shockwave burst impulse
        for (const sw of this.shockwaves) {
          const dx = p.currentX - sw.x;
          const dy = p.currentY - sw.y;
          const dist = Math.hypot(dx, dy);
          const waveDelta = Math.abs(dist - sw.radius);
          if (waveDelta < 0.12 && dist > 0.001) {
            const push = (1.0 - waveDelta / 0.12) * sw.force * p.scatterMult;
            p.vx += (dx / dist) * push;
            p.vy += (dy / dist) * push;
          }
        }

        // 3. Spring force towards home
        const sfx = (p.homeX - p.currentX) * springK;
        const sfy = (p.homeY - p.currentY) * springK;

        p.vx = (p.vx + sfx * dt) * damping;
        p.vy = (p.vy + sfy * dt) * damping;

        p.currentX += p.vx;
        p.currentY += p.vy;

        // 4. Subtle ambient breathing drift
        const breathX = Math.sin(elapsedTime * 1.4 + p.phase) * 0.004;
        const breathY = Math.cos(elapsedTime * 1.1 + p.phase) * 0.004;

        this.dummy.position.set(p.currentX + breathX, p.currentY + breathY, 0);
        this.dummy.scale.set(p.size, p.size, 1);
        this.dummy.updateMatrix();

        this.pixelMesh.setMatrixAt(i, this.dummy.matrix);
      }
      this.pixelMesh.instanceMatrix.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
    this.animFrameId = requestAnimationFrame(this.tick);
  };

  public dispose(): void {
    this.pause();

    if (this.pixelMesh) {
      this.scene.remove(this.pixelMesh);
      this.pixelMesh.geometry.dispose();
      (this.pixelMesh.material as THREE.Material).dispose();
    }

    if (this.haloMesh) {
      this.scene.remove(this.haloMesh);
      this.haloMesh.geometry.dispose();
      this.haloMesh.material.dispose();
    }

    if (this.portraitMesh) {
      this.scene.remove(this.portraitMesh);
      this.portraitMesh.geometry.dispose();
      this.portraitMesh.material.dispose();
    }

    this.darkTexture?.dispose();
    this.lightTexture?.dispose();
    this.renderer.dispose();
  }
}
