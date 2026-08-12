import React from 'react';
import fs from 'fs';
import path from 'path';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';
import {
  createLayoutTest,
  createMockComponentRegistry,
} from '../../../../resources/js/core/template-engine/__tests__/utils/layoutTestUtils';
import * as TemplateComponents from '../src/index';
import { normalizeTemplateAssetSrc } from '../src/components/basic/Img';

const TEMPLATE_ROOT = path.resolve(__dirname, '..');
const TEMPLATE_ID = 'glitter-gallery_bz';
const homeApiResponses = {
  gallery_home: {
    success: true,
    data: {
      featured_exhibition: {
        slug: 'api-current-exhibition',
        title_label: 'API 현재 전시',
        subtitle_label: 'API 전시 부제',
        summary_label: 'API 전시 요약',
        image_url: '/assets/gallery/api-featured.jpg',
        media_caption: 'API 전시 이미지 캡션',
        href: '/exhibitions/api-current-exhibition',
      },
      highlighted_items: [
        {
          slug: 'api-item',
          type: 'artwork',
          type_label: 'artwork',
          type_label_key: 'gallery.items.types.artwork',
          title_label: 'API 항목',
          artist_label: 'API 작가',
          year_label: '2026',
          medium_label: 'API 매체',
          summary_label: 'API 항목 요약',
          thumbnail_url: '/assets/gallery/api-item-thumb.jpg',
          href: '/items/api-item',
        },
      ],
      recent_records: [
        {
          slug: 'api-record-note',
          type: 'field_note',
          type_label: 'field_note',
          type_label_key: 'gallery.records.types.field_note',
          title_label: 'API 기록 노트',
          summary_label: 'API 기록 요약',
          preview_image: '/assets/gallery/api-record-preview.jpg',
          recorded_at: '2026-05-02T05:48:17+00:00',
          recorded_at_display: '2026.05.02',
          related_exhibition: {
            title: {
              ko: 'API 현재 전시',
            },
            href: '/exhibitions/api-current-exhibition',
          },
          href: '/records/api-record-note',
        },
      ],
      recent_archive_materials: [
        {
          slug: 'api-archive-material',
          category: 'document',
          category_label_key: 'gallery.archive.categories.document.meta',
          type: 'press',
          type_label: 'press',
          type_label_key: 'gallery.archive_materials.types.press',
          title_label: 'API 아카이브 자료',
          summary_label: 'API 아카이브 요약',
          preview_image: '/assets/gallery/api-archive-preview.jpg',
          date_label: '2026.05.03',
          published_at: '2026-05-03T05:48:17+00:00',
          published_at_display: '2026.05.03',
          href: '/archive/document/api-archive-material',
        },
      ],
      relationship_paths: [
        {
          index: '01',
          id: 'api-path',
          type: 'exhibition_record',
          href: '/records/api-record-note',
          title_label: 'API 현재 전시 → API 기록 노트',
          body_label: 'API 관계 설명',
          preview_image: '/assets/gallery/api-relationship-preview.jpg',
          from_label: 'API 현재 전시',
          to_label: 'API 기록 노트',
        },
      ],
      archive_categories: [
        {
          slug: 'document',
          category: 'document',
          label_key: 'gallery.archive.categories.document.title',
          materials_count: 1,
          href: '/archive/document',
        },
      ],
      about_context: {},
    },
  },
  gallery_featured_exhibition: {
    success: true,
    data: {
      featured: {
        slug: 'api-current-exhibition',
        title_label: 'API 현재 전시',
        subtitle_label: 'API 전시 부제',
        summary_label: 'API 전시 요약',
        image_url: '/assets/gallery/api-featured.jpg',
        media_caption: 'API 전시 이미지 캡션',
        href: '/exhibitions/api-current-exhibition',
      },
      data: [],
    },
  },
  gallery_home_item_highlights: {
    success: true,
    data: {
      featured: {
        items: [],
      },
    },
  },
  gallery_home_recent_records: {
    success: true,
    data: {
      data: [
        {
          slug: 'api-record-note',
          type_label: 'field_note',
          title_label: 'API 기록 노트',
          summary_label: 'API 기록 요약',
          recorded_at: '2026-05-02T05:48:17+00:00',
          related_exhibition: {
            title: {
              ko: 'API 현재 전시',
            },
            href: '/exhibitions/api-current-exhibition',
          },
          href: '/records/api-record-note',
        },
      ],
    },
  },
  gallery_home_recent_archive_materials: {
    success: true,
    data: {
      categories: [
        {
          slug: 'material',
          category: 'material',
          materials_count: 1,
          href: '/archive/material',
        },
      ],
    },
  },
  gallery_archive_categories: {
    success: true,
    data: {
      categories: [
        {
          slug: 'material',
          category: 'material',
          materials_count: 1,
          href: '/archive/material',
        },
      ],
    },
  },
};
const UNRESOLVED_VISIBLE_KEYS = [
  'common.search_placeholder',
  'nav.home',
  'nav.all_boards',
  'nav.popular',
  'nav.qna',
  'auth.login',
  'auth.register_link',
  'footer.community',
  'footer.info',
  'footer.policy',
  'footer.about',
  'footer.faq',
  'footer.contact',
  'footer.terms',
  'footer.privacy',
  'footer.refund',
  'footer.powered_by',
  'footer.all_boards',
];

interface RouteDefinition {
  path: string;
  layout?: string;
  redirect?: string;
}

function readJson<T = any>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(TEMPLATE_ROOT, relativePath), 'utf8'));
}

function readLayoutFiles(directory = path.join(TEMPLATE_ROOT, 'layouts')): Array<{ path: string; content: string }> {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return readLayoutFiles(fullPath);
    }

    if (!entry.isFile() || !entry.name.endsWith('.json')) {
      return [];
    }

    return [{
      path: path.relative(TEMPLATE_ROOT, fullPath),
      content: fs.readFileSync(fullPath, 'utf8'),
    }];
  });
}

