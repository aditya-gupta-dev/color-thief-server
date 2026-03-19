import type { ImageSource, PixelLoader } from './types.js';

/**
 * Resolve the default pixel loader based on the current environment.
 * This universal version supports both browser and Node.js.
 */
export async function resolveDefaultLoader(): Promise<PixelLoader<ImageSource>> {
    const { NodePixelLoader } = await import('./loaders/node.js');
    return new NodePixelLoader() as PixelLoader<ImageSource>;
}
