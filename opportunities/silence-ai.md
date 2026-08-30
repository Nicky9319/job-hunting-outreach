---
company: Silence AI
slug: silence-ai
verdict: pursue
company_score: 37
role_score: 40
base_score: 77
outreach_priority: 86
role_status: inferred
pipeline_status: research-complete
evaluation_date: 2026-08-30
source_url: https://www.linkedin.com/company/silence-ai-agent/
---

# Silence AI

## Decision summary

**Verdict: pursue.** Silence is building a production engineering agent that investigates customer-reported bugs across logs and code, then opens a draft pull request. This is a direct match for Paarth's production-agent, observability, backend, incident-debugging, and system-ownership experience.

**Hard gate:** Passed for an inferred opportunity. No public job opening, India-remote policy, compensation, funding, customer traction, or hiring plan was verified. Outreach should test these facts before significant time is invested.

## Company score — 37/50

| Dimension | Score | Reason |
|---|---:|---|
| Domain alignment | 12/12 | Agentic investigation across logs, source code, and pull-request creation is core production-AI infrastructure. |
| Product traction | 4/10 | A launched product and public demonstration are verified; paying customers or meaningful production usage are not. |
| Company stage | 4/7 | Very early founder-led company with a live product; team size and external validation remain unclear. |
| Engineering quality | 7/8 | The problem requires code understanding, telemetry investigation, tool use, and safe software changes; the founder has relevant engineering and forward-deployed experience. |
| Ownership culture | 6/6 | At this stage, an engineer would likely own problems end to end, though this is an inference. |
| India/remote accessibility | 1/4 | Founder is based in London; India hiring or international contracting is unverified. |
| Founder accessibility | 3/3 | Founder-led company with a clear public LinkedIn route. |

## Inferred role score — 40/50

This evaluates a hypothetical early engineer / AI engineer role. It is **not evidence of an active vacancy**.

| Dimension | Score | Reason |
|---|---:|---|
| Production-AI ownership | 12/12 | The product itself is an end-to-end production debugging agent. |
| Demonstrated-experience match | 10/10 | Strong match across backend APIs, distributed systems, agents/tools, observability, and cloud deployment. |
| Learning value | 7/8 | High value in code agents, reliability, telemetry reasoning, and automated remediation; mentorship depth is unknown. |
| Scope and autonomy | 7/7 | A first/early engineering role would likely have outcome ownership; inferred from company stage. |
| User and business proximity | 3/4 | Founder-led product likely offers close customer contact, but customer access is unverified. |
| Compensation and upside | 1/5 | Entirely undisclosed; point reflects uncertainty rather than a negative fact. |
| Conversion and mobility | 0/4 | No role, durable remote arrangement, PPO, or relocation path was found. |

Because compensation and mobility are unknown, a reasonable role-score range is **39–47**, giving a base range of **76–84**. The tracker uses the conservative working score of 40/50 and base score of 77/100.

## Proof and access advantages

- **Proof Advantage: +7/10**
  - +4: Directly comparable production operations—logs, traces, incidents, backend services, and agent workflows.
  - +3: Demonstrated scale through Times Astro and Renderperk.
  - No points yet for using Silence or contributing to its product.
- **Access Advantage: +2/5**
  - +2: Reachable founder.
  - No verified mutual/alumni connection or explicit unconventional hiring invitation.

**Outreach Priority: 86/115 — send a highly personalized founder message.**

## Candidate fit

### Strongest evidence

- Ran production conversational AI serving 30,000+ monthly paying users.
- Worked with tens of millions of conversation records and built evaluation/observability flows with Langfuse.
- Built Renderperk as 11 microservices across three GCP VMs with queues, databases, CI/CD, logs, metrics, traces, and incident response.
- Operated 30+ parallel GPU workloads and owned backend infrastructure through production delivery.

### Real gaps

- No verified experience building autonomous code-repair agents.
- No demonstrated evaluation harness for patch correctness, regression risk, or repository-scale code navigation.
- India contracting, compensation, and relocation feasibility are unknown.
- No active opening was found.

## Contacts

| Name | Role | Location | Priority | LinkedIn | Reason | Supporting source |
|---|---|---|---:|---|---|---|
| Surya G Ganesan | Founder and CEO | London, United Kingdom | 1 | [Profile](https://uk.linkedin.com/in/suryagganesan) | Founder appears to own product and technical direction; best person to assess an early engineering need. | [LinkedIn profile](https://uk.linkedin.com/in/suryagganesan) |

No additional decision-maker could be verified. No email address was guessed.

## Recommended primary contact

**Surya G Ganesan.** Silence appears founder-led, no separate engineering or hiring leader was verified, and Surya publicly introduced the product. A concise founder message with a concrete technical observation is preferable to a generic application.

## Outreach angle

Lead with the specific overlap: Silence must convert incomplete bug reports into trustworthy evidence across logs and code, then produce a patch that is safe enough for human review. Paarth has operated the telemetry, distributed backend, and production-agent side of that exact boundary.

Suggested message premise:

> I built and operated production AI systems where the hard part was not generating an answer—it was tracing failures across services, logs, model behavior, and data, then making the fix safely. Silence's bug-to-draft-PR loop is exactly the reliability problem I want to work on.

Do not lead with “I need an internship.” First demonstrate understanding, then ask whether Surya is open to an early engineer or project-based trial that can be done from India.

## Proposed technical artifact

Create a small **bug-to-evidence evaluation harness**:

1. Use a sample multi-service FastAPI repository with one seeded cross-service bug.
2. Provide a noisy customer report plus correlated logs and traces.
3. Make an agent produce an evidence bundle: suspected root cause, cited log lines, relevant code paths, proposed patch, and confidence.
4. Run tests and a regression check in an isolated container.
5. Score root-cause accuracy, evidence grounding, patch validity, test pass rate, latency, and token cost.

This is stronger than a generic clone because it targets Silence's hardest trust problem: knowing when an automated patch is actually safe to review.

## Unknown facts that could change the decision

- Whether Silence currently has paying customers or production deployments.
- Current team size, funding, and runway.
- Whether an engineering role or paid project exists.
- Whether the company can hire or contract someone located in India.
- Compensation and equity.
- Exact technical stack and whether the product already has a formal evaluation/sandboxing system.

## Sources

- [Silence AI LinkedIn company page](https://www.linkedin.com/company/silence-ai-agent/)
- [Official website](https://usesilence.com/)
- [Founder launch post describing bug report → logs/code investigation → draft PR](https://www.linkedin.com/posts/suryagganesan_jira-tickets-are-where-customer-problems-activity-7439362055650004992-kfkN)
- [Surya G Ganesan — LinkedIn](https://uk.linkedin.com/in/suryagganesan)
- [Surya's earlier public voice-agent prototype and GitHub reference](https://www.linkedin.com/posts/suryagganesan_i-built-a-llama-voice-agent-that-connects-activity-7266918901060456448-8zvg)
