#ifndef PIXEL_HPP
#define PIXEL_HPP

#include <stdint.h>
#include <math.h>

// Pixel state flags
#define FLAG_NONE            0
#define FLAG_BACK_PIXEL      (1 << 0) // Back layer: ambient specks
#define FLAG_RING_PIXEL      (1 << 1) // Back layer: halo ring
#define FLAG_STAR_PIXEL      (1 << 2) // Back layer: animated pixel stars
#define FLAG_ORBIT_PIXEL     (1 << 3) // Back layer: animated pixel circles
#define FLAG_IMAGE_PIXEL     (1 << 4) // Middle layer: authentic portrait pixels
#define FLAG_TOP_PARTICLE    (1 << 5) // Top layer: light up particles
#define FLAG_EDGE_FLOW       (1 << 6) // Top layer: silhouette contour path

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

    void applyBaseTopColor(int isDark, float relX, float relY, float lightIntensity = 0.38f) {
        if (!active || baseA == 0 || lightIntensity <= 0.02f) return;

        // Strictly protect facial features (eyes, nose, mouth, cheeks)
        // Authentic natural photographic skin tones
        float faceDistX = fabsf(relX - 0.50f);
        if (faceDistX < 0.22f && relY >= 0.22f && relY <= 0.54f) {
            return; // zero contamination on face features
        }

        float leftWeight = 0.0f;
        float rightWeight = 0.0f;

        // 1. Top of Head & Hair Crown: subtle edge rim only on outermost silhouette
        if (relY <= 0.38f) {
            // In light mode, preserve 100% natural authentic photographic dark hair
            // The top glow is provided by the floating glowing particles & halo!
            if (!isDark) {
                return;
            }
            float topDistX = fabsf(relX - 0.50f);
            if (topDistX > 0.16f) {
                float crownWeight = ((topDistX - 0.16f) / 0.34f) * lightIntensity * 1.8f;
                if (relX < 0.50f) {
                    leftWeight = crownWeight;
                } else {
                    rightWeight = crownWeight;
                }
            }
        } else if (relY <= 0.95f) {
            // 2. Shoulders & Lateral Arms down both sides
            // Only on the outer edges (arms/sleeves), leaving the chest/shirt center clean
            if (relX < 0.35f) {
                float distFromCenter = (0.35f - relX) / 0.35f;
                leftWeight = powf(distFromCenter, 0.75f) * lightIntensity * 2.8f;
            } else if (relX > 0.65f) {
                float distFromCenter = (relX - 0.65f) / 0.35f;
                rightWeight = powf(distFromCenter, 0.75f) * lightIntensity * 2.8f;
            }
        }
        // At the very bottom hem of the shirt (relY > 0.95f), leftWeight and rightWeight remain 0.0f:
        // Zero glow at bottom edge, completely clean & dark!

        if (leftWeight > 1.0f) leftWeight = 1.0f;
        if (rightWeight > 1.0f) rightWeight = 1.0f;

        float cr = (float)baseR;
        float cg = (float)baseG;
        float cb = (float)baseB;

        if (isDark) {
            if (leftWeight > 0.01f) {
                // Electric Cyan: vibrant cyber glow illuminating dark hoodie fabric
                cr = cr * (1.0f - leftWeight * 0.25f) + 0.0f * leftWeight;
                cg = cg * (1.0f - leftWeight * 0.25f) + 242.0f * leftWeight;
                cb = cb * (1.0f - leftWeight * 0.25f) + 255.0f * leftWeight;
            } else if (rightWeight > 0.01f) {
                // Cyber Neon Violet/Purple
                cr = cr * (1.0f - rightWeight * 0.25f) + 195.0f * rightWeight;
                cg = cg * (1.0f - rightWeight * 0.25f) + 85.0f * rightWeight;
                cb = cb * (1.0f - rightWeight * 0.25f) + 255.0f * rightWeight;
            }
        } else {
            // Light Mode: Clean luminous cyber cyan & cyber violet rim tint on hoodie edges
            if (leftWeight > 0.01f) {
                cr = cr * (1.0f - leftWeight * 0.25f) + 0.0f * (leftWeight * 0.25f);
                cg = cg * (1.0f - leftWeight * 0.25f) + 200.0f * (leftWeight * 0.25f);
                cb = cb * (1.0f - leftWeight * 0.25f) + 245.0f * (leftWeight * 0.25f);
            } else if (rightWeight > 0.01f) {
                cr = cr * (1.0f - rightWeight * 0.25f) + 160.0f * (rightWeight * 0.25f);
                cg = cg * (1.0f - rightWeight * 0.25f) + 70.0f * (rightWeight * 0.25f);
                cb = cb * (1.0f - rightWeight * 0.25f) + 245.0f * (rightWeight * 0.25f);
            }
        }

        if (cr > 255.0f) cr = 255.0f;
        if (cg > 255.0f) cg = 255.0f;
        if (cb > 255.0f) cb = 255.0f;

        r = (uint8_t)cr;
        g = (uint8_t)cg;
        b = (uint8_t)cb;
    }
};

#endif // PIXEL_HPP
