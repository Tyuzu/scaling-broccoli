type Params = Record<string, string>;

type PageModule = {
  default?: (params: any, query: Params) => string;
  render?: (params: any, query: Params) => string;
};

type Route = {
  path: string;
  loader: () => Promise<PageModule>;
};

const routes: Route[] = [
  {
    path: '/',
    loader: () => import('../pages/home.ts')
  },
  {
    path: '/about',
    loader: () => import('../pages/about.ts')
  },
  {
    path: '/user/:id',
    loader: () => import('../pages/user.ts')
  }
];

let currentRequest = 0;

export function initRouter() {
  window.addEventListener('popstate', renderRoute);

  document.body.addEventListener('click', (e) => {
    const link = (e.target as HTMLElement).closest('[data-link]');
    if (link) {
      e.preventDefault();
      const href = link.getAttribute('href');
      if (href) navigate(href);
    }
  });

  renderRoute();
}

export function navigate(path: string) {
  history.pushState({}, '', path);
  renderRoute();
}

async function renderRoute() {
  const requestId = ++currentRequest;

  const url = new URL(location.href);
  const path = url.pathname;
  const query = Object.fromEntries(url.searchParams.entries());

  const app = document.querySelector<HTMLDivElement>('#app')!;
  app.innerHTML = '<p>Loading...</p>';

  // Sort routes: more static segments first
  const rankedRoutes = [...routes].sort(rankRoute);

  for (const route of rankedRoutes) {
    const params = matchRoute(route.path, path);

    if (params) {
      try {
        const mod = await route.loader();

        if (requestId !== currentRequest) return;

        const render = mod.render || mod.default;
        if (!render) throw new Error('No render function exported');

        app.innerHTML = render(params, query);
        window.scrollTo(0, 0);
      } catch (err) {
        if (requestId !== currentRequest) return;

        app.innerHTML = '<h1>Error loading page</h1>';
        console.error(err);
      }
      return;
    }
  }

  app.innerHTML = '<h1>404</h1>';
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
 */
function rankRoute(a: Route, b: Route) {
  const score = (path: string) =>
    path.split('/').reduce((acc, part) => {
      if (!part) return acc;
      return acc + (part.startsWith(':') ? 1 : 10);
    }, 0);

  return score(b.path) - score(a.path);
}