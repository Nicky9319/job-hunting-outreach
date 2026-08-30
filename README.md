# Job Hunting Outreach

A single source of truth for tracking high-fit AI engineering opportunities, researching companies and decision-makers, and managing applications and founder outreach without duplicates.

## Target opportunities

This repository prioritizes:

- Production AI and agentic systems
- AI infrastructure, reliability, observability, and evaluation
- Backend and distributed systems supporting AI products
- Remote internships or full-time roles, especially at early-stage startups
- Teams where direct founder or technical-leader outreach is realistic

An opportunity should only be added after it has been evaluated and judged worth pursuing.

## Repository structure

```text
companies/
  <company-slug>/
    README.md
    contacts.md
    outreach.md
```

Each company gets one folder. This prevents duplicate entries when the same company has multiple roles or is rediscovered later.

### `companies/<company-slug>/README.md`

Contains the core evaluation:

- Company overview and product
- Relevant role or opportunity
- Location, remote policy, stage, funding, and team size
- Fit score and recommendation
- Reasons to pursue
- Risks or gaps
- Suggested contribution angle
- Source links
- Current application status
- Date added and last verified date

### `companies/<company-slug>/contacts.md`

Contains verified or plausible people to contact:

- Founder(s)
- Hiring manager
- Technical leader
- Relevant employee or alumnus
- Role and reason for contacting
- LinkedIn and other public profile links
- Publicly available contact details, where appropriate
- Verification source and date

### `companies/<company-slug>/outreach.md`

Tracks execution:

- Recommended outreach order
- Personalized message drafts
- Contact attempts and dates
- Replies and follow-ups
- Interview notes
- Next action

## Opportunity status

Use one of these values consistently:

| Status | Meaning |
|---|---|
| `researching` | Evaluation or contact research is incomplete |
| `ready-to-contact` | Worth pursuing and outreach is prepared |
| `contacted` | Initial message has been sent |
| `applied` | Formal application has been submitted |
| `interviewing` | Interview process is active |
| `follow-up` | A follow-up action is due |
| `offer` | An offer has been received |
| `rejected` | The company declined |
| `paused` | Intentionally deferred |
| `closed` | Role closed or no longer relevant |

## Required company metadata

Every company evaluation should begin with:

```yaml
company: Example
website: https://example.com
role: AI Engineer
location: San Francisco, CA
remote: true
stage: Seed
fit_score: 8.5
recommendation: pursue
status: ready-to-contact
date_added: YYYY-MM-DD
last_verified: YYYY-MM-DD
```

## Workflow

1. Research the company and specific role using current, reliable sources.
2. Evaluate fit against the target areas above.
3. Add the opportunity only when the recommendation is `pursue`.
4. Check whether the company already has a folder before creating one.
5. Record relevant founders and decision-makers with source links.
6. Draft personalized outreach based on the company’s actual product and needs.
7. Update status and next action after every application or message.
8. Re-verify time-sensitive facts before outreach.

## Data quality rules

- Never create duplicate company folders.
- Prefer primary sources: company website, job page, founder profile, accelerator page, or official announcement.
- Mark uncertain information clearly; do not present guesses as verified facts.
- Record the source and verification date for time-sensitive claims.
- Do not store private, leaked, or sensitive personal information.
- Keep outreach concise, specific, and based on genuine fit.

## Naming convention

Use lowercase kebab-case for company folders:

```text
companies/company-name/
```

If multiple roles exist at the same company, keep them in the same company README under separate role sections.
