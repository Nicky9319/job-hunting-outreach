# Job Hunting Outreach

A source of truth for high-fit AI engineering opportunities, verified decision-makers, and outreach status.

## Pursuit gate

Add a company only when all conditions hold:

- Verdict: `pursue` or `pursue aggressively`
- Company score: at least 30/50
- Role score: at least 32/50
- Domain alignment: at least 8/12
- Base opportunity score: at least 75/100

An opportunity without a published vacancy may be saved only when it clears the same gate and is explicitly marked `inferred`.

## Structure

```text
README.md
opportunities/
  index.csv
  <company-slug>.md
```

- `opportunities/index.csv` is the filterable, one-row-per-company index.
- Each Markdown file contains the evidence, scoring, contacts, outreach angle, unknowns, and sources.

## Fixed CSV schema

The index header must remain exactly:

```csv
company,slug,verdict,company_score,role_score,base_score,outreach_priority,role_status,location,remote_india,primary_contact,contact_role,contact_linkedin,opportunity_url,status,evaluated_on,record_path
```

## Pipeline statuses

| Status | Meaning |
|---|---|
| `research-complete` | Evaluation and contact research completed |
| `ready-to-contact` | Personalized outreach is prepared |
| `contacted` | Initial outreach was sent |
| `applied` | Formal application was submitted |
| `interviewing` | Interview process is active |
| `follow-up` | A follow-up is due |
| `offer` | Offer received |
| `rejected` | Opportunity declined |
| `paused` | Intentionally deferred |
| `closed` | No longer active or relevant |

New records default to `research-complete`. Never mark outreach or an application as sent without explicit confirmation.

## Required detailed-record sections

Every `opportunities/<company-slug>.md` must include:

1. YAML metadata with company, slug, verdict, scores, role status, pipeline status, evaluation date, and source URL
2. Decision summary and hard-gate result
3. Company and role score breakdowns
4. Proof and access advantages
5. Candidate fit, strongest evidence, and real gaps
6. Verified contact table
7. Recommended primary contact and rationale
8. Company-specific outreach angle and proposed technical artifact
9. Unknown facts that could change the decision
10. Direct source links

## Deduplication

Use one stable lowercase, hyphenated slug per company. Before writing, search both the CSV and existing Markdown files. Update the existing row and record rather than creating duplicates.

## Data-quality rules

- Prefer official company pages, job descriptions, founder profiles, technical documentation, GitHub, and reliable funding sources.
- Label inference and uncertainty explicitly.
- Never guess email addresses, identities, roles, traction, compensation, or remote eligibility.
- Store only public professional contact routes. Do not store leaked, private, or sensitive personal data.
- Re-verify time-sensitive information before outreach.
