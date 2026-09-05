"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  ApplicationStatus, Contact, ContactOutreachStatus, Opportunity,
  OutreachStatus, PipelineStage
} from "@/lib/types";

const STAGES: PipelineStage[] = ["research-complete","ready-to-contact","contacted","applied","interviewing","follow-up","offer","rejected","paused","closed"];
const OUTREACH: OutreachStatus[] = ["not-started","draft-ready","sent","replied","follow-up-due","no-response","closed"];
const APPLICATIONS: ApplicationStatus[] = ["not-started","submitted","screening","interviewing","offer","rejected","withdrawn","not-applicable"];
const CONTACT_OUTREACH: ContactOutreachStatus[] = ["not-contacted","draft-ready","sent","replied","follow-up-due","no-response","closed"];

function label(value: string) {
  return value.split("-").map(word => word[0].toUpperCase() + word.slice(1)).join(" ");
}
function date(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
}

export default function Dashboard() {
  const [secret, setSecret] = useState("");
  const [draftSecret, setDraftSecret] = useState("");
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [onlyActionable, setOnlyActionable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("dashboard-secret");
    if (saved) { setSecret(saved); setDraftSecret(saved); }
  }, []);

  async function load(activeSecret = secret) {
    if (!activeSecret) return;
    setLoading(true); setMessage("");
    try {
      const response = await fetch("/api/opportunities", { headers: { "x-dashboard-secret": activeSecret } });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to load opportunities");
      setOpportunities(payload.opportunities);
      setSelectedSlug(current => current || payload.opportunities[0]?.slug || null);
    } catch (error) {
      setMessage(String(error instanceof Error ? error.message : error));
    } finally { setLoading(false); }
  }

  useEffect(() => { if (secret) void load(secret); }, [secret]);

  function unlock() {
    const clean = draftSecret.trim();
    sessionStorage.setItem("dashboard-secret", clean);
    setSecret(clean);
  }

  const filtered = useMemo(() => opportunities
    .filter(item => {
      const text = `${item.company.name} ${item.opportunity.title} ${item.contacts.map(contact => contact.name).join(" ")}`.toLowerCase();
      return text.includes(query.toLowerCase());
    })
    .filter(item => stageFilter === "all" || item.pipeline.stage === stageFilter)
    .filter(item => !onlyActionable || Boolean(item.pipeline.next_action) || item.pipeline.outreach_status === "follow-up-due")
    .sort((a, b) => b.evaluation.outreach_priority - a.evaluation.outreach_priority),
  [opportunities, query, stageFilter, onlyActionable]);

  const selected = opportunities.find(item => item.slug === selectedSlug) || filtered[0];

  async function saveOpportunity(
    item: Opportunity,
    pipeline: Partial<Opportunity["pipeline"]>,
    contact?: { id: string; outreach_status: ContactOutreachStatus; next_follow_up_at?: string | null },
    eventSummary?: string
  ) {
    setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/opportunities", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-dashboard-secret": secret },
        body: JSON.stringify({
          slug: item.slug,
          expected_updated_at: item.updated_at,
          pipeline,
          contact,
          event_summary: eventSummary
        })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Update failed");
      setOpportunities(current => current.map(opportunity => opportunity.slug === item.slug ? payload.opportunity : opportunity));
      setMessage("Saved to GitHub.");
    } catch (error) {
      setMessage(String(error instanceof Error ? error.message : error));
    } finally { setSaving(false); }
  }

  if (!secret) {
    return (
      <main className="lock-screen">
        <section className="lock-card">
          <div className="brand-mark">OC</div>
          <p className="eyebrow">PRIVATE WORKSPACE</p>
          <h1>Opportunity Control Room</h1>
          <p className="muted">Track every target, decision-maker, message, and next move without losing the thread.</p>
          <label>
            Dashboard password
            <input type="password" value={draftSecret} onChange={event => setDraftSecret(event.target.value)}
              onKeyDown={event => event.key === "Enter" && unlock()} autoFocus />
          </label>
          <button className="primary" onClick={unlock}>Open dashboard</button>
        </section>
      </main>
    );
  }

  const counts = {
    active: opportunities.filter(item => !["rejected","closed","paused"].includes(item.pipeline.stage)).length,
    contact: opportunities.filter(item => ["not-started","draft-ready"].includes(item.pipeline.outreach_status)).length,
    followUp: opportunities.filter(item => item.pipeline.outreach_status === "follow-up-due").length,
    interviews: opportunities.filter(item => item.pipeline.stage === "interviewing").length
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">JOB SEARCH OS</p>
          <h1>Opportunity Control Room</h1>
        </div>
        <div className="header-actions">
          {message && <span className={message.includes("Saved") ? "success" : "error"}>{message}</span>}
          <button className="ghost" onClick={() => void load()} disabled={loading}>{loading ? "Refreshing…" : "Refresh"}</button>
          <button className="ghost" onClick={() => { sessionStorage.removeItem("dashboard-secret"); setSecret(""); }}>Lock</button>
        </div>
      </header>

      <section className="stats">
        <Stat value={counts.active} label="Active targets" />
        <Stat value={counts.contact} label="Need outreach" accent />
        <Stat value={counts.followUp} label="Follow-ups due" />
        <Stat value={counts.interviews} label="Interviewing" />
      </section>

      <section className="workspace">
        <aside className="opportunity-list">
          <div className="filters">
            <input aria-label="Search opportunities" placeholder="Search company or contact…" value={query} onChange={event => setQuery(event.target.value)} />
            <div className="filter-row">
              <select value={stageFilter} onChange={event => setStageFilter(event.target.value)}>
                <option value="all">All stages</option>
                {STAGES.map(stage => <option key={stage} value={stage}>{label(stage)}</option>)}
              </select>
              <label className="check"><input type="checkbox" checked={onlyActionable} onChange={event => setOnlyActionable(event.target.checked)} /> Actionable</label>
            </div>
          </div>
          <div className="list-heading"><span>{filtered.length} opportunities</span><span>Priority</span></div>
          <div className="list-scroll">
            {filtered.map(item => (
              <button key={item.id} className={item.slug === selected?.slug ? "opportunity-card selected" : "opportunity-card"}
                onClick={() => setSelectedSlug(item.slug)}>
                <div className="card-top">
                  <div><strong>{item.company.name}</strong><small>{item.opportunity.title} · {item.opportunity.role_status}</small></div>
                  <span className="score">{item.evaluation.outreach_priority}</span>
                </div>
                <div className="tags">
                  <span className={`status stage-${item.pipeline.stage}`}>{label(item.pipeline.stage)}</span>
                  <span>{item.company.remote_india === "unknown" ? "India unknown" : `India: ${item.company.remote_india}`}</span>
                </div>
                <p>{item.pipeline.next_action || "No next action recorded"}</p>
              </button>
            ))}
            {!filtered.length && <div className="empty">No opportunities match these filters.</div>}
          </div>
        </aside>

        {selected ? <OpportunityPanel item={selected} saving={saving} onSave={saveOpportunity} /> :
          <section className="detail empty">Add an evaluated opportunity to get started.</section>}
      </section>
    </main>
  );
}

