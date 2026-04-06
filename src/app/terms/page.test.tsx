import { render, screen } from '@testing-library/react';

import TermsPage from './page';

describe('TermsPage', () => {
  it('renders the Terms of Service heading', () => {
    render(<TermsPage />);
    expect(screen.getByRole('heading', { name: /terms of service/i })).toBeInTheDocument();
  });

  it('mentions UK jurisdiction', () => {
    render(<TermsPage />);
    expect(screen.getByText(/united kingdom/i)).toBeInTheDocument();
  });
});
