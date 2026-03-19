export type PixelBuffer = Uint8Array | Uint8ClampedArray;
export type CssColorFormat = 'rgb' | 'hsl' | 'oklch';
export type ImageSource = string; 

export interface Quantizer {
    init(): Promise<void>;
    quantize(
        pixels: Array<[number, number, number]>,
        maxColors: number,
    ): Array<{ color: [number, number, number]; population: number }>;
};

export interface PixelLoader<TSource> {
    load(source: TSource, signal?: AbortSignal): Promise<PixelData>;
}

export interface PixelData {
    data: PixelBuffer;
    width: number;
    height: number;
}

export interface ExtractionOptions {
    colorCount?: number;
    quality?: number;
    colorSpace?: 'rgb' | 'oklch';
    worker?: boolean;
    quantizer?: Quantizer;
    loader?: PixelLoader<ImageSource>;
    ignoreWhite?: boolean;
    whiteThreshold?: number;
    alphaThreshold?: number;
    minSaturation?: number;
}

export interface FilterOptions {
    ignoreWhite?: boolean;
    whiteThreshold?: number;
    alphaThreshold?: number;
    minSaturation?: number;
}

export interface RGB {
    r: number;
    g: number;
    b: number;
}

export interface HSL {
    h: number;
    s: number;
    l: number;
}

export interface OKLCH {
    l: number;
    c: number;
    h: number;
}

export interface ContrastInfo {
    white: number;
    black: number;
    foreground: Color;
}


export interface Color {
    rgb(): RGB;
    hex(): string;
    hsl(): HSL;
    oklch(): OKLCH;
    css(format?: CssColorFormat): string;
    array(): [number, number, number];
    toString(): string;
    readonly textColor: string;
    readonly isDark: boolean;
    readonly isLight: boolean;
    readonly contrast: ContrastInfo;
    readonly population: number;
    readonly proportion: number;
}

export interface ValidatedOptions {
    colorCount: number;
    quality: number;
    ignoreWhite: boolean;
    whiteThreshold: number;
    alphaThreshold: number;
    minSaturation: number;
    colorSpace: 'rgb' | 'oklch';
}