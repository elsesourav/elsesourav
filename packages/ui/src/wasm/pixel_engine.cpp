#include "pixel_engine.hpp"
#include <string.h>
#include <math.h>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

static inline float pseudoRand(float seed) {
    float val = sinf(seed * 12.9898f + 78.233f) * 43758.5453f;
    return val - floorf(val);
}

PixelEngine::PixelEngine() {
    width = 224;
    height = 224;
    isDark = 1;
    globalTime = 0.0f;
    lightIntensity = 0.38f;
    entranceTime = 0.0f;
    entranceDuration = 1.6f;
    isEntrancing = 0;
    sizeMultiplier = 1.0f;
    glowMultiplier = 1.0f;
    speedMultiplier = 1.0f;
    densityMultiplier = 1.0f;
    particleCount = 0;
    contourCount = 0;
    emitterCount = 0;
    memset(inputImage, 0, sizeof(inputImage));
    memset(vertexBuffer, 0, sizeof(vertexBuffer));
    for (int i = 0; i < MAX_SHOCKWAVES; i++) {
        shockwaves[i].active = 0;
    }
}

PixelEngine::~PixelEngine() {
}

void PixelEngine::init(int w, int h, int dark) {
    if (w > MAX_IMAGE_DIM) w = MAX_IMAGE_DIM;
    if (h > MAX_IMAGE_DIM) h = MAX_IMAGE_DIM;
    width = w;
    height = h;
    isDark = dark;
    globalTime = 0.0f;
    entranceTime = 0.0f;
    entranceDuration = 1.6f;
    isEntrancing = 0;
    particleCount = 0;
    contourCount = 0;
    emitterCount = 0;
    memset(vertexBuffer, 0, sizeof(vertexBuffer));
    for (int i = 0; i < MAX_PARTICLES; i++) {
        particles[i].reset();
    }
}

void PixelEngine::setLightIntensity(float intensity) {
    if (intensity < 0.0f) intensity = 0.0f;
    if (intensity > 1.0f) intensity = 1.0f;
    lightIntensity = intensity;

    // Refresh middle image pixel base colors with new light intensity
    int w = width;
    int h = height;
    for (int i = 0; i < particleCount; i++) {
        Pixel& p = particles[i];
        if (p.active && (p.flags & FLAG_IMAGE_PIXEL)) {
            float relX = p.baseX / (float)w;
            float relY = p.baseY / (float)h;
            p.r = p.baseR;
            p.g = p.baseG;
            p.b = p.baseB;
            p.applyBaseTopColor(isDark, relX, relY, lightIntensity);
        }
    }
}

void PixelEngine::setParticleSize(float mult) {
    sizeMultiplier = (mult > 0.2f && mult < 5.0f) ? mult : 1.0f;
    generatePixels();
}

void PixelEngine::setGlowBrightness(float mult) {
    glowMultiplier = (mult > 0.1f && mult < 5.0f) ? mult : 1.0f;
}

void PixelEngine::setSpeed(float mult) {
    speedMultiplier = (mult > 0.1f && mult < 5.0f) ? mult : 1.0f;
}

void PixelEngine::setDensity(float mult) {
    densityMultiplier = (mult > 0.2f && mult < 5.0f) ? mult : 1.0f;
    generatePixels();
}

void PixelEngine::processImage(int w, int h) {
    init(w, h, isDark);
    generatePixels();
    triggerEntrance(1.6f);
}

