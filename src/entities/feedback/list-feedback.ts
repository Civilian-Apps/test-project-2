import type { SupabaseClient } from '@supabase/supabase-js';

import { Feedback, ListFeedbackParams } from './types';

/**
 * MCP tool description for the `list-feedback` edge function.
 *
 * Every edge function is both a REST endpoint and an MCP tool (rules/functions.md)
 * — the tool description and parameter descriptions below drive MCP discoverability.
 */
export const listFeedbackTool = {
  name: 'list_feedback',
  description:
    'List all feedback submitted across the app, ordered by most recent first. Admin-only. Returns a paginated page of feedback rows plus the total count.',
  parameters: {
    page: 'Page number (1-indexed). Defaults to 1.',
    pageSize: 'Number of rows per page. Defaults to 20. Maximum 100.',
  },
} as const;

export type ListFeedbackSuccess = {
  data: Feedback[];
  page: number;
  pageSize: number;
  total: number;
};

export type ListFeedbackErrorBody = {
  error: { error_code: string; message?: string; details?: unknown };
};

export type ListFeedbackDeps = {
  /**
   * Client scoped to the caller's JWT — used to identify the user and read
   * their `app_metadata.role` claim for the admin check.
   */
  authClient: Pick<SupabaseClient, 'auth'>;
  /**
   * Service-role client used only after the admin check passes, so the query
   * can read every user's feedback. Using the service role here is an
   * intentional exception documented in src/entities/feedback/definition.md.
   */
  adminClient: Pick<SupabaseClient, 'from'>;
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export async function handleListFeedback(request: Request, deps: ListFeedbackDeps): Promise<Response> {
  if (request.method !== 'GET') {
    return jsonResponse(405, {
      error: { error_code: 'METHOD_NOT_ALLOWED', message: 'Use GET' },
    });
  }

  const url = new URL(request.url);
  const rawPage = url.searchParams.get('page');
  const rawPageSize = url.searchParams.get('pageSize');

  const parsed = ListFeedbackParams.safeParse({
    ...(rawPage !== null ? { page: rawPage } : {}),
    ...(rawPageSize !== null ? { pageSize: rawPageSize } : {}),
  });
  if (!parsed.success) {
    return jsonResponse(400, {
      error: {
        error_code: 'VALIDATION_ERROR',
        message: 'Invalid query parameters',
        details: parsed.error.flatten(),
      },
    });
  }
  const { page, pageSize } = parsed.data;

  const { data: userData, error: userError } = await deps.authClient.auth.getUser();
  if (userError || !userData?.user) {
    return jsonResponse(401, { error: { error_code: 'UNAUTHENTICATED' } });
  }

  const appMetadata = (userData.user.app_metadata ?? {}) as { role?: unknown };
  if (appMetadata.role !== 'admin') {
    return jsonResponse(403, { error: { error_code: 'FORBIDDEN' } });
  }

  const offset = (page - 1) * pageSize;
  const limit = offset + pageSize - 1;

  // Cast through unknown to sidestep the generated Insert/Select type collapse
  // that the rest of this entity works around (see actions.ts).
  const fromFeedback = deps.adminClient.from('feedback') as unknown as {
    select: (
      columns: string,
      opts: { count: 'exact' }
    ) => {
      is: (
        column: string,
        value: null
      ) => {
        order: (
          column: string,
          opts: { ascending: boolean }
        ) => {
          range: (
            from: number,
            to: number
          ) => Promise<{
            data: Feedback[] | null;
            error: { message: string } | null;
            count: number | null;
          }>;
        };
      };
    };
  };

  const { data, error, count } = await fromFeedback
    .select('id, user_id, subject, body, created_at, updated_at, deleted_at', {
      count: 'exact',
    })
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(offset, limit);

  if (error) {
    return jsonResponse(500, {
      error: { error_code: 'QUERY_FAILED', message: 'Could not load feedback' },
    });
  }

  const body: ListFeedbackSuccess = {
    data: data ?? [],
    page,
    pageSize,
    total: count ?? 0,
  };
  return jsonResponse(200, body);
}
