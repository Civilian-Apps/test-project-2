import { getEnvVar } from '@/utils/get-env-var';

import type { ListFeedbackSuccess } from './list-feedback';

/**
 * Server-side fetcher for the admin-only `list-feedback` edge function.
 *
 * Forwards the caller's Supabase JWT as a Bearer token so the edge function
 * can run its own admin check (see `handleListFeedback`). This wrapper is
 * kept as its own module so server components can mock it in tests without
 * reaching through the real fetch.
 */

export type FetchAdminFeedbackParams = {
  page: number;
  pageSize: number;
  accessToken: string;
};

type FetchError = { error_code: string; message: string };

export type FetchAdminFeedbackResult = { data: ListFeedbackSuccess; error: null } | { data: null; error: FetchError };

export async function fetchAdminFeedback({
  page,
  pageSize,
  accessToken,
}: FetchAdminFeedbackParams): Promise<FetchAdminFeedbackResult> {
  const supabaseUrl = getEnvVar(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL');
  const url = new URL(`${supabaseUrl}/functions/v1/list-feedback`);
  url.searchParams.set('page', String(page));
  url.searchParams.set('pageSize', String(pageSize));

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: FetchError } | null;
    return {
      data: null,
      error: body?.error ?? {
        error_code: 'REQUEST_FAILED',
        message: `list-feedback returned ${response.status}`,
      },
    };
  }

  const data = (await response.json()) as ListFeedbackSuccess;
  return { data, error: null };
}
