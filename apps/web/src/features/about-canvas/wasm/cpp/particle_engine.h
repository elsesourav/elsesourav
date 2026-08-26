#ifndef PARTICLE_ENGINE_H
#define PARTICLE_ENGINE_H

#include "image_processor.h"
#include <cstdint>

class ParticleEngine {
private:
    ParticleData* particles;
    int particleCount;
    float interactionRadius;
    float repelForce;
    float returnSpeed;

public:
    ParticleEngine();
    ~ParticleEngine();

    void initFromImage(
        const uint8_t* imageData, 
        int width, int height, 
        int chunkSize, int alphaThreshold,
        float offsetX, float offsetY
    );

    void update(float pointerX, float pointerY, bool pointerActive, float dt);

    const ParticleData* getParticles() const { return particles; }
    int getParticleCount() const { return particleCount; }

    void setPhysicsConfig(float iRadius, float rForce, float rSpeed);
};

#endif
