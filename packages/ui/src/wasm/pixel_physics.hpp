#ifndef PIXEL_PHYSICS_HPP
#define PIXEL_PHYSICS_HPP

#include "pixel_engine.hpp"
#include "pixel_lighting.hpp"
#include <math.h>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

inline void PixelEngine::addBurst(float x, float y, float force) {
    float effForce = (force > 0.1f) ? force : 1.8f;
    float burstRadius = (float)width * 0.32f; // ~70-80px blast radius

    // 1. Immediate radial burst impulse to pixels near the click position
    for (int i = 0; i < particleCount; i++) {
        Pixel& p = particles[i];
        if (!p.active) continue;

        float dx = p.x - x;
        float dy = p.y - y;
        float dist = sqrtf(dx * dx + dy * dy);
        if (dist < burstRadius && dist > 0.001f) {
            float norm = 1.0f - dist / burstRadius;
            float kick = norm * norm * effForce * 5.8f * p.scatterFactor;
            float nx = dx / dist;
            float ny = dy / dist;
            // Radial push with dynamic digital swirl
            p.vx += nx * kick - ny * kick * 0.30f;
            p.vy += ny * kick + nx * kick * 0.30f;
        }
    }

    // 2. Expanding shockwave ring that sweeps across the rest of the canvas
    for (int i = 0; i < MAX_SHOCKWAVES; i++) {
        if (!shockwaves[i].active) {
            shockwaves[i].x = x;
            shockwaves[i].y = y;
            shockwaves[i].radius = burstRadius * 0.35f;
            shockwaves[i].maxRadius = (float)width * 1.15f;
            shockwaves[i].force = effForce;
            shockwaves[i].active = 1;
            break;
        }
    }
}

inline void PixelEngine::triggerEntrance(float duration) {
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

    isEntrancing = 1;
    entranceTime = 0.0f;
    entranceDuration = duration;

    float cx = (float)width * 0.5f;
    float cy = (float)height * 0.5f;
    float maxDim = (float)((width > height) ? width : height);
    float effDuration = (duration > 0.01f) ? duration : 1.6f;

    for (int i = 0; i < particleCount; i++) {
        Pixel& p = particles[i];
        if (!p.active) continue;

        float seed = (float)i * 0.6180339887f;
        float randAngle = pseudoRand(seed * 7.13f + 1.23f) * 6.2831853f;

        float outDist = maxDim * (2.8f + pseudoRand(seed * 11.37f + 5.67f) * 2.8f);

        p.startX = cx + cosf(randAngle) * outDist;
        p.startY = cy + sinf(randAngle) * outDist;
        p.curveSeed = (pseudoRand(seed * 4.31f) - 0.5f) * ((float)width * 0.28f);

        float baseStagger = 0.0f;
        if (p.flags & FLAG_BACK_PIXEL) {
            baseStagger = 0.0f;
        } else if (p.flags & FLAG_IMAGE_PIXEL) {
            baseStagger = 0.04f + pseudoRand(seed * 3.19f) * 0.20f;
        } else if (p.flags & (FLAG_TOP_PARTICLE | FLAG_PATH_LINE)) {
            baseStagger = 0.14f + pseudoRand(seed * 5.41f) * 0.22f;
        }
        p.startDelay = baseStagger * effDuration;

        float speedVariation = 0.65f + pseudoRand(seed * 8.91f + 0.42f) * 0.70f;
        p.travelDuration = effDuration * speedVariation;

        p.x = p.startX;
        p.y = p.startY;
        p.vx = 0.0f;
        p.vy = 0.0f;
        p.size = p.targetSize * 0.12f;
        p.a = 0;
    }

    updateBuffers();
}

