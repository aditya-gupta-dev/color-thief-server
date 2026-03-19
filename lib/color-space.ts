import type { OKLCH } from "./model";

export function srgbToLinear(c: number): number {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function oklchToRgb(l: number, c: number, h: number): [number, number, number] {
    const hRad = h * (Math.PI / 180);
    const a = c * Math.cos(hRad);
    const bLab = c * Math.sin(hRad);

    const l3 = l + 0.3963377774 * a + 0.2158037573 * bLab;
    const m3 = l - 0.1055613458 * a - 0.0638541728 * bLab;
    const s3 = l - 0.0894841775 * a - 1.2914855480 * bLab;

    const l_ = l3 * l3 * l3;
    const m_ = m3 * m3 * m3;
    const s_ = s3 * s3 * s3;

    const lr = +4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
    const lg = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
    const lb = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_;

    return [linearToSrgb(lr), linearToSrgb(lg), linearToSrgb(lb)];
}

export function rgbToOklch(r: number, g: number, b: number): OKLCH {
    const lr = srgbToLinear(r);
    const lg = srgbToLinear(g);
    const lb = srgbToLinear(b);

    const l_ = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
    const m_ = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
    const s_ = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

    const l3 = Math.cbrt(l_);
    const m3 = Math.cbrt(m_);
    const s3 = Math.cbrt(s_);

    const L = 0.2104542553 * l3 + 0.7936177850 * m3 - 0.0040720468 * s3;
    const a = 1.9779984951 * l3 - 2.4285922050 * m3 + 0.4505937099 * s3;
    const bLab = 0.0259040371 * l3 + 0.7827717662 * m3 - 0.8086757660 * s3;

    const C = Math.sqrt(a * a + bLab * bLab);
    let H = Math.atan2(bLab, a) * (180 / Math.PI);
    if (H < 0) H += 360;

    return { l: L, c: C, h: H };
}

export function linearToSrgb(c: number): number {
    const s = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    return Math.round(Math.max(0, Math.min(255, s * 255)));
}