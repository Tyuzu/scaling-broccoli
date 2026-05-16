/**
 * Router module - decoupled from route definitions.
 * Routes are managed in config/routes.ts
 * Uses event emitter for loose coupling with rest of app.
 */

import { routes, type Route } from '../config/routes';
import { eventBus, Events } from '../core/EventEmitter';

type Params = Record<string, string>;

let currentRequest = 0;
let appElement: HTMLDivElement | null = null;

export function initRouter(selector: string = '#app') {
  appElement = document.querySelector<HTMLDivElement>(selector);
  
  if (!appElement) {
    throw new Error(`App container not found: ${selector}`);
  }

  // Handle browser back/forward
  window.addEventListener('popstate', renderRoute);

  // Handle link clicks with data-link attribute
  document.body.addEventListener('click', (e) => {
    const link = (e.target as HTMLElement).closest('[data-link]');
    if (link) {
      e.preventDefault();
      const href = link.getAttribute('href');
      if (href) navigate(href);
    }
  });

  // Render initial route
  renderRoute();
}

export function navigate(path: string) {
  history.pushState({}, '', path);
  renderRoute();
}

async function renderRoute() {
  const requestId = ++currentRequest;

  if (!appElement) {
    console.error('Router not initialized');
    return;
  }

  const url = new URL(location.href);
  const path = url.pathname;
  const query = Object.fromEntries(url.searchParams.entries());

  appElement.innerHTML = '<p>Loading...</p>';
  eventBus.emit(Events.ROUTE_LOADING, { path });

  // Sort routes: more static segments first
  const rankedRoutes = [...routes].sort(rankRoute);

  for (const route of rankedRoutes) {
    const params = matchRoute(route.path, path);

    if (params) {
      try {
        eventBus.emit(Events.ROUTE_LOADING, { path, route: route.name });
        
        const mod = await route.loader();

        // Discard if newer request came in
        if (requestId !== currentRequest) return;

        const render = mod.render || mod.default;
        if (!render) throw new Error('No render function exported');

        const html = render(params, query);
        appElement.innerHTML = html;
        window.scrollTo(0, 0);

        eventBus.emit(Events.ROUTE_LOADED, { path, route: route.name });
      } catch (err) {
        if (requestId !== currentRequest) return;

        const errorMsg = err instanceof Error ? err.message : String(err);
        appElement.innerHTML = `<div class="error"><h1>Error loading page</h1><p>${errorMsg}</p></div>`;
        
        eventBus.emit(Events.ROUTE_ERROR, { path, error: errorMsg });
        console.error('Route error:', err);
      }
      return;
    }
  }

  appElement.innerHTML = '<div class="not-found"><h1>404</h1><p>Page not found</p></div>';
  eventBus.emit(Events.ROUTE_ERROR, { path, error: 'Not Found' });
}

function matchRoute(routePath: string, actualPath: string): Params | null {
  const routeParts = routePath.split('/').filter(Boolean);
  const pathParts = actualPath.split('/').filter(Boolean);

  if (routeParts.length !== pathParts.length) return null;

  const params: Params = {};

  for (let i = 0; i < routeParts.length; i++) {
    const routePart = routeParts[i];
    const pathPart = pathParts[i];

    if (routePart.startsWith(':')) {
      params[routePart.slice(1)] = decodeURIComponent(pathPart);
    } else if (routePart !== pathPart) {
      return null;
    }
  }

  return params;
}

/**
 * Rank routes: static segments > dynamic
 * Ensures more specific routes are matched first
 */
function rankRoute(a: Route, b: Route) {
  const score = (path: string) =>
    path.split('/').reduce((acc, part) => {
      if (!part) return acc;
      return acc + (part.startsWith(':') ? 1 : 10);
    }, 0);

  return score(b.path) - score(a.path);
}