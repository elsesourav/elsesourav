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
#define FLAG_BACK_PIXEL      (1 << 0) // Back layer: behind subject
#define FLAG_RING_PIXEL      (1 << 1) // Back layer: halo ring
#define FLAG_IMAGE_PIXEL     (1 << 2) // Middle layer: authentic portrait pixels
#define FLAG_TOP_PARTICLE    (1 << 3) // Top layer: light up particles
#define FLAG_EDGE_FLOW       (1 << 4) // Top layer: silhouette contour path
#define FLAG_PATH_LINE       (1 << 5) // Top layer: continuous smooth edge path line

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

    // All glow is computed dynamically in real-time from the moving glow particles
    // preserving authentic natural photograph hair texture and smooth light spread.
};

#endif // PIXEL_HPP
