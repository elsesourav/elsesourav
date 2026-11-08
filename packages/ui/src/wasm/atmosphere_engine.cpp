#include "atmosphere_engine.hpp"
#include <string.h>

AtmosphereEngine::AtmosphereEngine()
    : width(1280),
      height(800),
      dpr(1.0f),
      isDark(1),
      isMobile(0),
      globalTime(0.0f),
      densityMultiplier(1.0f),
      speedMultiplier(1.0f),
      meteorFrequencyMultiplier(1.0f),
      reducedMotion(0),
      targetParallaxX(0.0f),
      targetParallaxY(0.0f),
      currentParallaxX(0.0f),
      currentParallaxY(0.0f),
      rng(421337u),
      starCount(0),
      meteorCooldown(2.5f),
      fogCount(0),
      moteCount(0),
      vertexCount(0) {}

AtmosphereEngine::~AtmosphereEngine() {}

void AtmosphereEngine::populateEntities() {
    // 1. Dark Mode Celestial Stars (Crisp retro micro-pixels)
    int baseStars = isMobile ? 80 : 200;
    starCount = (int)(baseStars * densityMultiplier);
    if (starCount < 25) starCount = 25;
    if (starCount > MAX_STARS) starCount = MAX_STARS;

    for (int i = 0; i < starCount; ++i) {
        stars[i].init(rng, isMobile);
    }

    // Reset meteors pool
    for (int i = 0; i < MAX_METEORS; ++i) {
        meteors[i].active = 0;
    }
    meteorCooldown = (isMobile ? 3.0f : 2.0f) / (meteorFrequencyMultiplier > 0.1f ? meteorFrequencyMultiplier : 1.0f);

    // 2. Light Mode Fog Puffs & Sunlit Motes
    int basePuffs = isMobile ? 8 : 16;
    fogCount = (int)(basePuffs * densityMultiplier);
    if (fogCount < 4) fogCount = 4;
    if (fogCount > MAX_FOG_PUFFS) fogCount = MAX_FOG_PUFFS;

    for (int i = 0; i < fogCount; ++i) {
        fogPuffs[i].init(rng, isMobile);
    }

    int baseMotes = isMobile ? 28 : 60;
    moteCount = (int)(baseMotes * densityMultiplier);
    if (moteCount < 10) moteCount = 10;
    if (moteCount > MAX_SUNLIT_MOTES) moteCount = MAX_SUNLIT_MOTES;

    for (int i = 0; i < moteCount; ++i) {
        motes[i].init(rng, isMobile);
    }
}

void AtmosphereEngine::init(int w, int h, int dark, int mobile, float densityMult, float speedMult, float meteorFreqMult) {
    width = (w > 0) ? w : 1280;
    height = (h > 0) ? h : 800;
    dpr = 1.0f;
    isDark = dark;
    isMobile = mobile;
    densityMultiplier = (densityMult > 0.1f) ? densityMult : 1.0f;
    speedMultiplier = (speedMult > 0.1f) ? speedMult : 1.0f;
    meteorFrequencyMultiplier = (meteorFreqMult >= 0.0f) ? meteorFreqMult : 1.0f;
    reducedMotion = 0;

    targetParallaxX = 0.0f;
    targetParallaxY = 0.0f;
    currentParallaxX = 0.0f;
    currentParallaxY = 0.0f;
    globalTime = 0.0f;

    populateEntities();
}

void AtmosphereEngine::resize(int w, int h, float newDpr) {
    width = (w > 0) ? w : 1280;
    height = (h > 0) ? h : 800;
    dpr = (newDpr > 0.5f) ? newDpr : 1.0f;
    int wasMobile = isMobile;
    isMobile = (width < 768) ? 1 : 0;

    if (wasMobile != isMobile) {
        populateEntities();
    }
}

void AtmosphereEngine::setTheme(int dark) {
    if (isDark != dark) {
        isDark = dark;
        populateEntities();
    }
}

void AtmosphereEngine::setDensity(float mult) {
    float validMult = (mult > 0.1f) ? mult : 1.0f;
    if (fabsf(densityMultiplier - validMult) > 0.05f) {
        densityMultiplier = validMult;
        populateEntities();
    }
}

void AtmosphereEngine::setSpeed(float mult) {
    speedMultiplier = (mult > 0.05f) ? mult : 1.0f;
}

void AtmosphereEngine::setMeteorFrequency(float mult) {
    meteorFrequencyMultiplier = (mult >= 0.0f) ? mult : 1.0f;
}

void AtmosphereEngine::setReducedMotion(int reduced) {
    reducedMotion = reduced;
}

void AtmosphereEngine::setParallaxTarget(float nx, float ny) {
    // Normal input between -0.5 and +0.5
    float maxParallaxX = isMobile ? 12.0f : 24.0f;
    float maxParallaxY = isMobile ? 8.0f : 16.0f;
    targetParallaxX = nx * maxParallaxX;
    targetParallaxY = ny * maxParallaxY;
}