void PixelEngine::extractSilhouetteContour() {
    contourCount = 0;
    int w = width;
    int h = height;

    static uint8_t edgeMap[MAX_IMAGE_BYTES / 4];
    memset(edgeMap, 0, sizeof(edgeMap));

    int topStartY = h;
    int topStartX = w / 2;
    float bestStartMetric = 999999.0f;

    for (int y = 0; y < h; y++) {
        for (int x = 0; x < w; x++) {
            int idx = (y * w + x) * 4;
            if (inputImage[idx + 3] > 16) {
                bool isEdge = false;
                if (x == 0 || x == w - 1 || y == 0 || y == h - 1) {
                    isEdge = true;
                } else {
                    for (int dy = -1; dy <= 1; dy++) {
                        for (int dx = -1; dx <= 1; dx++) {
                            if (dx == 0 && dy == 0) continue;
                            int nidx = ((y + dy) * w + (x + dx)) * 4;
                            if (inputImage[nidx + 3] <= 16) {
                                isEdge = true;
                                break;
                            }
                        }
                        if (isEdge) break;
                    }
                }

                if (isEdge) {
                    edgeMap[y * w + x] = 1;
                    float metric = (float)y + fabsf((float)x - (float)w * 0.5f) * 0.5f;
                    if (metric < bestStartMetric) {
                        bestStartMetric = metric;
                        topStartX = x;
                        topStartY = y;
                    }
                }
            }
        }
    }

    if (bestStartMetric > 999900.0f) return;

    int currX = topStartX;
    int currY = topStartY;
    edgeMap[currY * w + currX] = 2;

    ContourPoint& startP = contour[contourCount++];
    startP.x = (float)currX;
    startP.y = (float)currY;
    startP.nx = 0.0f;
    startP.ny = -1.0f;

    while (contourCount < MAX_CONTOUR) {
        int bestX = -1;
        int bestY = -1;
        int bestDist = 999999;

        for (int dy = -3; dy <= 3; dy++) {
            for (int dx = -3; dx <= 3; dx++) {
                if (dx == 0 && dy == 0) continue;
                int nx = currX + dx;
                int ny = currY + dy;
                if (nx >= 0 && nx < w && ny >= 0 && ny < h && edgeMap[ny * w + nx] == 1) {
                    int d = dx * dx + dy * dy;
                    if (d < bestDist) {
                        bestDist = d;
                        bestX = nx;
                        bestY = ny;
                        if (d <= 2) break;
                    }
                }
            }
            if (bestX >= 0 && bestDist <= 2) break;
        }

        if (bestX < 0) {
            for (int dy = -6; dy <= 6; dy++) {
                for (int dx = -6; dx <= 6; dx++) {
                    int nx = currX + dx;
                    int ny = currY + dy;
                    if (nx >= 0 && nx < w && ny >= 0 && ny < h && edgeMap[ny * w + nx] == 1) {
                        int d = dx * dx + dy * dy;
                        if (d < bestDist) {
                            bestDist = d;
                            bestX = nx;
                            bestY = ny;
                        }
                    }
                }
            }
        }

        if (bestX < 0 || bestDist > 49) break;

        edgeMap[bestY * w + bestX] = 2;
        currX = bestX;
        currY = bestY;

        ContourPoint& cp = contour[contourCount++];
        cp.x = (float)currX;
        cp.y = (float)currY;
        cp.nx = 0.0f;
        cp.ny = 0.0f;
    }

    if (contourCount < 10) return;

    float centerBodyX = (float)w * 0.5f;
    float centerBodyY = (float)h * 0.52f;

    for (int i = 0; i < contourCount; i++) {
        int prev = (i - 1 + contourCount) % contourCount;
        int next = (i + 1) % contourCount;

        float tx = contour[next].x - contour[prev].x;
        float ty = contour[next].y - contour[prev].y;

        float nx = -ty;
        float ny = tx;
        float len = sqrtf(nx * nx + ny * ny);
        if (len > 0.0001f) {
            nx /= len;
            ny /= len;
        } else {
            nx = 0.0f;
            ny = -1.0f;
        }

        float toCenterX = contour[i].x - centerBodyX;
        float toCenterY = contour[i].y - centerBodyY;
        if (nx * toCenterX + ny * toCenterY < 0.0f) {
            nx = -nx;
            ny = -ny;
        }

        contour[i].nx = nx;
        contour[i].ny = ny;
    }
}

