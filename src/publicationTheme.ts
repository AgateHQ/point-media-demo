export const defaultBrandColor = '#dc2626';

export function normalizeHex(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const hex = value.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(hex)) return hex;
  if (/^#[0-9a-f]{3}$/.test(hex)) return `#${[...hex.slice(1)].map(channel => channel + channel).join('')}`;
  return undefined;
}

function channels(hex: string) {
  return [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16));
}
function mix(color: string, other: string, amount: number) {
  const target = channels(other);
  return `#${channels(color).map((channel, index) => Math.round(channel * (1 - amount) + target[index] * amount).toString(16).padStart(2, '0')).join('')}`;
}
function luminance(hex: string) {
  const linear = channels(hex).map(channel => {
    const value = channel / 255;
    return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
  });
  return linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
}
export function contrastRatio(a: string, b: string) {
  const values = [luminance(a), luminance(b)];
  return (Math.max(...values) + .05) / (Math.min(...values) + .05);
}

// Keep the chosen colour for the masthead/buttons; darken only text accents
// when a pale brand colour would be difficult to read on the tinted paper.
export function publicationTheme(value: unknown) {
  const accent = normalizeHex(value) || defaultBrandColor;
  const color = mix(accent, '#ffffff', .97);
  let brand = accent;
  for (let step = 1; contrastRatio(brand, color) < 4.5 && step <= 20; step++) {
    brand = mix(accent, '#000000', step / 20);
  }
  const brandInk = contrastRatio(accent, '#000000') >= contrastRatio(accent, '#ffffff') ? '#000000' : '#ffffff';
  return {
    color, accent, brand, brandInk,
    ink: mix(accent, '#111111', .9),
    header: accent, headerInk: brandInk,
    canvas: mix(accent, '#ffffff', .9),
  };
}
