import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';

import { Tag } from './types';

type QueryError = { error_code: string; message: string };
type QueryResult<T> = { data: T; error: null } | { data: null; error: QueryError };

export interface ListUserTagsParams {
  page?: number;
  pageSize?: number;
}

export async function listUserTags({ page = 1, pageSize = 50 }: ListUserTagsParams = {}): Promise<QueryResult<Tag[]>> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: { error_code: 'UNAUTHENTICATED', message: 'Sign in to view your tags' },
    };
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from('tag')
    .select('id, user_id, name, color, created_at, updated_at, deleted_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error || !data) {
    return {
      data: null,
      error: {
        error_code: 'QUERY_FAILED',
        message: 'Could not load tags. Please try again.',
      },
    };
  }

  return { data: data as Tag[], error: null };
}
