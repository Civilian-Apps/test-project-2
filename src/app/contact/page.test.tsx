import { render, screen } from '@testing-library/react';

jest.mock('@/features/pricing/components/pricing-section', () => ({
  PricingSection: () => null,
}));

/* eslint-disable simple-import-sort/imports */
import HomePage from '../page';
import ContactPage from './page';
/* eslint-enable simple-import-sort/imports */

describe('ContactPage', () => {
  it('renders the Contact heading', () => {
    render(<ContactPage />);
    expect(screen.getByRole('heading', { name: /^contact$/i })).toBeInTheDocument();
  });

  it('renders a mailto link to hello@example.com', () => {
    render(<ContactPage />);
    const link = screen.getByRole('link', { name: /hello@example\.com/i });
    expect(link).toHaveAttribute('href', 'mailto:hello@example.com');
  });
});

describe('HomePage Contact link', () => {
  it('includes a link to /contact labelled "Contact"', async () => {
    const ui = await HomePage();
    render(ui);
    const link = screen.getByRole('link', { name: /^contact$/i });
    expect(link).toHaveAttribute('href', '/contact');
  });
});
