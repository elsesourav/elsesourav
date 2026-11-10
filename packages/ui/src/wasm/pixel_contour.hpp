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

// Master Silhouette Contour Extraction with configurable algorithm & sensitivity
// Equidistant arc-length resampling guarantees constant travel speed across the entire path.
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

    // Algorithm 1: Sobel Edge Gradient. Default / Algorithm 0: Perimeter Alpha Scan.
    if (algorithm == 1) {
        traceSobelGradient(inputImage, w, h, threshold, pinBottom, rawX, rawY, rawCount);
    } else {
        tracePerimeterAlpha(inputImage, w, h, threshold, pinBottom, rawX, rawY, rawCount);
    }

    // Fallback to perimeter if alternative algorithm produced too few points
    if (rawCount < 16 && algorithm != 0) {
        rawCount = 0;
        tracePerimeterAlpha(inputImage, w, h, threshold, pinBottom, rawX, rawY, rawCount);
    }

    if (rawCount < 8) return;

    // 1. Moving average smoothing on raw points to eliminate pixel discretization noise
    static float smoothX[MAX_CONTOUR];
    static float smoothY[MAX_CONTOUR];
    const int WIN = 5;
    const int HALF = WIN / 2;

    for (int i = 0; i < rawCount; i++) {
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
        smoothX[i] = sumX / (float)count;
        smoothY[i] = sumY / (float)count;
    }

    // 2. Compute cumulative arc-length distances along the smoothed path
    static float arcLen[MAX_CONTOUR];
    arcLen[0] = 0.0f;
    for (int i = 1; i < rawCount; i++) {
        float dx = smoothX[i] - smoothX[i - 1];
        float dy = smoothY[i] - smoothY[i - 1];
        arcLen[i] = arcLen[i - 1] + sqrtf(dx * dx + dy * dy);
    }
    float totalLen = arcLen[rawCount - 1];
    if (totalLen < 2.0f) return;

    // 3. Equidistant arc-length resampling:
    // Every consecutive point is placed at the exact same distance (actualStep pixels)
    // guaranteeing perfectly constant particle traversal speed across all parts of the silhouette!
    float targetStep = 1.6f;
    int numSamples = (int)(totalLen / targetStep);
    if (numSamples < 24) numSamples = 24;
    if (numSamples > MAX_CONTOUR - 8) numSamples = MAX_CONTOUR - 8;

    float actualStep = totalLen / (float)(numSamples - 1);
    int currSeg = 0;

    for (int s = 0; s < numSamples; s++) {
        float targetDist = (float)s * actualStep;
        while (currSeg < rawCount - 2 && arcLen[currSeg + 1] < targetDist) {
            currSeg++;
        }
        float segStart = arcLen[currSeg];
        float segEnd = arcLen[currSeg + 1];
        float segDist = segEnd - segStart;
        float t = (segDist > 0.0001f) ? ((targetDist - segStart) / segDist) : 0.0f;
        if (t < 0.0f) t = 0.0f;
        if (t > 1.0f) t = 1.0f;

        contour[s].x = smoothX[currSeg] + t * (smoothX[currSeg + 1] - smoothX[currSeg]);
        contour[s].y = smoothY[currSeg] + t * (smoothY[currSeg + 1] - smoothY[currSeg]);
    }
    contourCount = numSamples;

    if (pinBottom && contourCount > 2) {
        contour[0].y = (float)(h - 1);
        contour[contourCount - 1].y = (float)(h - 1);
    }

    // 4. Compute true outward normal vectors
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
