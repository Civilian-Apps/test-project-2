/**
 * @jest-environment node
 */

import { CreateFeedbackDeps, createFeedbackTool, handleCreateFeedback } from './handler';

function makeDeps(overrides: Partial<CreateFeedbackDeps> = {}): CreateFeedbackDeps {
  return {
    authenticate: jest.fn().mockResolvedValue({ id: 'user-1' }),
    findByIdempotencyKey: jest.fn().mockResolvedValue(null),
    insertFeedback: jest.fn().mockResolvedValue({
      id: 'fb-1',
      created_at: '2026-04-06T12:00:00.000Z',
    }),
    ...overrides,
  };
}

function makeRequest(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request('http://localhost/create-feedback', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: 'Bearer jwt',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe('create-feedback edge function', () => {
  it('inserts feedback and returns id+created_at on success', async () => {
    const deps = makeDeps();
    const res = await handleCreateFeedback(makeRequest({ subject: 'Hi', body: 'Hello there' }), deps);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ id: 'fb-1', created_at: '2026-04-06T12:00:00.000Z' });
    expect(deps.insertFeedback).toHaveBeenCalledWith({
      user_id: 'user-1',
      subject: 'Hi',
      body: 'Hello there',
      idempotency_key: null,
    });
  });

  it('returns 400 VALIDATION when body fails Zod', async () => {
    const deps = makeDeps();
    const res = await handleCreateFeedback(makeRequest({ subject: '', body: '' }), deps);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.error_code).toBe('VALIDATION');
    expect(json.error.fields).toBeDefined();
    expect(deps.insertFeedback).not.toHaveBeenCalled();
  });

  it('returns 400 VALIDATION when body is not valid JSON', async () => {
    const deps = makeDeps();
    const req = new Request('http://localhost/create-feedback', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer jwt' },
      body: 'not-json',
    });
    const res = await handleCreateFeedback(req, deps);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.error_code).toBe('VALIDATION');
    expect(deps.insertFeedback).not.toHaveBeenCalled();
  });

  it('returns 401 UNAUTHENTICATED when authenticate returns null', async () => {
    const deps = makeDeps({ authenticate: jest.fn().mockResolvedValue(null) });
    const res = await handleCreateFeedback(
      makeRequest({ subject: 'Hi', body: 'Hello there' }, { authorization: '' }),
      deps
    );

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error.error_code).toBe('UNAUTHENTICATED');
    expect(deps.insertFeedback).not.toHaveBeenCalled();
  });

  it('returns 405 when the method is not POST', async () => {
    const deps = makeDeps();
    const req = new Request('http://localhost/create-feedback', { method: 'GET' });
    const res = await handleCreateFeedback(req, deps);

    expect(res.status).toBe(405);
    expect(deps.authenticate).not.toHaveBeenCalled();
  });

  it('replays idempotently when an Idempotency-Key matches an existing row', async () => {
    const existing = { id: 'fb-existing', created_at: '2026-04-05T00:00:00.000Z' };
    const deps = makeDeps({
      findByIdempotencyKey: jest.fn().mockResolvedValue(existing),
    });
    const res = await handleCreateFeedback(
      makeRequest({ subject: 'Hi', body: 'Hello there' }, { 'Idempotency-Key': 'abc-123' }),
      deps
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual(existing);
    expect(deps.findByIdempotencyKey).toHaveBeenCalledWith('user-1', 'abc-123');
    expect(deps.insertFeedback).not.toHaveBeenCalled();
  });

  it('passes Idempotency-Key to insert when no existing row matches', async () => {
    const deps = makeDeps();
    await handleCreateFeedback(
      makeRequest({ subject: 'Hi', body: 'Hello there' }, { 'Idempotency-Key': 'fresh-key' }),
      deps
    );

    expect(deps.findByIdempotencyKey).toHaveBeenCalledWith('user-1', 'fresh-key');
    expect(deps.insertFeedback).toHaveBeenCalledWith({
      user_id: 'user-1',
      subject: 'Hi',
      body: 'Hello there',
      idempotency_key: 'fresh-key',
    });
  });

  it('returns 500 INSERT_FAILED when the insert dependency returns null', async () => {
    const deps = makeDeps({ insertFeedback: jest.fn().mockResolvedValue(null) });
    const res = await handleCreateFeedback(makeRequest({ subject: 'Hi', body: 'Hello there' }), deps);

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.error_code).toBe('INSERT_FAILED');
  });
});

describe('createFeedbackTool', () => {
  it('exposes a tool description and parameter descriptions for MCP discoverability', () => {
    expect(createFeedbackTool.name).toBe('create_feedback');
    expect(typeof createFeedbackTool.description).toBe('string');
    expect(createFeedbackTool.description.length).toBeGreaterThan(20);

    const props = createFeedbackTool.inputSchema.properties;
    expect(props.subject.description).toMatch(/subject|summary/i);
    expect(props.body.description).toMatch(/feedback|body/i);
    expect(createFeedbackTool.inputSchema.required).toEqual(['subject', 'body']);
  });
});
