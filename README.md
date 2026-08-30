# Job Hunting Outreach

A JSON-first source of truth for researching opportunities, tracking decision-makers, recording outreach, and powering a future job-search UI.

## Canonical structure

```text
data/
  opportunities/
    index.json
    <company-slug>.json
schemas/
  opportunity.schema.json
docs/
  status-workflow.md
opportunities/
  index.csv
  <company-slug>.md
```

### Canonical files

- `data/opportunities/index.json`: lightweight summaries for UI lists, filters, sorting, and dashboards.
- `data/opportunities/<company-slug>.json`: complete company evaluation, contacts, current pipeline state, activity history, and sources.
- `schemas/opportunity.schema.json`: validation contract for every opportunity record.
- `docs/status-workflow.md`: exact rules for adding records and updating outreach/application state.

The `opportunities/` CSV and Markdown files are compatibility views only. JSON under `data/` is authoritative.

## Why one JSON file per company?

A single giant file becomes difficult to review and creates merge conflicts. One company per file keeps updates isolated, while `index.json` gives a UI one fast file to load for the overview.

## Opportunity lifecycle

Current state is stored in each record's `pipeline` object:

- `stage`: overall position in the process
- `outreach_status`: whether outreach is untouched, drafted, sent, replied to, or awaiting follow-up
- `application_status`: whether a formal application is untouched, submitted, interviewing, rejected, etc.
- `next_action` and `next_action_due`
- `last_updated`

Allowed pipeline stages:

| Stage | Meaning |
|---|---|
| `research-complete` | Evaluation and contact research finished |
| `ready-to-contact` | Personalized outreach is prepared |
| `contacted` | Initial outreach was sent |
| `applied` | Formal application was submitted |
| `interviewing` | Interview process is active |
| `follow-up` | A follow-up is due |
| `offer` | Offer received |
| `rejected` | Opportunity declined |
| `paused` | Intentionally deferred |
| `closed` | No longer active |

Never mark outreach or an application as sent unless Paarth explicitly confirms it.

## Contact tracking

Every contact has independent fields for:

- Priority and reason for contacting
- Verified LinkedIn and public work email, if available
- Verification source and date
- Outreach status
- Last contacted time
- Next follow-up time
- Notes

This lets the future UI show exactly who remains to be contacted.

## Append-only history

Every meaningful change appends an event to `activity_log`. Existing events must never be rewritten. The current state is in `pipeline`; the audit trail is in `activity_log`.

Examples include:

- `outreach-drafted`
- `outreach-sent`
- `reply-received`
- `follow-up-scheduled`
- `application-submitted`
- `interview-scheduled`
- `offer-received`
- `rejected`

## Adding a new opportunity

1. Evaluate it against the pursuit gate.
2. Search `data/opportunities/index.json` by company name and slug.
3. Update the existing company record if found; never create a duplicate.
4. Otherwise create `data/opportunities/<company-slug>.json`.
5. Validate it against `schemas/opportunity.schema.json`.
6. Add its summary to `data/opportunities/index.json`.
7. Sort index entries by outreach priority descending, then company name.

## Pursuit gate

Persist an opportunity only when:

- Verdict is `pursue` or `pursue-aggressively`
- Company score is at least 30/50
- Role score is at least 32/50
- Domain alignment is at least 8/12
- Base opportunity score is at least 75/100

An opportunity without a published vacancy must be marked `inferred`.

## Data rules

- Use stable lowercase hyphenated slugs.
- Use ISO 8601 UTC timestamps.
- Use `null` for unknown values.
- Prefer primary and current sources.
- Never guess emails, identities, roles, compensation, traction, or remote eligibility.
- Store only public professional contact information.


## Dashboard

The repository includes a private Vercel-ready Next.js dashboard.

### Features

- Search and filter opportunities
- See outreach priority and next actions
- Track pipeline, outreach, and application status independently
- Track every decision-maker independently
- Record follow-up dates
- View the latest activity timeline
- Write changes back to GitHub in one atomic commit
- Detect concurrent edits before overwriting data

### Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Required environment variables:

| Variable | Purpose |
|---|---|
| `GITHUB_TOKEN` | Fine-grained GitHub token with Contents read/write access to this repository |
| `GITHUB_OWNER` | `Nicky9319` |
| `GITHUB_REPO` | `job-hunting-outreach` |
| `GITHUB_BRANCH` | `main` |
| `DASHBOARD_SECRET` | Long private password used to unlock the dashboard |

Never prefix either secret with `NEXT_PUBLIC_`; both must remain server-only.

### Vercel deployment

1. Import `Nicky9319/job-hunting-outreach` into Vercel.
2. Keep the detected framework as Next.js and the root directory as the repository root.
3. Add all five variables above under Project Settings → Environment Variables.
4. Deploy.
5. Open the deployment and enter the value of `DASHBOARD_SECRET`.

Status changes update the canonical company JSON and `index.json` in the same Git commit. Data-only commits are ignored by Vercel builds, preventing a full redeploy each time a status changes.

### Security model

The GitHub token exists only in the Vercel server function. The browser receives neither the GitHub token nor repository write credentials. The dashboard password is kept in browser session storage and sent only to the server API.
