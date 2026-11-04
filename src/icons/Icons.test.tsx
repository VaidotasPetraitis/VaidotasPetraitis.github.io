import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { Icon } from './Icons';

afterEach(cleanup);

it('renders brand, outline and fallback icons with accessible decoration semantics', () => {
  const { container } = render(
    <>
      <Icon name="github" />
      <Icon name="mail" />
      <Icon name="unknown" />
    </>,
  );

  expect(container.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(3);
  expect(container.querySelector('svg')?.getAttribute('width')).toBe('20');
});
