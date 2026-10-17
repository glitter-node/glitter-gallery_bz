import React from 'react';

export interface ImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fetchpriority?: 'high' | 'low' | 'auto';
}

const TEMPLATE_ASSET_PREFIX = '/api/templates/assets/glitter-gallery_bz/';
const TEMPLATE_ASSET_PREFIX_WITHOUT_LEADING_SLASH = TEMPLATE_ASSET_PREFIX.slice(1);
const DOUBLE_TEMPLATE_ASSET_PREFIX = `${TEMPLATE_ASSET_PREFIX}${TEMPLATE_ASSET_PREFIX_WITHOUT_LEADING_SLASH}`;
const GALLERY_PATH_PREFIX = 'images/gallery/';

export const normalizeTemplateAssetSrc = (src?: string): string | undefined => {
  if (!src) {
    return src;
  }

  if (/^(https?:)?\/\//.test(src) || src.startsWith('data:') || src.startsWith('blob:')) {
    return src;
  }

  let normalizedSrc = src;

  while (normalizedSrc.startsWith(DOUBLE_TEMPLATE_ASSET_PREFIX)) {
    normalizedSrc = TEMPLATE_ASSET_PREFIX + normalizedSrc.slice(DOUBLE_TEMPLATE_ASSET_PREFIX.length);
  }

  if (normalizedSrc.startsWith(TEMPLATE_ASSET_PREFIX)) {
    return normalizedSrc;
  }

  if (normalizedSrc.startsWith('/images/gallery/')) {
    const galleryPath = normalizedSrc.slice(1);

    return `${TEMPLATE_ASSET_PREFIX}${galleryPath}`;
  }

  if (normalizedSrc.startsWith(GALLERY_PATH_PREFIX)) {
    return `${TEMPLATE_ASSET_PREFIX}${normalizedSrc}`;
  }

  return normalizedSrc;
};

export const Img: React.FC<ImgProps> = ({
  className = '',
  alt = '',
  onError,
  src,
  fetchpriority,
  fetchPriority,
  ...props
}) => {
  const [hasLoadError, setHasLoadError] = React.useState(false);
  const isGalleryMediaImage = className.split(/\s+/).includes('gallery-media-image');
  const normalizedSrc = normalizeTemplateAssetSrc(src);
  const normalizedFetchPriority = fetchPriority ?? fetchpriority;

  React.useEffect(() => {
    setHasLoadError(false);
  }, [normalizedSrc]);

  const handleError: React.ReactEventHandler<HTMLImageElement> = (event) => {
    onError?.(event);

    if (isGalleryMediaImage) {
      setHasLoadError(true);
    }
  };

  if (isGalleryMediaImage && hasLoadError) {
    return (
      <div
        className="gallery-media-placeholder gallery-media-load-fallback"
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
      />
    );
  }

  return (
    <img
      className={className}
      alt={alt}
      src={normalizedSrc}
      fetchPriority={normalizedFetchPriority}
      onError={handleError}
      {...props}
    />
  );
};
