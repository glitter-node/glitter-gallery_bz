import { default as React } from 'react';
export interface ImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fetchpriority?: 'high' | 'low' | 'auto';
}
export declare const normalizeTemplateAssetSrc: (src?: string) => string | undefined;
export declare const Img: React.FC<ImgProps>;
