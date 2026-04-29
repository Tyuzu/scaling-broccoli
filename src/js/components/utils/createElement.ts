type Child = Node | string | number | null | undefined | false;
type Children = Child | Child[];

type EventMap<T extends HTMLElement> = {
  [K in keyof HTMLElementEventMap]?: (
    event: HTMLElementEventMap[K] & { currentTarget: T }
  ) => void;
};

interface BaseOptions<T extends HTMLElement> {
  id?: string;
  class?: string;
  classes?: string[];
  attrs?: Record<string, string>;
  style?: Partial<CSSStyleDeclaration>;
  dataset?: Record<string, string>;
  on?: EventMap<T>;
  children?: Children;
}

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options: BaseOptions<HTMLElementTagNameMap[K]> & {
    props?: Partial<HTMLElementTagNameMap[K]>;
  } = {}
): HTMLElementTagNameMap[K] {
  const {
    id,
    class: className,
    classes = [],
    attrs = {},
    props = {},
    style = {},
    dataset = {},
    on = {},
    children
  } = options;

  const el = document.createElement(tag);

  if (id) el.id = id;
  if (className) el.className = className;
  if (classes.length) el.classList.add(...classes);

  Object.entries(attrs).forEach(([k, v]) => {
    el.setAttribute(k, v);
  });

  Object.assign(el, props); // now correctly typed

  Object.assign(el.style, style);

  Object.entries(dataset).forEach(([k, v]) => {
    el.dataset[k] = v;
  });

  Object.entries(on).forEach(([event, handler]) => {
    if (handler) {
      el.addEventListener(event, handler as EventListener);
    }
  });

  const append = (child: Child) => {
    if (!child) return;
    if (child instanceof Node) {
      el.appendChild(child);
    } else {
      el.appendChild(document.createTextNode(String(child)));
    }
  };

  if (Array.isArray(children)) {
    children.forEach(append);
  } else {
    append(children);
  }

  return el;
}