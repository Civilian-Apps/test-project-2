import { forbidden, redirect } from 'next/navigation';

import { fetchAdminFeedback } from '@/entities/feedback/admin-list-feedback';
import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';

import { type FeedbackRow, FeedbackTable } from './feedback-table';

const DEFAULT_PAGE_SIZE = 20;

type SearchParams = Promise<{ page?: string | string[] }>;

export default async function AdminFeedbackPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const role = ((user.app_metadata ?? {}) as { role?: unknown }).role;
  if (role !== 'admin') {
    forbidden();
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token ?? '';

  const resolvedSearchParams = await searchParams;
  const rawPage = resolvedSearchParams.page;
  const pageParam = Array.isArray(rawPage) ? rawPage[0] : rawPage;
  const page = Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1);

  const result = await fetchAdminFeedback({
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    accessToken,
  });

  if (result.error) {
    return (
      <section className='mx-auto w-full max-w-6xl p-6'>
        <h1 className='mb-4 text-2xl font-semibold'>Feedback</h1>
        <p className='text-destructive'>Could not load feedback: {result.error.message}</p>
      </section>
    );
  }

  const rows: FeedbackRow[] = result.data.data.map((row) => ({
    id: row.id,
    subject: row.subject,
    body: row.body,
    created_at: row.created_at,
    // The edge function response does not currently include the submitter's
    // email. Leaving as null keeps the column honest until we add it.
    user_email: null,
  }));

  return (
    <section className='mx-auto w-full max-w-6xl p-6'>
      <h1 className='mb-4 text-2xl font-semibold'>Feedback</h1>
      {rows.length === 0 ? (
        <p className='text-muted-foreground'>No feedback yet.</p>
      ) : (
        <FeedbackTable rows={rows} page={result.data.page} pageSize={result.data.pageSize} total={result.data.total} />
      )}
    </section>
  );
}
