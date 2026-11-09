#ifndef PIXEL_CONTOUR_HPP
#define PIXEL_CONTOUR_HPP

#include "pixel.hpp"
#include <stdint.h>
#include <string.h>
#include <math.h>

#define MAX_IMAGE_DIM 512
#define MAX_CONTOUR 2048

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

struct ContourPoint {
    float x;
    float y;
    float nx; // outward normal x
    float ny; // outward normal y
};

// =============================================================================
// ALGORITHM 0: Continuous Perimeter Alpha Trace
// Starts at canvas bottom-left, ascends left curls/shoulders to hair apex,
// bridges top crown, and descends right curls/shoulders to canvas bottom-right.
// =============================================================================
inline void tracePerimeterAlpha(
    uint8_t* inputImage,
    int w,
    int h,
    int threshold,
    int pinBottom,
    float* rawX,
    float* rawY,
    int& rawCount
) {
    static float leftX[MAX_IMAGE_DIM];
    static float rightX[MAX_IMAGE_DIM];
    static uint8_t hasRow[MAX_IMAGE_DIM];
    memset(hasRow, 0, h * sizeof(uint8_t));

    int topY = -1;
    int bottomY = -1;

    for (int y = 0; y < h; y++) {
        int firstX = -1;
        int lastX = -1;
        int rowOffset = y * w * 4;

        for (int x = 0; x < w; x++) {
            if (inputImage[rowOffset + x * 4 + 3] > (uint8_t)threshold) {
                firstX = x;
                break;
            }
        }

        if (firstX >= 0) {
            for (int x = w - 1; x >= firstX; x--) {
                if (inputImage[rowOffset + x * 4 + 3] > (uint8_t)threshold) {
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

    // Up left side: bottom to top apex
    for (int y = bottomY; y >= topY; y--) {
        if (hasRow[y] && rawCount < MAX_CONTOUR - 16) {
            rawX[rawCount] = leftX[y];
            rawY[rawCount] = (float)y;
            rawCount++;
        }
    }

    // Apex crown transition bridge
    if (leftX[topY] != rightX[topY] && rawCount < MAX_CONTOUR - 16) {
        rawX[rawCount] = rightX[topY];
        rawY[rawCount] = (float)topY;
        rawCount++;
    }

    // Down right side: top apex to bottom
    for (int y = topY + 1; y <= bottomY; y++) {
        if (hasRow[y] && rawCount < MAX_CONTOUR - 16) {
            rawX[rawCount] = rightX[y];
            rawY[rawCount] = (float)y;
            rawCount++;
        }
    }
}

// =============================================================================
// ALGORITHM 1: Sobel Edge Gradient Filter
// Computes horizontal and vertical spatial intensity gradients on alpha/luma,
// locating outer perimeter step edges.
// =============================================================================
inline void traceSobelGradient(
    uint8_t* inputImage,
    int w,
    int h,
    int threshold,
    int pinBottom,
    float* rawX,
    float* rawY,
    int& rawCount
) {
    static float leftX[MAX_IMAGE_DIM];
    static float rightX[MAX_IMAGE_DIM];
    static uint8_t hasRow[MAX_IMAGE_DIM];
    memset(hasRow, 0, h * sizeof(uint8_t));

    int topY = -1;
    int bottomY = -1;
    float gradThresh = (float)threshold * 1.6f;

    for (int y = 1; y < h - 1; y++) {
        int firstX = -1;
        int lastX = -1;

        for (int x = 1; x < w - 1; x++) {
            // Sobel convolution on alpha channel
            int a00 = inputImage[((y - 1) * w + (x - 1)) * 4 + 3];
            int a02 = inputImage[((y - 1) * w + (x + 1)) * 4 + 3];
            int a10 = inputImage[(y * w + (x - 1)) * 4 + 3];
            int a12 = inputImage[(y * w + (x + 1)) * 4 + 3];
            int a20 = inputImage[((y + 1) * w + (x - 1)) * 4 + 3];
            int a22 = inputImage[((y + 1) * w + (x + 1)) * 4 + 3];
            int a01 = inputImage[((y - 1) * w + x) * 4 + 3];
            int a21 = inputImage[((y + 1) * w + x) * 4 + 3];

            float gx = (float)(-a00 + a02 - 2 * a10 + 2 * a12 - a20 + a22);
            float gy = (float)(-a00 - 2 * a01 - a02 + a20 + 2 * a21 + a22);
            float mag = sqrtf(gx * gx + gy * gy);

            if (mag > gradThresh || inputImage[(y * w + x) * 4 + 3] > (uint8_t)threshold) {
                firstX = x;
                break;
            }
        }

        if (firstX >= 1) {
            for (int x = w - 2; x >= firstX; x--) {
                int a00 = inputImage[((y - 1) * w + (x - 1)) * 4 + 3];
                int a02 = inputImage[((y - 1) * w + (x + 1)) * 4 + 3];
                int a10 = inputImage[(y * w + (x - 1)) * 4 + 3];
                int a12 = inputImage[(y * w + (x + 1)) * 4 + 3];
                int a20 = inputImage[((y + 1) * w + (x - 1)) * 4 + 3];
                int a22 = inputImage[((y + 1) * w + (x + 1)) * 4 + 3];
                int a01 = inputImage[((y - 1) * w + x) * 4 + 3];
                int a21 = inputImage[((y + 1) * w + x) * 4 + 3];

                float gx = (float)(-a00 + a02 - 2 * a10 + 2 * a12 - a20 + a22);
                float gy = (float)(-a00 - 2 * a01 - a02 + a20 + 2 * a21 + a22);
                float mag = sqrtf(gx * gx + gy * gy);

                if (mag > gradThresh || inputImage[(y * w + x) * 4 + 3] > (uint8_t)threshold) {
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

    for (int y = bottomY; y >= topY; y--) {
        if (hasRow[y] && rawCount < MAX_CONTOUR - 16) {
            rawX[rawCount] = leftX[y];
            rawY[rawCount] = (float)y;
            rawCount++;
        }
    }
    if (leftX[topY] != rightX[topY] && rawCount < MAX_CONTOUR - 16) {
        rawX[rawCount] = rightX[topY];
        rawY[rawCount] = (float)topY;
        rawCount++;
    }
    for (int y = topY + 1; y <= bottomY; y++) {
        if (hasRow[y] && rawCount < MAX_CONTOUR - 16) {
            rawX[rawCount] = rightX[y];
            rawY[rawCount] = (float)y;
            rawCount++;
        }
    }
}

// =============================================================================
// ALGORITHM 2: Radial Centroid Raycast
// Finds subject centroid and casts radial rays outward across 180-240 degrees
// spanning shoulders, neck, face, and hair apex.
// =============================================================================
inline void traceRadialRaycast(
    uint8_t* inputImage,
    int w,
    int h,
    int threshold,
    int pinBottom,
    float* rawX,
    float* rawY,
    int& rawCount
) {
    float sumX = 0.0f;
    float sumY = 0.0f;
    int count = 0;

    for (int y = 0; y < h; y += 2) {
        for (int x = 0; x < w; x += 2) {
            if (inputImage[(y * w + x) * 4 + 3] > (uint8_t)threshold) {
                sumX += (float)x;
                sumY += (float)y;
                count++;
            }
        }
    }
    if (count < 20) return;

    float cx = sumX / (float)count;
    float cy = sumY / (float)count;
    float maxR = (float)w * 0.72f;

    // Sweep from bottom-left angle (approx 140 deg = 0.78 * PI) over top (-PI/2) to bottom-right (approx 40 deg = 0.22 * PI)
    const int STEPS = 220;
    for (int i = 0; i < STEPS; i++) {
        if (rawCount >= MAX_CONTOUR - 16) break;
        // Map i from +PI*0.85 around top to +PI*0.15
        float t = (float)i / (float)(STEPS - 1);
        float angle = (float)M_PI * (0.88f - t * 0.76f);

        float dirX = -cosf(angle);
        float dirY = -sinf(angle);

        float lastHitX = cx;
        float lastHitY = cy;
        bool found = false;

        for (float r = 4.0f; r < maxR; r += 1.0f) {
            int px = (int)roundf(cx + dirX * r);
            int py = (int)roundf(cy + dirY * r);
            if (px < 0 || px >= w || py < 0 || py >= h) break;

            if (inputImage[(py * w + px) * 4 + 3] > (uint8_t)threshold) {
                lastHitX = (float)px;
                lastHitY = (float)py;
                found = true;
            } else if (found) {
                break;
            }
        }

        if (found) {
            rawX[rawCount] = lastHitX;
            rawY[rawCount] = lastHitY;
            rawCount++;
        }
    }
}

// Master Silhouette Contour Extraction with configurable algorithm & sensitivity
inline void extractSilhouetteContour(
    uint8_t* inputImage,
    int w,
    int h,
    int algorithm,
    int threshold,
    int pinBottom,
    ContourPoint* contour,
    int& contourCount
) {
    contourCount = 0;
    if (w <= 0 || h <= 0 || w > MAX_IMAGE_DIM || h > MAX_IMAGE_DIM) return;

    if (threshold < 5) threshold = 5;
    if (threshold > 150) threshold = 150;

    static float rawX[MAX_CONTOUR];
    static float rawY[MAX_CONTOUR];
    int rawCount = 0;

    if (algorithm == 1) {
        traceSobelGradient(inputImage, w, h, threshold, pinBottom, rawX, rawY, rawCount);
    } else if (algorithm == 2) {
        traceRadialRaycast(inputImage, w, h, threshold, pinBottom, rawX, rawY, rawCount);
    } else {
        tracePerimeterAlpha(inputImage, w, h, threshold, pinBottom, rawX, rawY, rawCount);
    }

    // Fallback to perimeter if alternative algorithm produced too few points
    if (rawCount < 16 && algorithm != 0) {
        rawCount = 0;
        tracePerimeterAlpha(inputImage, w, h, threshold, pinBottom, rawX, rawY, rawCount);
    }

    if (rawCount < 8) return;

    // Moving average smoothing window (win = 7)
    const int WIN = 7;
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

    if (contourCount > 2 && pinBottom) {
        contour[0].y = (float)(h - 1);
        contour[contourCount - 1].y = (float)(h - 1);
    }

    // True outward normal vectors
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
