export type PipelineStage =
  | "research-complete" | "ready-to-contact" | "contacted" | "applied"
  | "interviewing" | "follow-up" | "offer" | "rejected" | "paused" | "closed";
export type OutreachStatus =
  | "not-started" | "draft-ready" | "sent" | "replied" | "follow-up-due" | "no-response" | "closed";
export type ContactOutreachStatus =
  | "not-contacted" | "draft-ready" | "sent" | "replied" | "follow-up-due" | "no-response" | "closed";
export type ApplicationStatus =
  | "not-started" | "submitted" | "screening" | "interviewing" | "offer" | "rejected" | "withdrawn" | "not-applicable";

export interface Contact {
  id: string;
  name: string;
  role: string;
  priority: number;
  linkedin: string | null;
  email: string | null;
  location: string | null;
  reason: string;
  outreach_status: ContactOutreachStatus;
  last_contacted_at: string | null;
  next_follow_up_at: string | null;
  notes?: string | null;
}

export interface Opportunity {
  schema_version: string;
  id: string;
  slug: string;
  company: {
    name: string;
    website: string | null;
    linkedin: string | null;
    location: string | null;
    remote_india: "yes" | "no" | "unknown";
    stage: string | null;
    team_size: string | null;
    funding: string | null;
  };
  opportunity: {
    title: string;
    role_status: "open" | "inferred" | "closed" | "unknown";
    url: string | null;
    employment_type: string | null;
  };
  evaluation: {
    verdict: string;
    company_score: number;
    role_score: number;
    base_score: number;
    outreach_priority: number;
    summary: string;
    strengths?: string[];
    gaps?: string[];
    unknowns?: string[];
    outreach_angle?: string;
    proposed_artifact?: string;
  };
  pipeline: {
    stage: PipelineStage;
    outreach_status: OutreachStatus;
    application_status: ApplicationStatus;
    next_action: string | null;
    next_action_due: string | null;
    notes: string | null;
    last_updated: string;
  };
  contacts: Contact[];
  activity_log: Array<{
    id: string;
    timestamp: string;
    type: string;
    actor: string;
    summary: string;
    contact_id?: string | null;
  }>;
  updated_at: string;
}