void PixelEngine::generatePixels() {
    particleCount = 0;
    emitterCount = 0;
    int w = width;
    int h = height;

    // Solid seamless pixel size (slight 1.06x overlap eliminates subpixel cracks/grid lines)
    float basePixelSize = (580.0f / (float)w) * 1.06f * sizeMultiplier;

    // =========================================================================
    // LAYER 1: BACK PIXELS (Always rendered behind the portrait image)
    // =========================================================================

    // 1A. Backside Halo Ring made of delicate, dense animated pixels
    float ringCenterX = (float)w * 0.50f;
    float ringCenterY = (float)h * 0.44f;
    float ringRadius = (float)w * 0.355f;
    int ringPixelCount = (int)((float)w * 3.8f * densityMultiplier);
    float delicateRingPixelSize = basePixelSize * 0.90f;

    for (int j = 0; j < ringPixelCount; j++) {
        if (particleCount >= MAX_PARTICLES - 8) break;
        float angle = ((float)j / (float)ringPixelCount) * 2.0f * (float)M_PI;
        float px = ringCenterX + cosf(angle) * ringRadius;
        float py = ringCenterY + sinf(angle) * ringRadius;

        float normX = cosf(angle);
        float t = (normX + 1.0f) * 0.5f;

        uint8_t rr, rg, rb;
        if (isDark) {
            rr = (uint8_t)((1.0f - t) * 0.0f   + t * 185.0f);
            rg = (uint8_t)((1.0f - t) * 230.0f + t * 90.0f);
            rb = (uint8_t)((1.0f - t) * 255.0f + t * 252.0f);
        } else {
            rr = (uint8_t)((1.0f - t) * 14.0f  + t * 140.0f);
            rg = (uint8_t)((1.0f - t) * 165.0f + t * 70.0f);
            rb = (uint8_t)((1.0f - t) * 233.0f + t * 245.0f);
        }

        Pixel& rp = particles[particleCount++];
        rp.init(px, py, rr, rg, rb, 210, delicateRingPixelSize, FLAG_RING_PIXEL | FLAG_BACK_PIXEL);
        rp.pathPhase = angle;
    }

    // 1B. Animated Pixel Stars in background (2x quantity: 32 delicate diamond stars)
    static const float STAR_SEEDS[32][2] = {
        {0.14f, 0.16f}, {0.86f, 0.15f}, {0.18f, 0.34f}, {0.82f, 0.32f},
        {0.08f, 0.50f}, {0.92f, 0.48f}, {0.24f, 0.10f}, {0.76f, 0.08f},
        {0.10f, 0.25f}, {0.90f, 0.22f}, {0.29f, 0.20f}, {0.71f, 0.18f},
        {0.06f, 0.68f}, {0.94f, 0.65f}, {0.15f, 0.82f}, {0.85f, 0.80f},
        {0.05f, 0.12f}, {0.95f, 0.10f}, {0.12f, 0.42f}, {0.88f, 0.40f},
        {0.20f, 0.06f}, {0.80f, 0.05f}, {0.32f, 0.14f}, {0.68f, 0.12f},
        {0.04f, 0.38f}, {0.96f, 0.35f}, {0.22f, 0.28f}, {0.78f, 0.26f},
        {0.09f, 0.60f}, {0.91f, 0.58f}, {0.17f, 0.74f}, {0.83f, 0.72f}
    };

    int starCount = (int)(32 * densityMultiplier);
    if (starCount > 32) starCount = 32;
    if (starCount < 8) starCount = 8;

    for (int s = 0; s < starCount; s++) {
        if (particleCount >= MAX_PARTICLES - 8) break;
        float sx = STAR_SEEDS[s][0] * (float)w;
        float sy = STAR_SEEDS[s][1] * (float)h;
        bool isLeft = (STAR_SEEDS[s][0] < 0.5f);

        uint8_t sr = isLeft ? 140 : 215;
        uint8_t sg = isLeft ? 245 : 175;
        uint8_t sb = isLeft ? 255 : 255;

        // Center star pixel (delicate diamond point)
        Pixel& sp = particles[particleCount++];
        sp.init(sx, sy, sr, sg, sb, 230, basePixelSize * 1.05f, FLAG_STAR_PIXEL | FLAG_BACK_PIXEL);
        sp.pathPhase = (float)s * 1.618f;

        // 4 Cross arms (fine micro-pixels)
        float armDist = basePixelSize * 0.72f;
        float armSize = basePixelSize * 0.58f;
        static const float ARMS[4][2] = {{-1.0f, 0.0f}, {1.0f, 0.0f}, {0.0f, -1.0f}, {0.0f, 1.0f}};
        for (int a = 0; a < 4; a++) {
            if (particleCount >= MAX_PARTICLES - 4) break;
            Pixel& ap = particles[particleCount++];
            ap.init(sx + ARMS[a][0] * armDist, sy + ARMS[a][1] * armDist, sr, sg, sb, 190, armSize, FLAG_STAR_PIXEL | FLAG_BACK_PIXEL);
            ap.pathPhase = sp.pathPhase;
        }
    }

    // 1C. Animated Pixel Orbit Circles (planetary digital loops)
    static const float ORBITS[2][3] = {
        {0.18f, 0.25f, 12.0f}, // left orbit: x, y, radius
        {0.82f, 0.22f, 14.0f}  // right orbit
    };

    for (int o = 0; o < 2; o++) {
        float ocx = ORBITS[o][0] * (float)w;
        float ocy = ORBITS[o][1] * (float)h;
        float orad = ORBITS[o][2];
        bool isLeft = (o == 0);
        int dotCount = 18;

        for (int d = 0; d < dotCount; d++) {
            if (particleCount >= MAX_PARTICLES - 4) break;
            float oang = ((float)d / (float)dotCount) * 2.0f * (float)M_PI;
            float opx = ocx + cosf(oang) * orad;
            float opy = ocy + sinf(oang) * orad;

            uint8_t orr = isLeft ? 0 : 190;
            uint8_t org = isLeft ? 230 : 95;
            uint8_t orb = isLeft ? 255 : 252;

            Pixel& op = particles[particleCount++];
            op.init(opx, opy, orr, org, orb, 180, basePixelSize * 0.85f, FLAG_ORBIT_PIXEL | FLAG_BACK_PIXEL);
            op.pathPhase = oang;
            op.pathSpeed = isLeft ? 0.9f : -0.75f;
            op.normalOffset = orad;
            op.baseX = ocx;
            op.baseY = ocy;
        }
    }

    // 1D. Extra small ambient micro-pixel specks
    for (int y = 0; y < h; y += 5) {
        for (int x = 0; x < w; x += 5) {
            if (particleCount >= MAX_PARTICLES - 4) break;
            int idx = (y * w + x) * 4;
            if (inputImage[idx + 3] <= 16) {
                float n = pseudoRand((float)x * 3.7f + (float)y * 7.1f);
                if (n > 0.965f) {
                    bool isLeft = (x < w / 2);
                    uint8_t ar = isLeft ? 0 : 175;
                    uint8_t ag = isLeft ? 225 : 85;
                    uint8_t ab = isLeft ? 255 : 250;

                    Pixel& ap = particles[particleCount++];
                    ap.init((float)x, (float)y, ar, ag, ab, 110, basePixelSize * 0.55f, FLAG_BACK_PIXEL);
                }
            }
        }
    }

    // =========================================================================
    // LAYER 2: MIDDLE IMAGE PIXELS (Authentic photograph, clean, normal face)
    // =========================================================================
    for (int y = 0; y < h; y++) {
        for (int x = 0; x < w; x++) {
            if (particleCount >= MAX_PARTICLES - 8) break;
            int idx = (y * w + x) * 4;
            uint8_t pr = inputImage[idx];
            uint8_t pg = inputImage[idx + 1];
            uint8_t pb = inputImage[idx + 2];
            uint8_t pa = inputImage[idx + 3];

            if (pa > 16) {
                float relX = (float)x / (float)w;
                float relY = (float)y / (float)h;

                Pixel& p = particles[particleCount++];
                p.init((float)x, (float)y, pr, pg, pb, pa, basePixelSize, FLAG_IMAGE_PIXEL);
                p.applyBaseTopColor(isDark, relX, relY, lightIntensity);
            }
        }
    }

    // =========================================================================
    // LAYER 3: TOP PARTICLES (Light up pixels traveling along silhouette edges)
    // =========================================================================
    extractSilhouetteContour();

    if (contourCount > 10) {
        // Top glow pixels: 2x quantity
        int edgeParticleCount = (int)((float)w * 4.30f * densityMultiplier);
        for (int k = 0; k < edgeParticleCount; k++) {
            if (particleCount >= MAX_PARTICLES - 8) break;

            float initProgress = ((float)k / (float)edgeParticleCount) * (float)contourCount;
            float dir = (k % 2 == 0) ? 1.0f : -1.0f; // 50% clockwise, 50% anticlockwise
            float speed = 11.0f + pseudoRand((float)k * 2.3f) * 15.0f;

            float laneOffset = (pseudoRand((float)k * 3.7f) - 0.25f) * 7.0f;
            float wPhase = pseudoRand((float)k * 5.1f) * 6.28f;
            float wAmp = 0.5f + pseudoRand((float)k * 7.9f) * 1.2f;
            float wFreq = 1.2f + pseudoRand((float)k * 9.3f) * 1.8f;

            int idx0 = (int)initProgress % contourCount;
            float cx = contour[idx0].x;
            float cy = contour[idx0].y;
            float nx = contour[idx0].nx;
            float ny = contour[idx0].ny;

            float spawnX = cx + nx * laneOffset;
            float spawnY = cy + ny * laneOffset;

            float relX = cx / (float)w;
            uint8_t gr, gg, gb;
            if (isDark) {
                if (relX < 0.46f) {
                    gr = 0; gg = 238; gb = 255;
                } else if (relX > 0.54f) {
                    gr = 190; gg = 92; gb = 252;
                } else {
                    float b = (relX - 0.46f) / 0.08f;
                    gr = (uint8_t)(b * 190.0f);
                    gg = (uint8_t)((1.0f - b) * 238.0f + b * 92.0f);
                    gb = 255;
                }
            } else {
                if (relX < 0.46f) {
                    gr = 14; gg = 165; gb = 233;
                } else if (relX > 0.54f) {
                    gr = 135; gg = 65; gb = 240;
                } else {
                    float b = (relX - 0.46f) / 0.08f;
                    gr = (uint8_t)((1.0f - b) * 14.0f + b * 135.0f);
                    gg = (uint8_t)((1.0f - b) * 165.0f + b * 65.0f);
                    gb = (uint8_t)((1.0f - b) * 233.0f + b * 240.0f);
                }
            }

            // Top glow pixels: significantly smaller (0.58x) and delicate
            float topGlowSize = basePixelSize * 0.58f;

            Pixel& ep = particles[particleCount++];
            ep.init(spawnX, spawnY, gr, gg, gb, 240, topGlowSize, FLAG_TOP_PARTICLE | FLAG_EDGE_FLOW);
            ep.pathPos = initProgress;
            ep.pathDir = dir;
            ep.pathSpeed = speed;
            ep.normalOffset = laneOffset;
            ep.wanderPhase = wPhase;
            ep.wanderAmp = wAmp;
            ep.wanderFreq = wFreq;

            if (emitterCount < MAX_EMITTERS && (k % 2 == 0) && cy < (float)h - 2.5f) {
                LightEmitter& em = emitters[emitterCount++];
                em.x = spawnX;
                em.y = spawnY;
                em.r = (float)gr;
                em.g = (float)gg;
                em.b = (float)gb;
                em.radius = 12.0f * glowMultiplier;
            }
        }
    }
}

