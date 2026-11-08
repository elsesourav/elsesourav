#ifndef ATMOSPHERE_HPP
#define ATMOSPHERE_HPP

#include <stdint.h>
#include <math.h>

#define MAX_STARS 512
#define MAX_METEORS 24
#define MAX_FOG_PUFFS 32
#define MAX_SUNLIT_MOTES 160
#define MAX_VERTICES 4096

// Vertex types for fragment shader rendering
#define VERTEX_TYPE_STAR_PIXEL 0.0f // Crisp square micro-pixel (zero blur, identical to portrait engine)
#define VERTEX_TYPE_FOG_PUFF   1.0f // Soft daylight morning fog mist
#define VERTEX_TYPE_METEOR     2.0f // Sleek tapered shooting star / asteroid plasma streak
#define VERTEX_TYPE_MOTE       3.0f // Daylight golden stardust mote

// High-speed deterministic PRNG (Linear Congruential Generator)
class FastRng {
private:
    uint32_t state;
public:
    FastRng(uint32_t seed = 133742u) : state(seed) {}

    uint32_t next() {
        state = state * 1664525u + 1013904223u;
        return state;
    }

    float nextFloat() {
        return (float)(next() & 0x00FFFFFFu) / 16777216.0f;
    }

    float nextFloatRange(float minVal, float maxVal) {
        return minVal + nextFloat() * (maxVal - minVal);
    }
};

struct AtmosphereVertex {
    float x;     // NDC coordinate x (-1.0 to 1.0)
    float y;     // NDC coordinate y (-1.0 to 1.0)
    float r;     // Color Red (0.0 to 1.0)
    float g;     // Color Green (0.0 to 1.0)
    float b;     // Color Blue (0.0 to 1.0)
    float a;     // Color Alpha (0.0 to 1.0)
    float size;  // Point size in CSS pixels
    float type;  // Fragment shader point sprite rendering type
};

// Celestial Star for cosmic dark night sky:
// Crisp retro micro-pixels (zero blur), with delicate 5-pixel diamond cross stars
// and single twinkling micro-pixels matching the About page portrait side stars.
class CelestialStar {
public:
    float x;             // Normalized coordinate (0.0 to 1.0)
    float y;             // Normalized coordinate (0.0 to 1.0)
    float vx;            // Drift velocity x
    float vy;            // Drift velocity y
    float size;          // Base pixel size (1.6px - 2.6px)
    float baseAlpha;     // Base opacity (0.65f - 1.0f)
    float twinkleSpeed;  // Radians per second
    float twinkleOffset; // Phase offset
    int isCross;         // 1 = 5-pixel diamond cross star (center + 4 micro arms)
    float depth;         // Parallax depth multiplier (0.35 to 1.0)
    float colorType;     // Cosmic theme palette variation (0..1)

    CelestialStar() : x(0), y(0), vx(0), vy(0), size(2.0f), baseAlpha(0.85f),
                      twinkleSpeed(1.5f), twinkleOffset(0), isCross(0),
                      depth(0.6f), colorType(0) {}

    void init(FastRng& rng, int mobile) {
        x = rng.nextFloat();
        y = rng.nextFloat() * 0.76f; // Sky upper horizon
        float spdMult = mobile ? 0.00003f : 0.00006f;
        vx = (rng.nextFloat() - 0.5f) * spdMult;
        vy = (rng.nextFloat() - 0.5f) * (spdMult * 0.65f);

        colorType = rng.nextFloat();
        // ~18% are 5-pixel retro diamond cross stars on desktop, ~12% on mobile
        isCross = (!mobile && rng.nextFloat() < 0.18f) ? 1 : (mobile && rng.nextFloat() < 0.12f ? 1 : 0);

        // Crisp small pixel sizes: center pixel 2.0px-2.5px; single stars 1.5px-2.2px
        size = isCross ? rng.nextFloatRange(2.0f, 2.5f) : rng.nextFloatRange(1.5f, 2.2f);
        baseAlpha = isCross ? rng.nextFloatRange(0.85f, 1.0f) : rng.nextFloatRange(0.65f, 0.95f);
        twinkleSpeed = rng.nextFloatRange(1.2f, 3.2f);
        twinkleOffset = rng.nextFloatRange(0.0f, 6.28318f);

        depth = isCross ? 0.95f : rng.nextFloatRange(0.35f, 0.75f);
    }

    void update(float dt, float speedFactor, int reducedMotion) {
        if (!reducedMotion) {
            x += vx * (dt * 60.0f) * speedFactor;
            y += vy * (dt * 60.0f) * speedFactor;

            if (x < 0.0f) x += 1.0f;
            if (x > 1.0f) x -= 1.0f;
            if (y < 0.0f) y += 0.76f;
            if (y > 0.76f) y -= 0.76f;
        }
    }
};

// Shooting Star (Meteor / Asteroid):
// Small and medium sized (not very big!), sleek, elegant, and cosmic.
class ShootingStar {
public:
    int active;
    float x;             // Normalized coordinate (0.0 to 1.0)
    float y;             // Normalized coordinate (0.0 to 1.0)
    float length;        // Trail length in CSS pixels
    float speed;         // Speed in pixels per frame
    float angle;         // Trajectory angle in radians
    float alpha;         // Current opacity
    float life;          // Elapsed frames
    float maxLife;       // Total lifetime in frames
    float thickness;     // Nucleus size
    int isMedium;        // 0 = small, 1 = medium (never huge)

