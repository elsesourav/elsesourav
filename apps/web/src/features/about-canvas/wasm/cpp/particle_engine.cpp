#include "particle_engine.h"
#include "force_calculator.h"
#include "image_processor.h"
#include <emscripten.h>

ParticleEngine::ParticleEngine() 
    : particles(nullptr), particleCount(0), 
      interactionRadius(80.0f), repelForce(0.8f), returnSpeed(0.1f) {}

ParticleEngine::~ParticleEngine() {
    if (particles != nullptr) {
        delete[] particles;
    }
}

void ParticleEngine::initFromImage(
    const uint8_t* imageData, 
    int width, int height, 
    int chunkSize, int alphaThreshold,
    float offsetX, float offsetY
) {
    if (particles != nullptr) {
        delete[] particles;
    }

    particleCount = ImageProcessor::countValidParticles(
        imageData, width, height, chunkSize, alphaThreshold
    );

    particles = new ParticleData[particleCount];

    ImageProcessor::generateParticles(
        imageData, width, height, chunkSize, alphaThreshold, offsetX, offsetY, particles
    );
}

void ParticleEngine::setPhysicsConfig(float iRadius, float rForce, float rSpeed) {
    interactionRadius = iRadius;
    repelForce = rForce;
    returnSpeed = rSpeed;
}

void ParticleEngine::update(float pointerX, float pointerY, bool pointerActive, float dt) {
    for (int i = 0; i < particleCount; ++i) {
        ParticleData& p = particles[i];

        // Reset velocity
        p.vx = 0.0f;
        p.vy = 0.0f;

        // Apply mouse interaction if active
        if (pointerActive) {
            ForceCalculator::applyRepelForce(
                p.vx, p.vy, p.x, p.y, pointerX, pointerY, interactionRadius, repelForce
            );
        }

        // Apply return-to-origin spring force
        ForceCalculator::applyReturnForce(
            p.vx, p.vy, p.x, p.y, p.originX, p.originY, returnSpeed
        );

        // Apply velocity to position
        p.x += p.vx;
        p.y += p.vy;
    }
}

// C API exposed to JavaScript/WASM
extern "C" {
    EMSCRIPTEN_KEEPALIVE
    ParticleEngine* create_engine() {
        return new ParticleEngine();
    }

    EMSCRIPTEN_KEEPALIVE
    void destroy_engine(ParticleEngine* engine) {
        delete engine;
    }

    EMSCRIPTEN_KEEPALIVE
    void init_engine_from_image(
        ParticleEngine* engine, 
        const uint8_t* imageData, 
        int width, int height, 
        int chunkSize, int alphaThreshold,
        float offsetX, float offsetY
    ) {
        engine->initFromImage(imageData, width, height, chunkSize, alphaThreshold, offsetX, offsetY);
    }

    EMSCRIPTEN_KEEPALIVE
    void update_engine(ParticleEngine* engine, float pointerX, float pointerY, bool pointerActive, float dt) {
        engine->update(pointerX, pointerY, pointerActive, dt);
    }

    EMSCRIPTEN_KEEPALIVE
    void set_engine_config(ParticleEngine* engine, float interactionRadius, float repelForce, float returnSpeed) {
        engine->setPhysicsConfig(interactionRadius, repelForce, returnSpeed);
    }

    EMSCRIPTEN_KEEPALIVE
    const ParticleData* get_particles_ptr(ParticleEngine* engine) {
        return engine->getParticles();
    }

    EMSCRIPTEN_KEEPALIVE
    int get_particle_count(ParticleEngine* engine) {
        return engine->getParticleCount();
    }

    EMSCRIPTEN_KEEPALIVE
    uint8_t* allocate_image_buffer(int byteSize) {
        return new uint8_t[byteSize];
    }

    EMSCRIPTEN_KEEPALIVE
    void free_image_buffer(uint8_t* buffer) {
        delete[] buffer;
    }
}
