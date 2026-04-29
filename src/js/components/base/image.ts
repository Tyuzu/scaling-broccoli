import { createElement } from '../utils/createElement';

interface ImageProps {
  src: string;
  alt?: string;
  className?: string;
}

export function Image({
  src,
  alt = '',
  className
}: ImageProps): HTMLImageElement {
  return createElement('img', {
    class: className,
    attrs: { src, alt }
  });
}