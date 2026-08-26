#include "force_calculator.h"
#include <cmath>

void ForceCalculator::applyRepelForce(
    float& vx, float& vy, 
    float x, float y, 
    float pointerX, float pointerY, 
    float interactionRadius, float repelForce
) {
    float dx = pointerX - x;
    float dy = pointerY - y;
    float distSq = dx * dx + dy * dy;
    float radiusSq = interactionRadius * interactionRadius;

    if (distSq < radiusSq) {
        float dist = std::sqrt(distSq);
        if (dist > 0.0f) {
            float force = (interactionRadius - dist) / interactionRadius;
            float ax = (dx / dist) * force * repelForce * 10.0f;
            float ay = (dy / dist) * force * repelForce * 10.0f;
            vx -= ax;
            vy -= ay;
        }
    }
}

void ForceCalculator::applyReturnForce(
    float& vx, float& vy, 
    float x, float y, 
    float originX, float originY, 
    float returnSpeed
) {
    float dxOrigin = originX - x;
    float dyOrigin = originY - y;
    
    vx += dxOrigin * returnSpeed;
    vy += dyOrigin * returnSpeed;
}