void PixelEngine::addBurst(float x, float y, float force) {
    for (int i = 0; i < MAX_SHOCKWAVES; i++) {
        if (!shockwaves[i].active) {
            shockwaves[i].x = x;
            shockwaves[i].y = y;
            shockwaves[i].radius = 1.0f;
            shockwaves[i].maxRadius = (float)width * 0.70f;
            shockwaves[i].force = force;
            shockwaves[i].active = 1;
            break;
        }
    }
}

void PixelEngine::triggerEntrance(float duration) {
    if (duration <= 0.01f) {
        isEntrancing = 0;
        entranceTime = 0.0f;
        for (int i = 0; i < particleCount; i++) {
            Pixel& p = particles[i];
            if (!p.active) continue;
            p.x = p.origX;
            p.y = p.origY;
            p.vx = p.vy = 0.0f;
            p.size = p.targetSize;
            p.a = p.baseA;
        }
        updateBuffers();
        return;
    }

    entranceDuration = duration;
    entranceTime = 0.0f;
    isEntrancing = 1;

    float cx = (float)width * 0.5f;
    float cy = (float)height * 0.5f;
    float maxDim = (float)((width > height) ? width : height);
    float effDuration = (duration > 0.1f ? duration : 2.0f) / (speedMultiplier > 0.1f ? speedMultiplier : 1.0f);

    for (int i = 0; i < particleCount; i++) {
        Pixel& p = particles[i];
        if (!p.active) continue;

        float seed = (float)i * 1.618f;

        // Completely random angle around the full 360-degree perimeter [0, 2*PI]
        // Independent of the particle's destination coordinate for natural organic convergence
        float randAngle = pseudoRand(seed * 7.13f + 1.234f) * 6.2831853f;

        // Outward distance FAR beyond display bounds outside canvas perimeter (2.8x to 5.6x max dimension)
        float outDist = maxDim * (2.8f + pseudoRand(seed * 11.37f + 5.67f) * 2.8f);

        p.startX = cx + cosf(randAngle) * outDist;
        p.startY = cy + sinf(randAngle) * outDist;

        // Organic transverse curved swooping seed
        p.curveSeed = (pseudoRand(seed * 4.31f) - 0.5f) * ((float)width * 0.28f);

        // Stagger entrance pacing:
        // Back pixels (halo ring, retro stars) fly in first
        // Middle portrait image pixels stream in organically
        // Top edge flow particles enter with starlight trails
        float baseStagger = 0.0f;
        if (p.flags & FLAG_BACK_PIXEL) {
            baseStagger = 0.0f;
        } else if (p.flags & FLAG_IMAGE_PIXEL) {
            baseStagger = 0.04f + pseudoRand(seed * 3.19f) * 0.20f;
        } else if (p.flags & FLAG_TOP_PARTICLE) {
            baseStagger = 0.14f + pseudoRand(seed * 5.41f) * 0.22f;
        }
        p.startDelay = baseStagger * effDuration;

        // Individual variable flight speeds & travel durations:
        // Scout particles arrive early (0.65x), standard (0.85-1.10x), trailers (1.20-1.45x)
        float speedVariation = 0.65f + pseudoRand(seed * 8.91f + 0.42f) * 0.70f;
        p.travelDuration = effDuration * speedVariation;

        // Start outside display as glowing micro-sparks (increasing in size via WebGL)
        p.x = p.startX;
        p.y = p.startY;
        p.vx = 0.0f;
        p.vy = 0.0f;
        p.size = p.targetSize * 0.12f;
        p.a = 0;
    }

    updateBuffers();
}

