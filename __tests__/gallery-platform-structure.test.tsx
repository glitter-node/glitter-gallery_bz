import React from 'react';
import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { fireEvent } from '@testing-library/react';
import {
  createLayoutTest,
  createMockComponentRegistry,
} from '../../../../resources/js/core/template-engine/__tests__/utils/layoutTestUtils';
import * as TemplateComponents from '../src/index';

const TEMPLATE_ROOT = path.resolve(__dirname, '..');
const LAYOUT_ROOT = path.join(TEMPLATE_ROOT, 'layouts');
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
          type_label_key: 'gallery.archive_materials.types.press',
          title_label: 'API 아카이브 자료',
          summary_label: 'API 아카이브 요약',
          preview_image: '/assets/gallery/api-archive-preview.jpg',
          media_caption: 'API 자료 캡션',
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
          slug: 'material',
          category: 'material',
          label_key: 'gallery.archive.categories.material.title',
          materials_count: 1,
          href: '/archive/material',
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
const emptyHomeApiResponses = {
  gallery_home: {
    success: true,
    data: {
      featured_exhibition: null,
      highlighted_items: [],
      recent_records: [],
      recent_archive_materials: [],
      relationship_paths: [],
      archive_categories: [],
      about_context: {},
    },
  },
  gallery_featured_exhibition: {
    success: true,
    data: {
      featured: null,
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
      data: [],
    },
  },
  gallery_home_recent_archive_materials: {
    success: true,
    data: {
      categories: [],
    },
  },
  gallery_archive_categories: {
    success: true,
    data: {
      categories: [],
    },
  },
};

function readJson<T = any>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(TEMPLATE_ROOT, relativePath), 'utf8'));
}

