import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';

jest.mock('lucide-react', () => ({
  __esModule: true,
  Plus: () => null,
  X: () => null,
}));

const createTagMock = jest.fn();
const softDeleteTagMock = jest.fn();
jest.mock('@/entities/tag/actions', () => ({
  createTag: (...args: unknown[]) => createTagMock(...args),
  softDeleteTag: (...args: unknown[]) => softDeleteTagMock(...args),
}));

const toastMock = jest.fn();
jest.mock('@/components/ui/use-toast', () => ({
  toast: (args: unknown) => toastMock(args),
  useToast: () => ({ toast: toastMock }),
}));

import type { Tag } from '@/entities/tag/types';

import { TagPicker } from './TagPicker';

const tags: Tag[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    user_id: '22222222-2222-2222-2222-222222222222',
    name: 'work',
    color: '#aabbcc',
    created_at: '2026-04-06T00:00:00Z',
    deleted_at: null,
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    user_id: '22222222-2222-2222-2222-222222222222',
    name: 'home',
    color: '#112233',
    created_at: '2026-04-06T00:00:00Z',
    deleted_at: null,
  },
];

beforeEach(() => {
  createTagMock.mockReset();
  softDeleteTagMock.mockReset();
  toastMock.mockReset();
});

describe('TagPicker', () => {
  it('renders existing tags as removable chips', () => {
    render(<TagPicker tags={tags} />);
    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('home')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove tag work/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove tag home/i })).toBeInTheDocument();
  });

  it('opens an inline add form when "+ Add tag" is clicked', async () => {
    render(<TagPicker tags={tags} />);
    fireEvent.click(screen.getByRole('button', { name: /add tag/i }));
    expect(await screen.findByLabelText(/tag name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/color/i)).toBeInTheDocument();
  });

  it('submits a new tag via createTag and clears the form on success', async () => {
    createTagMock.mockResolvedValue({
      data: {
        id: '44444444-4444-4444-4444-444444444444',
        user_id: '22222222-2222-2222-2222-222222222222',
        name: 'new',
        color: '#ffffff',
        created_at: '2026-04-06T00:00:00Z',
        deleted_at: null,
      },
      error: null,
    });

    render(<TagPicker tags={tags} />);
    fireEvent.click(screen.getByRole('button', { name: /add tag/i }));

    const form = await screen.findByRole('form', { name: /add tag/i });
    fireEvent.change(within(form).getByLabelText(/tag name/i), { target: { value: 'new' } });
    fireEvent.change(within(form).getByLabelText(/color/i), { target: { value: '#ffffff' } });

    await act(async () => {
      fireEvent.click(within(form).getByRole('button', { name: /^save$/i }));
    });

    await waitFor(() => {
      expect(createTagMock).toHaveBeenCalledTimes(1);
    });
    expect(createTagMock).toHaveBeenCalledWith({ name: 'new', color: '#ffffff' });
  });

  it('removes a chip via softDeleteTag', async () => {
    softDeleteTagMock.mockResolvedValue({ data: { id: tags[0].id }, error: null });
    render(<TagPicker tags={tags} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /remove tag work/i }));
    });

    await waitFor(() => {
      expect(softDeleteTagMock).toHaveBeenCalledTimes(1);
    });
    expect(softDeleteTagMock).toHaveBeenCalledWith({ id: tags[0].id });
  });

  it('shows validation error and does not call createTag for an empty name', async () => {
    render(<TagPicker tags={tags} />);
    fireEvent.click(screen.getByRole('button', { name: /add tag/i }));
    const form = await screen.findByRole('form', { name: /add tag/i });

    await act(async () => {
      fireEvent.click(within(form).getByRole('button', { name: /^save$/i }));
    });

    await waitFor(() => {
      expect(within(form).getAllByRole('alert').length).toBeGreaterThanOrEqual(1);
    });
    expect(createTagMock).not.toHaveBeenCalled();
  });
});
