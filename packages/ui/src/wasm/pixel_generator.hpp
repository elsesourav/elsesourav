#ifndef PIXEL_GENERATOR_HPP
#define PIXEL_GENERATOR_HPP

#include "pixel_engine.hpp"
#include "pixel_contour.hpp"
#include <math.h>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

inline void PixelEngine::generatePixels() {
    particleCount = 0;
    emitterCount = 0;
    int w = width;
    int h = height;

    // Solid seamless pixel size (slight 1.06x overlap eliminates subpixel cracks/grid lines)
    float basePixelSize = (580.0f / (float)w) * 1.06f * sizeMultiplier;

    // 1. Infill holes & extract smooth silhouette contour FIRST
    extractSilhouetteContour(inputImage, w, h, contour, contourCount);

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

    // 1B. Animated Pixel Stars in background (32 delicate diamond stars)
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

        // Skip star if it overlaps the subject
        int checkIdx = ((int)sy * w + (int)sx) * 4;
        if (checkIdx >= 0 && checkIdx + 3 < w * h * 4 && inputImage[checkIdx + 3] > 16) {
            continue;
        }

        bool isLeft = (STAR_SEEDS[s][0] < 0.5f);

        uint8_t sr = isDark ? (isLeft ? 140 : 215) : (isLeft ? 0 : 160);
        uint8_t sg = isDark ? (isLeft ? 245 : 175) : (isLeft ? 180 : 70);
        uint8_t sb = isDark ? (isLeft ? 255 : 255) : (isLeft ? 240 : 245);

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

    // 1D. Extra small ambient micro-pixel specks (outside portrait)
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
                Pixel& p = particles[particleCount++];
                p.init((float)x, (float)y, pr, pg, pb, pa, basePixelSize, FLAG_IMAGE_PIXEL);
            }
        }
    }

    // =========================================================================
    // LAYER 2.5: SMOOTH EDGE PATH GUIDE LINE (Optional: admin inspection toggle)
    // =========================================================================
    if (showPathGuide && contourCount > 10) {
        for (int k = 0; k < contourCount; k++) {
            if (particleCount >= MAX_PARTICLES - 8) break;
            float cx = contour[k].x;
            float cy = contour[k].y;
            float relX = cx / (float)w;

            uint8_t lr, lg, lb;
            if (isDark) {
                if (relX < 0.46f) {
                    lr = 0; lg = 238; lb = 255;
                } else if (relX > 0.54f) {
                    lr = 190; lg = 92; lb = 252;
                } else {
                    float b = (relX - 0.46f) / 0.08f;
                    lr = (uint8_t)(b * 190.0f);
                    lg = (uint8_t)((1.0f - b) * 238.0f + b * 92.0f);
                    lb = 255;
                }
            } else {
                if (relX < 0.46f) {
                    lr = 0; lg = 190; lb = 245;
                } else if (relX > 0.54f) {
                    lr = 160; lg = 65; lb = 245;
                } else {
                    float b = (relX - 0.46f) / 0.08f;
                    lr = (uint8_t)(b * 160.0f);
                    lg = (uint8_t)((1.0f - b) * 190.0f + b * 65.0f);
                    lb = 245;
                }
            }

            Pixel& lp = particles[particleCount++];
            lp.init(cx, cy, lr, lg, lb, 245, basePixelSize * 0.95f, FLAG_PATH_LINE);
            lp.pathPhase = (float)k * 0.05f;
        }
    }

    // =========================================================================
    // LAYER 3: TOP PARTICLES (Light up pixels traveling along silhouette edges)
    // =========================================================================
    if (contourCount > 10) {
        int edgeParticleCount = (int)((float)w * 1.55f * densityMultiplier);
        if (edgeParticleCount < 80) edgeParticleCount = 80;
        if (edgeParticleCount > 380) edgeParticleCount = 380;
        for (int k = 0; k < edgeParticleCount; k++) {
            if (particleCount >= MAX_PARTICLES - 8) break;

            float initProgress = ((float)k / (float)edgeParticleCount) * (float)(contourCount - 1);
            float dir = (k % 2 == 0) ? 1.0f : -1.0f;
            float speed = (11.0f + pseudoRand((float)k * 2.3f) * 15.0f) * speedMultiplier;

            // Follow the exact edge silhouette line without wide offsets or extra width tracks
            float laneOffset = 0.0f;
            float wPhase = pseudoRand((float)k * 5.1f) * 6.28f;
            float wAmp = 0.0f;
            float wFreq = 1.0f;

            int idx0 = (int)initProgress;
            if (idx0 >= contourCount) idx0 = contourCount - 1;
            float cx = contour[idx0].x;
            float cy = contour[idx0].y;

            float spawnX = cx;
            float spawnY = cy;

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
                    gr = 0; gg = 190; gb = 245;
                } else if (relX > 0.54f) {
                    gr = 160; gg = 65; gb = 245;
                } else {
                    float b = (relX - 0.46f) / 0.08f;
                    gr = (uint8_t)(b * 160.0f);
                    gg = (uint8_t)((1.0f - b) * 190.0f + b * 65.0f);
                    gb = 245;
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
                em.radius = 16.0f * glowMultiplier;
            }
        }
    }
}

#endif // PIXEL_GENERATOR_HPP
