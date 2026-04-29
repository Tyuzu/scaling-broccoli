import { createElement } from '../utils/createElement';
import { Image } from '../base/image';
import { makeZoomable } from '../utils/zoomable';

interface LightboxProps {
  src: string;
}

export function Lightbox({ src }: LightboxProps): HTMLDivElement {
  const img = Image({ src });

  const overlay = createElement('div', {
    classes: ['lightbox'],
    children: img,
    on: {
      click: () => overlay.remove()
    }
  });

  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    background: 'rgba(0,0,0,0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  });

  makeZoomable(overlay);

  return overlay;
}