import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Img, normalizeTemplateAssetSrc } from '../Img';

describe('Img normalizeTemplateAssetSrc', () => {
  it('keeps gallery asset paths out of the demo directory', () => {
    expect(normalizeTemplateAssetSrc('/images/gallery/uploads/photo.jpg')).toBe(
      '/api/templates/assets/glitter-gallery_bz/images/gallery/uploads/photo.jpg',
    );

    expect(normalizeTemplateAssetSrc('images/gallery/uploads/photo.jpg')).toBe(
      '/api/templates/assets/glitter-gallery_bz/images/gallery/uploads/photo.jpg',
    );
  });

  it('preserves already normalized template asset paths', () => {
    expect(
      normalizeTemplateAssetSrc('/api/templates/assets/glitter-gallery_bz/images/gallery/uploads/photo.jpg'),
    ).toBe('/api/templates/assets/glitter-gallery_bz/images/gallery/uploads/photo.jpg');
  });

  it('passes LCP image attributes through to the rendered image', () => {
    render(
      <Img
        src="/images/gallery/featured-exhibition.jpg"
        alt="Featured"
        loading="eager"
        fetchpriority="high"
        decoding="async"
        width={1400}
        height={900}
        sizes="(max-width: 1023px) 100vw, 50vw"
      />,
    );

    const image = screen.getByRole('img', { name: 'Featured' });
    expect(image).toHaveAttribute('src', '/api/templates/assets/glitter-gallery_bz/images/gallery/featured-exhibition.jpg');
    expect(image).toHaveAttribute('loading', 'eager');
    expect(image).toHaveAttribute('fetchpriority', 'high');
    expect(image).toHaveAttribute('decoding', 'async');
    expect(image).toHaveAttribute('width', '1400');
    expect(image).toHaveAttribute('height', '900');
    expect(image).toHaveAttribute('sizes', '(max-width: 1023px) 100vw, 50vw');
  });
});
