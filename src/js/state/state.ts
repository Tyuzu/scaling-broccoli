type State = {
  language: string;
};

const state: State = {
  language: 'en'
};

const listeners: ((s: State) => void)[] = [];

export function getState() {
  return state;
}

export function setState(partial: Partial<State>) {
  Object.assign(state, partial);
  listeners.forEach(l => l(state));
}

export function subscribe(listener: (s: State) => void) {
  listeners.push(listener);
}