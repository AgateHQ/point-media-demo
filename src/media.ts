export function fadeImage(image: HTMLImageElement) {
  const loaded = () => image.classList.add('loaded');
  if (image.complete) loaded();
  else image.addEventListener('load', loaded, { once: true });
  return { destroy: () => image.removeEventListener('load', loaded) };
}