void PixelEngine::setTheme(int dark) {
    if (isDark != dark) {
        isDark = dark;
        generatePixels();
    }
}

void PixelEngine::update(float dt, float mouseX, float mouseY, int isMouseDown) {
    if (dt > 0.05f) dt = 0.05f;
    globalTime += dt;

    int stillEntrancing = 0;
    if (isEntrancing) {
        entranceTime += dt;
        for (int i = 0; i < particleCount; i++) {
            Pixel& p = particles[i];
            if (!p.active) continue;

            float pProg = 0.0f;
            if (entranceTime > p.startDelay) {
                pProg = (entranceTime - p.startDelay) / p.travelDuration;
                if (pProg > 1.0f) pProg = 1.0f;
            }

            if (pProg < 1.0f) {
                stillEntrancing = 1;

                // Silky quartic ease-out magnetic deceleration:
                // Swift starlight flight from deep outer space smoothly easing into docked position
                float rem = 1.0f - pProg;
                float ease = 1.0f - rem * rem * rem * rem;

                // Transverse organic swooping curve that flattens out smoothly as particles dock
                float curve = sinf(pProg * 3.14159265f) * (1.0f - pProg * 0.85f);
                float perpX = -(p.startY - p.origY);
                float perpY = (p.startX - p.origX);
                float perpLen = sqrtf(perpX * perpX + perpY * perpY) + 0.001f;

                p.x = p.startX * (1.0f - ease) + p.origX * ease + (perpX / perpLen) * curve * p.curveSeed;
                p.y = p.startY * (1.0f - ease) + p.origY * ease + (perpY / perpLen) * curve * p.curveSeed;
                p.vx = 0.0f;
                p.vy = 0.0f;

                // Smoothly expand from micro-spark to full solid pixel size
                p.size = p.targetSize * (0.12f + 0.88f * ease);

                // Progressive luminance fade-in
                float alphaScale = pProg * 1.8f;
                if (alphaScale > 1.0f) alphaScale = 1.0f;
                p.a = (uint8_t)((float)p.baseA * alphaScale);
            } else {
                p.x = p.origX;
                p.y = p.origY;
                p.size = p.targetSize;
                p.a = p.baseA;
            }
        }

        if (!stillEntrancing) {
            isEntrancing = 0;
        }
    }

    for (int i = 0; i < MAX_SHOCKWAVES; i++) {
        if (shockwaves[i].active) {
            shockwaves[i].radius += dt * 32.0f;
            if (shockwaves[i].radius >= shockwaves[i].maxRadius) {
                shockwaves[i].active = 0;
            }
        }
    }

    float interactRadius = (float)width * 0.20f;
    float springK = 3.6f;
    float damping = 0.91f;
    float maxPush = isMouseDown ? 1.8f : 0.95f;

    int currentEmitter = 0;

    for (int i = 0; i < particleCount; i++) {
        Pixel& p = particles[i];
        if (!p.active) continue;

        // Position updates based on layer & role
        if (p.flags & FLAG_EDGE_FLOW) {
            p.pathPos += p.pathDir * p.pathSpeed * dt;
            if (contourCount > 0) {
                while (p.pathPos >= (float)contourCount) p.pathPos -= (float)contourCount;
                while (p.pathPos < 0.0f) p.pathPos += (float)contourCount;

                int idx0 = (int)p.pathPos;
                int idx1 = (idx0 + 1) % contourCount;
                float frac = p.pathPos - (float)idx0;

                float cx = contour[idx0].x * (1.0f - frac) + contour[idx1].x * frac;
                float cy = contour[idx0].y * (1.0f - frac) + contour[idx1].y * frac;
                float nx = contour[idx0].nx * (1.0f - frac) + contour[idx1].nx * frac;
                float ny = contour[idx0].ny * (1.0f - frac) + contour[idx1].ny * frac;

                float wander = sinf(globalTime * p.wanderFreq + p.wanderPhase) * p.wanderAmp;
                float totalOffset = p.normalOffset + wander;

                p.origX = cx + nx * totalOffset;
                p.origY = cy + ny * totalOffset;

                // User request:
                // "The particles at the very bottom of the shirt should not be shown.
                //  Also, the particles on the bottom half of the sides are not working properly. Can you please fix that?"
                // Only hide particles when at the VERY BOTTOM horizontal line of the shirt (cy >= height - 2.5f).
                // Everywhere else (top, shoulders, and both sides all the way down the arms): fully shown and glowing!
                if (cy >= (float)height - 2.5f || p.origY >= (float)height - 2.0f) {
                    p.a = 0; // Not shown at the very bottom of the shirt
                } else {
                    p.a = 245; // Always glowing along top, shoulders, and both sides all the way down
                }

                float relX = cx / (float)width;
                if (isDark) {
                    if (relX < 0.46f) {
                        p.baseR = 0; p.baseG = 238; p.baseB = 255;
                    } else if (relX > 0.54f) {
                        p.baseR = 190; p.baseG = 92; p.baseB = 252;
                    } else {
                        float b = (relX - 0.46f) / 0.08f;
                        p.baseR = (uint8_t)(b * 190.0f);
                        p.baseG = (uint8_t)((1.0f - b) * 238.0f + b * 92.0f);
                        p.baseB = 255;
                    }
                }
                p.r = p.baseR;
                p.g = p.baseG;
                p.b = p.baseB;

                if (p.a > 0 && currentEmitter < emitterCount) {
                    emitters[currentEmitter].x = p.x;
                    emitters[currentEmitter].y = p.y;
                    emitters[currentEmitter].r = (float)p.r;
                    emitters[currentEmitter].g = (float)p.g;
                    emitters[currentEmitter].b = (float)p.b;
                    currentEmitter++;
                }
            }
        } else if (p.flags & FLAG_RING_PIXEL) {
            p.origX = p.baseX;
            p.origY = p.baseY;
            float shimmer = 0.85f + 0.15f * sinf(globalTime * 2.2f + p.pathPhase * 2.0f);
            p.a = (uint8_t)(210.0f * shimmer);
        } else if (p.flags & FLAG_STAR_PIXEL) {
            // Star twinkle & gentle floating
            p.origX = p.baseX + sinf(globalTime * 0.7f + p.pathPhase) * 1.2f;
            p.origY = p.baseY + cosf(globalTime * 0.5f + p.pathPhase) * 1.2f;
            float twinkle = 0.70f + 0.30f * sinf(globalTime * 3.2f + p.pathPhase);
            p.a = (uint8_t)(220.0f * twinkle);
        } else if (p.flags & FLAG_ORBIT_PIXEL) {
            // Planetary orbit rotation
            float curAng = p.pathPhase + globalTime * p.pathSpeed;
            p.origX = p.baseX + cosf(curAng) * p.normalOffset;
            p.origY = p.baseY + sinf(curAng) * p.normalOffset;
            p.a = (uint8_t)(170.0f + 50.0f * sinf(curAng));
        } else if (p.flags & FLAG_BACK_PIXEL) {
            p.origX = p.baseX + sinf(p.pathPhase + globalTime * 0.6f) * 1.2f;
            p.origY = p.baseY + cosf(p.pathPhase * 1.2f + globalTime * 0.5f) * 1.2f;
        } else {
            // Image pixels stay completely still at rest
            p.origX = p.baseX;
            p.origY = p.baseY;
        }

        // Skip interaction forces during entrance flight until particle is docked
        if (isEntrancing && entranceTime < (p.startDelay + p.travelDuration)) {
            continue;
        }

        // Repulsion field
        if (mouseX >= 0.0f && mouseY >= 0.0f) {
            float dx = p.x - mouseX;
            float dy = p.y - mouseY;
            float dist = sqrtf(dx * dx + dy * dy);

            if (dist < interactRadius && dist > 0.001f) {
                float normDist = dist / interactRadius;
                float falloff = (1.0f - normDist) * (1.0f - normDist);
                float force = falloff * maxPush * p.scatterFactor;
                float nx = dx / dist;
                float ny = dy / dist;

                p.applyForce(nx * force - ny * force * 0.10f, ny * force + nx * force * 0.10f);
            }
        }

        // Shockwaves
        for (int s = 0; s < MAX_SHOCKWAVES; s++) {
            if (shockwaves[s].active) {
                float dx = p.x - shockwaves[s].x;
                float dy = p.y - shockwaves[s].y;
                float dist = sqrtf(dx * dx + dy * dy);
                float waveDiff = fabsf(dist - shockwaves[s].radius);
                if (waveDiff < 10.0f && dist > 0.001f) {
                    float push = (1.0f - waveDiff / 10.0f) * shockwaves[s].force * p.scatterFactor * 0.35f;
                    p.applyForce((dx / dist) * push, (dy / dist) * push);
                }
            }
        }

        p.updatePhysics(dt, springK, damping);
    }

    // Controlled Dynamic Proximity Lighting on middle image pixels
    float effLight = lightIntensity;
    int w = width;
    int h = height;

    for (int i = 0; i < particleCount; i++) {
        Pixel& p = particles[i];
        if (!p.active) continue;

        if (p.flags & FLAG_IMAGE_PIXEL) {
            float relX = p.baseX / (float)w;
            float relY = p.baseY / (float)h;

            // Strictly protect face & facial features from proximity lighting contamination
            float faceDistX = fabsf(relX - 0.50f);
            if (faceDistX < 0.22f && relY >= 0.22f && relY <= 0.54f) {
                p.r = p.baseR;
                p.g = p.baseG;
                p.b = p.baseB;
                continue;
            }

            if (effLight <= 0.02f) {
                p.r = p.baseR;
                p.g = p.baseG;
                p.b = p.baseB;
                continue;
            }

            float litR = (float)p.baseR;
            float litG = (float)p.baseG;
            float litB = (float)p.baseB;

            for (int e = 0; e < emitterCount; e++) {
                const LightEmitter& em = emitters[e];
                float dx = p.x - em.x;
                float dy = p.y - em.y;
                float distSq = dx * dx + dy * dy;
                float rSq = em.radius * em.radius;

                if (distSq < rSq) {
                    float norm = 1.0f - sqrtf(distSq) / em.radius;
                    // Controlled soft falloff scaled by dashboard lightIntensity
                    float intensity = norm * norm * 0.38f * effLight;

                    litR = litR * (1.0f - intensity * 0.50f) + em.r * (intensity * 0.60f);
                    litG = litG * (1.0f - intensity * 0.50f) + em.g * (intensity * 0.60f);
                    litB = litB * (1.0f - intensity * 0.50f) + em.b * (intensity * 0.60f);
                }
            }

            if (litR > 255.0f) litR = 255.0f;
            if (litG > 255.0f) litG = 255.0f;
            if (litB > 255.0f) litB = 255.0f;

            p.r = (uint8_t)litR;
            p.g = (uint8_t)litG;
            p.b = (uint8_t)litB;
        }
    }

    updateBuffers();
}

