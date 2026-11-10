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

    // 1. Infill holes & extract smooth silhouette contour with configured algorithm & threshold
    extractSilhouetteContour(
        inputImage,
        w,
        h,
        edgeAlgorithm,
        edgeThreshold,
        pinBottomEdge,
        contour,
        contourCount
    );

    // =========================================================================
    // LAYER 1: BACK PIXELS (Always rendered behind the portrait image)
    // =========================================================================

    // 1A. Backside Halo Ring made of delicate, dense animated pixels
    if (backsideHaloMult > 0.01f) {
        float ringCenterX = (float)w * 0.50f;
        float ringCenterY = (float)h * 0.44f;
        float ringRadius = (float)w * 0.355f;
        int ringPixelCount = (int)((float)w * 3.8f * densityMultiplier * backsideHaloMult);
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
    }

    // Resolution scaling factor relative to baseline 224px grid
    float resScale = (float)w / 224.0f;
    if (resScale < 0.65f) resScale = 0.65f;

    // 1B. Side Star-type Points (Delicate retro diamond stars on image sides)
    if (backsideStarsCount > 0) {
        static const float STAR_SEEDS[48][2] = {
            {0.14f, 0.16f}, {0.86f, 0.15f}, {0.18f, 0.34f}, {0.82f, 0.32f},
            {0.08f, 0.50f}, {0.92f, 0.48f}, {0.24f, 0.10f}, {0.76f, 0.08f},
            {0.10f, 0.25f}, {0.90f, 0.22f}, {0.29f, 0.20f}, {0.71f, 0.18f},
            {0.06f, 0.66f}, {0.94f, 0.64f}, {0.15f, 0.72f}, {0.85f, 0.70f},
            {0.05f, 0.12f}, {0.95f, 0.10f}, {0.12f, 0.42f}, {0.88f, 0.40f},
            {0.20f, 0.06f}, {0.80f, 0.05f}, {0.32f, 0.14f}, {0.68f, 0.12f},
            {0.04f, 0.38f}, {0.96f, 0.35f}, {0.22f, 0.28f}, {0.78f, 0.26f},
            {0.09f, 0.58f}, {0.91f, 0.56f}, {0.17f, 0.68f}, {0.83f, 0.66f},
            {0.07f, 0.20f}, {0.93f, 0.18f}, {0.13f, 0.48f}, {0.87f, 0.46f},
            {0.25f, 0.04f}, {0.75f, 0.04f}, {0.05f, 0.54f}, {0.95f, 0.52f},
            {0.11f, 0.62f}, {0.89f, 0.60f}, {0.19f, 0.78f}, {0.81f, 0.76f},
            {0.03f, 0.44f}, {0.97f, 0.42f}, {0.27f, 0.16f}, {0.73f, 0.14f}
        };

        int starLimit = backsideStarsCount;
        if (starLimit > 48) starLimit = 48;

        float starCenterSize = fmaxf(2.2f, basePixelSize * 1.15f);
        float armDist = fmaxf(2.4f, 2.5f * resScale);
        float armSize = fmaxf(1.6f, basePixelSize * 0.80f);

        for (int s = 0; s < starLimit; s++) {
            if (particleCount >= MAX_PARTICLES - 8) break;
            float sx = STAR_SEEDS[s][0] * (float)w;
            float sy = STAR_SEEDS[s][1] * (float)h;

            // Ensure star does not touch or overlap the subject (3px clearance)
            int isx = (int)roundf(sx);
            int isy = (int)roundf(sy);
            bool nearSubject = false;
            for (int dy = -3; dy <= 3 && !nearSubject; dy++) {
                int py = isy + dy;
                if (py < 0 || py >= h) continue;
                for (int dx = -3; dx <= 3; dx++) {
                    int px = isx + dx;
                    if (px < 0 || px >= w) continue;
                    if (inputImage[(py * w + px) * 4 + 3] > 16) {
                        nearSubject = true;
                        break;
                    }
                }
            }
            if (nearSubject) continue;

            bool isLeft = (STAR_SEEDS[s][0] < 0.5f);
            uint8_t sr, sg, sb;
            if (isDark) {
                sr = isLeft ? 0 : 195;
                sg = isLeft ? 235 : 95;
                sb = 255;
            } else {
                sr = isLeft ? 0 : 145;
                sg = isLeft ? 150 : 55;
                sb = isLeft ? 235 : 225;
            }

            // Center star pixel (delicate diamond point, invariant across resolutions)
            Pixel& sp = particles[particleCount++];
            sp.init(sx, sy, sr, sg, sb, 240, starCenterSize, FLAG_STAR_PIXEL | FLAG_BACK_PIXEL);
            sp.pathPhase = (float)s * 1.618f;

            // 4 Cross arms forming classic 5-pixel diamond cross star
            static const float ARMS[4][2] = {{-1.0f, 0.0f}, {1.0f, 0.0f}, {0.0f, -1.0f}, {0.0f, 1.0f}};
            for (int a = 0; a < 4; a++) {
                if (particleCount >= MAX_PARTICLES - 4) break;
                Pixel& ap = particles[particleCount++];
                ap.init(sx + ARMS[a][0] * armDist, sy + ARMS[a][1] * armDist, sr, sg, sb, 195, armSize, FLAG_STAR_PIXEL | FLAG_BACK_PIXEL);
                ap.pathPhase = sp.pathPhase;
            }
        }
    }

    // 1C. Side Orbit Loops (Digital celestial orbits on left, right, and space perimeter)
    int numOrbits = backsideOrbitsCount;
    if (numOrbits > 0 && backsideOrbitsEnabled) {
        if (numOrbits > 4) numOrbits = 4;
        static const float ORBITS[4][3] = {
            {0.16f, 0.26f, 13.0f}, // left orbit: x, y, radius
            {0.84f, 0.24f, 14.0f}, // right orbit
            {0.50f, 0.12f, 12.0f}, // top halo celestial orbit
            {0.20f, 0.42f, 10.0f}  // secondary side orbit
        };

        float orbitDotSize = fmaxf(1.8f, basePixelSize * 0.90f);
        int dotCount = (int)(18.0f * (0.85f + 0.25f * resScale));
        if (dotCount < 16) dotCount = 16;
        if (dotCount > 28) dotCount = 28;

        for (int o = 0; o < numOrbits; o++) {
            float ocx = ORBITS[o][0] * (float)w;
            float ocy = ORBITS[o][1] * (float)h;
            float orad = ORBITS[o][2] * resScale;
            bool isLeft = (o == 0 || o == 3);

            uint8_t orr, org, orb;
            if (isDark) {
                orr = isLeft ? 0 : 190;
                org = isLeft ? 230 : 95;
                orb = 255;
            } else {
                orr = isLeft ? 0 : 145;
                org = isLeft ? 150 : 55;
                orb = isLeft ? 235 : 225;
            }

            for (int d = 0; d < dotCount; d++) {
                if (particleCount >= MAX_PARTICLES - 4) break;
                float oang = ((float)d / (float)dotCount) * 2.0f * (float)M_PI;
                float opx = ocx + cosf(oang) * orad;
                float opy = ocy + sinf(oang) * orad;

                int cpx = (int)roundf(opx);
                int cpy = (int)roundf(opy);
                if (cpx >= 0 && cpx < w && cpy >= 0 && cpy < h) {
                    if (inputImage[(cpy * w + cpx) * 4 + 3] > 16) continue;
                }

                Pixel& op = particles[particleCount++];
                op.init(opx, opy, orr, org, orb, 185, orbitDotSize, FLAG_ORBIT_PIXEL | FLAG_BACK_PIXEL);
                op.pathPhase = oang;
                op.pathSpeed = isLeft ? 0.9f : -0.75f;
                op.normalOffset = orad;
                op.baseX = ocx;
                op.baseY = ocy;
            }
        }
    }

    // 1D. Extra ambient micro-pixel specks (outside portrait on sides)
    if (backsideSpecksMult > 0.01f) {
        float speckCutoff = 0.955f - (backsideSpecksMult - 1.0f) * 0.02f;
        if (speckCutoff < 0.90f) speckCutoff = 0.90f;

        for (int y = 0; y < (int)((float)h * 0.78f); y += 4) {
            for (int x = 0; x < w; x += 4) {
                if (particleCount >= MAX_PARTICLES - 4) break;
                if (x > (int)((float)w * 0.32f) && x < (int)((float)w * 0.68f)) continue;

                int idx = (y * w + x) * 4;
                if (inputImage[idx + 3] <= 16) {
                    bool nearSubject = false;
                    for (int dy = -2; dy <= 2 && !nearSubject; dy++) {
                        int cy = y + dy;
                        if (cy < 0 || cy >= h) continue;
                        for (int dx = -2; dx <= 2; dx++) {
                            int cx = x + dx;
                            if (cx < 0 || cx >= w) continue;
                            if (inputImage[(cy * w + cx) * 4 + 3] > 16) {
                                nearSubject = true;
                                break;
                            }
                        }
                    }
                    if (nearSubject) continue;

                    float n = pseudoRand((float)x * 3.7f + (float)y * 7.1f);
                    if (n > speckCutoff) {
                        bool isLeft = (x < w / 2);
                        uint8_t ar, ag, ab;
                        if (isDark) {
                            ar = isLeft ? 0 : 185;
                            ag = isLeft ? 225 : 90;
                            ab = 255;
                        } else {
                            ar = isLeft ? 0 : 145;
                            ag = isLeft ? 150 : 55;
                            ab = isLeft ? 235 : 225;
                        }

                        Pixel& ap = particles[particleCount++];
                        ap.init((float)x, (float)y, ar, ag, ab, 140, basePixelSize * 0.60f, FLAG_BACK_PIXEL);
                    }
                }
            }
        }
    }

    // =========================================================================
    // LAYER 2: MIDDLE IMAGE PIXELS (Authentic photograph with shadow recovery & color fidelity)
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
                // Adaptive Photographic Color & Shadow Recovery
                // Deep blacks (RGB 0..25) in jackets/hoodies vanish against dark backgrounds (#09090b).
                // Lift shadows smoothly so fabric folds, seams, and silhouettes remain clearly visible,
                // while skin tones and vibrant features are perfectly preserved without color loss.
                float rF = (float)pr;
                float gF = (float)pg;
                float bF = (float)pb;
                float lum = 0.299f * rF + 0.587f * gF + 0.114f * bF;

                if (isDark) {
                    if (lum < 65.0f) {
                        float norm = 1.0f - lum / 65.0f;
                        float lift = norm * norm * 28.0f;
                        rF = fminf(255.0f, rF + lift);
                        gF = fminf(255.0f, gF + lift);
                        bF = fminf(255.0f, bF + lift * 1.15f);
                    }
                } else {
                    if (lum > 220.0f) {
                        float norm = (lum - 220.0f) / 35.0f;
                        float compress = norm * 12.0f;
                        rF = fmaxf(0.0f, rF - compress);
                        gF = fmaxf(0.0f, gF - compress);
                        bF = fmaxf(0.0f, bF - compress);
                    }
                }

                // Color vibrance preservation (counteracts multi-step downsample desaturation)
                if (lum >= 35.0f && lum <= 215.0f) {
                    float meanRGB = (rF + gF + bF) * 0.333333f;
                    float satBoost = 1.08f;
                    rF = fminf(255.0f, fmaxf(0.0f, meanRGB + (rF - meanRGB) * satBoost));
                    gF = fminf(255.0f, fmaxf(0.0f, meanRGB + (gF - meanRGB) * satBoost));
                    bF = fminf(255.0f, fmaxf(0.0f, meanRGB + (bF - meanRGB) * satBoost));
                }

                uint8_t finalR = (uint8_t)roundf(rF);
                uint8_t finalG = (uint8_t)roundf(gF);
                uint8_t finalB = (uint8_t)roundf(bF);

                // Preserve edge silhouette opacity so borders don't fade into haze
                uint8_t finalA = (pa > 160) ? 255 : (uint8_t)(170 + (int)pa * 0.45f);

                Pixel& p = particles[particleCount++];
                p.init((float)x, (float)y, finalR, finalG, finalB, finalA, basePixelSize, FLAG_IMAGE_PIXEL);
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
        int edgeParticleCount = (int)((float)w * 1.55f * densityMultiplier * topParticleQuantityMult);
        if (edgeParticleCount < 40) edgeParticleCount = 40;
        if (edgeParticleCount > 450) edgeParticleCount = 450;
        for (int k = 0; k < edgeParticleCount; k++) {
            if (particleCount >= MAX_PARTICLES - 8) break;

            float initProgress = ((float)k / (float)edgeParticleCount) * (float)(contourCount - 1);
            float dir = (k % 2 == 0) ? 1.0f : -1.0f;
            float speed = (11.0f + pseudoRand((float)k * 2.3f) * 15.0f) * speedMultiplier * topParticleSpeedMult;

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
            if (spawnX < 0.0f) spawnX = 0.0f;
            if (spawnX > (float)w - 1.0f) spawnX = (float)w - 1.0f;
            if (spawnY < 0.0f) spawnY = 0.0f;
            if (spawnY > (float)h - 1.0f) spawnY = (float)h - 1.0f;

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

            // Top glow pixels: configurable luminous, crystalline starlight pixels
            float topGlowSize = basePixelSize * 0.85f * topParticleSizeMult;

            Pixel& ep = particles[particleCount++];
            ep.init(spawnX, spawnY, gr, gg, gb, 245, topGlowSize, FLAG_TOP_PARTICLE | FLAG_EDGE_FLOW);
            ep.pathPos = initProgress;
            ep.pathDir = dir;
            ep.pathSpeed = speed;
            ep.normalOffset = laneOffset;
            ep.wanderPhase = wPhase;
            ep.wanderAmp = wAmp;
            ep.wanderFreq = wFreq;

            if (emitterCount < MAX_EMITTERS && (k % 2 == 0) && cy < (float)h - 0.5f) {
                LightEmitter& em = emitters[emitterCount++];
                em.x = spawnX;
                em.y = spawnY;
                em.r = (float)gr;
                em.g = (float)gg;
                em.b = (float)gb;
                em.radius = 16.0f * glowMultiplier * (glowDistanceMult > 0.05f ? glowDistanceMult : 1.0f);
            }
        }
    }

    // Immediately calculate initial proximity rim glow so the image glows right away on Frame 0
    applyProximityLighting(
        particles,
        particleCount,
        w,
        h,
        lightIntensity,
        glowMultiplier,
        glowDistanceMult,
        isDark,
        lightMapR,
        lightMapG,
        lightMapB,
        lightMapW
    );
}

#endif // PIXEL_GENERATOR_HPP
