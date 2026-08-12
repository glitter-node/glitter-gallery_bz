import React from 'react';

export interface AProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

function getCurrentPath(): string {
  if (typeof window === 'undefined') {
    return '/';
  }

  return window.location.pathname || '/';
}

function isActiveNavHref(href: React.AnchorHTMLAttributes<HTMLAnchorElement>['href'], currentPath: string): boolean {
  if (!href || href.startsWith('http') || href.startsWith('#')) {
    return false;
  }

  const targetPath = href.split('?')[0].replace(/\/$/, '') || '/';
  const normalizedCurrentPath = currentPath.replace(/\/$/, '') || '/';

  if (targetPath === '/') {
    return normalizedCurrentPath === '/';
  }

  return normalizedCurrentPath === targetPath || normalizedCurrentPath.startsWith(`${targetPath}/`);
}

export const A: React.FC<AProps> = ({
  children,
  className = '',
  href,
  'aria-current': ariaCurrent,
  ...props
}) => {
  const isGalleryNavLink = className.split(/\s+/).includes('gallery-nav-link');
  const [currentPath, setCurrentPath] = React.useState(getCurrentPath);
  const isActive = isGalleryNavLink && isActiveNavHref(href, currentPath);
  const mergedClassName = isActive
    ? `${className} gallery-nav-link-active`
    : className;

  React.useEffect(() => {
    if (!isGalleryNavLink || typeof window === 'undefined') {
      return;
    }

    const syncPath = () => setCurrentPath(getCurrentPath());
    const g7core = (window as any).G7Core;
    const unsubscribe = g7core?.state?.subscribe?.((state: any) => {
      const nextPath = state?._global?.currentPath || getCurrentPath();
      setCurrentPath(nextPath);
    });

    window.addEventListener('popstate', syncPath);
    window.addEventListener('pushstate', syncPath as EventListener);
    window.addEventListener('replacestate', syncPath as EventListener);

    return () => {
      unsubscribe?.();
      window.removeEventListener('popstate', syncPath);
      window.removeEventListener('pushstate', syncPath as EventListener);
      window.removeEventListener('replacestate', syncPath as EventListener);
    };
  }, [isGalleryNavLink]);

  return (
    <a
      className={mergedClassName}
      href={href}
      aria-current={isActive ? 'page' : ariaCurrent}
      {...props}
    >
      {children}
    </a>
  );
};
