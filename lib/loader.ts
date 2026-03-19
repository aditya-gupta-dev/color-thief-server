import type { ExtractionOptions, ImageSource, PixelData, PixelLoader } from "./model";

async function loadPixels(
    source: ImageSource,
    options?: ExtractionOptions,
): Promise<PixelData> {
    const loader = await getLoader(options?.loader);
    return loader.load(source);
}

async function getLoader(loader?: PixelLoader<ImageSource>): Promise<PixelLoader<ImageSource>> { 
    if (loader) return loader;
    return loader!; 
}

