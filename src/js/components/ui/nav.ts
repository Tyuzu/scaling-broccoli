/**
 * Navigation Component with SPA Support
 * Features: Active link tracking, smooth transitions, responsive menu
 */

import { eventBus, Events } from '../../core/EventEmitter';

export interface NavItem {
  label: string;
  path: string;
  icon?: string;
  badge?: number;
}

export interface NavConfig {
  items?: NavItem[];
  onNavigate?: (path: string) => void;
  onActiveChange?: (activePath: string) => void;
}

export function createNav(config: NavConfig = {}): HTMLElement {
  const nav = document.createElement('nav');
  nav.className = 'main-nav';
  nav.id = 'main-nav';

  const defaultItems: NavItem[] = config.items || [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/shop' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  nav.innerHTML = `
    <div class="nav-container">
      <button class="nav-toggle" aria-label="Toggle navigation">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <ul class="nav-list">
        ${defaultItems
          .map(
            item => `
          <li class="nav-item">
            <a href="${item.path}" class="nav-link spa-link" data-path="${item.path}">
              ${item.icon ? `<span class="nav-icon">${item.icon}</span>` : ''}
              ${item.label}
              ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
            </a>
          </li>
        `
          )
          .join('')}
      </ul>
    </div>
  `;

  // Handle navigation
  const spaLinks = nav.querySelectorAll('.spa-link');
  spaLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const path = (link as HTMLElement).getAttribute('data-path');
      if (path) {
        // Update active state
        updateActiveLink(nav, path);

        if (config.onNavigate) {
          config.onNavigate(path);
        }

        // Emit navigation event
        eventBus.emit(Events.NAVIGATION, { path });

        // Close mobile menu
        const navList = nav.querySelector('.nav-list');
        navList?.classList.remove('active');
      }
    });
  });

  // Handle mobile menu toggle
  const navToggle = nav.querySelector('.nav-toggle');
  const navList = nav.querySelector('.nav-list');

  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      navList.classList.toggle('active');
    });

    // Close menu on window resize if opened
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        navList.classList.remove('active');
      }
    });
  }

  // Listen to navigation events to update active state
  eventBus.on(Events.NAVIGATION, (data: any) => {
    if (data?.path) {
      updateActiveLink(nav, data.path);
      if (config.onActiveChange) {
        config.onActiveChange(data.path);
      }
    }
  });

  return nav;
}

/**
 * Update active link styling
 */
function updateActiveLink(nav: HTMLElement, path: string): void {
  const allLinks = nav.querySelectorAll('.spa-link');
  allLinks.forEach(link => {
    link.classList.remove('active');
  });

  const activeLink = nav.querySelector(`[data-path="${path}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

/**
 * Update nav badge
 */
export function updateNavBadge(nav: HTMLElement, itemPath: string, count: number): void {
  const item = nav.querySelector(`[data-path="${itemPath}"]`);
  if (item) {
    let badge = item.querySelector('.nav-badge') as HTMLElement | null;
    if (!badge && count > 0) {
      badge = document.createElement('span');
      badge.className = 'nav-badge';
      item.appendChild(badge);
    }
    if (badge) {
      badge.textContent = count.toString();
      (badge as HTMLElement).style.display = count > 0 ? 'inline' : 'none';
    }
  }
}
