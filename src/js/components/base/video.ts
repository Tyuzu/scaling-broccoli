import { createElement } from '../utils/createElement';

interface VideoProps {
  src: string;
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  className?: string;
}

export function Video({
  src,
  controls = true,
  autoplay = false,
  loop = false,
  className
}: VideoProps): HTMLVideoElement {
  return createElement('video', {
    class: className,
    attrs: { src },
    props: { controls, autoplay, loop }
  });
}