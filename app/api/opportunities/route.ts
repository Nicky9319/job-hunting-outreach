import { timingSafeEqual, randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { atomicCommit, currentHead, readJson } from "@/lib/github";
import type {
  ApplicationStatus, ContactOutreachStatus, Opportunity,
  OutreachStatus, PipelineStage
} from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface IndexEntry {
  id: string;
  slug: string;
  company_name: string;
  role_title: string;
  role_status: string;
  verdict: string;
  outreach_priority: number;
  pipeline_stage: PipelineStage;
  outreach_status: OutreachStatus;
  application_status: ApplicationStatus;
  primary_contact_id: string | null;
  next_action: string | null;
  next_action_due: string | null;
  record_path: string;
  updated_at: string;
}
interface OpportunityIndex {
  schema_version: string;
  updated_at: string;
  opportunities: IndexEntry[];
}

function authorized(request: NextRequest) {
  const configured = process.env.DASHBOARD_SECRET;
  const supplied = request.headers.get("x-dashboard-secret");
  if (!configured || !supplied) return false;
  const a = Buffer.from(configured);
  const b = Buffer.from(supplied);
  return a.length === b.length && timingSafeEqual(a, b);
}

function deny() {
  return NextResponse.json({ error: "Invalid dashboard password" }, { status: 401 });
}

const stages: PipelineStage[] = ["research-complete","ready-to-contact","contacted","applied","interviewing","follow-up","offer","rejected","paused","closed"];
const outreach: OutreachStatus[] = ["not-started","draft-ready","sent","replied","follow-up-due","no-response","closed"];
const applications: ApplicationStatus[] = ["not-started","submitted","screening","interviewing","offer","rejected","withdrawn","not-applicable"];
const contactOutreach: ContactOutreachStatus[] = ["not-contacted","draft-ready","sent","replied","follow-up-due","no-response","closed"];

export async function GET(request: NextRequest) {
  if (!authorized(request)) return deny();
  try {
    const index = await readJson<OpportunityIndex>("data/opportunities/index.json");
    const records = await Promise.all(index.opportunities.map(item => readJson<Opportunity>(item.record_path)));
    return NextResponse.json({ opportunities: records });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!authorized(request)) return deny();
  try {
    const body = await request.json() as {
      slug?: string;
      expected_updated_at?: string;
      pipeline?: Partial<Opportunity["pipeline"]>;
      contact?: { id: string; outreach_status: ContactOutreachStatus; next_follow_up_at?: string | null };
      event_summary?: string;
    };
    if (!body.slug || !body.expected_updated_at) {
      return NextResponse.json({ error: "slug and expected_updated_at are required" }, { status: 400 });
    }

    const head = await currentHead();
    const index = await readJson<OpportunityIndex>("data/opportunities/index.json");
    const summary = index.opportunities.find(item => item.slug === body.slug);
    if (!summary) return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });

    const record = await readJson<Opportunity>(summary.record_path);
    if (record.updated_at !== body.expected_updated_at) {
      return NextResponse.json({ error: "This opportunity changed. Reload before saving." }, { status: 409 });
    }

    const patch = body.pipeline || {};
    if (patch.stage && !stages.includes(patch.stage)) throw new Error("Invalid pipeline stage");
    if (patch.outreach_status && !outreach.includes(patch.outreach_status)) throw new Error("Invalid outreach status");
    if (patch.application_status && !applications.includes(patch.application_status)) throw new Error("Invalid application status");
    if (body.contact && !contactOutreach.includes(body.contact.outreach_status)) throw new Error("Invalid contact status");

    const now = new Date().toISOString();
    const previousStage = record.pipeline.stage;
    record.pipeline = { ...record.pipeline, ...patch, last_updated: now };
    let contactName: string | undefined;

    if (body.contact) {
      const contact = record.contacts.find(item => item.id === body.contact!.id);
      if (!contact) return NextResponse.json({ error: "Contact not found" }, { status: 404 });
      contactName = contact.name;
      contact.outreach_status = body.contact.outreach_status;
      contact.next_follow_up_at = body.contact.next_follow_up_at ?? contact.next_follow_up_at;
      if (body.contact.outreach_status === "sent" && !contact.last_contacted_at) contact.last_contacted_at = now;
    }

    const eventType =
      body.contact?.outreach_status === "sent" ? "outreach-sent" :
      body.contact?.outreach_status === "replied" ? "reply-received" :
      patch.application_status === "submitted" ? "application-submitted" :
      "status-changed";

    record.activity_log.push({
      id: `event_${randomUUID()}`,
      timestamp: now,
      type: eventType,
      actor: "paarth",
      summary: body.event_summary?.trim() || `Updated ${record.company.name}${contactName ? ` contact ${contactName}` : ""}.`,
      contact_id: body.contact?.id || null
    });
    record.updated_at = now;

    summary.pipeline_stage = record.pipeline.stage;
    summary.outreach_status = record.pipeline.outreach_status;
    summary.application_status = record.pipeline.application_status;
    summary.next_action = record.pipeline.next_action;
    summary.next_action_due = record.pipeline.next_action_due;
    summary.updated_at = now;
    index.updated_at = now;

    const sha = await atomicCommit(
      {
        [summary.record_path]: record,
        "data/opportunities/index.json": index
      },
      `tracker: update ${record.company.name} from ${previousStage} to ${record.pipeline.stage}`,
      head
    );
    return NextResponse.json({ opportunity: record, commit: sha });
  } catch (error) {
    if (String(error).includes("CONFLICT")) {
      return NextResponse.json({ error: "Concurrent update detected. Reload and try again." }, { status: 409 });
    }
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