void AtmosphereEngine::triggerMeteor(float x, float y, float length, float speed, float angle, int isBig) {
    for (int i = 0; i < MAX_METEORS; ++i) {
        if (!meteors[i].active) {
            ShootingStar& m = meteors[i];
            m.active = 1;
            m.isMedium = isBig ? 1 : 0;
            m.x = (x >= 0.0f && x <= 1.0f) ? x : rng.nextFloatRange(0.08f, 0.88f);
            m.y = (y >= 0.0f && y <= 1.0f) ? y : rng.nextFloatRange(0.03f, 0.30f);
            m.length = (length > 10.0f) ? length : (m.isMedium ? 105.0f : 65.0f);
            m.speed = (speed > 1.0f) ? speed : (m.isMedium ? 9.0f : 6.8f);
            m.angle = (angle != 0.0f) ? angle : (26.0f * (3.14159265f / 180.0f));
            m.alpha = 1.0f;
            m.life = 0.0f;
            m.maxLife = m.isMedium ? 40.0f : 28.0f;
            m.thickness = m.isMedium ? 2.2f : 1.5f;
            return;
        }
    }
}

inline void AtmosphereEngine::emitVertex(float ndcX, float ndcY, float r, float g, float b, float a, float size, float type) {
    if (vertexCount >= MAX_VERTICES) return;
    AtmosphereVertex& v = vertexBuffer[vertexCount++];
    v.x = ndcX;
    v.y = ndcY;
    v.r = r;
    v.g = g;
    v.b = b;
    v.a = a;
    v.size = size;
    v.type = type;
}

