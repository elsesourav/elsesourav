#ifndef PIXEL_CONTOUR_HPP
#define PIXEL_CONTOUR_HPP

#include "pixel.hpp"
#include <stdint.h>
#include <string.h>
#include <math.h>

#define MAX_IMAGE_DIM 288
#define MAX_CONTOUR 2048

struct ContourPoint {
    float x;
    float y;
    float nx; // outward normal x
    float ny; // outward normal y
};

// Simple, robust edge path extraction based on alpha transparency:
// 1. The background around the subject (top, left, right) is transparent (alpha == 0).
// 2. For each column x from left to right, find where alpha begins from top down.
// 3. This traces a single continuous, unbroken, natural silhouette curve across shoulders, neck, hair, and crown.
// 4. Smooth with a moving average filter to produce a silky, straightened, elegant contour path.
// 5. Compute true outward normals pointing away from the person: left on left, up at top, right on right.
inline void extractSilhouetteContour(
    uint8_t* inputImage,
    int w,
    int h,
    ContourPoint* contour,
    int& contourCount
) {
    contourCount = 0;
    if (w <= 0 || h <= 0 || w > MAX_IMAGE_DIM || h > MAX_IMAGE_DIM) return;

    static float rawX[MAX_CONTOUR];
    static float rawY[MAX_CONTOUR];
    int rawCount = 0;

    int maxBottomY = (int)((float)h * 0.86f);

    // Scan each column x from left to right for positive alpha from top down
    for (int x = 0; x < w; x++) {
        for (int y = 0; y <= maxBottomY; y++) {
            int idx = (y * w + x) * 4;
            if (inputImage[idx + 3] > 28) {
                if (rawCount < MAX_CONTOUR - 16) {
                    rawX[rawCount] = (float)x;
                    rawY[rawCount] = (float)y;
                    rawCount++;
                }
                break;
            }
        }
    }

    if (rawCount < 8) return;

    // Moving average smoothing filter (window = 11) for a silky, organic contour line
    const int WIN = 11;
    const int HALF = WIN / 2;

    for (int i = 0; i < rawCount; i++) {
        if (contourCount >= MAX_CONTOUR - 2) break;

        float sumX = 0.0f;
        float sumY = 0.0f;
        int count = 0;

        for (int j = -HALF; j <= HALF; j++) {
            int idx = i + j;
            if (idx >= 0 && idx < rawCount) {
                sumX += rawX[idx];
                sumY += rawY[idx];
                count++;
            }
        }

        contour[contourCount].x = sumX / (float)count;
        contour[contourCount].y = sumY / (float)count;
        contourCount++;
    }

    // Compute true outward normal vectors along the smoothed path:
    // With x increasing from left to right along the path:
    // dx = x[next] - x[prev] > 0
    // Outward normal (pointing upwards and away from the subject body):
    // N = (dy, -dx) / len
    for (int i = 0; i < contourCount; i++) {
        int prevIdx = (i > 0) ? (i - 1) : 0;
        int nextIdx = (i < contourCount - 1) ? (i + 1) : (contourCount - 1);

        float dx = contour[nextIdx].x - contour[prevIdx].x;
        float dy = contour[nextIdx].y - contour[prevIdx].y;
        float len = sqrtf(dx * dx + dy * dy);

        if (len > 0.001f) {
            contour[i].nx = dy / len;
            contour[i].ny = -dx / len;
        } else {
            contour[i].nx = 0.0f;
            contour[i].ny = -1.0f;
        }
    }
}

#endif // PIXEL_CONTOUR_HPP
