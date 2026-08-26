#ifndef IMAGE_PROCESSOR_H
#define IMAGE_PROCESSOR_H

#include <cstdint>

struct ParticleData {
    float x;
    float y;
    float originX;
    float originY;
    float vx;
    float vy;
    uint8_t r;
    uint8_t g;
    uint8_t b;
    uint8_t a;
};

class ImageProcessor {
public:
    static int countValidParticles(
        const uint8_t* imageData, 
        int width, int height, 
        int chunkSize, int alphaThreshold
    );

    static void generateParticles(
        const uint8_t* imageData, 
        int width, int height, 
        int chunkSize, int alphaThreshold,
        float offsetX, float offsetY,
        ParticleData* outParticles
    );
};

#endif
