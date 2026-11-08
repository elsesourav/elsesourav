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
            lp.init(cx, cy, lr, lg, lb, 245, basePixelSize * 1.30f, FLAG_PATH_LINE);
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

            // Controlled lateral spread ribbon across the contour edge with subtle organic randomness
            float laneOffset = (pseudoRand((float)k * 7.13f + 1.41f) - 0.5f) * 2.0f * pathSpread;
            float wPhase = pseudoRand((float)k * 5.1f) * 6.28f;
            float wAmp = (0.25f + pseudoRand((float)k * 9.27f) * 0.75f) * pathSpread * 0.35f;
            float wFreq = 0.8f + pseudoRand((float)k * 3.41f) * 1.2f;

            int idx0 = (int)initProgress;
            if (idx0 >= contourCount) idx0 = contourCount - 1;
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
