import { FeedbackInput } from '@/entities/feedback/types';

/**
 * Pure handler for the create-feedback edge function.
 *
 * The Deno entrypoint in `index.ts` wires real Supabase + auth dependencies
 * into this handler. Tests inject mock dependencies so the handler can be
 * exercised in Jest without a running Supabase instance.
 */

export type AuthenticatedUser = { id: string };

export type FeedbackRow = { id: string; created_at: string };

export type CreateFeedbackDeps = {
  /**
   * Resolve the caller from the raw `Authorization` header value. Must return
   * `null` for missing, malformed, or invalid tokens.
   */
  authenticate: (authHeader: string | null) => Promise<AuthenticatedUser | null>;

  /**
   * Look up an already-created feedback row for this user + idempotency key.
   * Returns `null` if no prior call used this key.
   */
  findByIdempotencyKey: (userId: string, idempotencyKey: string) => Promise<FeedbackRow | null>;

  /**
   * Insert a feedback row scoped to the authenticated user. Implementation
   * must use a Supabase client bound to the user's JWT so RLS is enforced.
   * Returns `null` on database failure.
   */
  insertFeedback: (input: {
    user_id: string;
    subject: string;
    body: string;
    idempotency_key: string | null;
  }) => Promise<FeedbackRow | null>;
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export async function handleCreateFeedback(req: Request, deps: CreateFeedbackDeps): Promise<Response> {
  if (req.method !== 'POST') {
    return jsonResponse(405, {
      error: { error_code: 'METHOD_NOT_ALLOWED', message: 'Use POST' },
    });
  }

  const authHeader = req.headers.get('Authorization');
  const user = await deps.authenticate(authHeader);
  if (!user) {
    return jsonResponse(401, {
      error: {
        error_code: 'UNAUTHENTICATED',
        message: 'Missing or invalid authentication token',
      },
    });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return jsonResponse(400, {
      error: {
        error_code: 'VALIDATION',
        message: 'Request body must be valid JSON',
        fields: {},
      },
    });
  }

  const parsed = FeedbackInput.safeParse(raw);
  if (!parsed.success) {
    return jsonResponse(400, {
      error: {
        error_code: 'VALIDATION',
        message: 'Feedback failed validation',
        fields: parsed.error.flatten().fieldErrors,
      },
    });
  }

  const idempotencyKey = req.headers.get('Idempotency-Key');
  if (idempotencyKey) {
    const existing = await deps.findByIdempotencyKey(user.id, idempotencyKey);
    if (existing) {
      return jsonResponse(200, {
        id: existing.id,
        created_at: existing.created_at,
      });
    }
  }

  const inserted = await deps.insertFeedback({
    user_id: user.id,
    subject: parsed.data.subject,
    body: parsed.data.body,
    idempotency_key: idempotencyKey,
  });

  if (!inserted) {
    return jsonResponse(500, {
      error: {
        error_code: 'INSERT_FAILED',
        message: 'Could not save feedback',
      },
    });
  }

  return jsonResponse(200, {
    id: inserted.id,
    created_at: inserted.created_at,
  });
}

/**
 * MCP tool descriptor for `create_feedback`.
 *
 * The same Zod schema (`FeedbackInput`) backs the REST validation above and
 * the JSON schema below, so the contract stays single-sourced. Hand-rolled
 * here to avoid pulling in `zod-to-json-schema` for one tool.
 */
export const createFeedbackTool = {
  name: 'create_feedback',
  description:
    'Create a new feedback entry on behalf of the authenticated user. Subject is a short summary (1-120 chars). Body is the full feedback content (1-2000 chars). Pass an Idempotency-Key header to make the call safely retriable.',
  inputSchema: {
    type: 'object',
    additionalProperties: false,
    required: ['subject', 'body'],
    properties: {
      subject: {
        type: 'string',
        minLength: 1,
        maxLength: 120,
        description: 'Short summary of the feedback (1-120 characters).',
      },
      body: {
        type: 'string',
        minLength: 1,
        maxLength: 2000,
        description: 'Full feedback body content (1-2000 characters).',
      },
    },
  },
} as const;
