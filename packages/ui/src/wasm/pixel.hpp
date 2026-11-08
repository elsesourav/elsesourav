#ifndef PIXEL_HPP
#define PIXEL_HPP

#include <stdint.h>
#include <math.h>

// Fast deterministic pseudo-random generator
static inline float pseudoRand(float seed) {
    float val = sinf(seed * 12.9898f + 78.233f) * 43758.5453f;
    return val - floorf(val);
}

// Pixel state flags
#define FLAG_NONE            0
#define FLAG_BACK_PIXEL      (1 << 0) // Back layer: ambient specks
#define FLAG_RING_PIXEL      (1 << 1) // Back layer: halo ring
#define FLAG_STAR_PIXEL      (1 << 2) // Back layer: animated pixel stars
#define FLAG_ORBIT_PIXEL     (1 << 3) // Back layer: animated pixel circles
#define FLAG_IMAGE_PIXEL     (1 << 4) // Middle layer: authentic portrait pixels
#define FLAG_TOP_PARTICLE    (1 << 5) // Top layer: light up particles
#define FLAG_EDGE_FLOW       (1 << 6) // Top layer: silhouette contour path
#define FLAG_PATH_LINE       (1 << 7) // Top layer: continuous smooth edge path line

class Pixel {
public:
    float x;
    float y;
    float baseX;
    float baseY;
    float origX;
    float origY;
    float vx;
    float vy;

    uint8_t baseR;
    uint8_t baseG;
    uint8_t baseB;
    uint8_t baseA;

    uint8_t r;
    uint8_t g;
    uint8_t b;
    uint8_t a;

    float size;
    float targetSize;
    float startX;
    float startY;
    float startDelay;
    float travelDuration;
    float curveSeed;
    uint32_t flags;
    float pathPhase;
    float pathSpeed;
    float pathPos;
    float pathDir;
    float normalOffset;
    float wanderPhase;
    float wanderAmp;
    float wanderFreq;
    float scatterFactor;
    int active;

    Pixel() {
        reset();
    }

    void reset() {
        x = baseX = origX = 0.0f;
        y = baseY = origY = 0.0f;
        vx = vy = 0.0f;
        baseR = baseG = baseB = baseA = 0;
        r = g = b = a = 0;
        size = targetSize = 2.6f;
        startX = startY = 0.0f;
        startDelay = 0.0f;
        travelDuration = 1.0f;
        curveSeed = 0.0f;
        flags = FLAG_NONE;
        pathPhase = 0.0f;
        pathSpeed = 1.0f;
        pathPos = 0.0f;
        pathDir = 1.0f;
        normalOffset = 0.0f;
        wanderPhase = 0.0f;
        wanderAmp = 1.0f;
        wanderFreq = 1.0f;
        scatterFactor = 1.0f;
        active = 0;
    }

    void init(float bx, float by, uint8_t br, uint8_t bg, uint8_t bb, uint8_t ba, float sz, uint32_t fl) {
        baseX = origX = x = bx;
        baseY = origY = y = by;
        vx = vy = 0.0f;

        baseR = r = br;
        baseG = g = bg;
        baseB = b = bb;
        baseA = a = ba;

        size = targetSize = sz;
        startX = startY = 0.0f;
        startDelay = 0.0f;
        flags = fl;
        pathPhase = (bx * 12.9898f + by * 78.233f);
        pathSpeed = 0.8f + fmodf(fabsf(pathPhase * 0.15f), 1.2f);
        pathPos = 0.0f;
        pathDir = 1.0f;
        normalOffset = 0.0f;
        wanderPhase = pathPhase * 0.4f;
        wanderAmp = 1.0f;
        wanderFreq = 1.5f;
        scatterFactor = 0.85f + fmodf(fabsf(pathPhase * 0.35f), 1.3f);
        active = 1;
    }

    void applyForce(float fx, float fy) {
        vx += fx;
        vy += fy;
    }

    void updatePhysics(float dt, float springK, float damping) {
        if (!active) return;
        // Hooke's spring restitution
        float fx = (origX - x) * springK;
        float fy = (origY - y) * springK;

        vx = (vx + fx * dt) * damping;
        vy = (vy + fy * dt) * damping;

        // Smooth speed clamping for silky, calm, slow motion (no jarring jumps)
        float spdSq = vx * vx + vy * vy;
        float maxSpd = 1.6f;
        if (spdSq > maxSpd * maxSpd) {
            float spd = sqrtf(spdSq);
            vx = (vx / spd) * maxSpd;
            vy = (vy / spd) * maxSpd;
        }

        x += vx;
        y += vy;
    }

    void applyBaseTopHairGlow(int isDark, float relX, float relY, float lightIntensity = 0.38f) {
        if (!active || baseA == 0 || lightIntensity <= 0.02f) return;

        // Top of Head & Hair Crown: ALWAYS GLOW!
        if (relY <= 0.36f) {
            float topDistX = fabsf(relX - 0.50f);
            if (topDistX > 0.06f) {
                float crownWeight = ((topDistX - 0.06f) / 0.44f) * lightIntensity * 2.2f;
                if (crownWeight > 1.0f) crownWeight = 1.0f;

                uint8_t gr, gg, gb;
                if (isDark) {
                    if (relX < 0.48f) {
                        gr = 0; gg = 220; gb = 255;
                    } else if (relX > 0.52f) {
                        gr = 185; gg = 90; gb = 250;
                    } else {
                        float b = (relX - 0.48f) / 0.04f;
                        gr = (uint8_t)(b * 185.0f);
                        gg = (uint8_t)((1.0f - b) * 220.0f + b * 90.0f);
                        gb = 255;
                    }
                    float addR = (float)gr * crownWeight * 0.90f;
                    float addG = (float)gg * crownWeight * 0.90f;
                    float addB = (float)gb * crownWeight * 0.90f;
                    float nr = (float)baseR + addR;
                    float ng = (float)baseG + addG;
                    float nb = (float)baseB + addB;
                    r = baseR = (uint8_t)(nr > 255.0f ? 255.0f : nr);
                    g = baseG = (uint8_t)(ng > 255.0f ? 255.0f : ng);
                    b = baseB = (uint8_t)(nb > 255.0f ? 255.0f : nb);
                } else {
                    if (relX < 0.48f) {
                        gr = 0; gg = 175; gb = 240;
                    } else if (relX > 0.52f) {
                        gr = 150; gg = 60; gb = 240;
                    } else {
                        float b = (relX - 0.48f) / 0.04f;
                        gr = (uint8_t)(b * 150.0f);
                        gg = (uint8_t)((1.0f - b) * 175.0f + b * 60.0f);
                        gb = 240;
                    }
                    float tintR = (float)gr * crownWeight * 0.70f;
                    float tintG = (float)gg * crownWeight * 0.70f;
                    float tintB = (float)gb * crownWeight * 0.70f;
                    float nr = (float)baseR * (1.0f - crownWeight * 0.25f) + tintR;
                    float ng = (float)baseG * (1.0f - crownWeight * 0.25f) + tintG;
                    float nb = (float)baseB * (1.0f - crownWeight * 0.25f) + tintB;
                    r = baseR = (uint8_t)(nr > 255.0f ? 255.0f : nr);
                    g = baseG = (uint8_t)(ng > 255.0f ? 255.0f : ng);
                    b = baseB = (uint8_t)(nb > 255.0f ? 255.0f : nb);
                }
            }
        }
    }
};

#endif // PIXEL_HPP
