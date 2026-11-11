#include "pixel_engine.hpp"
#include "pixel_physics.hpp"
#include "pixel_generator.hpp"
#include <stdlib.h>
#include <string.h>
#include <math.h>

PixelEngine::PixelEngine() {
    width = 0;
    height = 0;
    isDark = 1;
    globalTime = 0.0f;
    lightIntensity = 0.38f;
    entranceTime = 0.0f;
    entranceDuration = 1.6f;
    isEntrancing = 0;
    sizeMultiplier = 1.0f;
    glowMultiplier = 1.0f;
    speedMultiplier = 1.0f;
    densityMultiplier = 1.0f;
    pathSpread = 2.4f;
    showPathGuide = 0; // Default off on public client side; toggleable in admin

    // Advanced Customizations defaults
    edgeAlgorithm = 0;
    edgeThreshold = 28;
    pinBottomEdge = 1;
    topParticleSizeMult = 1.0f;
    topParticleQuantityMult = 1.0f;
    topParticleSpeedMult = 1.0f;
    backsideStarsCount = 32;
    backsideHaloMult = 1.0f;
    backsideOrbitsEnabled = 1;
    backsideOrbitsCount = 2;
    backsideSpecksMult = 1.0f;
    clickForceMult = 1.0f;
    bounceSpeedMult = 1.0f;
    glowDistanceMult = 1.0f;
    clickRadiusMult = 1.0f;
    hoverSpeedMult = 1.0f;
    hoverRadiusMult = 1.0f;
    clickSpeedMult = 1.0f;
    introSpreadMult = 1.0f;
    introPattern = 0;

    particleCount = 0;
    emitterCount = 0;
    contourCount = 0;

    memset(inputImage, 0, sizeof(inputImage));
    memset(shockwaves, 0, sizeof(shockwaves));
}

PixelEngine::~PixelEngine() {}

void PixelEngine::init(int w, int h, int dark) {
    width = (w > MAX_IMAGE_DIM) ? MAX_IMAGE_DIM : w;
    height = (h > MAX_IMAGE_DIM) ? MAX_IMAGE_DIM : h;
    isDark = dark;
    globalTime = 0.0f;
    particleCount = 0;
    emitterCount = 0;
    contourCount = 0;
    isEntrancing = 0;
    entranceTime = 0.0f;
}

void PixelEngine::setTheme(int dark) {
    if (isDark != dark) {
        isDark = dark;
        generatePixels();
    }
}

void PixelEngine::setLightIntensity(float intensity) {
    if (fabsf(lightIntensity - intensity) > 0.01f) {
        lightIntensity = intensity;
        generatePixels();
    }
}

void PixelEngine::setParticleSize(float mult) {
    if (fabsf(sizeMultiplier - mult) > 0.01f) {
        sizeMultiplier = mult;
        generatePixels();
    }
}

void PixelEngine::setGlowBrightness(float mult) {
    if (fabsf(glowMultiplier - mult) > 0.01f) {
        glowMultiplier = mult;
        generatePixels();
    }
}

void PixelEngine::setSpeed(float mult) {
    if (fabsf(speedMultiplier - mult) > 0.01f) {
        speedMultiplier = mult;
        generatePixels();
    }
}

void PixelEngine::setDensity(float mult) {
    if (fabsf(densityMultiplier - mult) > 0.01f) {
        densityMultiplier = mult;
        generatePixels();
    }
}

void PixelEngine::setPathSpread(float spread) {
    if (fabsf(pathSpread - spread) > 0.05f) {
        pathSpread = spread;
        generatePixels();
    }
}

void PixelEngine::setShowPathGuide(int show) {
    if (showPathGuide != show) {
        showPathGuide = show;
        generatePixels();
        updateBuffers();
    }
}

void PixelEngine::setEdgeAlgorithm(int algo) {
    if (edgeAlgorithm != algo) {
        edgeAlgorithm = algo;
        generatePixels();
    }
}

void PixelEngine::setEdgeThreshold(int threshold) {
    if (edgeThreshold != threshold) {
        edgeThreshold = threshold;
        generatePixels();
    }
}

void PixelEngine::setPinBottomEdge(int pin) {
    if (pinBottomEdge != pin) {
        pinBottomEdge = pin;
        generatePixels();
    }
}

