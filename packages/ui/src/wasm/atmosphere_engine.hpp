#ifndef ATMOSPHERE_ENGINE_HPP
#define ATMOSPHERE_ENGINE_HPP

#include "atmosphere.hpp"

class AtmosphereEngine {
private:
    int width;
    int height;
    float dpr;
    int isDark;
    int isMobile;

    float globalTime;
    float densityMultiplier;
    float speedMultiplier;
    float meteorFrequencyMultiplier;
    int reducedMotion;

    float targetParallaxX;
    float targetParallaxY;
    float currentParallaxX;
    float currentParallaxY;

    FastRng rng;

    CelestialStar stars[MAX_STARS];
    int starCount;

    ShootingStar meteors[MAX_METEORS];
    float meteorCooldown;

    FogPuff fogPuffs[MAX_FOG_PUFFS];
    int fogCount;

    SunlitMote motes[MAX_SUNLIT_MOTES];
    int moteCount;

    AtmosphereVertex vertexBuffer[MAX_VERTICES];
    int vertexCount;

    void populateEntities();
    void emitVertex(float ndcX, float ndcY, float r, float g, float b, float a, float size, float type);

public:
    AtmosphereEngine();
    ~AtmosphereEngine();

    void init(int w, int h, int dark, int mobile, float densityMult, float speedMult, float meteorFreqMult);
    void resize(int w, int h, float newDpr);
    void setTheme(int dark);
    void setDensity(float mult);
    void setSpeed(float mult);
    void setMeteorFrequency(float mult);
    void setReducedMotion(int reduced);
    void setParallaxTarget(float nx, float ny);
    void triggerMeteor(float x, float y, float length, float speed, float angle, int isBig);
    void update(float dt);

    float* getVertexBufferPtr() {
        return (float*)vertexBuffer;
    }

    int getVertexCount() const {
        return vertexCount;
    }

    int getWidth() const { return width; }
    int getHeight() const { return height; }
};

#endif // ATMOSPHERE_ENGINE_HPP
