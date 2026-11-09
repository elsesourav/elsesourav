#ifndef PIXEL_LIGHTING_HPP
#define PIXEL_LIGHTING_HPP

#include "pixel.hpp"
#include <stdint.h>
#include <string.h>
#include <math.h>

// Dynamic Proximity Lighting on nearby actual image pixels:
// Lights up immediately as soon as the image and particles are placed.
inline void applyProximityLighting(
    Pixel* particles,
    int particleCount,
    int w,
    int h,
    float lightIntensity,
    float glowMultiplier,
    float glowDistance,
    int isDark,
    float* lightMapR,
    float* lightMapG,
    float* lightMapB,
    float* lightMapW
) {
    float effLight = lightIntensity;
    int totalCells = w * h;

    memset(lightMapW, 0, totalCells * sizeof(float));
    memset(lightMapR, 0, totalCells * sizeof(float));
    memset(lightMapG, 0, totalCells * sizeof(float));
    memset(lightMapB, 0, totalCells * sizeof(float));

    float lightRadius = 7.5f * glowMultiplier * (glowDistance > 0.05f ? glowDistance : 1.0f);
    int iRad = (int)ceilf(lightRadius);
    float rSq = lightRadius * lightRadius;

    // 1. Accumulate light immediately from active moving glow particles along the contour
    if (effLight > 0.01f) {
        for (int i = 0; i < particleCount; i++) {
            const Pixel& mp = particles[i];
            if (!mp.active || !(mp.flags & FLAG_EDGE_FLOW) || mp.a == 0) continue;

            int pcx = (int)roundf(mp.x);
            int pcy = (int)roundf(mp.y);

            int minX = pcx - iRad; if (minX < 0) minX = 0;
            int maxX = pcx + iRad; if (maxX >= w) maxX = w - 1;
            int minY = pcy - iRad; if (minY < 0) minY = 0;
            int maxY = pcy + iRad; if (maxY >= h) maxY = h - 1;

            for (int y = minY; y <= maxY; y++) {
                float dy = (float)y - mp.y;
                for (int x = minX; x <= maxX; x++) {
                    float dx = (float)x - mp.x;
                    float dSq = dx * dx + dy * dy;
                    if (dSq < rSq) {
                        float dist = sqrtf(dSq);
                        float norm = 1.0f - dist / lightRadius;
                        // Smooth cubic falloff curve keeps starlight luminous and natural
                        float weight = norm * (0.35f + 0.65f * norm);

                        int idx = y * w + x;
                        lightMapR[idx] += (float)mp.r * weight;
                        lightMapG[idx] += (float)mp.g * weight;
                        lightMapB[idx] += (float)mp.b * weight;
                        lightMapW[idx] += weight;
                    }
                }
            }
        }
    }

    // 2. Update actual image pixels based on their current color + glow color + number/closeness of nearest pixels
    for (int i = 0; i < particleCount; i++) {
        Pixel& p = particles[i];
        if (!p.active) continue;

        if (p.flags & FLAG_IMAGE_PIXEL) {
            int ix = (int)roundf(p.origX);
            int iy = (int)roundf(p.origY);
            if (ix < 0) ix = 0; if (ix >= w) ix = w - 1;
            if (iy < 0) iy = 0; if (iy >= h) iy = h - 1;

            int cellIdx = iy * w + ix;
            float totalW = lightMapW[cellIdx];

            if (totalW <= 0.001f || effLight <= 0.01f) {
                // Not near moving glow pixels -> keep 100% natural base photograph color
                p.r = p.baseR;
                p.g = p.baseG;
                p.b = p.baseB;
            } else {
                // Near moving glow pixels -> calculate light up based on:
                // - current color (p.baseR, p.baseG, p.baseB)
                // - glow pixel color (avgR, avgG, avgB)
                // - number and distance of nearest pixels (totalW)
                float avgR = lightMapR[cellIdx] / totalW;
                float avgG = lightMapG[cellIdx] / totalW;
                float avgB = lightMapB[cellIdx] / totalW;

                float densityFactor = totalW / (totalW + 1.5f);
                float intensity = densityFactor * effLight * glowMultiplier;

                if (isDark) {
                    // Dark mode: Luminous screen glow lighting
                    float addR = avgR * intensity * 0.75f;
                    float addG = avgG * intensity * 0.75f;
                    float addB = avgB * intensity * 0.75f;

                    float litR = (float)p.baseR + addR;
                    float litG = (float)p.baseG + addG;
                    float litB = (float)p.baseB + addB;

                    p.r = (uint8_t)(litR > 255.0f ? 255.0f : litR);
                    p.g = (uint8_t)(litG > 255.0f ? 255.0f : litG);
                    p.b = (uint8_t)(litB > 255.0f ? 255.0f : litB);
                } else {
                    // Light mode: Vibrant atmospheric tint lighting
                    float tintR = avgR * intensity * 0.65f;
                    float tintG = avgG * intensity * 0.65f;
                    float tintB = avgB * intensity * 0.65f;

                    float litR = (float)p.baseR * (1.0f - intensity * 0.20f) + tintR;
                    float litG = (float)p.baseG * (1.0f - intensity * 0.20f) + tintG;
                    float litB = (float)p.baseB * (1.0f - intensity * 0.20f) + tintB;

                    p.r = (uint8_t)(litR > 255.0f ? 255.0f : litR);
                    p.g = (uint8_t)(litG > 255.0f ? 255.0f : litG);
                    p.b = (uint8_t)(litB > 255.0f ? 255.0f : litB);
                }
            }
        }
    }
}

#endif // PIXEL_LIGHTING_HPP
