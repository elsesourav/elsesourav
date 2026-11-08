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
    showPathGuide = 0; // Default off on public client side; toggleable in admin

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

void PixelEngine::setShowPathGuide(int show) {
    if (showPathGuide != show) {
        showPathGuide = show;
        generatePixels();
    }
}

void PixelEngine::processImage(int w, int h) {
    init(w, h, isDark);
    generatePixels();
    triggerEntrance(1.6f);
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

void engine_set_show_path_guide(PixelEngine* engine, int show) {
    if (engine) engine->setShowPathGuide(show);
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
