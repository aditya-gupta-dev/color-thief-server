import type { NodeSource, PixelData, PixelLoader } from '../types.js';
import Jimp from 'jimp';
import { readFile } from 'fs/promises';

export type NodeImageDecoder = (
    input: string | Buffer,
) => Promise<{ data: Uint8Array; width: number; height: number }>;

interface NodeLoaderOptions {
    decoder?: NodeImageDecoder;
}

export class NodePixelLoader implements PixelLoader<NodeSource> {
    private readonly decoder: NodeImageDecoder;

    constructor(options?: NodeLoaderOptions) {
        this.decoder = options?.decoder ?? defaultJimpDecoder;
    }

    async load(source: NodeSource): Promise<PixelData> {
        const result = await this.decoder(source);
        return {
            data: result.data,
            width: result.width,
            height: result.height,
        };
    }
}

async function defaultJimpDecoder(
    input: string | Buffer,
): Promise<{ data: Uint8Array; width: number; height: number }> {
    try {
        let imageBuffer: Buffer;
        if (typeof input === 'string') {
            imageBuffer = await readFile(input);
        } else {
            imageBuffer = input;
        }
        const image = await Jimp.read(imageBuffer);
        const { width, height, data } = image.bitmap;
        return { data: new Uint8Array(data), width, height };
    } catch (err) {
        console.error(err);
        throw new Error('Failed to decode image using Jimp.');
    }
}

export function createNodeLoader(options?: NodeLoaderOptions): NodePixelLoader {
    return new NodePixelLoader(options);
}
