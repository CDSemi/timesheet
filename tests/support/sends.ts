import { randomUUID } from 'node:crypto';
import type { ApiResponse, TestContext } from './testApp.ts';

/*
 * WP5-UX5-T01b: signing no longer sends. A test that signed off and then expected a send now signs off and sends,
 * like the owner does: it reads the revision's send draft (the Settings envelope rendered for the revision and the
 * two PDF switches) and posts that draft to the send route. `extra` overrides fields (a reason, a request key).
 */
export async function sendWithDefaults(
  t: Pick<TestContext, 'request'>,
  cookie: string,
  revisionId: string,
  extra: Record<string, unknown> = {},
): Promise<ApiResponse> {
  const draft = await t.request('GET', `/api/revisions/${revisionId}/send-draft`, { cookie });
  if (draft.status !== 200) throw new Error(`send draft failed: ${draft.status} ${JSON.stringify(draft.body)}`);
  return t.request('POST', `/api/revisions/${revisionId}/send`, {
    cookie,
    body: {
      request_key: randomUUID(),
      to: draft.body.to,
      cc: draft.body.cc,
      subject: draft.body.subject,
      body_text: draft.body.body_text,
      time_rows: draft.body.time_rows,
      ot_rows: draft.body.ot_rows,
      ...extra,
    },
  });
}
