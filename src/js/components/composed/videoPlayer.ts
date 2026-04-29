import { createElement } from '../utils/createElement';
import { Video } from '../base/video';
import { makeZoomable } from '../utils/zoomable';

interface VideoPlayerProps {
  src: string;
}

export function VideoPlayer({ src }: VideoPlayerProps): HTMLDivElement {
  const video = Video({ src });

  const container = createElement('div', {
    classes: ['video-player'],
    children: video
  });

  makeZoomable(container);

  return container;
}