import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Icon } from '../Icon';

describe('Icon component', () => {
  it('renders public navigation icons as inline svg without Font Awesome CSS', () => {
    render(<Icon name="menu" ariaLabel="Open menu" className="menu-icon" />);

    const icon = screen.getByRole('img', { name: 'Open menu' });
    expect(icon.tagName.toLowerCase()).toBe('svg');
    expect(icon).toHaveClass('menu-icon');
    expect(icon.querySelector('path')).toBeTruthy();
  });

  it('keeps Font Awesome class fallback for unsupported icons', () => {
    render(<Icon name="user" ariaLabel="User" />);

    const icon = screen.getByRole('img', { name: 'User' });
    expect(icon.tagName.toLowerCase()).toBe('i');
    expect(icon).toHaveClass('fas', 'fa-user');
  });
});
