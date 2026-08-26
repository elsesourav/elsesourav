#include "image_processor.h"

int ImageProcessor::countValidParticles(
    const uint8_t* imageData, 
    int width, int height, 
    int chunkSize, int alphaThreshold
) {
    int count = 0;
    for (int y = 0; y < height; y += chunkSize) {
        for (int x = 0; x < width; x += chunkSize) {
            int index = (y * width + x) * 4;
            uint8_t alpha = imageData[index + 3];
            if (alpha >= alphaThreshold) {
                count++;
            }
        }
    }
    return count;
}

void ImageProcessor::generateParticles(
    const uint8_t* imageData, 
    int width, int height, 
    int chunkSize, int alphaThreshold,
    float offsetX, float offsetY,
    ParticleData* outParticles
) {
    int pIndex = 0;
    for (int y = 0; y < height; y += chunkSize) {
        for (int x = 0; x < width; x += chunkSize) {
            int index = (y * width + x) * 4;
            uint8_t alpha = imageData[index + 3];
            
            if (alpha >= alphaThreshold) {
                float px = offsetX + static_cast<float>(x);
                float py = offsetY + static_cast<float>(y);
                
                outParticles[pIndex].x = px;
                outParticles[pIndex].y = py;
                outParticles[pIndex].originX = px;
                outParticles[pIndex].originY = py;
                outParticles[pIndex].vx = 0.0f;
                outParticles[pIndex].vy = 0.0f;
                
                outParticles[pIndex].r = imageData[index + 0];
                outParticles[pIndex].g = imageData[index + 1];
                outParticles[pIndex].b = imageData[index + 2];
                outParticles[pIndex].a = alpha;
                
                pIndex++;
            }
        }
    }
}
