type Params = Record<string, string>;

type PageModule = {
  default?: (params: Params) => string;
  render?: (params: Params) => string;
};

type Route = {
  path: string;
  loader: () => Promise<PageModule>;
};

const routes: Route[] = [
  { path: '/', loader: () => import('../pages/home') },
  { path: '/about', loader: () => import('../pages/about') },
  { path: '/user/:id', loader: () => import('../pages/user') }
];

export function initRouter() {
  window.addEventListener('popstate', renderRoute);

  document.body.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.matches('[data-link]')) {
      e.preventDefault();
      const href = target.getAttribute('href');
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
  const path = location.pathname;
  const app = document.querySelector<HTMLDivElement>('#app')!;

  for (const route of routes) {
    const params = matchRoute(route.path, path);
    if (params) {
      try {
        app.innerHTML = '<p>Loading...</p>';
        const mod = await route.loader();
        const render = mod.render || mod.default;
        if (!render) throw new Error('No render export');
        app.innerHTML = render(params);
      } catch (err) {
        app.innerHTML = '<h1>Error loading page</h1>';
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