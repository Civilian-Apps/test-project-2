import type { Tag } from '@/entities/tag/types';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

const createTagMock = jest.fn();
const softDeleteTagMock = jest.fn();

jest.mock('@/entities/tag/actions', () => ({
  createTag: (...args: unknown[]) => createTagMock(...args),
  softDeleteTag: (...args: unknown[]) => softDeleteTagMock(...args),
}));

jest.mock('lucide-react', () => ({
  __esModule: true,
  Plus: () => null,
  X: () => null,
}));

// eslint-disable-next-line simple-import-sort/imports
import { TagPicker } from './TagPicker';

const USER_ID = '00000000-0000-0000-0000-000000000aaa';

function tag(overrides: Partial<Tag> = {}): Tag {
  return {
    id: '00000000-0000-0000-0000-000000000001',
    user_id: USER_ID,
    name: 'Important',
    color: '#aabbcc',
    created_at: '2026-04-11T12:00:00.000Z',
    updated_at: '2026-04-11T12:00:00.000Z',
    deleted_at: null,
    ...overrides,
  };
}

describe('TagPicker', () => {
  beforeEach(() => {
    createTagMock.mockReset();
    softDeleteTagMock.mockReset();
  });

  it('renders each tag as a chip', () => {
    const tags: Tag[] = [
      tag({ id: '00000000-0000-0000-0000-000000000001', name: 'Important' }),
      tag({ id: '00000000-0000-0000-0000-000000000002', name: 'Urgent', color: '#112233' }),
    ];

    render(<TagPicker tags={tags} />);

    expect(screen.getByText('Important')).toBeInTheDocument();
    expect(screen.getByText('Urgent')).toBeInTheDocument();
  });

  it('renders a "+ Add tag" trigger that reveals the inline input form', () => {
    render(<TagPicker tags={[]} />);

    // Form is hidden initially.
    expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /add tag/i }));

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/color/i)).toBeInTheDocument();
  });

  it('submits a new tag via the createTag server action and closes the form on success', async () => {
    const newTag = tag({ id: '00000000-0000-0000-0000-000000000003', name: 'Blue', color: '#0000ff' });
    createTagMock.mockResolvedValue({ data: newTag, error: null });

    render(<TagPicker tags={[]} />);

    fireEvent.click(screen.getByRole('button', { name: /add tag/i }));

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Blue' } });
    fireEvent.change(screen.getByLabelText(/color/i), { target: { value: '#0000ff' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
    });

    await waitFor(() => {
      expect(createTagMock).toHaveBeenCalledTimes(1);
    });
    expect(createTagMock).toHaveBeenCalledWith({ name: 'Blue', color: '#0000ff' });

    // Form closes after a successful submission.
    await waitFor(() => {
      expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument();
    });
  });

  it('does not call createTag when the form is submitted with invalid input', async () => {
    render(<TagPicker tags={[]} />);

    fireEvent.click(screen.getByRole('button', { name: /add tag/i }));

    // Leave the name empty — should fail Zod validation.
    fireEvent.change(screen.getByLabelText(/color/i), { target: { value: '#aabbcc' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(createTagMock).not.toHaveBeenCalled();
  });

  it('removes a chip by calling softDeleteTag with the tag id', async () => {
    const tags: Tag[] = [tag({ id: '00000000-0000-0000-0000-000000000001', name: 'Important' })];
    softDeleteTagMock.mockResolvedValue({
      data: tag({ deleted_at: '2026-04-11T13:00:00.000Z' }),
      error: null,
    });

    render(<TagPicker tags={tags} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /remove important/i }));
    });

    await waitFor(() => {
      expect(softDeleteTagMock).toHaveBeenCalledTimes(1);
    });
    expect(softDeleteTagMock).toHaveBeenCalledWith('00000000-0000-0000-0000-000000000001');
  });
});
