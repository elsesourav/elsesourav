#ifndef FORCE_CALCULATOR_H
#define FORCE_CALCULATOR_H

class ForceCalculator {
public:
    static void applyRepelForce(
        float& vx, float& vy, 
        float x, float y, 
        float pointerX, float pointerY, 
        float interactionRadius, float repelForce
    );

    static void applyReturnForce(
        float& vx, float& vy, 
        float x, float y, 
        float originX, float originY, 
        float returnSpeed
    );
};

#endif
