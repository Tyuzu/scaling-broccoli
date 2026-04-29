export interface ZoomOptions {
  minScale?: number;
  maxScale?: number;
  step?: number;
}

export function makeZoomable(
  container: HTMLElement,
  opts: ZoomOptions = {}
) {
  const target = container.firstElementChild as HTMLElement | null;
  if (!target) return () => {};

  const minScale = opts.minScale ?? 1;
  const maxScale = opts.maxScale ?? 4;
  const step = opts.step ?? 0.1;

  let scale = 1;
  let x = 0;
  let y = 0;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  const apply = () => {
    target.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    target.style.transformOrigin = 'center center';
    target.style.willChange = 'transform';
  };

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? step : -step;
    const next = Math.min(maxScale, Math.max(minScale, scale + delta));
    if (next === scale) return;
    scale = next;
    apply();
  };

  const onDown = (e: PointerEvent) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    x += dx;
    y += dy;
    apply();
  };

  const onUp = (e: PointerEvent) => {
    dragging = false;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  const onDblClick = () => {
    scale = 1;
    x = 0;
    y = 0;
    apply();
  };

  container.style.overflow = 'hidden';
  container.style.touchAction = 'none';
  target.style.cursor = 'grab';

  container.addEventListener('wheel', onWheel, { passive: false });
  container.addEventListener('pointerdown', onDown);
  container.addEventListener('pointermove', onMove);
  container.addEventListener('pointerup', onUp);
  container.addEventListener('pointerleave', onUp);
  container.addEventListener('dblclick', onDblClick);

  apply();

  return () => {
    container.removeEventListener('wheel', onWheel);
    container.removeEventListener('pointerdown', onDown);
    container.removeEventListener('pointermove', onMove);
    container.removeEventListener('pointerup', onUp);
    container.removeEventListener('pointerleave', onUp);
    container.removeEventListener('dblclick', onDblClick);
  };
}