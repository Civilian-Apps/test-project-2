import { render, screen } from '@testing-library/react';

jest.mock('@/features/pricing/components/pricing-section', () => ({
  PricingSection: () => null,
}));

/* eslint-disable simple-import-sort/imports */
import HomePage from '../page';
import AboutPage from './page';
/* eslint-enable simple-import-sort/imports */

describe('AboutPage', () => {
  it('renders the About heading', () => {
    render(<AboutPage />);
    expect(screen.getByRole('heading', { name: /^about$/i })).toBeInTheDocument();
  });

  it('renders at least two paragraphs of placeholder text', () => {
    const { container } = render(<AboutPage />);
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBeGreaterThanOrEqual(2);
  });
});

describe('HomePage About link', () => {
  it('includes a link to /about labelled "About"', async () => {
    const ui = await HomePage();
    render(ui);
    const link = screen.getByRole('link', { name: /^about$/i });
    expect(link).toHaveAttribute('href', '/about');
  });
});
