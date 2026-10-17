import { default as React } from 'react';
export type ThemeMode = 'auto' | 'light' | 'dark';
export interface ThemeToggleProps {
    onThemeChange?: (theme: ThemeMode) => void;
    className?: string;
    variant?: 'default' | 'headerGear';
    ariaLabel?: string;
    autoText?: string;
    lightText?: string;
    darkText?: string;
}
export declare const ThemeToggle: React.FC<ThemeToggleProps>;
export default ThemeToggle;
