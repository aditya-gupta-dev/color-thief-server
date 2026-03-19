import type {
    Color,
    ExtractionOptions,
    ImageSource,
    PixelData,
    PixelLoader,
    ProgressiveResult,
    Quantizer,
    SwatchMap,
} from './types.js';
import { validateOptions, extractPalette } from './pipeline.js';
import { extractProgressive } from './progressive.js';
import { classifySwatches } from './swatches.js';
import { MmcqQuantizer } from './quantizers/mmcq.js';
import { resolveDefaultLoader } from './resolve-loader.js';

// ---------------------------------------------------------------------------
// Global configuration
// ---------------------------------------------------------------------------

let globalLoader: PixelLoader<ImageSource> | null = null;
let globalQuantizer: Quantizer | null = null;

/**
 * Override the default pixel loader and/or quantizer.
 *
 * ```ts
 * import { configure } from 'colorthief';
 * import { WasmQuantizer } from 'colorthief/internals';
 * const q = new WasmQuantizer();
 * await q.init();
 * configure({ quantizer: q });
 * ```
 */
export function configure(opts: {
    loader?: PixelLoader<ImageSource>;
    quantizer?: Quantizer;
}): void {
    if (opts.loader) { globalLoader = opts.loader; };
    if (opts.quantizer) { globalQuantizer = opts.quantizer; };
}

// ---------------------------------------------------------------------------
// Lazy environment detection
// ---------------------------------------------------------------------------

async function getLoader(perCall?: PixelLoader<ImageSource>): Promise<PixelLoader<ImageSource>> {
    console.log("loader-1");
    if (perCall) { return perCall; }
    console.log("loader-2");
    if (globalLoader) { return globalLoader; }
    console.log("loader-3");
    
    globalLoader = await resolveDefaultLoader();
    return globalLoader;
}

async function getQuantizer(perCall?: Quantizer): Promise<Quantizer> {
    if (perCall) {
        await perCall.init();
        return perCall;
    }
    if (globalQuantizer) { return globalQuantizer; }
    const q = new MmcqQuantizer();
    await q.init();
    globalQuantizer = q;
    return q;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function checkAborted(signal?: AbortSignal): void {
    if (signal?.aborted) {
        throw signal.reason ?? new Error('Aborted');
    }
}

async function loadPixels(
    source: ImageSource,
    options?: ExtractionOptions,
): Promise<PixelData> {
    console.log('loadPixels: starting');
    checkAborted(options?.signal);
    console.log('loadPixels: getting loader');
    const loader = await getLoader(options?.loader);
    console.log('loadPixels: loading source');
    const result = await loader.load(source, options?.signal);
    console.log('loadPixels: finished');
    return result;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get the single dominant color from an image.
 *
 * ```ts
 * const color = await getColor(imgElement);
 * console.log(color.hex()); // '#e84393'
 * ```
 */
export async function getColor(
    source: ImageSource,
    options?: ExtractionOptions,
): Promise<Color | null> {
    const palette = await getPalette(source, {
        colorCount: 5,
        ...options,
    });
    return palette ? palette[0] : null;
}

/**
 * Get a color palette from an image.
 *
 * ```ts
 * const palette = await getPalette(imgElement, { colorCount: 5 });
 * palette.forEach(c => console.log(c.hex()));
 * ```
 */
export async function getPalette(
    source: ImageSource,
    options?: ExtractionOptions,
): Promise<Color[] | null> {
    const opts = validateOptions(options ?? {});

    checkAborted(options?.signal);

    console.log('getPalette: awaiting loadPixels and getQuantizer');
    const [pixels, quantizer] = await Promise.all([
        loadPixels(source, options),
        getQuantizer(options?.quantizer),
    ]);
    console.log('getPalette: loadPixels and getQuantizer completed');

    checkAborted(options?.signal);

    console.log('getPalette: extracting palette');
    const result = extractPalette(
        pixels.data,
        pixels.width,
        pixels.height,
        opts,
        quantizer,
    );
    console.log('getPalette: palette extracted');
    return result;
}

/**
 * Get semantic swatches (Vibrant, Muted, etc.) from an image.
 *
 * ```ts
 * const swatches = await getSwatches(imgElement);
 * console.log(swatches.Vibrant?.color.hex());
 * ```
 */
export async function getSwatches(
    source: ImageSource,
    options?: ExtractionOptions,
): Promise<SwatchMap> {
    const palette = await getPalette(source, {
        colorCount: 16,
        ...options,
    });
    return classifySwatches(palette ?? []);
}

/**
 * Progressively extract a palette with increasing quality.
 * Yields intermediate results so the UI can update incrementally.
 *
 * ```ts
 * for await (const { palette, progress, done } of getPaletteProgressive(img)) {
 *   updateUI(palette, progress);
 * }
 * ```
 */
export async function* getPaletteProgressive(
    source: ImageSource,
    options?: ExtractionOptions,
): AsyncGenerator<ProgressiveResult> {
    const opts = validateOptions(options ?? {});

    const [pixels, quantizer] = await Promise.all([
        loadPixels(source, options),
        getQuantizer(options?.quantizer),
    ]);

    yield* extractProgressive(
        pixels.data,
        pixels.width,
        pixels.height,
        opts,
        quantizer,
        options?.signal,
    );
}
