import { createElement } from '../utils/createElement';

interface AudioProps {
  src: string;
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
}

export function Audio({
  src,
  controls = true,
  autoplay = false,
  loop = false
}: AudioProps): HTMLAudioElement {
  return createElement('audio', {
    attrs: { src },
    props: { controls, autoplay, loop }
  });
}