void PixelEngine::updateBuffers() {
    for (int i = 0; i < particleCount; i++) {
        Pixel& p = particles[i];
        if (!p.active) continue;

        float clipX = (p.x / (float)width) * 2.0f - 1.0f;
        float clipY = 1.0f - (p.y / (float)height) * 2.0f;

        float cr = (float)p.r / 255.0f;
        float cg = (float)p.g / 255.0f;
        float cb = (float)p.b / 255.0f;
        float ca = (float)p.a / 255.0f;

        if (p.flags & FLAG_TOP_PARTICLE) {
            if (p.a == 0) {
                WebGLVertex& v = vertexBuffer[i];
                v.x = clipX;
                v.y = clipY;
                v.r = 0.0f;
                v.g = 0.0f;
                v.b = 0.0f;
                v.a = 0.0f;
                v.size = 0.0f;
                continue;
            }
            // Always glow continuously along top (never fading down or going dark)
            ca = ((float)p.a / 255.0f) * glowMultiplier;
            if (ca > 1.0f) ca = 1.0f;
        } else if (p.flags & (FLAG_STAR_PIXEL | FLAG_RING_PIXEL)) {
            ca *= glowMultiplier;
            if (ca > 1.0f) ca = 1.0f;
        }

        WebGLVertex& v = vertexBuffer[i];
        v.x = clipX;
        v.y = clipY;
        v.r = cr;
        v.g = cg;
        v.b = cb;
        v.a = ca;
        v.size = p.size;
    }
}