void PixelEngine::setTopParticleSize(float mult) {
    if (fabsf(topParticleSizeMult - mult) > 0.01f) {
        topParticleSizeMult = mult;
        generatePixels();
    }
}

void PixelEngine::setTopParticleQuantity(float mult) {
    if (fabsf(topParticleQuantityMult - mult) > 0.01f) {
        topParticleQuantityMult = mult;
        generatePixels();
    }
}

void PixelEngine::setTopParticleSpeed(float mult) {
    if (fabsf(topParticleSpeedMult - mult) > 0.01f) {
        topParticleSpeedMult = mult;
        for (int i = 0; i < particleCount; i++) {
            if (particles[i].flags & FLAG_EDGE_FLOW) {
                particles[i].pathSpeed = (11.0f + pseudoRand((float)i * 2.3f) * 15.0f) * speedMultiplier * mult;
            }
        }
    }
}

void PixelEngine::setBacksideStars(int count) {
    if (backsideStarsCount != count) {
        backsideStarsCount = count;
        generatePixels();
    }
}

void PixelEngine::setBacksideHalo(float mult) {
    if (fabsf(backsideHaloMult - mult) > 0.01f) {
        backsideHaloMult = mult;
        generatePixels();
    }
}

void PixelEngine::setBacksideOrbits(int count) {
    if (backsideOrbitsCount != count || backsideOrbitsEnabled != (count > 0 ? 1 : 0)) {
        backsideOrbitsCount = count;
        backsideOrbitsEnabled = (count > 0) ? 1 : 0;
        generatePixels();
    }
}

void PixelEngine::setBacksideSpecks(float mult) {
    if (fabsf(backsideSpecksMult - mult) > 0.01f) {
        backsideSpecksMult = mult;
        generatePixels();
    }
}

void PixelEngine::setClickForce(float mult) {
    clickForceMult = mult;
}

void PixelEngine::setBounceSpeed(float mult) {
    bounceSpeedMult = mult;
}

void PixelEngine::setGlowDistance(float dist) {
    if (fabsf(glowDistanceMult - dist) > 0.01f) {
        glowDistanceMult = dist;
        generatePixels();
    }
}

void PixelEngine::setClickRadius(float radius) {
    clickRadiusMult = radius;
}

void PixelEngine::setHoverSpeed(float mult) {
    hoverSpeedMult = mult;
}

void PixelEngine::setHoverRadius(float mult) {
    hoverRadiusMult = mult;
}

void PixelEngine::setClickSpeed(float mult) {
    clickSpeedMult = mult;
}

void PixelEngine::setIntroSpread(float mult) {
    introSpreadMult = mult;
}

void PixelEngine::setIntroPattern(int pattern) {
    introPattern = pattern;
}

void PixelEngine::processImage(int w, int h) {
    init(w, h, isDark);
    generatePixels();
    updateBuffers();
}

void PixelEngine::updateBuffers() {
    float invW = 1.0f / (float)width;
    float invH = 1.0f / (float)height;

    for (int i = 0; i < particleCount; i++) {
        Pixel& p = particles[i];
        if (!p.active || p.a <= 0) {
            vertexBuffer[i].a = 0.0f;
            continue;
        }

        // Convert [0, width] to WebGL clip space [-1.0, 1.0] with inverted Y
        float clipX = (p.x * invW) * 2.0f - 1.0f;
        float clipY = 1.0f - (p.y * invH) * 2.0f;

        vertexBuffer[i].x = clipX;
        vertexBuffer[i].y = clipY;
        vertexBuffer[i].r = (float)p.r / 255.0f;
        vertexBuffer[i].g = (float)p.g / 255.0f;
        vertexBuffer[i].b = (float)p.b / 255.0f;
        vertexBuffer[i].a = (float)p.a / 255.0f;
        vertexBuffer[i].size = p.size;
    }
}

