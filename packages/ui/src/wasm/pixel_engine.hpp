#ifndef PIXEL_ENGINE_HPP
#define PIXEL_ENGINE_HPP

#include "pixel.hpp"
#include "pixel_contour.hpp"
#include "pixel_lighting.hpp"
#include <stdint.h>

#define MAX_IMAGE_BYTES (MAX_IMAGE_DIM * MAX_IMAGE_DIM * 4)
#define MAX_PARTICLES 200000
#define MAX_EMITTERS 480
#define MAX_SHOCKWAVES 8

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
    float pathSpread;
    int showPathGuide;

    // Advanced Customizations
    int edgeAlgorithm;               // 0: Perimeter, 1: Sobel, 2: Radial
    int edgeThreshold;               // Alpha / Gradient sensitivity threshold (10..80)
    int pinBottomEdge;               // 1: Lock to canvas bottom (y = h - 1), 0: Natural bbox
    float topParticleSizeMult;       // Top glow pixel size multiplier (0.5..2.0)
    float topParticleQuantityMult;   // Top glow pixel count multiplier (0.5..3.0)
    float topParticleSpeedMult;      // Top glow travel speed multiplier (0.5..3.0)
    int backsideStarsCount;          // Diamond star count: 0, 8, 16, 32, 48
    float backsideHaloMult;          // Halo ring density multiplier: 0.0 (off) .. 2.0
    int backsideOrbitsEnabled;       // Backward compatibility / 0: off, >0: count
    int backsideOrbitsCount;         // Number of orbit loops: 0, 1, 2, 3, 4
    float backsideSpecksMult;        // Ambient specks multiplier: 0.0 .. 2.0
    float clickForceMult;            // Burst blast force multiplier (0.1..1.8)
    float bounceSpeedMult;           // Elastic return spring speed multiplier (0.2..2.0)
    float glowDistanceMult;          // Top particle glow distance multiplier (0.4..3.0)
    float clickRadiusMult;           // Click disturbance radius multiplier (0.2..10.0, >= 5.0 = full)

    uint8_t inputImage[MAX_IMAGE_BYTES];
    Pixel particles[MAX_PARTICLES];
    int particleCount;

    ContourPoint contour[MAX_CONTOUR];
    int contourCount;

    LightEmitter emitters[MAX_EMITTERS];
    int emitterCount;

    WebGLVertex vertexBuffer[MAX_PARTICLES];
    Shockwave shockwaves[MAX_SHOCKWAVES];

    // Dynamic proximity lighting buffers
    float lightMapR[MAX_IMAGE_DIM * MAX_IMAGE_DIM];
    float lightMapG[MAX_IMAGE_DIM * MAX_IMAGE_DIM];
    float lightMapB[MAX_IMAGE_DIM * MAX_IMAGE_DIM];
    float lightMapW[MAX_IMAGE_DIM * MAX_IMAGE_DIM];

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
    void setPathSpread(float spread);
    void setShowPathGuide(int show);
    int getShowPathGuide() const {
        return showPathGuide;
    }

    // New Customization Setters
    void setEdgeAlgorithm(int algo);
    void setEdgeThreshold(int threshold);
    void setPinBottomEdge(int pin);
    void setTopParticleSize(float mult);
    void setTopParticleQuantity(float mult);
    void setTopParticleSpeed(float mult);
    void setBacksideStars(int count);
    void setBacksideHalo(float mult);
    void setBacksideOrbits(int count);
    void setBacksideSpecks(float mult);
    void setClickForce(float mult);
    void setBounceSpeed(float mult);
    void setGlowDistance(float dist);
    void setClickRadius(float radius);

    float* getVertexBufferPtr() {
        return (float*)vertexBuffer;
    }

    int getVertexCount() const {
        return particleCount;
    }

private:
    void generatePixels();
    void updateBuffers();
};

#endif // PIXEL_ENGINE_HPP
