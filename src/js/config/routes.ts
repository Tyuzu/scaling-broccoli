/**
 * Route configuration - decoupled from router logic.
 * Makes routes easy to maintain and extend.
 */

export type PageModule = {
  default?: (params: any, query: Record<string, string>) => string;
  render?: (params: any, query: Record<string, string>) => string;
};

export type Route = {
  path: string;
  loader: () => Promise<PageModule>;
  name?: string;
};

/**
 * All application routes
 * Easy to extend - just add new routes here
 */
export const routes: Route[] = [
  {
    path: '/',
    name: 'home',
    loader: () => import('../pages/home.ts')
  },
  {
    path: '/about',
    name: 'about',
    loader: () => import('../pages/about.ts')
  },
  {
    path: '/user/:id',
    name: 'user',
    loader: () => import('../pages/user.ts')
  }
];

/**
 * Find route by path
 */
export function findRoute(path: string): Route | undefined {
  return routes.find(r => r.path === path);
}

/**
 * Find route by name
 */
export function findRouteByName(name: string): Route | undefined {
  return routes.find(r => r.name === name);
}
