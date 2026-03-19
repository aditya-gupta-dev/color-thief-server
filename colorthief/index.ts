// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export {
    getColor,
    getPalette,
    getSwatches,
    getPaletteProgressive,
    configure,
} from './api.js';


export { createColor } from './color.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type {
    RGB,
    HSL,
    OKLCH,
    FilterOptions,
    ColorSpace,
    ExtractionOptions,
    ContrastInfo,
    Color,
    CssColorFormat,
    SwatchRole,
    Swatch,
    SwatchMap,
    BrowserSource,
    NodeSource,
    ImageSource,
    ProgressiveResult,
} from './types.js';