function Stat({ value, label, accent = false }: { value: number; label: string; accent?: boolean }) {
  return <article className={accent ? "stat accent" : "stat"}><strong>{value}</strong><span>{label}</span></article>;
}

function OpportunityPanel({ item, saving, onSave }: {
  item: Opportunity;
  saving: boolean;
  onSave: (item: Opportunity, pipeline: Partial<Opportunity["pipeline"]>, contact?: { id: string; outreach_status: ContactOutreachStatus; next_follow_up_at?: string | null }, summary?: string) => Promise<void>;
}) {
  const [stage, setStage] = useState(item.pipeline.stage);
  const [outreach, setOutreach] = useState(item.pipeline.outreach_status);
  const [application, setApplication] = useState(item.pipeline.application_status);
  const [nextAction, setNextAction] = useState(item.pipeline.next_action || "");
  const [due, setDue] = useState(item.pipeline.next_action_due || "");
  const [note, setNote] = useState("");

  useEffect(() => {
    setStage(item.pipeline.stage); setOutreach(item.pipeline.outreach_status);
    setApplication(item.pipeline.application_status); setNextAction(item.pipeline.next_action || "");
    setDue(item.pipeline.next_action_due || ""); setNote("");
  }, [item.slug, item.updated_at]);

  return (
    <section className="detail">
      <div className="detail-header">
        <div>
          <div className="tags"><span className="status">{label(item.evaluation.verdict)}</span><span>{item.company.location || "Location unknown"}</span></div>
          <h2>{item.company.name}</h2>
          <p>{item.opportunity.title} · {item.opportunity.role_status}</p>
        </div>
        <div className="score-block"><strong>{item.evaluation.outreach_priority}</strong><span>outreach priority</span></div>
      </div>

      <div className="score-strip">
        <span><b>{item.evaluation.company_score}</b>/50 company</span>
        <span><b>{item.evaluation.role_score}</b>/50 role</span>
        <span><b>{item.evaluation.base_score}</b>/100 base</span>
      </div>

      <p className="summary">{item.evaluation.summary}</p>

      <section className="application-widget" aria-label="Job application">
        <div className="application-widget-copy">
          <span className="application-kicker">JOB APPLICATION</span>
          <strong>{item.opportunity.title}</strong>
          <span>
            {item.opportunity.employment_type || "Employment type unknown"} · {item.company.location || "Location unknown"}
          </span>
        </div>
        {item.opportunity.url ? (
          <a className="application-link" href={item.opportunity.url} target="_blank" rel="noreferrer">
            Open application ↗
          </a>
        ) : (
          <span className="application-unavailable">No application link</span>
        )}
      </section>

      <section className="panel action-panel">
        <div className="section-title"><h3>Current state</h3><span>Last updated {date(item.updated_at)}</span></div>
        <div className="form-grid">
          <label>Pipeline stage<select value={stage} onChange={event => setStage(event.target.value as PipelineStage)}>{STAGES.map(value => <option key={value}>{value}</option>)}</select></label>
          <label>Outreach<select value={outreach} onChange={event => setOutreach(event.target.value as OutreachStatus)}>{OUTREACH.map(value => <option key={value}>{value}</option>)}</select></label>
          <label>Application<select value={application} onChange={event => setApplication(event.target.value as ApplicationStatus)}>{APPLICATIONS.map(value => <option key={value}>{value}</option>)}</select></label>
          <label>Next action due<input type="date" value={due} onChange={event => setDue(event.target.value)} /></label>
          <label className="wide">Next action<input value={nextAction} onChange={event => setNextAction(event.target.value)} /></label>
          <label className="wide">Update note<input placeholder="What changed?" value={note} onChange={event => setNote(event.target.value)} /></label>
        </div>
        <button className="primary" disabled={saving} onClick={() => onSave(item, {
          stage, outreach_status: outreach, application_status: application,
          next_action: nextAction || null, next_action_due: due || null
        }, undefined, note || undefined)}>{saving ? "Saving…" : "Save state"}</button>
      </section>

      <section className="panel">
        <div className="section-title"><h3>People to reach</h3><span>{item.contacts.filter(contact => contact.outreach_status === "not-contacted").length} not contacted</span></div>
        <div className="contacts">
          {item.contacts.sort((a,b) => a.priority-b.priority).map(contact =>
            <ContactRow key={contact.id} contact={contact} item={item} saving={saving} onSave={onSave} />)}
        </div>
      </section>

      <div className="two-columns">
        <section className="panel">
          <h3>Outreach angle</h3>
          <p>{item.evaluation.outreach_angle || "Not recorded."}</p>
          {item.evaluation.proposed_artifact && <><h4>Proof artifact</h4><p>{item.evaluation.proposed_artifact}</p></>}
        </section>
        <section className="panel">
          <h3>Recent activity</h3>
          <div className="timeline">
            {[...item.activity_log].reverse().slice(0, 5).map(event =>
              <div key={event.id}><i /><span><strong>{label(event.type)}</strong><small>{date(event.timestamp)}</small><p>{event.summary}</p></span></div>)}
          </div>
        </section>
      </div>
    </section>
  );
}

