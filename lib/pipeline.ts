import { createColor } from "./color";
import { oklchToRgb, rgbToOklch } from "./color-space";
import type { Color, FilterOptions, PixelBuffer, Quantizer, ValidatedOptions } from "./model";

export function createPixelArray(
    data: PixelBuffer,
    pixelCount: number,
    quality: number,
    filterOptions: FilterOptions,
): Array<[number, number, number]> {
    const {
        ignoreWhite = true,
        whiteThreshold = 250,
        alphaThreshold = 125,
        minSaturation = 0,
    } = filterOptions;

    const pixelArray: Array<[number, number, number]> = [];

    for (let i = 0; i < pixelCount; i += quality) {
        const offset = i * 4;
        const r = data[offset];
        const g = data[offset + 1];
        const b = data[offset + 2];
        const a = data[offset + 3];

        if ((!r) || (!g) || (!b)) continue; 

        if (a !== undefined && a < alphaThreshold) continue;

        if (
            ignoreWhite &&
            r > whiteThreshold &&
            g > whiteThreshold &&
            b > whiteThreshold
        )
            continue;

        if (minSaturation > 0) {
            const max = Math.max(r, g, b);
            if (max === 0 || (max - Math.min(r, g, b)) / max < minSaturation)
                continue;
        }

        pixelArray.push([r, g, b]);
    }

    return pixelArray;
}


export function computeFallbackColor(
    data: PixelBuffer,
    pixelCount: number,
    quality: number,
): [number, number, number] | null {
    let rTotal = 0;
    let gTotal = 0;
    let bTotal = 0;
    let count = 0;

    for (let i = 0; i < pixelCount; i += quality) {
        const offset = i * 4;
        rTotal += data[offset]!;
        gTotal += data[offset + 1]!;
        bTotal += data[offset + 2]!;
        count++;
    }

    if (count === 0) return null;

    return [
        Math.round(rTotal / count),
        Math.round(gTotal / count),
        Math.round(bTotal / count),
    ];
}

export function pixelsRgbToOklchScaled(
    pixels: Array<[number, number, number]>,
): Array<[number, number, number]> {
    const out: Array<[number, number, number]> = new Array(pixels.length);
    for (let i = 0; i < pixels.length; i++) {
        const pixel = pixels[i]!;
        const { l, c, h } = rgbToOklch(pixel[0], pixel[1], pixel[2]);
        out[i] = [
            Math.round(l * 255),
            Math.round((c / 0.4) * 255),
            Math.round((h / 360) * 255),
        ];
    }
    return out;
}

export function paletteOklchScaledToRgb(
    colors: Array<{ color: [number, number, number]; population: number }>,
): Array<{ color: [number, number, number]; population: number }> {
    return colors.map(({ color: [ls, cs, hs], population }) => {
        const l = ls / 255;
        const c = (cs / 255) * 0.4;
        const h = (hs / 255) * 360;
        return { color: oklchToRgb(l, c, h), population };
    });
}

export function extractPalette(
    data: PixelBuffer,
    width: number,
    height: number,
    opts: ValidatedOptions,
    quantizer: Quantizer,
): Color[] | null {
    const pixelCount = width * height;
    const filterOptions: FilterOptions = {
        ignoreWhite: opts.ignoreWhite,
        whiteThreshold: opts.whiteThreshold,
        alphaThreshold: opts.alphaThreshold,
        minSaturation: opts.minSaturation,
    };

    let pixelArray = createPixelArray(data, pixelCount, opts.quality, filterOptions);

    if (pixelArray.length === 0) {
        pixelArray = createPixelArray(data, pixelCount, opts.quality, {
            ...filterOptions,
            ignoreWhite: false,
        });
    }
    if (pixelArray.length === 0) {
        pixelArray = createPixelArray(data, pixelCount, opts.quality, {
            ...filterOptions,
            ignoreWhite: false,
            alphaThreshold: 0,
        });
    }

    let quantized: Array<{ color: [number, number, number]; population: number }>;
    if (opts.colorSpace === 'oklch') {
        const scaled = pixelsRgbToOklchScaled(pixelArray);
        quantized = paletteOklchScaledToRgb(
            quantizer.quantize(scaled, opts.colorCount),
        );
    } else {
        quantized = quantizer.quantize(pixelArray, opts.colorCount);
    }

    if (quantized.length > 0) {
        const totalPopulation = quantized.reduce((sum, q) => sum + q.population, 0);
        return quantized.map(({ color: [r, g, b], population }) =>
            createColor(r, g, b, population, totalPopulation > 0 ? population / totalPopulation : 0),
        );
    }

    const fallback = computeFallbackColor(data, pixelCount, opts.quality);
    return fallback ? [createColor(fallback[0], fallback[1], fallback[2], 1, 1)] : null;
}