// C-Linkage Exported WebAssembly Functions
extern "C" {

PixelEngine* engine_create() {
    return new PixelEngine();
}

void engine_init(PixelEngine* engine, int w, int h, int dark) {
    if (engine) engine->init(w, h, dark);
}

uint8_t* engine_get_input_buffer(PixelEngine* engine) {
    return engine ? engine->getInputBufferPtr() : nullptr;
}

void engine_process_image(PixelEngine* engine, int w, int h) {
    if (engine) engine->processImage(w, h);
}

void engine_update(PixelEngine* engine, float dt, float mx, float my, int down) {
    if (engine) engine->update(dt, mx, my, down);
}

void engine_add_burst(PixelEngine* engine, float x, float y, float force) {
    if (engine) engine->addBurst(x, y, force);
}

void engine_trigger_entrance(PixelEngine* engine, float duration) {
    if (engine) engine->triggerEntrance(duration);
}

int engine_is_entrancing(PixelEngine* engine) {
    return engine ? engine->isEntranceActive() : 0;
}

void engine_set_theme(PixelEngine* engine, int dark) {
    if (engine) engine->setTheme(dark);
}

void engine_set_light_intensity(PixelEngine* engine, float intensity) {
    if (engine) engine->setLightIntensity(intensity);
}

void engine_set_particle_size(PixelEngine* engine, float mult) {
    if (engine) engine->setParticleSize(mult);
}

void engine_set_glow_brightness(PixelEngine* engine, float mult) {
    if (engine) engine->setGlowBrightness(mult);
}

void engine_set_speed(PixelEngine* engine, float mult) {
    if (engine) engine->setSpeed(mult);
}

void engine_set_density(PixelEngine* engine, float mult) {
    if (engine) engine->setDensity(mult);
}

float* engine_get_vertex_buffer(PixelEngine* engine) {
    return engine ? engine->getVertexBufferPtr() : nullptr;
}

int engine_get_vertex_count(PixelEngine* engine) {
    return engine ? engine->getVertexCount() : 0;
}

void engine_destroy(PixelEngine* engine) {
    delete engine;
}

}