inline void PixelEngine::update(float dt, float mouseX, float mouseY, int isMouseDown) {
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
                float rem = 1.0f - pProg;
                float ease = 1.0f - rem * rem * rem * rem;

                float straightX = p.startX + (p.origX - p.startX) * ease;
                float straightY = p.startY + (p.origY - p.startY) * ease;

                float transverse = sinf(ease * (float)M_PI) * p.curveSeed * (1.0f - ease);
                float dx = p.origX - p.startX;
                float dy = p.origY - p.startY;
                float dist = sqrtf(dx * dx + dy * dy);
                float nx = (dist > 0.001f) ? -dy / dist : 0.0f;
                float ny = (dist > 0.001f) ? dx / dist : 1.0f;

                p.x = straightX + nx * transverse;
                p.y = straightY + ny * transverse;

                float targetSize = p.targetSize;
                p.size = targetSize * (0.12f + 0.88f * ease);

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

    // Fast, energetic 260px/s shockwave expansion (sweeps across canvas in ~0.55s)
    for (int i = 0; i < MAX_SHOCKWAVES; i++) {
        if (shockwaves[i].active) {
            shockwaves[i].radius += dt * 260.0f;
            if (shockwaves[i].radius >= shockwaves[i].maxRadius) {
                shockwaves[i].active = 0;
            }
        }
    }

    float interactRadius = (float)width * 0.22f;
    float maxPush = isMouseDown ? 4.8f : 2.4f;

    int currentEmitter = 0;

    for (int i = 0; i < particleCount; i++) {
        Pixel& p = particles[i];
        if (!p.active) continue;

        // Position updates based on layer & role
        if (p.flags & FLAG_EDGE_FLOW) {
            p.pathPos += p.pathDir * p.pathSpeed * dt;
            if (contourCount > 1) {
                if (p.pathPos >= (float)(contourCount - 1)) {
                    p.pathPos = (float)(contourCount - 1);
                    p.pathDir = -fabsf(p.pathDir);
                } else if (p.pathPos <= 0.0f) {
                    p.pathPos = 0.0f;
                    p.pathDir = fabsf(p.pathDir);
                }

                int idx0 = (int)p.pathPos;
                int idx1 = idx0 + 1;
                if (idx1 >= contourCount) idx1 = contourCount - 1;
                float frac = p.pathPos - (float)idx0;

                float cx = contour[idx0].x * (1.0f - frac) + contour[idx1].x * frac;
                float cy = contour[idx0].y * (1.0f - frac) + contour[idx1].y * frac;
                float nx = contour[idx0].nx * (1.0f - frac) + contour[idx1].nx * frac;
                float ny = contour[idx0].ny * (1.0f - frac) + contour[idx1].ny * frac;

                // Follow the contour ribbon with controlled lateral spread and organic wandering
                float wander = sinf(globalTime * p.wanderFreq + p.wanderPhase) * p.wanderAmp;
                float totalOffset = p.normalOffset + wander;

                p.origX = cx + nx * totalOffset;
                p.origY = cy + ny * totalOffset;

                // Fade out smoothly at the lower shoulders so particles never touch bottom of shirt
                if (cy >= (float)height * 0.82f) {
                    float f = 1.0f - (cy - (float)height * 0.82f) / ((float)height * 0.04f);
                    if (f < 0.0f) f = 0.0f;
                    p.a = (uint8_t)(245.0f * f);
                } else {
                    p.a = 245;
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
                } else {
                    if (relX < 0.46f) {
                        p.baseR = 0; p.baseG = 190; p.baseB = 245;
                    } else if (relX > 0.54f) {
                        p.baseR = 160; p.baseG = 65; p.baseB = 245;
                    } else {
                        float b = (relX - 0.46f) / 0.08f;
                        p.baseR = (uint8_t)(b * 160.0f);
                        p.baseG = (uint8_t)((1.0f - b) * 190.0f + b * 65.0f);
                        p.baseB = 245;
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
        } else if (p.flags & FLAG_PATH_LINE) {
            p.origX = p.baseX;
            p.origY = p.baseY;
            float shimmer = 0.92f + 0.08f * sinf(globalTime * 2.2f + p.pathPhase);
            p.a = (uint8_t)(240.0f * shimmer);
        } else if (p.flags & FLAG_RING_PIXEL) {
            p.origX = p.baseX;
            p.origY = p.baseY;
            float shimmer = 0.85f + 0.15f * sinf(globalTime * 2.2f + p.pathPhase * 2.0f);
            p.a = (uint8_t)(210.0f * shimmer);
        } else if (p.flags & FLAG_BACK_PIXEL) {
            p.origX = p.baseX;
            p.origY = p.baseY;
        } else {
            p.origX = p.baseX;
            p.origY = p.baseY;
        }

        if (isEntrancing && entranceTime < (p.startDelay + p.travelDuration)) {
            continue;
        }

        // Pointer repulsion field
        if (mouseX >= 0.0f && mouseY >= 0.0f) {
            float dx = p.x - mouseX;
            float dy = p.y - mouseY;
            float dist = sqrtf(dx * dx + dy * dy);

            if (dist < interactRadius && dist > 0.001f) {
                float normDist = 1.0f - dist / interactRadius;
                float force = normDist * normDist * maxPush * p.scatterFactor;
                float nx = dx / dist;
                float ny = dy / dist;

                p.applyForce(nx * force - ny * force * 0.22f, ny * force + nx * force * 0.22f);
            }
        }

        // Expanding shockwave ripple impulse across the entire canvas
        for (int s = 0; s < MAX_SHOCKWAVES; s++) {
            if (shockwaves[s].active) {
                float dx = p.x - shockwaves[s].x;
                float dy = p.y - shockwaves[s].y;
                float dist = sqrtf(dx * dx + dy * dy);
                float waveDiff = fabsf(dist - shockwaves[s].radius);
                float waveThickness = 16.0f;

                if (waveDiff < waveThickness && dist > 0.001f) {
                    float waveFalloff = 1.0f - (waveDiff / waveThickness);
                    float wavePush = shockwaves[s].force * waveFalloff * 4.2f * p.scatterFactor;
                    p.applyForce((dx / dist) * wavePush, (dy / dist) * wavePush);
                }
            }
        }

        // Snappy, organic elastic spring return to docked origin (Hooke's spring-damper)
        float targetX = p.origX;
        float targetY = p.origY;
        float sdx = targetX - p.x;
        float sdy = targetY - p.y;

        p.vx = (p.vx + sdx * 8.2f * dt) * 0.88f;
        p.vy = (p.vy + sdy * 8.2f * dt) * 0.88f;

        p.x += p.vx;
        p.y += p.vy;
    }

    // Dynamic Proximity Lighting Grid
    applyProximityLighting(
        particles,
        particleCount,
        width,
        height,
        lightIntensity,
        glowMultiplier,
        isDark,
        isEntrancing,
        lightMapR,
        lightMapG,
        lightMapB,
        lightMapW
    );

    updateBuffers();
}

#endif // PIXEL_PHYSICS_HPP