function matchRoute(routes: RouteDefinition[], pathName: string): RouteDefinition | null {
  for (const route of routes) {
    let pattern = route.path.replace(/:[^/]+/g, '[^/]+');

    if (pattern.startsWith('*/')) {
      pattern = '(?:/[^/]+)?' + pattern.slice(1);
    }

    pattern = pattern.replace(/\//g, '\\/');

    if (new RegExp('^' + pattern + '$').test(pathName)) {
      return route;
    }
  }

  return null;
}

function createRegistryFromManifest(manifest: any) {
  const registry = createMockComponentRegistry();
  const components = manifest.components ?? {};

  for (const type of ['basic', 'composite', 'layout']) {
    for (const metadata of components[type] ?? []) {
      const component = (TemplateComponents as Record<string, React.ComponentType<any>>)[metadata.name];

      if (component) {
        registry.register(type, metadata.name, component);
      }
    }
  }

  registry.register('layout', 'Fragment', ({ children }) => <>{children}</>);

  return registry;
}

function resolveNode(node: any): any {
  if (Array.isArray(node)) {
    return node.flatMap((item) => {
      const resolved = resolveNode(item);
      return Array.isArray(resolved) ? resolved : [resolved];
    });
  }

  if (!node || typeof node !== 'object') {
    return node;
  }

  if (node.partial) {
    return resolveNode(readJson('layouts/' + node.partial));
  }

  return Object.fromEntries(
    Object.entries(node).map(([key, value]) => [
      key,
      key === 'children' || key === 'components' || key === 'content' ? resolveNode(value) : value,
    ])
  );
}

function resolveLayout(layout: any) {
  return {
    ...layout,
    slots: layout.slots
      ? Object.fromEntries(Object.entries(layout.slots).map(([slotName, children]) => [slotName, resolveNode(children)]))
      : layout.slots,
    components: layout.components ? resolveNode(layout.components) : layout.components,
  };
}

function createInitialData(layout: any, locale = 'ko') {
  return {
    $templateId: TEMPLATE_ID,
    $locale: locale,
    ...Object.fromEntries(
      (layout.data_sources ?? [])
        .filter((source: any) => source.type === 'static')
        .map((source: any) => [source.id, source.data])
    ),
  };
}

async function renderPublicPath(pathName: string, locale: 'ko' | 'en') {
  const routesResponse = readJson('routes.json');
  const manifest = readJson('components.json');
  const translations = readJson(`lang/${locale}.json`);
  const initialRoute = matchRoute(routesResponse.routes, pathName);
  const route = initialRoute?.redirect
    ? matchRoute(routesResponse.routes, initialRoute.redirect)
    : initialRoute;

  expect(route?.layout).toBeTruthy();

  const layoutJson = resolveLayout(readJson('layouts/' + route?.layout + '.json'));
  const registry = createRegistryFromManifest(manifest);
  const test = createLayoutTest(layoutJson, {
    componentRegistry: registry as any,
    translations,
    templateId: TEMPLATE_ID,
    locale,
    initialData: createInitialData(layoutJson, locale),
    initialState: {
      _global: {
        settings: {
          general: {
            site_name: locale === 'ko' ? '관리자 설정 사이트' : 'Admin configured site',
            site_url: 'https://admin-configured.example',
            site_description: locale === 'ko' ? '관리자 설정 설명' : 'Admin configured description',
          },
        },
      },
    },
  });

  return { test, route };
}

describe('glitter-gallery_bz public layout render', () => {
  it('does not keep bundled demo media paths in layout JSON', () => {
    const layoutFiles = readLayoutFiles();
    const demoSegment = ['gallery', 'demo'].join('/');
    const assetPrefix = '/api/templates/assets/glitter-gallery_bz/images/';
    const filesWithDemoAssetPaths = layoutFiles
      .filter(file => file.content.includes(`${assetPrefix}${demoSegment}/`))
      .map(file => file.path);
    const filesWithTemplateDemoPaths = layoutFiles
      .filter(file => file.content.includes(`images/${demoSegment}/`))
      .map(file => file.path);
    const filesWithDoubleAssetPaths = layoutFiles
      .filter(file => file.content.includes('/api/templates/assets/glitter-gallery_bz/api/templates/assets/glitter-gallery_bz/'))
      .map(file => file.path);

    expect(filesWithDemoAssetPaths).toEqual([]);
    expect(filesWithTemplateDemoPaths).toEqual([]);
    expect(filesWithDoubleAssetPaths).toEqual([]);
  });

  it('does not register gallery demo media files as data source endpoints', () => {
    const endpointImageReferences = readLayoutFiles()
      .flatMap((file) => {
        const layout = JSON.parse(file.content);

        return (layout.data_sources ?? [])
          .filter((source: any) => typeof source.endpoint === 'string')
          .filter((source: any) => source.endpoint.includes('images/gallery') || source.endpoint.includes('/api/templates/assets'))
          .map((source: any) => `${file.path}:${source.id}:${source.endpoint}`);
      });

    expect(endpointImageReferences).toEqual([]);
  });

  it('renders the institutional public header and footer chrome', async () => {
    const manifest = readJson('components.json');
    const translations = readJson('lang/ko.json');
    const layoutJson = resolveLayout(readJson('layouts/_user_base.json'));
    const registry = createRegistryFromManifest(manifest);
    const test = createLayoutTest(layoutJson, {
      componentRegistry: registry as any,
      translations,
      templateId: TEMPLATE_ID,
      locale: 'ko',
      initialData: createInitialData(layoutJson),
      initialState: {
        _global: {
          settings: {
            general: {
              site_name: '관리자 설정 사이트',
              site_url: 'https://admin-configured.example',
              site_description: '관리자 설정 설명',
            },
          },
        },
      },
    });

    try {
      const result = await test.render();
      const text = result.container.textContent ?? '';

      expect(result.container.querySelector('.gallery-header-inner')).not.toBeNull();
      expect(result.container.querySelector('.gallery-header-topbar')).not.toBeNull();
      expect(result.container.querySelector('.gallery-header-topbar > .gallery-brand-block')).not.toBeNull();
      expect(result.container.querySelector('.gallery-header-topbar > .gallery-nav')).not.toBeNull();
      expect(result.container.querySelector('.gallery-header-topbar > .gallery-header-utility')).not.toBeNull();
      expect(result.container.querySelector('.gallery-header-topbar > .gallery-mobile-menu-toggle')).not.toBeNull();
      expect(result.container.querySelector('.gallery-header-inner > .gallery-nav')).toBeNull();
      expect(result.container.querySelector('.gallery-brand-block .gallery-header-utility')).toBeNull();
      expect(result.container.querySelector('.gallery-header-right')).toBeNull();
      expect(result.container.querySelector('.gallery-footer-grid')).not.toBeNull();
      expect(text).toContain('전시 아카이브와 기록 색인');
      expect(result.container.querySelector('.gallery-header-status')).toBeNull();
      expect(text).not.toContain('OPEN CATALOG');
      expect(text).not.toContain('전시와 기록을 연결해 읽는 공개 색인');
      expect(text).toContain('전시, 작품, 문서, 현장 기록과 그 관계를 계속 읽을 수 있도록 정리한 기관형 색인입니다.');
      expect(text).toContain('아카이브 경로');
      expect(text).toContain('기록 맥락');
    } finally {
      test.cleanup();
    }
  });

  it('keeps footer structure intact while reducing footer density', async () => {
    const manifest = readJson('components.json');
    const translations = readJson('lang/ko.json');
    const layoutJson = resolveLayout(readJson('layouts/_user_base.json'));
    const registry = createRegistryFromManifest(manifest);
    const stylesheet = fs.readFileSync(path.join(TEMPLATE_ROOT, 'src/styles/main.css'), 'utf8');
    const footerBlock = stylesheet.match(/\.gallery-footer \{[\s\S]*?\n  \}/)?.[0] ?? '';
    const footerGridBlock = stylesheet.match(/\.gallery-footer-grid \{[\s\S]*?\n  \}/)?.[0] ?? '';
    const footerMissionBlock = stylesheet.match(/\.gallery-footer-mission \{[\s\S]*?\n  \}/)?.[0] ?? '';
    const footerMetaBlock = stylesheet.match(/\.gallery-footer-meta \{[\s\S]*?\n  \}/)?.[0] ?? '';
    const footerNavBlock = stylesheet.match(/\.gallery-footer-nav \{[\s\S]*?\n  \}/)?.[0] ?? '';
    const footerLinkGroupBlock = stylesheet.match(/\.gallery-footer-link-group \{[\s\S]*?\n  \}/)?.[0] ?? '';
    const footerHeadingBlock = stylesheet.match(/\.gallery-footer-heading \{[\s\S]*?\n  \}/)?.[0] ?? '';
    const test = createLayoutTest(layoutJson, {
      componentRegistry: registry as any,
      translations,
      templateId: TEMPLATE_ID,
      locale: 'ko',
      initialData: createInitialData(layoutJson),
    });

    try {
      const result = await test.render();
      const footer = result.container.querySelector('.gallery-footer');
      const linkGroups = result.container.querySelectorAll('.gallery-footer-link-group');
      const links = result.container.querySelectorAll('.gallery-footer-link-group a');

      expect(footer).not.toBeNull();
      expect(result.container.querySelector('.gallery-footer-grid')).not.toBeNull();
      expect(linkGroups).toHaveLength(3);
      expect(links).toHaveLength(9);
      expect(Array.from(links).map((link) => link.getAttribute('href'))).toEqual([
        '/exhibitions',
        '/records',
        '/about',
        '/archive/exhibition',
        '/archive/material',
        '/archive/research',
        '/records',
        '/records',
        '/collections',
      ]);
    } finally {
      test.cleanup();
    }

    expect(footerBlock).toContain('py-8');
    expect(footerBlock).toContain('md:py-10');
    expect(footerBlock).not.toContain('py-12');
    expect(footerBlock).not.toContain('md:py-14');
    expect(footerGridBlock).toContain('gap-7');
    expect(footerGridBlock).toContain('lg:gap-8');
    expect(footerMissionBlock).toContain('text-[0.86rem]');
    expect(footerMissionBlock).toContain('leading-6');
    expect(footerMetaBlock).toContain('mt-5');
    expect(footerMetaBlock).toContain('pt-3');
    expect(footerNavBlock).toContain('gap-5');
    expect(footerNavBlock).toContain('md:gap-6');
    expect(footerLinkGroupBlock).toContain('gap-2');
    expect(footerLinkGroupBlock).toContain('text-[0.84rem]');
    expect(footerHeadingBlock).toContain('tracking-[0.16em]');
  });

  it('keeps the desktop and tablet header controls in one topbar row', async () => {
    const manifest = readJson('components.json');
    const translations = readJson('lang/ko.json');
    const layoutJson = resolveLayout(readJson('layouts/_user_base.json'));
    const registry = createRegistryFromManifest(manifest);
    const test = createLayoutTest(layoutJson, {
      componentRegistry: registry as any,
      translations,
      templateId: TEMPLATE_ID,
      locale: 'ko',
      initialData: createInitialData(layoutJson),
    });

    try {
      const result = await test.render();
      const topbar = result.container.querySelector('.gallery-header-topbar');
      const directChildren = Array.from(topbar?.children ?? []);

      expect(topbar).not.toBeNull();
      expect(directChildren).toHaveLength(4);
      expect(directChildren[0].classList.contains('gallery-brand-block')).toBe(true);
      expect(directChildren[1].classList.contains('gallery-nav')).toBe(true);
      expect(directChildren[2].classList.contains('gallery-header-utility')).toBe(true);
      expect(directChildren[3].classList.contains('gallery-mobile-menu-toggle')).toBe(true);
      expect(result.container.querySelector('.gallery-header-inner > .gallery-header-topbar + .gallery-nav')).toBeNull();
      expect(result.container.querySelector('.gallery-brand')).not.toBeNull();
      expect(result.container.querySelector('.gallery-brand')?.className).toContain('gallery-brand');
      expect(result.container.querySelector('.gallery-nav')?.querySelectorAll('.gallery-nav-link')).toHaveLength(5);
      expect(result.container.querySelector('.gallery-header-utility .gallery-header-language-toggle')).not.toBeNull();
      expect(result.container.querySelector('.gallery-header-utility .gallery-header-auth-link[href="/login"]')).not.toBeNull();
      expect(result.container.querySelector('.gallery-header-utility .gallery-header-auth-link[href="/register"]')).not.toBeNull();
    } finally {
      test.cleanup();
    }
  });

  it('keeps public header navigation typography above utility scale without adding a second row', () => {
    const stylesheet = fs.readFileSync(path.join(TEMPLATE_ROOT, 'src/styles/main.css'), 'utf8');
    const navBlock = stylesheet.match(/\.gallery-nav \{[\s\S]*?\n  \}/)?.[0] ?? '';

    expect(navBlock).toContain('.gallery-nav {');
    expect(navBlock).toContain('text-[0.86rem]');
    expect(navBlock).toContain('leading-5');
    expect(navBlock).toContain('gap-x-6');
    expect(navBlock).toContain('lg:flex');
    expect(navBlock).not.toContain('text-[0.72rem]');
    expect(navBlock).not.toContain('border-t');
    expect(navBlock).not.toContain('pt-4');
    expect(stylesheet.match(/\.gallery-nav-link-active \{[\s\S]*?\n  \}/)?.[0] ?? '').toContain('border-primary-600');
  });

  it('reduces only the home hero top spacing while preserving the hero bottom spacing', () => {
    const stylesheet = fs.readFileSync(path.join(TEMPLATE_ROOT, 'src/styles/main.css'), 'utf8');
    const heroBlock = stylesheet.match(/\.gallery-hero \{[\s\S]*?\n  \}/)?.[0] ?? '';

    expect(heroBlock).toContain('.gallery-hero {');
    expect(heroBlock).toContain('pt-8');
    expect(heroBlock).toContain('md:pt-12');
    expect(heroBlock).toContain('pb-14');
    expect(heroBlock).toContain('md:pb-20');
    expect(heroBlock).not.toContain('py-14');
    expect(heroBlock).not.toContain('md:py-20');
    expect(heroBlock).not.toContain('mt-');
  });

  it('normalizes home section rhythm without changing the global section scale', () => {
    const stylesheet = fs.readFileSync(path.join(TEMPLATE_ROOT, 'src/styles/main.css'), 'utf8');
    const globalSectionBlock = stylesheet.match(/\.gallery-section \{[\s\S]*?\n  \}/)?.[0] ?? '';
    const homeSectionBlock = stylesheet.match(/\.gallery-home-section\.gallery-section \{[\s\S]*?\n  \}/)?.[0] ?? '';
    const homeTightBlock = stylesheet.match(/\.gallery-home-section\.gallery-section-tight \{[\s\S]*?\n  \}/)?.[0] ?? '';
    const currentExhibitionBlock = stylesheet.match(/\.gallery-home-current-exhibition \{[\s\S]*?\n  \}/)?.[0] ?? '';
    const homeSectionPartials = [
      'layouts/partials/home/_homepage_featured_exhibition.json',
      'layouts/partials/home/_homepage_item_highlights.json',
      'layouts/partials/home/_homepage_recent_records.json',
      'layouts/partials/home/_homepage_recent_archive_materials.json',
      'layouts/partials/home/_homepage_relationship_paths.json',
      'layouts/partials/home/_homepage_archive_categories_compact.json',
      'layouts/partials/home/_homepage_about_compact.json',
    ];

    expect(globalSectionBlock).toContain('py-10');
    expect(globalSectionBlock).toContain('md:py-14');
    expect(homeSectionBlock).toContain('py-9');
    expect(homeSectionBlock).toContain('md:py-12');
    expect(homeTightBlock).toContain('py-8');
    expect(homeTightBlock).toContain('md:py-10');
    expect(currentExhibitionBlock).toContain('py-10');
    expect(currentExhibitionBlock).toContain('md:py-12');

    for (const partialPath of homeSectionPartials) {
      const partial = fs.readFileSync(path.join(TEMPLATE_ROOT, partialPath), 'utf8');
      expect(partial).toContain('gallery-home-section');
    }
  });

  it('normalizes home card media ratios without changing shared media defaults', () => {
    const stylesheet = fs.readFileSync(path.join(TEMPLATE_ROOT, 'src/styles/main.css'), 'utf8');
    const sharedThumbnailBlock = stylesheet.match(/\.gallery-media-thumbnail \{[\s\S]*?\n  \}/)?.[0] ?? '';
    const sharedRecordBlock = stylesheet.match(/\.gallery-media-record-note,[\s\S]*?\.gallery-media-relationship \{[\s\S]*?\n  \}/)?.[0] ?? '';
    const homeStandardBlock = stylesheet.match(/\.gallery-home-media-standard \{[\s\S]*?\n  \}/)?.[0] ?? '';
    const homeNoteBlock = stylesheet.match(/\.gallery-home-media-note \{[\s\S]*?\n  \}/)?.[0] ?? '';
    const homeListBlock = stylesheet.match(/\.gallery-home-media-list \{[\s\S]*?\n  \}/)?.[0] ?? '';
    const itemHighlights = fs.readFileSync(path.join(TEMPLATE_ROOT, 'layouts/partials/home/_homepage_item_highlights.json'), 'utf8');
    const recentRecords = fs.readFileSync(path.join(TEMPLATE_ROOT, 'layouts/partials/home/_homepage_recent_records.json'), 'utf8');
    const archiveMaterials = fs.readFileSync(path.join(TEMPLATE_ROOT, 'layouts/partials/home/_homepage_recent_archive_materials.json'), 'utf8');
    const relationshipPaths = fs.readFileSync(path.join(TEMPLATE_ROOT, 'layouts/partials/home/_homepage_relationship_paths.json'), 'utf8');

    expect(sharedThumbnailBlock).toContain('aspect-[4/3]');
    expect(sharedRecordBlock).toContain('aspect-[3/2]');
    expect(homeStandardBlock).toContain('aspect-[4/3]');
    expect(homeStandardBlock).toContain('min-h-32');
    expect(homeNoteBlock).toContain('aspect-[16/9]');
    expect(homeNoteBlock).toContain('min-h-36');
    expect(homeListBlock).toContain('aspect-[16/9]');
    expect(homeListBlock).toContain('min-h-28');
    expect(itemHighlights).toContain('gallery-home-media-standard');
    expect(relationshipPaths).toContain('gallery-home-media-standard');
    expect(recentRecords).toContain('gallery-home-media-note');
    expect(archiveMaterials).toContain('gallery-home-media-list');
  });

  it('keeps the mobile header collapsed to brand and menu toggle before expansion', async () => {
    const manifest = readJson('components.json');
    const translations = readJson('lang/ko.json');
    const layoutJson = resolveLayout(readJson('layouts/_user_base.json'));
    const registry = createRegistryFromManifest(manifest);
    const test = createLayoutTest(layoutJson, {
      componentRegistry: registry as any,
      translations,
      templateId: TEMPLATE_ID,
      locale: 'ko',
      initialData: createInitialData(layoutJson),
      initialState: {
        _global: {
          galleryMobileMenuOpen: false,
        },
      },
    });

    try {
      const result = await test.render();
      const topbar = result.container.querySelector('.gallery-header-topbar');
      const toggle = topbar?.querySelector(':scope > .gallery-mobile-menu-toggle') as HTMLButtonElement | null;

      expect(topbar?.querySelector(':scope > .gallery-brand-block')).not.toBeNull();
      expect(toggle).not.toBeNull();
      expect(toggle?.getAttribute('aria-expanded')).toBe('false');
      expect(toggle?.getAttribute('aria-controls')).toBe('gallery_mobile_nav_panel');
      expect(result.container.querySelector('.gallery-mobile-menu-panel')).toBeNull();
      expect(result.container.querySelector('.gallery-mobile-nav')).toBeNull();
      expect(result.container.querySelector('.gallery-mobile-auth')).toBeNull();
    } finally {
      test.cleanup();
    }
  });

  it('marks the current primary navigation path with a distinct active class', async () => {
    window.history.pushState({}, '', '/archive');

    const manifest = readJson('components.json');
    const translations = readJson('lang/ko.json');
    const layoutJson = resolveLayout(readJson('layouts/_user_base.json'));
    const registry = createRegistryFromManifest(manifest);
    const test = createLayoutTest(layoutJson, {
      componentRegistry: registry as any,
      translations,
      templateId: TEMPLATE_ID,
      locale: 'ko',
      initialData: createInitialData(layoutJson),
    });

    try {
      const result = await test.render();
      const archiveLink = result.container.querySelector('.gallery-nav-link[href="/archive"]');
      const exhibitionLink = result.container.querySelector('.gallery-nav-link[href="/exhibitions"]');

      expect(archiveLink?.classList.contains('gallery-nav-link-active')).toBe(true);
      expect(archiveLink?.getAttribute('aria-current')).toBe('page');
      expect(exhibitionLink?.classList.contains('gallery-nav-link-active')).toBe(false);
    } finally {
      test.cleanup();
      window.history.pushState({}, '', '/');
    }
  });

  it('renders the mobile public navigation panel for guest users from responsive menu state', async () => {
    window.history.pushState({}, '', '/records');

    const manifest = readJson('components.json');
    const translations = readJson('lang/ko.json');
    const layoutJson = resolveLayout(readJson('layouts/_user_base.json'));
    const registry = createRegistryFromManifest(manifest);
    const test = createLayoutTest(layoutJson, {
      componentRegistry: registry as any,
      translations,
      templateId: TEMPLATE_ID,
      locale: 'ko',
      initialData: createInitialData(layoutJson),
      initialState: {
        _global: {
          settings: {
            general: {
              site_name: '관리자 설정 사이트',
              site_url: 'https://admin-configured.example',
              site_description: '관리자 설정 설명',
            },
          },
          galleryMobileMenuOpen: true,
        },
      },
    });

    try {
      const result = await test.render();
      const toggle = result.container.querySelector('.gallery-mobile-menu-toggle') as HTMLButtonElement | null;

      expect(toggle).not.toBeNull();
      expect(toggle?.getAttribute('aria-controls')).toBe('gallery_mobile_nav_panel');
      expect(toggle?.getAttribute('aria-expanded')).toBe('true');
      expect(result.container.querySelector('.gallery-mobile-menu-panel')).not.toBeNull();

      const text = result.container.textContent ?? '';
      for (const label of ['현재 전시', '아카이브', '기록', '컬렉션', '소개', '한국어', '로그인', '회원가입']) {
        expect(text).toContain(label);
      }
      expect(text).not.toContain('언어');

      const utilityRow = result.container.querySelector('.gallery-mobile-utility-row');
      const mobileSettings = utilityRow?.querySelector('.gallery-mobile-mode-dropdown .gallery-header-mode-trigger') as HTMLButtonElement | null;
      const mobileLanguage = utilityRow?.querySelector('.gallery-mobile-language-toggle') as HTMLButtonElement | null;
      expect(utilityRow).not.toBeNull();
      expect(mobileSettings).not.toBeNull();
      expect(mobileLanguage).not.toBeNull();
      expect(Array.from(utilityRow?.children ?? [])[0].classList.contains('gallery-mobile-mode-dropdown')).toBe(true);
      expect(Array.from(utilityRow?.children ?? [])[1].classList.contains('gallery-mobile-language-toggle')).toBe(true);
      expect(mobileSettings?.getAttribute('aria-label')).toBe('표시 모드 선택');
      expect(mobileLanguage?.textContent).toBe('한국어');

      fireEvent.click(mobileSettings!);
      await waitFor(() => {
        expect(result.container.querySelector('.gallery-mobile-mode-dropdown .gallery-header-mode-menu')).not.toBeNull();
      });
      expect(result.container.textContent).toContain('시스템');
      expect(result.container.textContent).toContain('라이트');
      expect(result.container.textContent).toContain('다크');

      const recordsLink = result.container.querySelector('.gallery-mobile-nav-link[href="/records"]');
      expect(recordsLink?.classList.contains('gallery-nav-link-active')).toBe(true);
      expect(recordsLink?.getAttribute('aria-current')).toBe('page');

      const close = result.container.querySelector('.gallery-mobile-menu-close') as HTMLButtonElement | null;
      expect(close?.getAttribute('aria-label')).toBe('모바일 메뉴 닫기');
      expect(JSON.stringify(layoutJson)).toContain('"galleryMobileMenuOpen":false');
    } finally {
      test.cleanup();
      window.history.pushState({}, '', '/');
    }
  });

  it('navigates and closes the mobile public navigation links', async () => {
    window.history.pushState({}, '', '/');

    const manifest = readJson('components.json');
    const translations = readJson('lang/ko.json');
    const layoutJson = resolveLayout(readJson('layouts/_user_base.json'));
    const registry = createRegistryFromManifest(manifest);
    const test = createLayoutTest(layoutJson, {
      componentRegistry: registry as any,
      translations,
      templateId: TEMPLATE_ID,
      locale: 'ko',
      initialData: createInitialData(layoutJson),
      initialState: {
        _global: {
          galleryMobileMenuOpen: true,
        },
      },
    });

    try {
      const result = await test.render();
      const routes = [
        { path: '/exhibitions', selector: '.gallery-mobile-nav-link[href="/exhibitions"]' },
        { path: '/archive', selector: '.gallery-mobile-nav-link[href="/archive"]' },
        { path: '/records', selector: '.gallery-mobile-nav-link[href="/records"]' },
        { path: '/collections', selector: '.gallery-mobile-nav-link[href="/collections"]' },
        { path: '/about', selector: '.gallery-mobile-nav-link[href="/about"]' },
        { path: '/login', selector: '.gallery-mobile-auth-link[href="/login"]' },
        { path: '/register', selector: '.gallery-mobile-auth-link[href="/register"]' },
      ];

      for (const route of routes) {
        test.setState('galleryMobileMenuOpen', true, 'global');
        await test.rerender();

        const link = result.container.querySelector(route.selector) as HTMLAnchorElement | null;
        expect(link).not.toBeNull();

        fireEvent.click(link!);

        await waitFor(() => {
          expect(test.getNavigationHistory()).toContain(route.path);
        });
        await waitFor(() => {
          expect(test.getState()._global.galleryMobileMenuOpen).toBe(false);
        });
      }
    } finally {
      test.cleanup();
      window.history.pushState({}, '', '/');
    }
  });

  it('switches locale from the compact Korean status toggle to English and closes the mobile menu', async () => {
    const manifest = readJson('components.json');
    const translations = readJson('lang/ko.json');
    const layoutJson = resolveLayout(readJson('layouts/_user_base.json'));
    const registry = createRegistryFromManifest(manifest);
    const changeLocale = vi.fn().mockResolvedValue(undefined);
    (window as any).__templateApp = { changeLocale };

    const test = createLayoutTest(layoutJson, {
      componentRegistry: registry as any,
      translations,
      templateId: TEMPLATE_ID,
      locale: 'ko',
      initialData: createInitialData(layoutJson),
      initialState: {
        _global: {
          galleryMobileMenuOpen: true,
        },
      },
    });

    try {
      const result = await test.render();
      const text = result.container.textContent ?? '';
      expect(text).not.toContain('언어');
      expect(result.container.querySelector('.gallery-mobile-language-title')).toBeNull();
      expect(result.container.querySelector('.gallery-mobile-language-select')).toBeNull();
      expect(result.container.querySelector('.gallery-header-auth-language-select')).toBeNull();

      const headerToggle = result.container.querySelector('.gallery-header-language-toggle') as HTMLButtonElement | null;
      expect(headerToggle).not.toBeNull();
      expect(headerToggle?.textContent).toBe('한국어');

      fireEvent.click(headerToggle!);

      await waitFor(() => {
        expect(changeLocale).toHaveBeenCalledWith('en');
      });

      changeLocale.mockClear();
      test.setState('galleryMobileMenuOpen', true, 'global');
      await test.rerender();

      const mobileToggle = result.container.querySelector('.gallery-mobile-language-toggle') as HTMLButtonElement | null;
      expect(mobileToggle).not.toBeNull();
      expect(mobileToggle?.textContent).toBe('한국어');
      fireEvent.click(mobileToggle!);

      await waitFor(() => {
        expect(changeLocale).toHaveBeenCalledWith('en');
      });
      await waitFor(() => {
        expect(test.getState()._global.galleryMobileMenuOpen).toBe(false);
      });
    } finally {
      test.cleanup();
      delete (window as any).__templateApp;
    }
  });

  it('switches locale from the compact English status toggle to Korean', async () => {
    const manifest = readJson('components.json');
    const translations = readJson('lang/en.json');
    const layoutJson = resolveLayout(readJson('layouts/_user_base.json'));
    const registry = createRegistryFromManifest(manifest);
    const changeLocale = vi.fn().mockResolvedValue(undefined);
    (window as any).__templateApp = { changeLocale };

    const test = createLayoutTest(layoutJson, {
      componentRegistry: registry as any,
      translations,
      templateId: TEMPLATE_ID,
      locale: 'en',
      initialData: createInitialData(layoutJson, 'en'),
      initialState: {
        _global: {
          currentUser: {
            uuid: 'member-user',
            email: 'member@example.test',
            name: '멤버',
            role: 'member',
            is_admin: false,
          },
        },
      },
    });

    try {
      const result = await test.render();
      const text = result.container.textContent ?? '';
      expect(text).not.toContain('Language');
      expect(result.container.querySelector('.gallery-mobile-language-title')).toBeNull();
      expect(result.container.querySelector('.gallery-mobile-language-select')).toBeNull();
      expect(result.container.querySelector('.gallery-header-auth-language-select')).toBeNull();

      const headerToggle = result.container.querySelector('.gallery-header-language-toggle') as HTMLButtonElement | null;
      expect(headerToggle).not.toBeNull();
      expect(headerToggle?.textContent).toBe('English');

      fireEvent.click(headerToggle!);

      await waitFor(() => {
        expect(changeLocale).toHaveBeenCalledWith('ko');
      });
    } finally {
      test.cleanup();
      delete (window as any).__templateApp;
    }
  });

  it('exposes profile, logout, and admin actions in the mobile public navigation for admins', async () => {
    const manifest = readJson('components.json');
    const translations = readJson('lang/ko.json');
    const layoutJson = resolveLayout(readJson('layouts/_user_base.json'));
    const registry = createRegistryFromManifest(manifest);
    const test = createLayoutTest(layoutJson, {
      componentRegistry: registry as any,
      translations,
      templateId: TEMPLATE_ID,
      locale: 'ko',
      initialData: createInitialData(layoutJson),
      initialState: {
        _global: {
          currentUser: {
            uuid: 'admin-user',
            email: 'admin@example.test',
            name: '관리자',
            role: 'admin',
            is_admin: true,
          },
          galleryMobileMenuOpen: true,
        },
      },
    });

    try {
      const result = await test.render();
      const toggle = result.container.querySelector('.gallery-mobile-menu-toggle') as HTMLButtonElement | null;
      expect(toggle?.getAttribute('aria-expanded')).toBe('true');
      expect(result.container.querySelector('.gallery-mobile-menu-panel')).not.toBeNull();

      const text = result.container.textContent ?? '';
      for (const label of ['관리자', '마이페이지', '로그아웃', '관리 보드', '갤러리 관리']) {
        expect(text).toContain(label);
      }

      expect(result.container.querySelector('.gallery-mobile-profile-link[href="/mypage"]')).not.toBeNull();
      expect(result.container.querySelector('.gallery-mobile-profile-link[href="/admin/dashboard"]')).not.toBeNull();
      expect(result.container.querySelector('.gallery-mobile-profile-link[href="/admin/gallery"]')).not.toBeNull();
      expect(result.container.querySelector('.gallery-mobile-logout')).not.toBeNull();

      const routes = [
        { path: '/mypage', selector: '.gallery-mobile-profile-link[href="/mypage"]' },
        { path: '/admin/dashboard', selector: '.gallery-mobile-profile-link[href="/admin/dashboard"]' },
        { path: '/admin/gallery', selector: '.gallery-mobile-profile-link[href="/admin/gallery"]' },
      ];

      for (const route of routes) {
        test.setState('galleryMobileMenuOpen', true, 'global');
        await test.rerender();

        const link = result.container.querySelector(route.selector) as HTMLAnchorElement | null;
        expect(link).not.toBeNull();

        fireEvent.click(link!);

        await waitFor(() => {
          expect(test.getNavigationHistory()).toContain(route.path);
        });
        await waitFor(() => {
          expect(test.getState()._global.galleryMobileMenuOpen).toBe(false);
        });
      }
    } finally {
      test.cleanup();
    }
  });

  it.each([
    ['/', 'home', '.gallery-home-current-exhibition', 'API 현재 전시'],
    ['/archive', 'archive', '.gallery-archive-index-hero', '아카이브 탐색'],
    ['/records', 'records', '.gallery-records-index-hero', '기록 노트 인덱스'],
    ['/collections', 'collections', '.gallery-page-head', '컬렉션 구성'],
    ['/stories', 'stories', '.gallery-page-head', '기록 노트'],
    ['/about', 'about', '.gallery-page-head', '기록 중심 갤러리 사이트를 위한 출발점'],
  ])('renders the bundled public %s layout body with the runtime component manifest', async (
    pathName,
    expectedLayout,
    expectedSelector,
    expectedText
  ) => {
    const routesResponse = readJson('routes.json');
    const manifest = readJson('components.json');
    const translations = readJson('lang/ko.json');
    const initialRoute = matchRoute(routesResponse.routes, pathName);
    const route = initialRoute?.redirect
      ? matchRoute(routesResponse.routes, initialRoute.redirect)
      : initialRoute;

    expect(route?.layout).toBe(expectedLayout);

    const layoutJson = resolveLayout(readJson('layouts/' + route?.layout + '.json'));

    expect(JSON.stringify(layoutJson)).toContain(expectedSelector.slice(1));
    expect(JSON.stringify(layoutJson)).not.toContain('"slot"');

    const registry = createRegistryFromManifest(manifest);
    expect(registry.hasComponent('Section')).toBe(true);

    const test = createLayoutTest(layoutJson, {
      componentRegistry: registry as any,
      translations,
      templateId: TEMPLATE_ID,
      locale: 'ko',
      initialData: createInitialData(layoutJson),
      initialState: {
        _global: {
          settings: {
            general: {
              site_name: '관리자 설정 사이트',
              site_url: 'https://admin-configured.example',
              site_description: '관리자 설정 설명',
            },
          },
        },
      },
    });

    try {
      if (expectedLayout === 'home') {
        for (const [sourceId, response] of Object.entries(homeApiResponses)) {
          test.mockApi(sourceId, { response });
        }
      }

      const result = await test.render();
      const text = result.container.textContent ?? '';

      expect(result.container.querySelector(expectedSelector)).not.toBeNull();
      expect(text).toContain(expectedText);
      if (expectedLayout === 'home') {
        expect(result.container.querySelector('.gallery-media-primary img[src="/assets/gallery/api-featured.jpg"]')).not.toBeNull();
        expect(result.container.querySelector('.gallery-media-thumbnail img[src="/assets/gallery/api-item-thumb.jpg"]')).not.toBeNull();
        expect(result.container.querySelector('.gallery-media-record-note img[src="/assets/gallery/api-record-preview.jpg"]')).not.toBeNull();
        expect(result.container.querySelector('.gallery-media-archive-preview img[src="/assets/gallery/api-archive-preview.jpg"]')).not.toBeNull();
        expect(result.container.querySelector('.gallery-media-relationship img[src="/assets/gallery/api-relationship-preview.jpg"]')).not.toBeNull();
        expect(result.container.querySelector('.gallery-home-record-context-grid')).not.toBeNull();
        expect(result.container.querySelector('.gallery-relationship-chain')).not.toBeNull();
        expect(text).toContain('기록 유형');
        expect(text).toContain('관계 유형');
        expect(text).toContain('아카이브 시점');
        expect(text).toContain('작품');
        expect(text).toContain('현장 노트');
        expect(text).toContain('보도자료');
        expect(text).not.toContain('artwork');
        expect(text).not.toContain('field_note');
        expect(text).not.toContain('press');
        expect(text).not.toContain('2026-05-02T05:48:17+00:00');
        expect(text).not.toContain('2026-05-03T05:48:17+00:00');
      }
      for (const key of UNRESOLVED_VISIBLE_KEYS) {
        expect(text).not.toContain(key);
      }
    } finally {
      test.cleanup();
    }
  });

  it('keeps homepage live collections bounded when API payloads contain repeated entries', async () => {
    const routesResponse = readJson('routes.json');
    const manifest = readJson('components.json');
    const translations = readJson('lang/ko.json');
    const route = matchRoute(routesResponse.routes, '/');
    const layoutJson = resolveLayout(readJson('layouts/' + route?.layout + '.json'));
    const registry = createRegistryFromManifest(manifest);
    const repeatedHomeResponses = JSON.parse(JSON.stringify(homeApiResponses));
    const repeat = <T,>(items: T[], count: number): T[] =>
      Array.from({ length: count }, (_, index) => ({
        ...items[index % items.length],
        slug: `${(items[index % items.length] as any).slug}-${index}`,
        href: `${(items[index % items.length] as any).href}-${index}`,
      }));

    repeatedHomeResponses.gallery_home.data.highlighted_items = repeat(homeApiResponses.gallery_home.data.highlighted_items, 12);
    repeatedHomeResponses.gallery_home.data.recent_records = repeat(homeApiResponses.gallery_home.data.recent_records, 12);
    repeatedHomeResponses.gallery_home.data.recent_archive_materials = repeat(homeApiResponses.gallery_home.data.recent_archive_materials, 12);
    repeatedHomeResponses.gallery_home.data.relationship_paths = repeat(homeApiResponses.gallery_home.data.relationship_paths, 12);
    repeatedHomeResponses.gallery_home.data.archive_categories = repeat(homeApiResponses.gallery_home.data.archive_categories, 12);

    const test = createLayoutTest(layoutJson, {
      componentRegistry: registry as any,
      translations,
      templateId: TEMPLATE_ID,
      locale: 'ko',
      initialData: createInitialData(layoutJson),
    });

    try {
      for (const [sourceId, response] of Object.entries(repeatedHomeResponses)) {
        test.mockApi(sourceId, { response });
      }

      const result = await test.render();

      expect(result.container.querySelectorAll('.gallery-home-item-card')).toHaveLength(3);
      expect(result.container.querySelectorAll('.gallery-home-record-note')).toHaveLength(3);
      expect(result.container.querySelectorAll('.gallery-home-archive-row')).toHaveLength(3);
      expect(result.container.querySelectorAll('.gallery-home-path-card')).toHaveLength(3);
      expect(result.container.querySelectorAll('.gallery-home-category-chips .gallery-chip')).toHaveLength(6);
      expect(result.container.querySelectorAll('.gallery-home-current-exhibition')).toHaveLength(1);
      expect(result.container.querySelectorAll('.gallery-media-frame').length).toBeLessThanOrEqual(14);
    } finally {
      test.cleanup();
    }
  });

  it.each([
    ['/exhibitions', ['전시 기록', '주요 전시', '빛', '설치', '아카이브']],
    ['/archive', ['아카이브 탐색', '필터 구조', '설치']],
    ['/records', ['기록 노트', '필터 구조', '설치']],
    ['/collections', ['컬렉션 구성']],
    ['/about', ['소개']],
  ])('renders Korean public %s labels through runtime i18n', async (pathName, expectedLabels) => {
    const { test } = await renderPublicPath(pathName, 'ko');

    try {
      const result = await test.render();
      const text = result.container.textContent ?? '';

      for (const label of expectedLabels) {
        expect(text).toContain(label);
      }

      for (const forbidden of [
        'EXHIBITIONS',
        'FEATURED EXHIBITION',
        'RECORD NOTES',
        'FILTER READY STRUCTURE',
        'COLLECTIONS',
        'ABOUT',
        'Exhibitions',
        'Featured Exhibition',
        'Record Notes',
        'Filter Ready Structure',
        'Collections',
        'About',
        'gallery.tags.',
        'gallery.exhibitions.',
        'gallery.records.index.',
        'gallery.filters.ready_kicker',
        'gallery.collections.',
        'gallery.about.',
      ]) {
        expect(text).not.toContain(forbidden);
      }
    } finally {
      test.cleanup();
    }
  });

  it.each([
    ['/exhibitions', ['Exhibitions', 'Featured Exhibition', 'Light', 'Installation', 'Archive']],
    ['/archive', ['Archive browsing', 'Filter Ready Structure', 'Installation']],
    ['/records', ['Record Notes', 'Filter Ready Structure', 'Installation']],
    ['/collections', ['Collections']],
    ['/about', ['About']],
  ])('renders English public %s labels from en.json', async (pathName, expectedLabels) => {
    const { test } = await renderPublicPath(pathName, 'en');

    try {
      const result = await test.render();
      const text = result.container.textContent ?? '';

      for (const label of expectedLabels) {
        expect(text).toContain(label);
      }

      expect(text).not.toContain('gallery.tags.');
      expect(text).not.toContain('gallery.exhibitions.');
      expect(text).not.toContain('gallery.records.index.');
      expect(text).not.toContain('gallery.filters.ready_kicker');
      expect(text).not.toContain('gallery.collections.');
      expect(text).not.toContain('gallery.about.');
    } finally {
      test.cleanup();
    }
  });

  it('does not render bundled homepage sample image URLs as gallery media', async () => {
    const routesResponse = readJson('routes.json');
    const manifest = readJson('components.json');
    const translations = readJson('lang/ko.json');
    const route = matchRoute(routesResponse.routes, '/');
    const layoutJson = resolveLayout(readJson('layouts/' + route?.layout + '.json'));
    const registry = createRegistryFromManifest(manifest);
    const sampleImageResponses = JSON.parse(JSON.stringify(homeApiResponses));

    sampleImageResponses.gallery_home.data.featured_exhibition.image_url = '/images/gallery/featured-exhibition.jpg';
    sampleImageResponses.gallery_home.data.highlighted_items[0].thumbnail_url = '/images/gallery/items/pale-grid-01-thumb.jpg';
    sampleImageResponses.gallery_home.data.recent_records[0].preview_image = '/images/gallery/records/curator-note.jpg';
    sampleImageResponses.gallery_home.data.recent_archive_materials[0].preview_image = '/images/gallery/archive/press-release.jpg';
    sampleImageResponses.gallery_home.data.relationship_paths[0].preview_image = '/images/gallery/relationships/path.jpg';

    const test = createLayoutTest(layoutJson, {
      componentRegistry: registry as any,
      translations,
      templateId: TEMPLATE_ID,
      locale: 'ko',
      initialData: createInitialData(layoutJson),
    });

    try {
      for (const [sourceId, response] of Object.entries(sampleImageResponses)) {
        test.mockApi(sourceId, { response });
      }

      const result = await test.render();

      expect(result.container.querySelector('img[src^="/images/gallery/"]')).toBeNull();
      expect(result.container.querySelector('img[src^="/api/templates/assets/glitter-gallery_bz/images/gallery/"]')).toBeNull();
      expect(result.container.querySelector('.gallery-media-primary .gallery-media-placeholder')).not.toBeNull();
      expect(result.container.querySelector('.gallery-media-thumbnail .gallery-media-placeholder')).not.toBeNull();
      expect(result.container.querySelector('.gallery-media-record-note .gallery-media-placeholder')).not.toBeNull();
      expect(result.container.querySelector('.gallery-media-archive-preview .gallery-media-placeholder')).not.toBeNull();
      expect(result.container.querySelector('.gallery-media-relationship .gallery-media-placeholder')).not.toBeNull();
    } finally {
      test.cleanup();
    }
  });

  it('replaces failed homepage media images with a media placeholder fallback', async () => {
    const routesResponse = readJson('routes.json');
    const manifest = readJson('components.json');
    const translations = readJson('lang/ko.json');
    const route = matchRoute(routesResponse.routes, '/');
    const layoutJson = resolveLayout(readJson('layouts/' + route?.layout + '.json'));
    const registry = createRegistryFromManifest(manifest);

    const test = createLayoutTest(layoutJson, {
      componentRegistry: registry as any,
      translations,
      templateId: TEMPLATE_ID,
      locale: 'ko',
      initialData: createInitialData(layoutJson),
    });

    try {
      for (const [sourceId, response] of Object.entries(homeApiResponses)) {
        test.mockApi(sourceId, { response });
      }

      const result = await test.render();
      const image = result.container.querySelector('.gallery-media-primary img.gallery-media-image');

      expect(image).not.toBeNull();

      fireEvent.error(image as HTMLImageElement);

      expect(result.container.querySelector('.gallery-media-primary img.gallery-media-image')).toBeNull();
      expect(result.container.querySelector('.gallery-media-primary .gallery-media-load-fallback')).not.toBeNull();
    } finally {
      test.cleanup();
    }
  });

  it('normalizes gallery media URLs without double-prefixing template asset paths', () => {
    const assetPrefix = '/api/templates/assets/glitter-gallery_bz/';
    const normalizedAssetUrl = `${assetPrefix}images/gallery/exhibitions/featured-exhibition.jpg`;

    expect(normalizeTemplateAssetSrc(normalizedAssetUrl)).toBe(normalizedAssetUrl);
    expect(normalizeTemplateAssetSrc(`${assetPrefix}${assetPrefix.slice(1)}images/gallery/exhibitions/featured-exhibition.jpg`)).toBe(normalizedAssetUrl);
    expect(normalizeTemplateAssetSrc('images/gallery/items/pale-grid-thumb.jpg')).toBe(`${assetPrefix}images/gallery/items/pale-grid-thumb.jpg`);
    expect(normalizeTemplateAssetSrc('/images/gallery/items/pale-grid-thumb.jpg')).toBe(`${assetPrefix}images/gallery/items/pale-grid-thumb.jpg`);
    expect(normalizeTemplateAssetSrc('https://example.com/foo.jpg')).toBe('https://example.com/foo.jpg');
    expect(normalizeTemplateAssetSrc('http://example.com/foo.jpg')).toBe('http://example.com/foo.jpg');
    expect(normalizeTemplateAssetSrc('data:image/png;base64,abc')).toBe('data:image/png;base64,abc');
    expect(normalizeTemplateAssetSrc('blob:https://example.com/asset')).toBe('blob:https://example.com/asset');
    expect(normalizeTemplateAssetSrc('')).toBe('');
    expect(normalizeTemplateAssetSrc(undefined)).toBeUndefined();
  });
});
