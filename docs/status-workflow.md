# Status update workflow

The JSON under `data/` is the canonical source for the future UI.

## Adding an opportunity

1. Generate one stable ID: `opp_<company_slug_with_underscores>`.
2. Create `data/opportunities/<company-slug>.json`.
3. Validate it against `schemas/opportunity.schema.json`.
4. Append one summary entry to `data/opportunities/index.json`.
5. Sort the index by `outreach_priority` descending, then company name.
6. Never create a second record for the same company slug; update the existing record.

## Updating current state

When Paarth confirms an action:

1. Update `pipeline.stage`, `pipeline.outreach_status`, or `pipeline.application_status`.
2. Update the matching contact's `outreach_status`, `last_contacted_at`, and `next_follow_up_at` when relevant.
3. Append a new immutable entry to `activity_log`; never rewrite old history.
4. Update `pipeline.last_updated` and root `updated_at`.
5. Mirror the summary fields in `data/opportunities/index.json`.

### Examples

After an initial LinkedIn message:

- `pipeline.stage = "contacted"`
- `pipeline.outreach_status = "sent"`
- Contact `outreach_status = "sent"`
- Set `last_contacted_at`
- Append an `outreach-sent` activity event

After applying:

- `pipeline.stage = "applied"`
- `pipeline.application_status = "submitted"`
- Append an `application-submitted` event

After receiving a reply:

- `pipeline.outreach_status = "replied"`
- Contact `outreach_status = "replied"`
- Append a `reply-received` event
- Set the next action

## Safety rules

- Never infer that a message or application was sent.
- Never guess contact emails.
- Use ISO 8601 UTC timestamps.
- Use `null` for unknown values instead of empty strings.
- Current state lives in `pipeline`; full history lives in `activity_log`.