void AtmosphereEngine::update(float dt) {
    if (dt > 0.1f) dt = 0.1f;
    if (dt <= 0.0f) dt = 0.016f;

    globalTime += dt;
    vertexCount = 0;

    // Smooth parallax dampening
    float parallaxSmoothing = 0.06f * (dt * 60.0f);
    if (parallaxSmoothing > 0.5f) parallaxSmoothing = 0.5f;
    currentParallaxX += (targetParallaxX - currentParallaxX) * parallaxSmoothing;
    currentParallaxY += (targetParallaxY - currentParallaxY) * parallaxSmoothing;

    float invW = 1.0f / (float)width;
    float invH = 1.0f / (float)height;

    if (isDark) {
        // ── 1. Cosmic Stars: Crisp Micro-Pixels & 5-Pixel Diamond Crosses (Zero Blur) ──
        for (int i = 0; i < starCount; ++i) {
            CelestialStar& star = stars[i];
            star.update(dt, speedMultiplier, reducedMotion);

            // Gentle micro-floating identical to About portrait side stars
            float driftX = sinf(globalTime * 0.7f + star.twinkleOffset) * 0.8f;
            float driftY = cosf(globalTime * 0.5f + star.twinkleOffset) * 0.8f;

            float px = star.x * width + currentParallaxX * star.depth + driftX;
            float py = star.y * height + currentParallaxY * star.depth + driftY;

            // Convert screen coordinates to NDC [-1.0, 1.0]
            float ndcX = (px * invW) * 2.0f - 1.0f;
            float ndcY = 1.0f - (py * invH) * 2.0f;

            // Off-screen culling
            if (ndcX < -1.15f || ndcX > 1.15f || ndcY < -1.15f || ndcY > 1.15f) {
                continue;
            }

            // Twinkle glow animation: smooth sinusoidal opacity modulation (zero spatial blur)
            float twinkle = reducedMotion ? 1.0f : (0.35f + 0.65f * sinf(globalTime * star.twinkleSpeed * speedMultiplier + star.twinkleOffset));
            float alpha = star.baseAlpha * twinkle;
            if (alpha < 0.02f) continue;

            // Cosmic theme star palette distribution
            float r = 1.0f, g = 1.0f, b = 1.0f;
            if (star.colorType < 0.55f) {
                // Diamond pure icy white
                r = 1.0f; g = 1.0f; b = 1.0f;
            } else if (star.colorType < 0.78f) {
                // Icy cyan tint (matching ElseSourav cyan accent)
                r = 0.68f; g = 0.90f; b = 1.0f;
            } else if (star.colorType < 0.92f) {
                // Ethereal soft lavender tint (matching ElseSourav purple accent)
                r = 0.85f; g = 0.78f; b = 1.0f;
            } else {
                // Warm delicate starlight amber
                r = 1.0f; g = 0.92f; b = 0.75f;
            }

            // Center star pixel: crisp square micro-pixel (VERTEX_TYPE_STAR_PIXEL)
            float centerSize = star.size * dpr;
            emitVertex(ndcX, ndcY, r, g, b, alpha, centerSize, VERTEX_TYPE_STAR_PIXEL);

            // 5-pixel retro cross star (identical to About portrait side stars)
            if (star.isCross) {
                float armDist = star.size * 0.78f;
                float armSize = star.size * 0.55f * dpr;
                float armAlpha = alpha * 0.82f;

                static const float ARMS[4][2] = {{-1.0f, 0.0f}, {1.0f, 0.0f}, {0.0f, -1.0f}, {0.0f, 1.0f}};
                for (int a = 0; a < 4; ++a) {
                    float apx = px + ARMS[a][0] * armDist;
                    float apy = py + ARMS[a][1] * armDist;
                    float aNdcX = (apx * invW) * 2.0f - 1.0f;
                    float aNdcY = 1.0f - (apy * invH) * 2.0f;
                    emitVertex(aNdcX, aNdcY, r, g, b, armAlpha, armSize, VERTEX_TYPE_STAR_PIXEL);
                }
            }
        }

        // ── 2. Shooting Stars (Meteors & Asteroids: Small and Medium, Sleek) ──
        if (!reducedMotion && meteorFrequencyMultiplier > 0.02f) {
            meteorCooldown -= dt;
            if (meteorCooldown <= 0.0f) {
                // Find inactive slot
                for (int i = 0; i < MAX_METEORS; ++i) {
                    if (!meteors[i].active) {
                        meteors[i].spawn(rng, isMobile);
                        break;
                    }
                }
                float baseInterval = isMobile ? 3.0f : 2.2f;
                float randInterval = isMobile ? 3.5f : 2.8f;
                meteorCooldown = (baseInterval + rng.nextFloat() * randInterval) / meteorFrequencyMultiplier;
            }
        }

        for (int i = 0; i < MAX_METEORS; ++i) {
            ShootingStar& m = meteors[i];
            if (!m.active) continue;

            m.update(dt, speedMultiplier);
            if (!m.active) continue;

            // Advance coordinates in pixels
            float moveDist = m.speed * (dt * 60.0f) * speedMultiplier;
            m.x += (cosf(m.angle) * moveDist) * invW;
            m.y += (sinf(m.angle) * moveDist) * invH;

            // Off-screen cleanup
            if (m.x > 1.25f || m.y > 0.95f) {
                m.active = 0;
                continue;
            }

            float headPx = m.x * width + currentParallaxX * 0.9f;
            float headPy = m.y * height + currentParallaxY * 0.9f;
            float headNdcX = (headPx * invW) * 2.0f - 1.0f;
            float headNdcY = 1.0f - (headPy * invH) * 2.0f;

            if (headNdcX < -1.2f || headNdcX > 1.2f || headNdcY < -1.2f || headNdcY > 1.2f) {
                continue;
            }

            // Head nucleus: sleek, modest, elegant (no massive corona aura)
            float headSize = m.thickness * 1.35f * dpr;
            emitVertex(headNdcX, headNdcY, 1.0f, 1.0f, 1.0f, m.alpha, headSize, VERTEX_TYPE_METEOR);

            // Small and medium sleek trail streak (continuous, smoothly overlapping)
            int trailSegments = m.isMedium ? 40 : 28;
            float stepLen = m.length / (float)trailSegments;
            float cosA = cosf(m.angle);
            float sinA = sinf(m.angle);

            for (int s = 1; s <= trailSegments; ++s) {
                float distBack = s * stepLen;
                float segPx = headPx - (cosA * distBack);
                float segPy = headPy - (sinA * distBack);

                float segNdcX = (segPx * invW) * 2.0f - 1.0f;
                float segNdcY = 1.0f - (segPy * invH) * 2.0f;

                float falloff = 1.0f - ((float)s / (float)(trailSegments + 1));
                float segAlpha = m.alpha * (0.25f + 0.75f * falloff);
                // Overlapping thickness: smoothly narrows to a fine point
                float segSize = (m.thickness * (0.75f + 0.65f * falloff)) * dpr;

                // Electric cyan-lavender-white streak
                float trailR = 0.85f + 0.15f * falloff;
                float trailG = 0.92f + 0.08f * falloff;
                float trailB = 1.0f;
                emitVertex(segNdcX, segNdcY, trailR, trailG, trailB, segAlpha, segSize, VERTEX_TYPE_METEOR);

                // Subtle delicate stardust spark every 8 segments
                if (s % 8 == 0 && falloff > 0.20f) {
                    float sparkJitter = (s % 2 == 0 ? 1.0f : -1.0f) * (m.thickness * 0.7f);
                    float sparkPx = segPx - (sinA * sparkJitter);
                    float sparkPy = segPy + (cosA * sparkJitter);
                    float sparkNdcX = (sparkPx * invW) * 2.0f - 1.0f;
                    float sparkNdcY = 1.0f - (sparkPy * invH) * 2.0f;
                    emitVertex(sparkNdcX, sparkNdcY, 0.92f, 0.96f, 1.0f, segAlpha * 0.55f, (m.thickness * 0.65f) * dpr, VERTEX_TYPE_METEOR);
                }
            }
        }
    } else {
        // ── 3. Daylight Atmosphere: Volumetric Cloud Puffs & Sunlit Motes ──
        for (int i = 0; i < fogCount; ++i) {
            FogPuff& puff = fogPuffs[i];
            puff.update(dt, speedMultiplier, reducedMotion);

            float px = puff.x * width + currentParallaxX * 0.4f;
            float py = puff.y * height + currentParallaxY * 0.4f;

            float ndcX = (px * invW) * 2.0f - 1.0f;
            float ndcY = 1.0f - (py * invH) * 2.0f;

            if (ndcX < -1.5f || ndcX > 1.5f || ndcY < -1.5f || ndcY > 1.5f) continue;

            float pulseFactor = 1.0f + 0.10f * sinf(puff.phase);
            float puffSize = puff.radius * 1.6f * pulseFactor * dpr;
            float puffAlpha = puff.baseAlpha * (1.0f + 0.22f * sinf(puff.phase * 0.7f));

            emitVertex(ndcX, ndcY, 0.98f, 0.96f, 0.94f, puffAlpha, puffSize, VERTEX_TYPE_FOG_PUFF);
        }

        for (int i = 0; i < moteCount; ++i) {
            SunlitMote& mote = motes[i];
            mote.update(dt, speedMultiplier, reducedMotion);

            float px = mote.x * width + currentParallaxX * 0.7f;
            float py = mote.y * height + currentParallaxY * 0.7f;

            float ndcX = (px * invW) * 2.0f - 1.0f;
            float ndcY = 1.0f - (py * invH) * 2.0f;

            if (ndcX < -1.15f || ndcX > 1.15f || ndcY < -1.15f || ndcY > 1.15f) continue;

            float pulseFactor = 0.70f + 0.30f * sinf(mote.pulse);
            float moteSize = mote.radius * 1.5f * pulseFactor * dpr;
            float moteAlpha = mote.baseAlpha * pulseFactor;

            if (mote.isGolden) {
                emitVertex(ndcX, ndcY, 1.0f, 0.86f, 0.52f, moteAlpha, moteSize, VERTEX_TYPE_MOTE);
            } else {
                emitVertex(ndcX, ndcY, 1.0f, 0.98f, 0.92f, moteAlpha * 0.85f, moteSize, VERTEX_TYPE_MOTE);
            }
        }
    }
}

