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
// 1. The background around the subject (top, left, right) has alpha == 0.
// 2. For each row y, find where alpha starts (> 20) from left and right.
// 3. Assemble the ordered path: bottom-left -> top hair bridge -> bottom-right.
// 4. Smooth with a moving average window to obtain a clean, natural contour line.
// 5. Compute outward normals for particle travel offsets.
inline void extractSilhouetteContour(
    uint8_t* inputImage,
    int w,
    int h,
    ContourPoint* contour,
    int& contourCount
) {
    contourCount = 0;
    if (w <= 0 || h <= 0 || w > MAX_IMAGE_DIM || h > MAX_IMAGE_DIM) return;

    static float leftX[MAX_IMAGE_DIM];
    static float rightX[MAX_IMAGE_DIM];
    static uint8_t hasRow[MAX_IMAGE_DIM];
    memset(hasRow, 0, h * sizeof(uint8_t));

    int topY = -1;
    int maxBottomY = (int)((float)h * 0.86f);
    int bottomY = -1;

    // Scan each horizontal row for positive alpha (where subject begins from left & right)
    for (int y = 0; y <= maxBottomY; y++) {
        int firstX = -1;
        int lastX = -1;
        int rowOffset = y * w * 4;

        for (int x = 0; x < w; x++) {
            if (inputImage[rowOffset + x * 4 + 3] > 28) {
                firstX = x;
                break;
            }
        }

        if (firstX >= 0) {
            for (int x = w - 1; x >= firstX; x--) {
                if (inputImage[rowOffset + x * 4 + 3] > 28) {
                    lastX = x;
                    break;
                }
            }

            leftX[y] = (float)firstX;
            rightX[y] = (float)lastX;
            hasRow[y] = 1;

            if (topY < 0) topY = y;
            bottomY = y;
        }
    }

    if (topY < 0 || bottomY < 0) return;

    // Assemble continuous edge path:
    static float rawX[MAX_CONTOUR];
    static float rawY[MAX_CONTOUR];
    int rawCount = 0;

    // 1. Left side from bottom-left up to top-left apex
    for (int y = bottomY; y >= topY; y--) {
        if (hasRow[y] && rawCount < MAX_CONTOUR - 16) {
            rawX[rawCount] = leftX[y];
            rawY[rawCount] = (float)y;
            rawCount++;
        }
    }

    // 2. Right side from top-right apex down to bottom-right
    for (int y = topY; y <= bottomY; y++) {
        if (hasRow[y] && rawCount < MAX_CONTOUR - 16) {
            rawX[rawCount] = rightX[y];
            rawY[rawCount] = (float)y;
            rawCount++;
        }
    }

    if (rawCount < 4) return;

    // 4. Two-pass smoothing filter for a silky, straightened, elegant contour path
    static float pass1X[MAX_CONTOUR];
    static float pass1Y[MAX_CONTOUR];

    const int WIN1 = 15;
    const int HALF1 = WIN1 / 2;
    for (int i = 0; i < rawCount; i++) {
        float sumX = 0.0f;
        float sumY = 0.0f;
        int count = 0;
        for (int j = -HALF1; j <= HALF1; j++) {
            int idx = i + j;
            if (idx >= 0 && idx < rawCount) {
                sumX += rawX[idx];
                sumY += rawY[idx];
                count++;
            }
        }
        pass1X[i] = sumX / (float)count;
        pass1Y[i] = sumY / (float)count;
    }

    const int WIN2 = 11;
    const int HALF2 = WIN2 / 2;
    for (int i = 0; i < rawCount; i++) {
        if (contourCount >= MAX_CONTOUR - 2) break;

        float sumX = 0.0f;
        float sumY = 0.0f;
        int count = 0;
        for (int j = -HALF2; j <= HALF2; j++) {
            int idx = i + j;
            if (idx >= 0 && idx < rawCount) {
                sumX += pass1X[idx];
                sumY += pass1Y[idx];
                count++;
            }
        }
        contour[contourCount].x = sumX / (float)count;
        contour[contourCount].y = sumY / (float)count;
        contourCount++;
    }

    // 5. Compute outward normal vectors along the smoothed path
    for (int i = 0; i < contourCount; i++) {
        int prevIdx = (i > 0) ? (i - 1) : 0;
        int nextIdx = (i < contourCount - 1) ? (i + 1) : (contourCount - 1);

        float dx = contour[nextIdx].x - contour[prevIdx].x;
        float dy = contour[nextIdx].y - contour[prevIdx].y;
        float len = sqrtf(dx * dx + dy * dy);

        if (len > 0.001f) {
            // Normal points outwards (away from center of subject)
            contour[i].nx = -dy / len;
            contour[i].ny = dx / len;
        } else {
            contour[i].nx = 0.0f;
            contour[i].ny = 0.0f;
        }
    }
}

#endif // PIXEL_CONTOUR_HPP