function ContactRow({ contact, item, saving, onSave }: {
  contact: Contact; item: Opportunity; saving: boolean;
  onSave: (item: Opportunity, pipeline: Partial<Opportunity["pipeline"]>, contact?: { id: string; outreach_status: ContactOutreachStatus; next_follow_up_at?: string | null }, summary?: string) => Promise<void>;
}) {
  const [status, setStatus] = useState(contact.outreach_status);
  const [followUp, setFollowUp] = useState(contact.next_follow_up_at?.slice(0, 10) || "");
  useEffect(() => { setStatus(contact.outreach_status); setFollowUp(contact.next_follow_up_at?.slice(0, 10) || ""); }, [contact.outreach_status, contact.next_follow_up_at]);
  return (
    <article className="contact">
      <div className="avatar">{contact.name.split(" ").map(part => part[0]).slice(0,2).join("")}</div>
      <div className="contact-main"><strong>{contact.name}</strong><span>{contact.role} · Priority {contact.priority}</span><p>{contact.reason}</p></div>
      <label>Status<select value={status} onChange={event => setStatus(event.target.value as ContactOutreachStatus)}>{CONTACT_OUTREACH.map(value => <option key={value}>{value}</option>)}</select></label>
      <label>Follow-up<input type="date" value={followUp} onChange={event => setFollowUp(event.target.value)} /></label>
      <div className="contact-actions">
        {contact.linkedin && <a href={contact.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>}
        <button className="ghost" disabled={saving} onClick={() => onSave(item,
          status === "sent" ? { stage: "contacted", outreach_status: "sent" } :
          status === "replied" ? { outreach_status: "replied" } :
          status === "follow-up-due" ? { stage: "follow-up", outreach_status: "follow-up-due" } : {},
          { id: contact.id, outreach_status: status, next_follow_up_at: followUp ? new Date(`${followUp}T00:00:00Z`).toISOString() : null },
          `Updated outreach status for ${contact.name} to ${status}.`
        )}>Save</button>
      </div>
    </article>
  );
}