// ── WebAssembly Extern "C" ABI Bridge Exports ──
extern "C" {
    AtmosphereEngine* atmosphere_create() {
        return new AtmosphereEngine();
    }

    void atmosphere_init(AtmosphereEngine* engine, int w, int h, int dark, int mobile, float densityMult, float speedMult, float meteorFreqMult) {
        if (engine) engine->init(w, h, dark, mobile, densityMult, speedMult, meteorFreqMult);
    }

    void atmosphere_resize(AtmosphereEngine* engine, int w, int h, float dpr) {
        if (engine) engine->resize(w, h, dpr);
    }

    void atmosphere_set_theme(AtmosphereEngine* engine, int dark) {
        if (engine) engine->setTheme(dark);
    }

    void atmosphere_set_density(AtmosphereEngine* engine, float mult) {
        if (engine) engine->setDensity(mult);
    }

    void atmosphere_set_speed(AtmosphereEngine* engine, float mult) {
        if (engine) engine->setSpeed(mult);
    }

    void atmosphere_set_meteor_frequency(AtmosphereEngine* engine, float mult) {
        if (engine) engine->setMeteorFrequency(mult);
    }

    void atmosphere_set_reduced_motion(AtmosphereEngine* engine, int reduced) {
        if (engine) engine->setReducedMotion(reduced);
    }

    void atmosphere_set_parallax(AtmosphereEngine* engine, float nx, float ny) {
        if (engine) engine->setParallaxTarget(nx, ny);
    }

    void atmosphere_trigger_meteor(AtmosphereEngine* engine, float x, float y, float length, float speed, float angle, int isBig) {
        if (engine) engine->triggerMeteor(x, y, length, speed, angle, isBig);
    }

    void atmosphere_update(AtmosphereEngine* engine, float dt) {
        if (engine) engine->update(dt);
    }

    float* atmosphere_get_vertex_buffer(AtmosphereEngine* engine) {
        return engine ? engine->getVertexBufferPtr() : nullptr;
    }

    int atmosphere_get_vertex_count(AtmosphereEngine* engine) {
        return engine ? engine->getVertexCount() : 0;
    }

    void atmosphere_destroy(AtmosphereEngine* engine) {
        delete engine;
    }
}
