import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';

import { Feedback } from './types';

type QueryError = { error_code: string; message: string };
type QueryResult<T> = { data: T; error: null } | { data: null; error: QueryError };

export interface ListUserFeedbackParams {
  page?: number;
  pageSize?: number;
}

export async function listUserFeedback({
  page = 1,
  pageSize = 10,
}: ListUserFeedbackParams): Promise<QueryResult<Feedback[]>> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: { error_code: 'UNAUTHENTICATED', message: 'Sign in to view your feedback' },
    };
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from('feedback')
    .select('id, user_id, subject, body, created_at, updated_at, deleted_at')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error || !data) {
    return {
      data: null,
      error: {
        error_code: 'QUERY_FAILED',
        message: 'Could not load feedback. Please try again.',
      },
    };
  }

  return { data: data as Feedback[], error: null };
}
