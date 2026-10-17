import { describe, expect, it } from 'vitest';
import homeHero from '../../layouts/partials/home/_homepage_featured_exhibition.json';
import homeItemHighlights from '../../layouts/partials/home/_homepage_item_highlights.json';
import homeRecentArchiveMaterials from '../../layouts/partials/home/_homepage_recent_archive_materials.json';
import templateManifest from '../../template.json';

describe('home hero performance metadata', () => {
  it('marks the featured exhibition image as the LCP candidate', () => {
    const image = (homeHero as any).children[0].children[1].children[0].children[0];

    expect(image.name).toBe('Img');
    expect(image.props.loading).toBe('eager');
    expect(image.props.fetchPriority).toBe('high');
    expect(image.props.decoding).toBe('async');
    expect(image.props.width).toBe(1400);
    expect(image.props.height).toBe(900);
    expect(image.props.sizes).toContain('50vw');
  });

  it('does not preload bundled demo gallery images', () => {
    expect((templateManifest as any).performance.preload).toEqual([]);
  });

  it('lazy-loads below-the-fold homepage gallery images', () => {
    const itemImage = (homeItemHighlights as any).children[0].children[2].children[0].children[0].children[0];
    const archiveImage = (homeRecentArchiveMaterials as any).children[0].children[2].children[0].children[0].children[0];

    expect(itemImage.name).toBe('Img');
    expect(itemImage.props.loading).toBe('lazy');
    expect(itemImage.props.decoding).toBe('async');
    expect(itemImage.props.width).toBe(900);
    expect(itemImage.props.height).toBe(900);

    expect(archiveImage.name).toBe('Img');
    expect(archiveImage.props.loading).toBe('lazy');
    expect(archiveImage.props.decoding).toBe('async');
    expect(archiveImage.props.width).toBe(1000);
    expect(archiveImage.props.height).toBe(1300);
  });
});