function createRegistry() {
  const manifest = readJson('components.json');
  const registry = createMockComponentRegistry();

  for (const type of ['basic', 'composite', 'layout']) {
    for (const metadata of manifest.components?.[type] ?? []) {
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
    return resolveNode(readJson(`layouts/${node.partial}`));
  }

  const resolved: any = {};

  for (const [key, value] of Object.entries(node)) {
    resolved[key] = key === 'children' || key === 'components' || key === 'content'
      ? resolveNode(value)
      : value;
  }

  return resolved;
}

function resolveLayout(layout: any) {
  return {
    ...layout,
    slots: layout.slots
      ? Object.fromEntries(
        Object.entries(layout.slots).map(([slotName, children]) => [slotName, resolveNode(children)])
      )
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

async function renderLayout(
  layout: any,
  apiResponses: Record<string, any> = {},
  initialGlobal: Record<string, any> = {},
  locale = 'ko',
) {
  const resolvedLayout = resolveLayout(layout);
  const test = createLayoutTest(resolvedLayout, {
    componentRegistry: createRegistry() as any,
    translations: readJson(`lang/${locale}.json`),
    templateId: TEMPLATE_ID,
    locale,
    initialData: createInitialData(resolvedLayout, locale),
    initialState: {
      _global: {
        settings: {
          general: {
            site_name: '관리자 설정 사이트',
            site_url: 'https://admin-configured.example',
            site_description: '관리자 설정 설명',
          },
        },
        ...initialGlobal,
      },
    },
  });

  try {
    for (const [sourceId, response] of Object.entries(apiResponses)) {
      test.mockApi(sourceId, { response });
    }

    return { test, result: await test.render() };
  } catch (error) {
    test.cleanup();
    throw error;
  }
}

describe('glitter-gallery_bz platform structure', () => {
  it('declares the gallery module that owns its public API contract', () => {
    const manifest = readJson('template.json');

    expect(manifest.dependencies?.modules?.['glitter-gallery']).toBe('>=0.1.0');
  });

  it('maps every configured error layout to an existing errors layout file', () => {
    const manifest = readJson('template.json');
    const expectedErrorLayouts = {
      '401': 'errors/401',
      '403': 'errors/403',
      '404': 'errors/404',
      '500': 'errors/500',
      '503': 'errors/503',
      maintenance: 'errors/maintenance',
    };

    expect(manifest.error_config?.layouts).toEqual(expectedErrorLayouts);

    for (const layoutPath of Object.values(expectedErrorLayouts)) {
      expect(fs.existsSync(path.join(LAYOUT_ROOT, `${layoutPath}.json`))).toBe(true);
    }
  });

  it('renders institutional public header and footer chrome', async () => {
    const { test, result } = await renderLayout(readJson('layouts/_user_base.json'));

    try {
      const text = result.container.textContent ?? '';

      expect(result.container.querySelector('.gallery-header-inner')).not.toBeNull();
      expect(result.container.querySelector('.gallery-brand-subtitle')).not.toBeNull();
      expect(result.container.querySelector('.gallery-header-status')).toBeNull();
      expect(result.container.querySelector('.gallery-footer-grid')).not.toBeNull();
      expect(result.container.querySelectorAll('.gallery-footer-link-group')).toHaveLength(3);
      expect(text).toContain('전시 아카이브와 기록 색인');
      expect(text).toContain('현재 전시');
      expect(text).toContain('아카이브');
      expect(text).toContain('기록');
      expect(text).toContain('컬렉션');
      expect(text).toContain('소개');
      expect(text).not.toContain('OPEN CATALOG');
      expect(text).not.toContain('전시와 기록을 연결해 읽는 공개 색인');
      expect(text).toContain('전시, 작품, 문서, 현장 기록과 그 관계를 계속 읽을 수 있도록 정리한 기관형 색인입니다.');
      expect(text).toContain('아카이브 경로');
      expect(text).toContain('기록 맥락');
      expect(text).toContain('공개 카탈로그 구조 · 전시 아카이브 · 기록 노트');
    } finally {
      test.cleanup();
    }
  });

  it('loads homepage live sections from the aggregate public gallery API once', () => {
    const home = readJson('layouts/home.json');
    const sources = Object.fromEntries(home.data_sources.map((source: any) => [source.id, source]));
    const apiSources = home.data_sources.filter((source: any) => source.type === 'api');

    expect(sources.gallery_home).toMatchObject({
      type: 'api',
      endpoint: '/api/gallery/home',
      method: 'GET',
      auth_mode: 'none',
    });
    expect(apiSources).toHaveLength(1);
    expect(apiSources.map((source: any) => source.endpoint)).toEqual(['/api/gallery/home']);
    expect(sources.gallery_home_item_highlights_fallback.data.map((item: any) => item.type)).toEqual([
      'artwork',
      'installation',
      'document',
    ]);
    expect(sources.gallery_home_recent_archive_materials_fallback.data.map((material: any) => material.category)).toEqual([
      'material',
      'document',
      'field-record',
    ]);
    expect(sources.gallery_home_relationship_paths.data.map((path: any) => path.id)).toEqual(expect.arrayContaining([
      'exhibition-to-field-note',
      'installation-records',
      'research-connected-work',
    ]));
  });

  it('orders homepage sections as a curated exhibition and archive index', () => {
    const home = readJson('layouts/home.json');

    expect(home.slots.content.map((node: any) => node.partial)).toEqual([
      'partials/home/_homepage_featured_exhibition.json',
      'partials/home/_homepage_item_highlights.json',
      'partials/home/_homepage_recent_records.json',
      'partials/home/_homepage_recent_archive_materials.json',
      'partials/home/_homepage_relationship_paths.json',
      'partials/home/_homepage_archive_categories_compact.json',
      'partials/home/_homepage_about_compact.json',
    ]);
  });

  it('renders homepage as current archive state with item metadata and relationship paths', async () => {
    const { test, result } = await renderLayout(readJson('layouts/home.json'), homeApiResponses);

    try {
      const text = result.container.textContent ?? '';

      expect(text).toContain('현재 전시 보기');
      expect(text).toContain('API 현재 전시');
      expect(text).toContain('API 항목');
      expect(text).toContain('API 작가');
      expect(text).toContain('API 매체');
      expect(text).toContain('API 기록 노트');
      expect(text).toContain('API 기록 요약');
      expect(text).toContain('API 아카이브 자료');
      expect(text).toContain('API 전시 이미지 캡션');
      expect(text).toContain('자료 유형별 기록');
      expect(text).toContain('API 현재 전시 → API 기록 노트');
      expect(text).toContain('분류로 빠르게 들어가기');
      expect(text).toContain('작품');
      expect(text).toContain('현장 노트');
      expect(text).toContain('보도자료');
      expect(text).not.toContain('field_note');
      expect(text).not.toContain('2026-05-02T05:48:17+00:00');
      expect(result.container.querySelector('.gallery-home-category-chips')).not.toBeNull();
      expect(result.container.querySelector('.gallery-media-primary img[src="/assets/gallery/api-featured.jpg"]')).not.toBeNull();
      expect(result.container.querySelector('.gallery-media-thumbnail img[src="/assets/gallery/api-item-thumb.jpg"]')).not.toBeNull();
      expect(result.container.querySelector('.gallery-media-record-note img[src="/assets/gallery/api-record-preview.jpg"]')).not.toBeNull();
      expect(result.container.querySelector('.gallery-media-archive-preview img[src="/assets/gallery/api-archive-preview.jpg"]')).not.toBeNull();
      expect(result.container.querySelector('.gallery-media-relationship img[src="/assets/gallery/api-relationship-preview.jpg"]')).not.toBeNull();
      expect(result.container.querySelector('.gallery-grid-3')).toBeNull();
    } finally {
      test.cleanup();
    }
  });

  it('renders homepage fallback states with empty public API data', async () => {
    const { test, result } = await renderLayout(readJson('layouts/home.json'), emptyHomeApiResponses);

    try {
      const text = result.container.textContent ?? '';

      expect(text).toContain('준비 중인 전시');
      expect(text).toContain('희미한 격자 01');
      expect(text).toContain('아직 공개된 기록 노트가 없습니다.');
      expect(text).toContain('아직 공개된 아카이브 분류가 없습니다.');
      expect(text).toContain('아카이브 분류가 준비되면 이곳에 표시됩니다.');
      expect(result.container.querySelector('.gallery-home-current-exhibition')).not.toBeNull();
      expect(result.container.querySelector('.gallery-media-placeholder')).not.toBeNull();
      expect(text).toContain('전시 이미지 자리');
    } finally {
      test.cleanup();
    }
  });

  it('defines the bundled media hierarchy and placeholder utility layer', () => {
    const css = fs.readFileSync(path.join(TEMPLATE_ROOT, 'src/styles/main.css'), 'utf8');
    const mediaPartials = [
      'layouts/partials/home/_homepage_featured_exhibition.json',
      'layouts/partials/home/_homepage_item_highlights.json',
      'layouts/partials/home/_homepage_recent_records.json',
      'layouts/partials/home/_homepage_recent_archive_materials.json',
      'layouts/partials/home/_homepage_relationship_paths.json',
      'layouts/partials/exhibitions/_exhibition_hero.json',
      'layouts/partials/items/_item_visual.json',
      'layouts/partials/archive-materials/_archive_material_visual.json',
      'layouts/partials/records/_record_hero.json',
    ].map((file) => fs.readFileSync(path.join(TEMPLATE_ROOT, file), 'utf8')).join('\n');

    expect(css).toContain('.gallery-media-primary');
    expect(css).toContain('.gallery-media-secondary');
    expect(css).toContain('.gallery-media-thumbnail');
    expect(css).toContain('.gallery-media-archive-preview');
    expect(css).toContain('.gallery-media-record-note');
    expect(css).toContain('.gallery-media-scan');
    expect(mediaPartials).toContain('image_url');
    expect(mediaPartials).toContain('thumbnail_url');
    expect(mediaPartials).toContain('preview_image');
    expect(mediaPartials).toContain('media_caption');
    expect(mediaPartials).toContain('gallery-media-placeholder');
  });

  it('renders detail media placeholders when detail image fields are absent', async () => {
    const scenarios = [
      {
        layout: 'layouts/exhibition-detail.json',
        sourceId: 'gallery_exhibition_detail',
        remove: ['cover_image', 'image_url', 'preview_image', 'featured_image'],
        expected: '상세 대표 이미지',
      },
      {
        layout: 'layouts/item-detail.json',
        sourceId: 'gallery_item_detail',
        remove: ['detail_image', 'image_url', 'preview_image', 'media'],
        expected: '상세 대표 이미지',
      },
      {
        layout: 'layouts/record-detail.json',
        sourceId: 'gallery_record_detail',
        remove: ['image_url', 'thumbnail_url', 'preview_image', 'media'],
        expected: '기록 노트 시각 영역',
      },
      {
        layout: 'layouts/archive-material-detail.json',
        sourceId: 'gallery_archive_material_detail',
        remove: ['image', 'image_url', 'preview_image', 'media'],
        expected: '문서 스캔 자리',
      },
    ];

    for (const scenario of scenarios) {
      const layout = readJson(scenario.layout);
      const dataSource = layout.data_sources.find((source: any) => source.id === scenario.sourceId);

      for (const key of scenario.remove) {
        delete dataSource.data[key];
      }

      const { test, result } = await renderLayout(layout);

      try {
        const text = result.container.textContent ?? '';
        expect(result.container.querySelector('.gallery-media-frame')).not.toBeNull();
        expect(result.container.querySelector('.gallery-media-placeholder')).not.toBeNull();
        expect(text).toContain(scenario.expected);
      } finally {
        test.cleanup();
      }
    }
  });

  it('keeps bundled homepage layout JSON free of hardcoded Korean strings', () => {
    const files = [
      'layouts/home.json',
      'layouts/partials/home/_homepage_featured_exhibition.json',
      'layouts/partials/home/_homepage_item_highlights.json',
      'layouts/partials/home/_homepage_recent_records.json',
      'layouts/partials/home/_homepage_recent_archive_materials.json',
      'layouts/partials/home/_homepage_relationship_paths.json',
      'layouts/partials/home/_homepage_archive_categories_compact.json',
      'layouts/partials/home/_homepage_about_compact.json',
    ];

    for (const file of files) {
      expect(fs.readFileSync(path.join(TEMPLATE_ROOT, file), 'utf8')).not.toMatch(/[가-힣]/);
    }
  });

  it('keeps public page layout JSON display labels routed through i18n keys', () => {
    const files = [
      'layouts/exhibitions.json',
      'layouts/archive.json',
      'layouts/archive-category.json',
      'layouts/records.json',
      'layouts/collections.json',
      'layouts/about.json',
    ];

    for (const file of files) {
      const source = fs.readFileSync(path.join(TEMPLATE_ROOT, file), 'utf8');

      expect(source).not.toMatch(/[가-힣]/);
      expect(source).not.toMatch(/"label"\s*:\s*"(installation|document|field|research|context)"/);
    }
  });

  it('prepares exhibition and archive exploration routes', () => {
    const routes = readJson('routes.json').routes.map((route: any) => `${route.path}:${route.layout ?? route.redirect}`);

    expect(routes).toEqual(expect.arrayContaining([
      '/exhibitions:exhibitions',
      '/exhibitions/:slug:exhibition-detail',
      '/archive:archive',
      '/archive/:category:archive-category',
      '/records:records',
      '/archive/:category/:slug:archive-material-detail',
      '/records/:slug:record-detail',
      '/items/:slug:item-detail',
    ]));
  });

  it('prepares mock admin gallery IA routes', () => {
    const routes = readJson('routes.json').routes.map((route: any) => `${route.path}:${route.layout ?? route.redirect}`);

    expect(routes).toEqual(expect.arrayContaining([
      '/admin/gallery:admin-gallery-dashboard',
      '/admin/gallery/exhibitions:admin-gallery-exhibitions',
      '/admin/gallery/exhibitions/create:admin-gallery-exhibition-form',
      '/admin/gallery/exhibitions/:id/edit:admin-gallery-exhibition-form',
      '/admin/gallery/items:admin-gallery-items',
      '/admin/gallery/items/create:admin-gallery-item-form',
      '/admin/gallery/items/:id/edit:admin-gallery-item-form',
      '/admin/gallery/records:admin-gallery-records',
      '/admin/gallery/records/create:admin-gallery-record-form',
      '/admin/gallery/records/:id/edit:admin-gallery-record-form',
      '/admin/gallery/archive-materials:admin-gallery-archive-materials',
      '/admin/gallery/archive-materials/create:admin-gallery-archive-material-form',
      '/admin/gallery/archive-materials/:id/edit:admin-gallery-archive-material-form',
      '/admin/gallery/relationships:admin-gallery-relationships',
    ]));
  });

  it('defines exhibition listing groups with future filter and pagination support', () => {
    const layout = readJson('layouts/exhibitions.json');
    const source = layout.data_sources.find((item: any) => item.id === 'gallery_exhibitions');

    expect(source.data.groups.map((group: any) => group.id)).toEqual(['current', 'upcoming', 'past']);
    expect(source.data.filters.map((filter: any) => filter.id)).toEqual(['all', 'current', 'upcoming', 'past']);
    expect(source.data.pagination).toEqual(expect.objectContaining({
      page: 1,
      per_page: expect.any(Number),
      total: expect.any(Number),
    }));
    expect(source.data.items[0]).toEqual(expect.objectContaining({
      cover_image: expect.any(String),
      curator_summary_key: expect.any(String),
      archive_references: expect.any(Array),
      timeline: expect.any(Array),
    }));
  });

  it('renders exhibition group section headings once outside item iterations', () => {
    const layout = readJson('layouts/exhibitions.json');
    const groupSection = layout.slots.content.find((item: any) => item.props?.className === 'gallery-list gallery-exhibition-groups');
    const groups = groupSection.children.filter((item: any) => item.props?.className === 'gallery-group');

    expect(groups).toHaveLength(3);
    expect(groups.map((group: any) => group.children[0].children[0].text)).toEqual([
      '$t:gallery.exhibitions.groups.current.title',
      '$t:gallery.exhibitions.groups.upcoming.title',
      '$t:gallery.exhibitions.groups.past.title',
    ]);
    expect(groups.some((group: any) => group.iteration)).toBe(false);
    expect(groups.every((group: any) => group.children[1].children[0].iteration?.item_var === 'exhibition')).toBe(true);
  });

  it('defines exhibition detail exploration data', () => {
    const layout = readJson('layouts/exhibition-detail.json');
    const detail = layout.data_sources.find((item: any) => item.id === 'gallery_exhibition_detail').data;

    expect(detail.metadata.map((item: any) => item.id)).toEqual(expect.arrayContaining(['period', 'location', 'status', 'visibility']));
    expect(detail.sections.some((section: any) => section.insertion_point === 'artworks')).toBe(true);
    expect(detail.related_records).toHaveLength(2);
    expect(detail.field_notes).toHaveLength(2);
    expect(detail.archive_materials).toHaveLength(3);
    expect(detail.timeline_references).toHaveLength(3);
    expect(detail.related_collections).toHaveLength(2);
  });

  it('defines artwork and material records for exhibition detail exploration', () => {
    const layout = readJson('layouts/exhibition-detail.json');
    const source = layout.data_sources.find((item: any) => item.id === 'gallery_exhibition_items');
    const firstItem = source.data.items[0];

    expect(source.data.items.map((item: any) => item.type)).toEqual(['artwork', 'installation', 'document']);
    expect(firstItem).toMatchObject({
      id: expect.any(String),
      slug: expect.any(String),
      type: expect.any(String),
      title_key: expect.any(String),
      subtitle_key: expect.any(String),
      artist_name_key: expect.any(String),
      year: expect.any(String),
      medium_key: expect.any(String),
      dimensions_key: expect.any(String),
      collection_name_key: expect.any(String),
      credit_line_key: expect.any(String),
      section_id: expect.any(String),
      exhibition_slug: expect.any(String),
      archive_category: expect.any(String),
      thumbnail_image: expect.any(String),
      detail_image: expect.any(String),
      summary_key: expect.any(String),
      curator_note_key: expect.any(String),
      visibility_state: expect.any(String),
      published_at: expect.any(String),
      related_records: expect.any(Array),
      related_archive_materials: expect.any(Array),
    });
    expect(firstItem.relationships).toEqual(expect.objectContaining({
      artist_profile: expect.any(String),
      archive_category: expect.any(String),
      record_notes: expect.any(Array),
      collection: expect.any(String),
      exhibition_section: expect.any(String),
      timeline_reference: expect.any(String),
    }));
  });

  it('defines item detail data with metadata, visual, context, and relationships', () => {
    const layout = readJson('layouts/item-detail.json');
    const detail = layout.data_sources.find((item: any) => item.id === 'gallery_item_detail').data;

    expect(detail.metadata.map((item: any) => item.id)).toEqual([
      'artist',
      'year',
      'medium',
      'dimensions',
      'collection',
      'credit',
      'visibility',
    ]);
    expect(detail.related_record_items).toHaveLength(2);
    expect(detail.archive_material_items).toHaveLength(2);
    expect(detail.exhibition_href).toBe('/exhibitions/light-afterimage-record');
  });

  it('defines record note index data with filter and sort preparation', () => {
    const layout = readJson('layouts/records.json');
    const source = layout.data_sources.find((item: any) => item.id === 'gallery_records_index').data;

    expect(source.records.map((record: any) => record.type)).toEqual([
      'curator_note',
      'field_note',
      'installation_note',
      'process_note',
      'research_note',
    ]);
    expect(source.record_types.map((type: any) => type.id)).toEqual([
      'curator_note',
      'field_note',
      'installation_note',
      'process_note',
      'research_note',
    ]);
    expect(source.filters).toEqual(expect.objectContaining({
      record_type_filters: expect.any(Array),
      material_type_filters: expect.any(Array),
      tag_filters: expect.any(Array),
      sort_options: expect.any(Array),
      relation_filters: expect.any(Array),
      author_source_filters: expect.any(Array),
    }));
    expect(source.sort.supported).toEqual(['date_desc', 'date_asc', 'title']);
    expect(source.pagination).toEqual(expect.objectContaining({ page: 1, per_page: 12, total: 5 }));
    expect(source.records[0].href).toBe('/records/curator-note');
  });

  it('defines archive index and category data with material discovery relationships', () => {
    const archive = readJson('layouts/archive.json');
    const archiveSource = archive.data_sources.find((item: any) => item.id === 'gallery_archive_index').data;
    const category = readJson('layouts/archive-category.json');
    const categorySource = category.data_sources.find((item: any) => item.id === 'gallery_archive_category_detail').data;

    expect(archiveSource.categories.map((item: any) => item.id)).toEqual([
      'exhibition',
      'artist',
      'material',
      'document',
      'research',
      'field-record',
    ]);
    expect(archiveSource.categories.find((item: any) => item.id === 'material').href).toBe('/archive/material');
    expect(archiveSource.filters).toEqual(expect.objectContaining({
      material_type_filters: expect.any(Array),
      tag_filters: expect.any(Array),
      sort_options: expect.any(Array),
      relation_filters: expect.any(Array),
      author_source_filters: expect.any(Array),
    }));
    expect(categorySource.materials.map((item: any) => item.href)).toEqual(expect.arrayContaining([
      '/archive/material/installation-photo-set',
      '/archive/field-record/lighting-plan',
      '/archive/document/press-release',
    ]));
    expect(categorySource.materials[0]).toEqual(expect.objectContaining({
      category: expect.any(String),
      type: expect.any(String),
      source_key: expect.any(String),
      identifier: expect.any(String),
      record_slugs: expect.any(Array),
    }));
  });

  it('defines admin dashboard data for content operations and relationship review', () => {
    const layout = readJson('layouts/admin-gallery-dashboard.json');
    const source = layout.data_sources.find((item: any) => item.id === 'admin_gallery').data;

    expect(source.overview_counts.map((item: any) => item.id)).toEqual([
      'exhibitions',
      'items',
      'records',
      'archive-materials',
      'collections',
      'taxonomy',
      'relationships',
    ]);
    expect(source.status_summary.map((item: any) => item.id)).toEqual([
      'published',
      'draft',
      'private',
      'scheduled',
    ]);
    expect(source.quick_actions.map((item: any) => item.href)).toEqual(expect.arrayContaining([
      '/admin/gallery/exhibitions/create',
      '/admin/gallery/items/create',
      '/admin/gallery/records/create',
      '/admin/gallery/archive-materials/create',
      '/admin/gallery/relationships',
    ]));
    expect(source.relationship_gaps).toHaveLength(3);
    expect(source.option_lists).toEqual(expect.objectContaining({
      content_types: expect.any(Array),
      publication_states: expect.any(Array),
      taxonomy_options: expect.any(Array),
      relationship_targets: expect.any(Array),
    }));
  });

  it.each([
    ['admin-gallery-exhibition-form.json', ['identity', 'period_location', 'curator_note', 'sections', 'publication', 'relationships']],
    ['admin-gallery-item-form.json', ['identity', 'object_metadata', 'media_visual', 'exhibition_context', 'archive_relationships', 'publication']],
    ['admin-gallery-record-form.json', ['identity', 'author_date', 'body_sections', 'record_relationships', 'publication']],
    ['admin-gallery-archive-material-form.json', ['identity', 'source_rights', 'document_metadata', 'material_relationships', 'publication']],
  ])('defines logical admin form sections in %s', (layoutFile, expectedSections) => {
    const layout = readJson(`layouts/${layoutFile}`);
    const source = layout.data_sources.find((item: any) => item.id === 'admin_gallery').data;

    expect(source.form_sections.map((section: any) => section.id)).toEqual(expectedSections);
    expect(source.form_sections[0].fields[0]).toEqual(expect.objectContaining({
      id: expect.any(String),
      label_key: expect.any(String),
      placeholder_key: expect.any(String),
    }));
  });

  it('defines record note detail data with bidirectional relationships', () => {
    const layout = readJson('layouts/record-detail.json');
    const detail = layout.data_sources.find((item: any) => item.id === 'gallery_record_detail').data;

    expect(detail).toMatchObject({
      id: expect.any(String),
      slug: expect.any(String),
      type: 'curator_note',
      title_key: expect.any(String),
      subtitle_key: expect.any(String),
      author_name_key: expect.any(String),
      recorded_at_key: expect.any(String),
      summary_key: expect.any(String),
      exhibition_slug: expect.any(String),
      visibility_state: expect.any(String),
      published_at: expect.any(String),
    });
    expect(detail.body_sections).toHaveLength(3);
    expect(detail.item_slugs).toEqual(expect.arrayContaining(['pale-grid-01']));
    expect(detail.archive_material_slugs).toEqual(expect.arrayContaining(['press-release']));
    expect(detail.related_items).toHaveLength(2);
    expect(detail.related_archive_materials).toHaveLength(2);
  });

  it('defines archive material detail data with bidirectional relationships', () => {
    const layout = readJson('layouts/archive-material-detail.json');
    const detail = layout.data_sources.find((item: any) => item.id === 'gallery_archive_material_detail').data;

    expect(detail).toMatchObject({
      id: expect.any(String),
      slug: expect.any(String),
      category: expect.any(String),
      type: 'installation_photo',
      title_key: expect.any(String),
      subtitle_key: expect.any(String),
      date_label_key: expect.any(String),
      source_key: expect.any(String),
      rights_key: expect.any(String),
      format_key: expect.any(String),
      identifier: expect.any(String),
      image: expect.any(String),
      summary_key: expect.any(String),
      description_key: expect.any(String),
      exhibition_slug: expect.any(String),
      visibility_state: expect.any(String),
      published_at: expect.any(String),
    });
    expect(detail.item_slugs).toEqual(expect.arrayContaining(['pale-grid-01']));
    expect(detail.record_slugs).toEqual(expect.arrayContaining(['field-note']));
    expect(detail.related_items).toHaveLength(2);
    expect(detail.related_records).toHaveLength(2);
  });

  it.each([
    ['home.json', '.gallery-home-current-exhibition', 'API 현재 전시'],
    ['exhibitions.json', '.gallery-page-head', '빛이 지나간 자리의 기록'],
    ['archive.json', '.gallery-archive-index-hero', '아카이브 탐색'],
    ['records.json', '.gallery-records-index-hero', '기록 노트 인덱스'],
    ['collections.json', '.gallery-page-head', '프로젝트 자료'],
    ['stories.json', '.gallery-page-head', '설치 노트'],
    ['exhibition-detail.json', '.gallery-exhibition-detail-hero', '조사에서 공개까지'],
    ['exhibition-detail.json', '.gallery-item-section', '희미한 격자 01'],
    ['archive-category.json', '.gallery-archive-category-hero', '자료 유형별 기록'],
    ['record-detail.json', '.gallery-page-head', '빛이 지나간 자리의 기록'],
    ['item-detail.json', '.gallery-item-detail-hero', '희미한 격자 01'],
    ['record-detail.json', '.gallery-record-detail-hero', '자료를 읽는 방식'],
    ['archive-material-detail.json', '.gallery-archive-material-hero', '전시장 구조와 작품 배치'],
    ['admin-gallery-dashboard.json', '.gallery-admin-hero', '갤러리 콘텐츠 운영'],
    ['admin-gallery-exhibitions.json', '.gallery-admin-hero', '전시 관리'],
    ['admin-gallery-items.json', '.gallery-admin-hero', '전시 항목 관리'],
    ['admin-gallery-records.json', '.gallery-admin-hero', '기록 노트 관리'],
    ['admin-gallery-archive-materials.json', '.gallery-admin-hero', '아카이브 자료 관리'],
    ['admin-gallery-exhibition-form.json', '.gallery-admin-hero', '전시 작성 구조'],
    ['admin-gallery-item-form.json', '.gallery-admin-hero', '전시 항목 작성 구조'],
    ['admin-gallery-record-form.json', '.gallery-admin-hero', '기록 노트 작성 구조'],
    ['admin-gallery-archive-material-form.json', '.gallery-admin-hero', '아카이브 자료 작성 구조'],
    ['admin-gallery-relationships.json', '.gallery-admin-hero', '관계 검토'],
  ])('renders %s from data sources', async (layoutFile, expectedSelector, expectedText) => {
    const apiResponses = layoutFile === 'home.json' ? homeApiResponses : {};
    const { test, result } = await renderLayout(readJson(`layouts/${layoutFile}`), apiResponses);

    try {
      expect(result.container.querySelector(expectedSelector)).not.toBeNull();
      expect(result.container.textContent ?? '').toContain(expectedText);
    } finally {
      test.cleanup();
    }
  });

  it('renders the public display mode selector in the global header identity row only', async () => {
    const { test, result } = await renderLayout(readJson('layouts/_user_base.json'));

    try {
      const trigger = result.container.querySelector('.gallery-header-topbar .gallery-header-mode-trigger') as HTMLButtonElement | null;

      expect(trigger).not.toBeNull();
      expect(trigger?.getAttribute('aria-label')).toBe('표시 모드 선택');
      expect(trigger?.getAttribute('aria-haspopup')).toBe('menu');
      expect(trigger?.querySelector('.gallery-header-mode-trigger-icon')?.classList.contains('fa-xs')).toBe(false);
      expect(result.container.querySelector('.gallery-header-topbar .gallery-header-utility')).not.toBeNull();
      expect(result.container.querySelector('.gallery-header-topbar .gallery-header-auth-guest')).not.toBeNull();
      expect(result.container.querySelector('.gallery-header-topbar .gallery-header-auth-user')).toBeNull();
      expect(result.container.querySelector('.gallery-header-topbar .gallery-header-auth-cluster')).not.toBeNull();
      expect(result.container.querySelector('.gallery-header-topbar .gallery-header-auth-link[href="/admin/login"]')).toBeNull();
      expect(result.container.querySelector('.gallery-header-topbar .gallery-header-auth-login[href="/login"]')).not.toBeNull();
      expect(result.container.querySelector('.gallery-header-topbar .gallery-header-auth-register[href="/register"]')).not.toBeNull();
      expect(result.container.querySelectorAll('.gallery-header-topbar .gallery-header-auth-link')).toHaveLength(2);
      expect(result.container.querySelector('.gallery-header-mode-menu')).toBeNull();
      expect(result.container.querySelector('.gallery-brand-block')?.textContent).not.toContain('시스템라이트다크');

      fireEvent.click(trigger as HTMLButtonElement);

      const menu = result.container.querySelector('.gallery-header-mode-menu');
      const options = result.container.querySelectorAll('.gallery-header-mode-menu-item');

      expect(menu).not.toBeNull();
      expect(options).toHaveLength(3);
      expect(Array.from(options).map((option) => option.textContent)).toEqual(['시스템', '라이트', '다크']);
      expect(options[0].classList.contains('gallery-header-mode-menu-item-active')).toBe(true);
      expect(result.container.querySelector('.gallery-home-current-exhibition .gallery-mode-button')).toBeNull();
      expect(result.container.querySelector('.gallery-exhibition-detail-hero .gallery-mode-button')).toBeNull();
    } finally {
      test.cleanup();
    }
  });

  it('renders the authenticated public header action when current user is available', async () => {
    const { test, result } = await renderLayout(readJson('layouts/_user_base.json'), {}, {
      currentUser: {
        uuid: 'user-1',
        name: 'Archive Reader',
        email: 'reader@example.test',
      },
    });

    try {
      expect(result.container.querySelector('.gallery-header-topbar .gallery-header-auth-guest')).toBeNull();
      expect(result.container.querySelector('.gallery-header-topbar .gallery-header-auth-user')).not.toBeNull();
      expect(result.container.querySelector('.gallery-header-topbar .gallery-header-auth-dropdown-trigger')).not.toBeNull();
      expect(result.container.querySelector('.gallery-header-topbar .gallery-header-auth-avatar')?.textContent).toBe('A');
      expect(result.container.querySelector('.gallery-header-topbar .gallery-header-auth-user-name')?.textContent).toBe('Archive Reader');
      expect(result.container.querySelector('.gallery-header-topbar .gallery-header-auth-login[href="/login"]')).toBeNull();
      expect(result.container.querySelector('.gallery-header-topbar .gallery-header-auth-register[href="/register"]')).toBeNull();
      expect(result.container.querySelector('.gallery-header-topbar .gallery-header-auth-menu')).not.toBeNull();
      expect(result.container.querySelector('.gallery-header-topbar .gallery-header-auth-menu-avatar')?.textContent).toBe('A');
      expect(result.container.querySelector('.gallery-header-topbar .gallery-header-auth-menu-name')?.textContent).toBe('Archive Reader');
      expect(result.container.querySelector('.gallery-header-topbar .gallery-header-auth-menu-role')?.textContent).toBe('회원');
      expect(result.container.querySelector('.gallery-header-topbar .gallery-header-auth-menu-admin')).toBeNull();
      expect(result.container.querySelector('.gallery-header-topbar a[href="/admin/dashboard"]')).toBeNull();
      expect(result.container.querySelector('.gallery-header-topbar a[href="/admin/gallery"]')).toBeNull();
      expect(result.container.querySelector('.gallery-header-topbar a[href="/mypage"]')).toBeNull();
      expect(result.container.querySelector('.gallery-header-topbar .gallery-header-language-toggle')?.textContent).toBe('한국어');
      expect(result.container.querySelector('.gallery-header-topbar .gallery-header-auth-language-section')).toBeNull();
      expect(result.container.querySelector('.gallery-header-topbar .gallery-header-auth-menu-section-label')).toBeNull();
      expect(result.container.querySelectorAll('.gallery-header-topbar .gallery-header-auth-language-item')).toHaveLength(0);
      expect(result.container.querySelector('.gallery-header-topbar .gallery-header-auth-menu-logout')).not.toBeNull();
      expect(result.container.querySelector('.gallery-header-topbar .gallery-header-auth-link[href="/admin/login"]')).toBeNull();
      expect(result.container.querySelector('.gallery-header-topbar a[href="/admin/login"]')).toBeNull();
    } finally {
      test.cleanup();
    }
  });

  it('shows admin dropdown items only for public users with admin capability', async () => {
    const { test, result } = await renderLayout(readJson('layouts/_user_base.json'), {}, {
      currentUser: {
        uuid: 'admin-1',
        name: 'Archive Admin',
        email: 'admin@example.test',
        is_admin: true,
      },
    });

    try {
      const adminItems = Array.from(result.container.querySelectorAll('.gallery-header-topbar .gallery-header-auth-menu-admin'));
      const managementBoardItem = result.container.querySelector('.gallery-header-topbar a[href="/admin/dashboard"]');
      const galleryManagementItem = result.container.querySelector('.gallery-header-topbar a[href="/admin/gallery"]');

      expect(adminItems).toHaveLength(2);
      expect(managementBoardItem?.textContent).toBe('관리 보드');
      expect(galleryManagementItem?.textContent).toBe('갤러리 관리');
      expect(result.container.querySelector('.gallery-header-topbar a[href="/admin/login"]')).toBeNull();
    } finally {
      test.cleanup();
    }
  });

  it('localizes authenticated dropdown labels in English locale', async () => {
    const { test, result } = await renderLayout(readJson('layouts/_user_base.json'), {}, {
      currentUser: {
        uuid: 'user-1',
        name: 'Archive Reader',
        email: 'reader@example.test',
      },
    }, 'en');

    try {
      expect(result.container.querySelector('.gallery-header-topbar .gallery-header-auth-menu-role')?.textContent).toBe('Member');
      expect(result.container.querySelector('.gallery-header-topbar .gallery-header-language-toggle')?.textContent).toBe('English');
      expect(result.container.querySelector('.gallery-header-topbar .gallery-header-auth-menu-section-label')).toBeNull();
      expect(result.container.querySelectorAll('.gallery-header-topbar .gallery-header-auth-language-item')).toHaveLength(0);
      expect(result.container.querySelector('.gallery-header-topbar .gallery-header-auth-menu-logout')?.textContent).toBe('Log out');
    } finally {
      test.cleanup();
    }
  });

  it('defines a public login route and renders a user login form', async () => {
    const routes = readJson('routes.json');
    const loginRoute = routes.routes.find((route: any) => route.path === '/login');

    expect(loginRoute).toEqual({
      path: '/login',
      layout: 'auth/login',
      auth_required: false,
      meta: {
        title: '$t:auth.login_page.meta_title',
      },
    });

    const { test, result } = await renderLayout(readJson('layouts/auth/login.json'));

    try {
      const form = result.container.querySelector('.gallery-auth-form');
      const email = result.container.querySelector('input[name="email"][type="email"]');
      const password = result.container.querySelector('input[name="password"][type="password"]');

      expect(result.container.querySelector('.gallery-auth-page')).not.toBeNull();
      expect(result.container.textContent ?? '').toContain('Gallery Bz Beta2');
      expect(form).not.toBeNull();
      expect(email).not.toBeNull();
      expect(password).not.toBeNull();
      expect(result.container.querySelector('a[href="/archive"]')).not.toBeNull();
      expect(result.container.querySelector('a[href="/register"]')).toBeNull();
      expect(result.container.querySelector('a[href="/admin/login"]')).toBeNull();
    } finally {
      test.cleanup();
    }
  });

  it('defines a public register route and renders a public registration form', async () => {
    const routes = readJson('routes.json');
    const registerRoute = routes.routes.find((route: any) => route.path === '/register');

    expect(registerRoute).toEqual({
      path: '/register',
      layout: 'auth/register',
      auth_required: false,
      meta: {
        title: '$t:auth.register_page.meta_title',
      },
    });

    const { test, result } = await renderLayout(readJson('layouts/auth/register.json'));

    try {
      const form = result.container.querySelector('.gallery-auth-form');
      const name = result.container.querySelector('input[name="name"][type="text"]');
      const email = result.container.querySelector('input[name="email"][type="email"]');
      const password = result.container.querySelector('input[name="password"][type="password"]');
      const passwordConfirmation = result.container.querySelector('input[name="password_confirmation"][type="password"]');

      expect(result.container.querySelector('.gallery-auth-page')).not.toBeNull();
      expect(result.container.textContent ?? '').toContain('Gallery Bz Beta2');
      expect(form).not.toBeNull();
      expect(name).not.toBeNull();
      expect(email).not.toBeNull();
      expect(password).not.toBeNull();
      expect(passwordConfirmation).not.toBeNull();
      expect(result.container.querySelector('a[href="/login"]')).not.toBeNull();
      expect(result.container.querySelector('a[href="/admin/login"]')).toBeNull();
    } finally {
      test.cleanup();
    }
  });

  it.each([
    ['partials/admin-gallery/_admin_gallery_hero.json', '갤러리 콘텐츠 운영'],
    ['partials/admin-gallery/_admin_content_status_summary.json', '비공개'],
    ['partials/admin-gallery/_admin_quick_actions.json', '전시 작성'],
    ['partials/admin-gallery/_admin_filter_bar.json', '수정일'],
    ['partials/admin-gallery/_admin_relationship_summary.json', '전시에서 항목으로'],
  ])('renders admin partial %s', async (partialPath, expectedText) => {
    const dashboard = readJson('layouts/admin-gallery-dashboard.json');
    const partial = readJson(`layouts/${partialPath}`);
    const layout = {
      version: '1.0.0',
      layout_name: `test_${path.basename(partialPath, '.json')}`,
      data_sources: dashboard.data_sources,
      components: [partial],
    };
    const { test, result } = await renderLayout(layout);

    try {
      expect(result.container.textContent ?? '').toContain(expectedText);
    } finally {
      test.cleanup();
    }
  });

  it('renders admin content cards with edit targets', async () => {
    const dashboard = readJson('layouts/admin-gallery-dashboard.json');
    const partial = readJson('layouts/partials/admin-gallery/_admin_content_card.json');
    const layout = {
      version: '1.0.0',
      layout_name: 'test_admin_content_card',
      data_sources: dashboard.data_sources,
      components: [
        {
          type: 'basic',
          name: 'Div',
          iteration: {
            source: 'admin_gallery.content.slice(0, 1)',
            item_var: 'content',
          },
          children: [partial],
        },
      ],
    };
    const { test, result } = await renderLayout(layout);

    try {
      const text = result.container.textContent ?? '';
      expect(text).toContain('빛이 지나간 자리의 기록');
      expect(text).toContain('관계 완성');
      expect(result.container.querySelector('a[href="/admin/gallery/exhibitions/1/edit"]')).not.toBeNull();
    } finally {
      test.cleanup();
    }
  });

  it('renders admin form sections with mock field structure', async () => {
    const form = readJson('layouts/admin-gallery-exhibition-form.json');
    const partial = readJson('layouts/partials/admin-gallery/_admin_form_section.json');
    const layout = {
      version: '1.0.0',
      layout_name: 'test_admin_form_section',
      data_sources: form.data_sources,
      components: [
        {
          type: 'basic',
          name: 'Div',
          iteration: {
            source: 'admin_gallery.form_sections.slice(0, 1)',
            item_var: 'form_section',
          },
          children: [partial],
        },
      ],
    };
    const { test, result } = await renderLayout(layout);

    try {
      const text = result.container.textContent ?? '';
      expect(text).toContain('기본 식별 정보');
      expect(text).toContain('필드: title');
      expect(text).toContain('향후 title 값을 입력합니다.');
    } finally {
      test.cleanup();
    }
  });

  it('renders admin relationship gap cards with review targets', async () => {
    const dashboard = readJson('layouts/admin-gallery-dashboard.json');
    const partial = readJson('layouts/partials/admin-gallery/_admin_relationship_gap_card.json');
    const layout = {
      version: '1.0.0',
      layout_name: 'test_admin_relationship_gap_card',
      data_sources: dashboard.data_sources,
      components: [
        {
          type: 'basic',
          name: 'Div',
          iteration: {
            source: 'admin_gallery.relationship_gaps.slice(0, 1)',
            item_var: 'gap',
          },
          children: [partial],
        },
      ],
    };
    const { test, result } = await renderLayout(layout);

    try {
      const text = result.container.textContent ?? '';
      expect(text).toContain('항목에 연결된 기록이 부족합니다');
      expect(text).toContain('항목 편집으로 이동');
      expect(result.container.querySelector('a[href="/admin/gallery/items/1/edit"]')).not.toBeNull();
    } finally {
      test.cleanup();
    }
  });

  it.each([
    ['partials/home/_homepage_featured_exhibition.json', '현재 전시 보기'],
    ['partials/home/_homepage_item_highlights.json', 'API 항목'],
    ['partials/home/_homepage_recent_records.json', 'API 기록 노트'],
    ['partials/home/_homepage_recent_archive_materials.json', 'API 아카이브 자료'],
    ['partials/home/_homepage_relationship_paths.json', 'API 관계 설명'],
    ['partials/home/_homepage_archive_categories_compact.json', '자료 유형별 기록'],
    ['partials/home/_homepage_about_compact.json', '플랫폼 설명보다 현재 전시'],
  ])('renders partial %s with homepage data sources', async (partialPath, expectedText) => {
    const home = readJson('layouts/home.json');
    const partial = readJson(`layouts/${partialPath}`);
    const layout = {
      version: '1.0.0',
      layout_name: `test_${path.basename(partialPath, '.json')}`,
      data_sources: home.data_sources,
      components: [partial],
    };
    const { test, result } = await renderLayout(layout, homeApiResponses);

    try {
      expect(result.container.textContent ?? '').toContain(expectedText);
    } finally {
      test.cleanup();
    }
  });

  it.each([
    ['partials/exhibitions/_exhibition_hero.json', '전시와 설치 기록을 함께 읽는 대표 전시'],
    ['partials/exhibitions/_exhibition_metadata.json', '공개 기록'],
    ['partials/exhibitions/_curator_note.json', '작품 삽입 영역'],
    ['partials/exhibitions/_related_records.json', '설치 관찰 기록'],
    ['partials/exhibitions/_archive_materials.json', '작품 상세 데이터가 준비되면'],
    ['partials/exhibitions/_timeline_references.json', '공개 열람'],
    ['partials/exhibitions/_exhibition_items.json', '보도자료 단편 A'],
  ])('renders exhibition detail partial %s', async (partialPath, expectedText) => {
    const detail = readJson('layouts/exhibition-detail.json');
    const partial = readJson(`layouts/${partialPath}`);
    const layout = {
      version: '1.0.0',
      layout_name: `test_${path.basename(partialPath, '.json')}`,
      data_sources: detail.data_sources,
      components: [partial],
    };
    const { test, result } = await renderLayout(layout);

    try {
      expect(result.container.textContent ?? '').toContain(expectedText);
    } finally {
      test.cleanup();
    }
  });

  it('renders the exhibition item card partial with required metadata', async () => {
    const detail = readJson('layouts/exhibition-detail.json');
    const partial = readJson('layouts/partials/exhibitions/_exhibition_item_card.json');
    const itemsSource = detail.data_sources.find((source: any) => source.id === 'gallery_exhibition_items');
    const layout = {
      version: '1.0.0',
      layout_name: 'test_exhibition_item_card',
      data_sources: detail.data_sources,
      components: [
        {
          type: 'basic',
          name: 'Div',
          iteration: {
            source: 'gallery_exhibition_items.items.slice(0, 1)',
            item_var: 'item',
          },
          children: [partial],
        },
      ],
    };

    expect(itemsSource.data.items[0].slug).toBe('pale-grid-01');

    const { test, result } = await renderLayout(layout);

    try {
      const text = result.container.textContent ?? '';
      expect(text).toContain('희미한 격자 01');
      expect(text).toContain('민지원');
      expect(text).toContain('2025');
      expect(text).toContain('한지에 안료, 아카이벌 프린트');
      expect(text).toContain('항목 기록 보기');
    } finally {
      test.cleanup();
    }
  });

  it.each([
    ['partials/items/_item_hero.json', '빛의 잔상과 종이 표면을 기록한 작품'],
    ['partials/items/_item_visual.json', '작가 및 Glitter Gallery Bz 제공'],
    ['partials/items/_item_metadata.json', '72 x 54 cm'],
    ['partials/items/_item_curator_note.json', '전시장 입구에서 관람자가 처음 마주하는'],
    ['partials/items/_item_exhibition_context.json', '전시 기록으로 돌아가기'],
    ['partials/items/_item_related_records.json', '현장 노트'],
    ['partials/items/_item_archive_materials.json', '조명 계획 기록'],
  ])('renders item detail partial %s', async (partialPath, expectedText) => {
    const detail = readJson('layouts/item-detail.json');
    const partial = readJson(`layouts/${partialPath}`);
    const layout = {
      version: '1.0.0',
      layout_name: `test_${path.basename(partialPath, '.json')}`,
      data_sources: detail.data_sources,
      components: [partial],
    };
    const { test, result } = await renderLayout(layout);

    try {
      expect(result.container.textContent ?? '').toContain(expectedText);
    } finally {
      test.cleanup();
    }
  });

  it.each([
    ['partials/records-index/_records_hero.json', '기록 노트 인덱스'],
    ['partials/records-index/_record_type_summary.json', '설치 노트'],
    ['partials/records-index/_records_filter_bar.json', '최신 기록순'],
  ])('renders record index partial %s', async (partialPath, expectedText) => {
    const detail = readJson('layouts/records.json');
    const partial = readJson(`layouts/${partialPath}`);
    const layout = {
      version: '1.0.0',
      layout_name: `test_${path.basename(partialPath, '.json')}`,
      data_sources: detail.data_sources,
      components: [partial],
    };
    const { test, result } = await renderLayout(layout);

    try {
      expect(result.container.textContent ?? '').toContain(expectedText);
    } finally {
      test.cleanup();
    }
  });

  it('renders the record card partial with required metadata and detail link', async () => {
    const detail = readJson('layouts/records.json');
    const partial = readJson('layouts/partials/records-index/_record_card.json');
    const layout = {
      version: '1.0.0',
      layout_name: 'test_record_card',
      data_sources: detail.data_sources,
      components: [
        {
          type: 'basic',
          name: 'Div',
          iteration: {
            source: 'gallery_records_index.records.slice(0, 1)',
            item_var: 'record',
          },
          children: [partial],
        },
      ],
    };
    const { test, result } = await renderLayout(layout);

    try {
      const text = result.container.textContent ?? '';
      expect(text).toContain('큐레이터 노트');
      expect(text).toContain('수석 큐레이터');
      expect(text).toContain('빛이 지나간 자리의 기록');
      expect(result.container.querySelector('a[href="/records/curator-note"]')).not.toBeNull();
    } finally {
      test.cleanup();
    }
  });

  it.each([
    ['partials/archive/_archive_hero.json', '아카이브 탐색'],
    ['partials/archive/_archive_filter_bar.json', '최신 기록순'],
    ['partials/archive/_archive_category_card.json', '자료 수'],
    ['partials/archive/_archive_category_hero.json', '자료 유형별 기록'],
    ['partials/archive/_archive_material_card.json', 'GBZ-MAT-2026-001'],
  ])('renders archive index partial %s', async (partialPath, expectedText) => {
    const sourceLayout = partialPath.includes('_archive_category_hero') || partialPath.includes('_archive_material_card')
      ? readJson('layouts/archive-category.json')
      : readJson('layouts/archive.json');
    const partial = readJson(`layouts/${partialPath}`);
    const layout = {
      version: '1.0.0',
      layout_name: `test_${path.basename(partialPath, '.json')}`,
      data_sources: sourceLayout.data_sources,
      components: [partial],
    };
    const { test, result } = await renderLayout(layout);

    try {
      expect(result.container.textContent ?? '').toContain(expectedText);
    } finally {
      test.cleanup();
    }
  });

  it('renders archive cards with prepared category and material detail links', async () => {
    const archive = readJson('layouts/archive.json');
    const category = readJson('layouts/archive-category.json');
    const categoryPartial = readJson('layouts/partials/archive/_archive_category_card.json');
    const materialPartial = readJson('layouts/partials/archive/_archive_material_card.json');
    const layout = {
      version: '1.0.0',
      layout_name: 'test_archive_cards',
      data_sources: [...archive.data_sources, ...category.data_sources],
      components: [categoryPartial, materialPartial],
    };
    const { test, result } = await renderLayout(layout);

    try {
      const text = result.container.textContent ?? '';
      expect(text).toContain('자료 유형별 기록');
      expect(text).toContain('설치 사진 묶음');
      expect(text).toContain('Glitter Gallery Bz 기록팀');
      expect(result.container.querySelector('a[href="/archive/material"]')).not.toBeNull();
      expect(result.container.querySelector('a[href="/archive/material/installation-photo-set"]')).not.toBeNull();
    } finally {
      test.cleanup();
    }
  });

  it.each([
    ['partials/records/_record_hero.json', '장문 기록'],
    ['partials/records/_record_metadata.json', '수석 큐레이터'],
    ['partials/records/_record_body_sections.json', '전시 이후의 기록'],
    ['partials/records/_record_exhibition_context.json', '빛이 지나간 자리의 기록'],
    ['partials/records/_record_related_items.json', '희미한 격자 01'],
    ['partials/records/_record_archive_materials.json', '보도자료 원문'],
  ])('renders record detail partial %s', async (partialPath, expectedText) => {
    const detail = readJson('layouts/record-detail.json');
    const partial = readJson(`layouts/${partialPath}`);
    const layout = {
      version: '1.0.0',
      layout_name: `test_${path.basename(partialPath, '.json')}`,
      data_sources: detail.data_sources,
      components: [partial],
    };
    const { test, result } = await renderLayout(layout);

    try {
      expect(result.container.textContent ?? '').toContain(expectedText);
    } finally {
      test.cleanup();
    }
  });

  it.each([
    ['partials/archive-materials/_archive_material_hero.json', '이미지 자료'],
    ['partials/archive-materials/_archive_material_visual.json', 'GBZ-MAT-2026-001'],
    ['partials/archive-materials/_archive_material_metadata.json', '디지털 이미지 묶음'],
    ['partials/archive-materials/_archive_material_description.json', '재설치와 연구 열람'],
    ['partials/archive-materials/_archive_material_exhibition_context.json', '빛이 지나간 자리의 기록'],
    ['partials/archive-materials/_archive_material_related_items.json', '설치 축 기록'],
    ['partials/archive-materials/_archive_material_related_records.json', '현장 노트'],
  ])('renders archive material detail partial %s', async (partialPath, expectedText) => {
    const detail = readJson('layouts/archive-material-detail.json');
    const partial = readJson(`layouts/${partialPath}`);
    const layout = {
      version: '1.0.0',
      layout_name: `test_${path.basename(partialPath, '.json')}`,
      data_sources: detail.data_sources,
      components: [partial],
    };
    const { test, result } = await renderLayout(layout);

    try {
      expect(result.container.textContent ?? '').toContain(expectedText);
    } finally {
      test.cleanup();
    }
  });

  it('keeps visible Korean strings out of layout JSON files', () => {
    const layoutFiles = fs.readdirSync(LAYOUT_ROOT, { recursive: true })
      .filter((file) => typeof file === 'string' && file.endsWith('.json')) as string[];

    for (const file of layoutFiles) {
      const content = fs.readFileSync(path.join(LAYOUT_ROOT, file), 'utf8');
      expect(content, file).not.toMatch(/[가-힣]/);
    }
  });
});