    ShootingStar() : active(0), x(0), y(0), length(0), speed(0),
                     angle(0), alpha(0), life(0), maxLife(0),
                     thickness(0), isMedium(0) {}

    void spawn(FastRng& rng, int mobile, float startX = -1.0f, float startY = -1.0f) {
        active = 1;
        // ~35% medium, ~65% small (elegant cosmic scale, never oversized)
        isMedium = (!mobile && rng.nextFloat() < 0.35f) ? 1 : (mobile && rng.nextFloat() < 0.20f ? 1 : 0);
        angle = (rng.nextFloatRange(20.0f, 32.0f)) * (3.14159265f / 180.0f);

        x = (startX >= 0.0f) ? startX : rng.nextFloatRange(0.08f, 0.88f);
        y = (startY >= 0.0f) ? startY : rng.nextFloatRange(0.03f, 0.30f);

        // Small and medium lengths:
        // Small: 45px - 75px
        // Medium: 80px - 125px
        length = isMedium ? rng.nextFloatRange(80.0f, 125.0f) : rng.nextFloatRange(45.0f, 75.0f);
        speed = isMedium ? rng.nextFloatRange(7.5f, 10.5f) : rng.nextFloatRange(5.5f, 8.5f);
        if (mobile) {
            length *= 0.80f;
            speed *= 0.85f;
        }

        alpha = 1.0f;
        life = 0.0f;
        maxLife = isMedium ? rng.nextFloatRange(32.0f, 46.0f) : rng.nextFloatRange(24.0f, 36.0f);
        // Small and medium thickness: 1.2px - 1.8px (small), 1.9px - 2.6px (medium)
        thickness = isMedium ? rng.nextFloatRange(1.9f, 2.6f) : rng.nextFloatRange(1.2f, 1.8f);
    }

    void update(float dt, float speedFactor) {
        if (!active) return;

        float step = (dt * 60.0f) * speedFactor;
        life += step;

        if (life >= maxLife) {
            active = 0;
            alpha = 0.0f;
        } else {
            // Smooth flare-in and gradual dissipation
            float progress = life / maxLife;
            if (progress < 0.15f) {
                alpha = progress / 0.15f;
            } else if (progress < 0.65f) {
                alpha = 1.0f;
            } else {
                float rem = (1.0f - progress) / 0.35f;
                alpha = rem * rem;
            }
        }
    }
};

// Volumetric Day Fog Cloud Puff (whisper-thin soft morning mist)
class FogPuff {
public:
    float x;             // Normalized coordinate (0.0 to 1.0)
    float y;             // Normalized coordinate (0.0 to 1.0)
    float vx;            // Drift velocity
    float vy;
    float radius;        // Radius in pixels
    float baseAlpha;     // Base opacity
    float phase;         // Sine pulsation phase
    float pulseSpeed;    // Frequency

    FogPuff() : x(0), y(0), vx(0), vy(0), radius(0), baseAlpha(0), phase(0), pulseSpeed(0) {}

    void init(FastRng& rng, int mobile) {
        x = rng.nextFloat();
        y = rng.nextFloatRange(0.35f, 0.85f);
        vx = -rng.nextFloatRange(0.00010f, 0.00022f);
        vy = (rng.nextFloat() - 0.5f) * 0.00004f;
        radius = (mobile ? 80.0f : 120.0f) + rng.nextFloatRange(0.0f, mobile ? 50.0f : 90.0f);
        baseAlpha = rng.nextFloatRange(0.025f, 0.050f);
        phase = rng.nextFloatRange(0.0f, 6.28318f);
        pulseSpeed = rng.nextFloatRange(0.004f, 0.010f);
    }

    void update(float dt, float speedFactor, int reducedMotion) {
        if (!reducedMotion) {
            x += vx * (dt * 60.0f) * speedFactor;
            y += vy * (dt * 60.0f) * speedFactor;
            phase += pulseSpeed * (dt * 60.0f) * speedFactor;

            if (x < -0.2f) {
                x = 1.2f;
            }
        }
    }
};

// Sunlit Mote / Golden Shimmer Dust
class SunlitMote {
public:
    float x;
    float y;
    float vx;
    float vy;
    float radius;
    float baseAlpha;
    float pulse;
    int isGolden;

    SunlitMote() : x(0), y(0), vx(0), vy(0), radius(0), baseAlpha(0), pulse(0), isGolden(0) {}

    void init(FastRng& rng, int /*mobile*/) {
        x = rng.nextFloat();
        y = rng.nextFloat();
        vx = -rng.nextFloatRange(0.00008f, 0.00020f);
        vy = -rng.nextFloatRange(0.00005f, 0.00018f);
        radius = rng.nextFloatRange(1.8f, 3.2f);
        baseAlpha = rng.nextFloatRange(0.50f, 0.85f);
        pulse = rng.nextFloatRange(0.0f, 6.28318f);
        isGolden = (rng.nextFloat() > 0.30f) ? 1 : 0;
    }

    void update(float dt, float speedFactor, int reducedMotion) {
        if (!reducedMotion) {
            x += vx * (dt * 60.0f) * speedFactor;
            y += vy * (dt * 60.0f) * speedFactor;
            pulse += 0.026f * (dt * 60.0f) * speedFactor;

            if (x < 0.0f) x += 1.0f;
            if (y < 0.0f) y += 1.0f;
        }
    }
};

#endif // ATMOSPHERE_HPP
