import { eventBus, Events } from '../core/EventEmitter';
import type { Cart } from '../services/CartService';

export type State = {
  language: string;
  cart?: Cart;
  currentOrder?: any;
  isCheckingOut?: boolean;
  [key: string]: any; // Allow extension
};

let state: State = {
  language: 'en',
  cart: {
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    itemCount: 0
  },
  isCheckingOut: false
};

const listeners = new Set<(s: State) => void>();

export function getState(): Readonly<State> {
  return state;
}

/**
 * Update state and notify listeners
 * Emits events via EventBus for decoupled communication
 */
export function setState(partial: Partial<State>) {
  const nextState = { ...state, ...partial };

  // shallow change detection
  const changed = Object.keys(partial).some(
    key => state[key as keyof State] !== nextState[key as keyof State]
  );

  if (!changed) return;

  const prevLanguage = state.language;
  state = nextState;

  // Notify direct subscribers
  listeners.forEach(listener => listener(state));

  // Emit language change event for decoupled notification
  if (prevLanguage !== state.language) {
    eventBus.emit(Events.LANGUAGE_CHANGED, { language: state.language });
  }
}

export function subscribe(listener: (s: State) => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}