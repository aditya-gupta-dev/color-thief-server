// ---------------------------------------------------------------------------
// colorthief/internals
//
// Power-user exports: loaders, quantizers, color-space math, worker manager.
// Most consumers should use the main 'colorthief' entry point instead.
// ---------------------------------------------------------------------------

// Quantizers
export { MmcqQuantizer } from './quantizers/mmcq.js';

// Loaders
export { NodePixelLoader, createNodeLoader } from './loaders/node.js';
export type { NodeImageDecoder } from './loaders/node.js';

// Swatches (standalone classifier)
export { classifySwatches } from './swatches.js';

// Color space conversions
export {
    rgbToOklch,
    oklchToRgb,
    srgbToLinear,
    linearToSrgb,
    pixelsRgbToOklchScaled,
    paletteOklchScaledToRgb,
} from './color-space.js';

// Low-level pipeline
export {
    validateOptions,
    createPixelArray,
    computeFallbackColor,
    extractPalette,
} from './pipeline.js';

// Types not needed by most consumers
export type {
    PixelBuffer,
    PixelData,
    PixelLoader,
    Quantizer,
} from './types.js';
