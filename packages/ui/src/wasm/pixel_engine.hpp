#ifndef PIXEL_ENGINE_HPP
#define PIXEL_ENGINE_HPP

#include "pixel.hpp"
#include <stdint.h>

#define MAX_IMAGE_DIM 288
#define MAX_IMAGE_BYTES (MAX_IMAGE_DIM * MAX_IMAGE_DIM * 4)
#define MAX_PARTICLES 65536
#define MAX_EMITTERS 480
#define MAX_CONTOUR 2048
#define MAX_SHOCKWAVES 8

struct ContourPoint {
    float x;
    float y;
    float nx; // outward normal x
    float ny; // outward normal y
};

struct Shockwave {
    float x;
    float y;
    float radius;
    float maxRadius;
    float force;
    int active;
};

struct LightEmitter {
    float x;
    float y;
    float r;
    float g;
    float b;
    float radius;
};

struct WebGLVertex {
    float x;
    float y;
    float r;
    float g;
    float b;
    float a;
    float size;
};

class PixelEngine {
private:
    int width;
    int height;
    int isDark;
    float globalTime;
    float lightIntensity;
    float entranceTime;
    float entranceDuration;
    int isEntrancing;
    float sizeMultiplier;
    float glowMultiplier;
    float speedMultiplier;
    float densityMultiplier;

    uint8_t inputImage[MAX_IMAGE_BYTES];
    Pixel particles[MAX_PARTICLES];
    int particleCount;

    ContourPoint contour[MAX_CONTOUR];
    int contourCount;

    LightEmitter emitters[MAX_EMITTERS];
    int emitterCount;

    WebGLVertex vertexBuffer[MAX_PARTICLES];
    Shockwave shockwaves[MAX_SHOCKWAVES];

public:
    PixelEngine();
    ~PixelEngine();

    void init(int w, int h, int dark);
    uint8_t* getInputBufferPtr() {
        return inputImage;
    }

    void processImage(int w, int h);
    void update(float dt, float mouseX, float mouseY, int isMouseDown);
    void addBurst(float x, float y, float force);
    void triggerEntrance(float duration);
    int isEntranceActive() const {
        return isEntrancing;
    }
    void setTheme(int dark);
    void setLightIntensity(float intensity);
    void setParticleSize(float mult);
    void setGlowBrightness(float mult);
    void setSpeed(float mult);
    void setDensity(float mult);

    float* getVertexBufferPtr() {
        return (float*)vertexBuffer;
    }

    int getVertexCount() const {
        return particleCount;
    }

    int getWidth() const {
        return width;
    }

    int getHeight() const {
        return height;
    }

private:
    void generatePixels();
    void extractSilhouetteContour();
    void updateBuffers();
};

#endif // PIXEL_ENGINE_HPP
