/**
 * @jest-environment node
 */

import { handleListFeedback, ListFeedbackDeps, listFeedbackTool } from './list-feedback';
import { ListFeedbackParams } from './types';

type AuthClient = ListFeedbackDeps['authClient'];
type AdminClient = ListFeedbackDeps['adminClient'];

function buildAuthClient(user: { id: string; role?: string } | null): AuthClient {
  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user:
            user === null
              ? null
              : {
                  id: user.id,
                  app_metadata: user.role ? { role: user.role } : {},
                },
        },
        error: null,
      }),
    },
  } as unknown as AuthClient;
}

function buildAdminClient(rows: unknown, count: number, error: { message: string } | null = null) {
  const range = jest.fn().mockResolvedValue({ data: rows, error, count });
  const order = jest.fn().mockReturnValue({ range });
  const is = jest.fn().mockReturnValue({ order });
  const select = jest.fn().mockReturnValue({ is });
  const from = jest.fn().mockReturnValue({ select });
  const client = { from } as unknown as AdminClient;
  return { client, from, select, is, order, range };
}

describe('ListFeedbackParams schema', () => {
  it('applies defaults when nothing is provided', () => {
    const parsed = ListFeedbackParams.safeParse({});
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toEqual({ page: 1, pageSize: 20 });
    }
  });

  it('coerces string query params to numbers', () => {
    const parsed = ListFeedbackParams.safeParse({ page: '3', pageSize: '50' });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toEqual({ page: 3, pageSize: 50 });
    }
  });

  it('rejects pageSize greater than 100', () => {
    const parsed = ListFeedbackParams.safeParse({ pageSize: 101 });
    expect(parsed.success).toBe(false);
  });

  it('rejects non-positive page', () => {
    const parsed = ListFeedbackParams.safeParse({ page: 0 });
    expect(parsed.success).toBe(false);
  });
});

describe('listFeedbackTool MCP description', () => {
  it('exports a tool name, description, and parameter descriptions', () => {
    expect(listFeedbackTool.name).toBe('list_feedback');
    expect(listFeedbackTool.description).toMatch(/admin/i);
    expect(listFeedbackTool.parameters.page).toMatch(/page/i);
    expect(listFeedbackTool.parameters.pageSize).toMatch(/100/);
  });
});

describe('handleListFeedback', () => {
  const adminId = '00000000-0000-0000-0000-000000000001';
  const sampleRow = {
    id: '00000000-0000-0000-0000-0000000000aa',
    user_id: '00000000-0000-0000-0000-0000000000bb',
    subject: 'Hi',
    body: 'Hello there',
    created_at: '2026-04-06T12:00:00.000Z',
    updated_at: '2026-04-06T12:00:00.000Z',
    deleted_at: null,
  };

  it('returns 200 with paginated rows and total for an admin caller', async () => {
    const authClient = buildAuthClient({ id: adminId, role: 'admin' });
    const admin = buildAdminClient([sampleRow], 1);

    const res = await handleListFeedback(new Request('https://edge.test/list-feedback'), {
      authClient,
      adminClient: admin.client,
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ data: [sampleRow], page: 1, pageSize: 20, total: 1 });
    expect(admin.from).toHaveBeenCalledWith('feedback');
    expect(admin.is).toHaveBeenCalledWith('deleted_at', null);
    expect(admin.order).toHaveBeenCalledWith('created_at', { ascending: false });
    // page=1, pageSize=20 -> range 0..19
    expect(admin.range).toHaveBeenCalledWith(0, 19);
  });

  it('honours page and pageSize query params (page=3, pageSize=5 -> range 10..14)', async () => {
    const authClient = buildAuthClient({ id: adminId, role: 'admin' });
    const admin = buildAdminClient([], 0);

    const res = await handleListFeedback(new Request('https://edge.test/list-feedback?page=3&pageSize=5'), {
      authClient,
      adminClient: admin.client,
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ data: [], page: 3, pageSize: 5, total: 0 });
    expect(admin.range).toHaveBeenCalledWith(10, 14);
  });

  it('returns an empty data array when there are no rows', async () => {
    const authClient = buildAuthClient({ id: adminId, role: 'admin' });
    const admin = buildAdminClient(null, 0);

    const res = await handleListFeedback(new Request('https://edge.test/list-feedback'), {
      authClient,
      adminClient: admin.client,
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual([]);
    expect(body.total).toBe(0);
  });

  it('rejects non-admin callers with 403 FORBIDDEN and never queries the DB', async () => {
    const authClient = buildAuthClient({ id: adminId /* no role */ });
    const admin = buildAdminClient([sampleRow], 1);

    const res = await handleListFeedback(new Request('https://edge.test/list-feedback'), {
      authClient,
      adminClient: admin.client,
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).toEqual({ error: { error_code: 'FORBIDDEN' } });
    expect(admin.from).not.toHaveBeenCalled();
  });

  it('rejects unauthenticated callers with 401', async () => {
    const authClient = buildAuthClient(null);
    const admin = buildAdminClient([], 0);

    const res = await handleListFeedback(new Request('https://edge.test/list-feedback'), {
      authClient,
      adminClient: admin.client,
    });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.error_code).toBe('UNAUTHENTICATED');
    expect(admin.from).not.toHaveBeenCalled();
  });

  it('rejects pageSize > 100 with 400 VALIDATION_ERROR', async () => {
    const authClient = buildAuthClient({ id: adminId, role: 'admin' });
    const admin = buildAdminClient([], 0);

    const res = await handleListFeedback(new Request('https://edge.test/list-feedback?pageSize=101'), {
      authClient,
      adminClient: admin.client,
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.error_code).toBe('VALIDATION_ERROR');
    expect(admin.from).not.toHaveBeenCalled();
  });

  it('returns 405 for non-GET requests', async () => {
    const authClient = buildAuthClient({ id: adminId, role: 'admin' });
    const admin = buildAdminClient([], 0);

    const res = await handleListFeedback(new Request('https://edge.test/list-feedback', { method: 'POST' }), {
      authClient,
      adminClient: admin.client,
    });

    expect(res.status).toBe(405);
    expect(admin.from).not.toHaveBeenCalled();
  });
});