// =============================================================================
// C-ABI EXPORTED WRAPPERS FOR WEB-ASSEMBLY JAVASCRIPT CALLS
// =============================================================================
extern "C" {

PixelEngine* engine_create() {
    return new PixelEngine();
}

void engine_init(PixelEngine* engine, int w, int h, int dark) {
    if (engine) engine->init(w, h, dark);
}

uint8_t* engine_get_input_buffer(PixelEngine* engine) {
    return engine ? engine->getInputBufferPtr() : nullptr;
}

void engine_process_image(PixelEngine* engine, int w, int h) {
    if (engine) engine->processImage(w, h);
}

void engine_update(PixelEngine* engine, float dt, float mx, float my, int down) {
    if (engine) engine->update(dt, mx, my, down);
}

void engine_add_burst(PixelEngine* engine, float x, float y, float force) {
    if (engine) engine->addBurst(x, y, force);
}

void engine_trigger_entrance(PixelEngine* engine, float duration) {
    if (engine) engine->triggerEntrance(duration);
}

int engine_is_entrancing(PixelEngine* engine) {
    return engine ? engine->isEntranceActive() : 0;
}

void engine_set_theme(PixelEngine* engine, int dark) {
    if (engine) engine->setTheme(dark);
}

void engine_set_light_intensity(PixelEngine* engine, float intensity) {
    if (engine) engine->setLightIntensity(intensity);
}

void engine_set_particle_size(PixelEngine* engine, float mult) {
    if (engine) engine->setParticleSize(mult);
}

void engine_set_glow_brightness(PixelEngine* engine, float mult) {
    if (engine) engine->setGlowBrightness(mult);
}

void engine_set_speed(PixelEngine* engine, float mult) {
    if (engine) engine->setSpeed(mult);
}

void engine_set_density(PixelEngine* engine, float mult) {
    if (engine) engine->setDensity(mult);
}

void engine_set_path_spread(PixelEngine* engine, float spread) {
    if (engine) engine->setPathSpread(spread);
}

void engine_set_show_path_guide(PixelEngine* engine, int show) {
    if (engine) engine->setShowPathGuide(show);
}

void engine_set_edge_algorithm(PixelEngine* engine, int algo) {
    if (engine) engine->setEdgeAlgorithm(algo);
}

void engine_set_edge_threshold(PixelEngine* engine, int threshold) {
    if (engine) engine->setEdgeThreshold(threshold);
}

void engine_set_pin_bottom_edge(PixelEngine* engine, int pin) {
    if (engine) engine->setPinBottomEdge(pin);
}

void engine_set_top_particle_size(PixelEngine* engine, float mult) {
    if (engine) engine->setTopParticleSize(mult);
}

void engine_set_top_particle_quantity(PixelEngine* engine, float mult) {
    if (engine) engine->setTopParticleQuantity(mult);
}

void engine_set_top_particle_speed(PixelEngine* engine, float mult) {
    if (engine) engine->setTopParticleSpeed(mult);
}

void engine_set_backside_stars(PixelEngine* engine, int count) {
    if (engine) engine->setBacksideStars(count);
}

void engine_set_backside_halo(PixelEngine* engine, float mult) {
    if (engine) engine->setBacksideHalo(mult);
}

void engine_set_backside_orbits(PixelEngine* engine, int enabled) {
    if (engine) engine->setBacksideOrbits(enabled);
}

void engine_set_backside_specks(PixelEngine* engine, float mult) {
    if (engine) engine->setBacksideSpecks(mult);
}

void engine_set_click_force(PixelEngine* engine, float mult) {
    if (engine) engine->setClickForce(mult);
}

void engine_set_bounce_speed(PixelEngine* engine, float mult) {
    if (engine) engine->setBounceSpeed(mult);
}

void engine_set_glow_distance(PixelEngine* engine, float dist) {
    if (engine) engine->setGlowDistance(dist);
}

void engine_set_click_radius(PixelEngine* engine, float radius) {
    if (engine) engine->setClickRadius(radius);
}

void engine_set_hover_speed(PixelEngine* engine, float mult) {
    if (engine) engine->setHoverSpeed(mult);
}

void engine_set_hover_radius(PixelEngine* engine, float mult) {
    if (engine) engine->setHoverRadius(mult);
}

void engine_set_click_speed(PixelEngine* engine, float mult) {
    if (engine) engine->setClickSpeed(mult);
}

void engine_set_intro_spread(PixelEngine* engine, float mult) {
    if (engine) engine->setIntroSpread(mult);
}

void engine_set_intro_pattern(PixelEngine* engine, int pattern) {
    if (engine) engine->setIntroPattern(pattern);
}

float* engine_get_vertex_buffer(PixelEngine* engine) {
    return engine ? engine->getVertexBufferPtr() : nullptr;
}

int engine_get_vertex_count(PixelEngine* engine) {
    return engine ? engine->getVertexCount() : 0;
}

void engine_destroy(PixelEngine* engine) {
    if (engine) delete engine;
}

}
