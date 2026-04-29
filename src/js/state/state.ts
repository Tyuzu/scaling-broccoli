type State = {
  language: string;
};

let state: State = {
  language: 'en'
};

const listeners = new Set<(s: State) => void>();

export function getState(): Readonly<State> {
  return state;
}

export function setState(partial: Partial<State>) {
  const nextState = { ...state, ...partial };

  // shallow change detection
  const changed = Object.keys(partial).some(
    key => state[key as keyof State] !== nextState[key as keyof State]
  );

  if (!changed) return;

  state = nextState;

  listeners.forEach(listener => listener(state));
}

export function subscribe(listener: (s: State) => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}