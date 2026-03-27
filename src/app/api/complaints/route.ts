import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ComplaintModel, { ComplaintSeverity, ComplaintStatus } from '@/models/Complaint';
import { getComplaintNextEscalationAt } from './escalation';

const HISTORY_LIMIT = 200;
const severityOrder: Record<ComplaintSeverity, number> = {
  red: 0,
  yellow: 1,
  green: 2,
};

type StoredComplaint = {
  id: string;
  studentName: string;
  rollNo?: string;
  studentEmail?: string;
  category: string;
  title: string;
  description: string;
  severity: ComplaintSeverity;
  status: ComplaintStatus;
  assignedDepartment?: string;
  assignedAdmin?: string;
  attachments?: Array<{
    name: string;
    mimeType: string;
    size: number;
    dataUrl: string;
    uploadedAt: Date | string;
  }>;
  adminNotificationCount?: number;
  lastAdminNotificationAt?: Date | string | null;
  escalationCount?: number;
  lastEscalatedAt?: Date | string | null;
  statusUpdatedAt?: Date | string | null;
  createdAt: Date | string;
};

type ComplaintAttachment = {
  name: string;
  mimeType: string;
  size: number;
  dataUrl: string;
  uploadedAt: string;
};

const normalizeSeverity = (value: unknown): ComplaintSeverity => {
  const severity = String(value || '').toLowerCase();

  if (severity === 'red' || severity === 'yellow' || severity === 'green') {
    return severity;
  }

  return 'yellow';
};

const normalizeStatus = (value: unknown): ComplaintStatus => {
  const status = String(value || '').toLowerCase();

  if (status === 'open' || status === 'in-progress' || status === 'resolved' || status === 'escalated') {
    return status;
  }

  return 'open';
};

const normalizeAttachments = (value: unknown): ComplaintAttachment[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => ({
      name: String(item?.name || '').trim(),
      mimeType: String(item?.mimeType || item?.type || '').trim(),
      size: Number(item?.size || 0),
      dataUrl: String(item?.dataUrl || '').trim(),
      uploadedAt: new Date(item?.uploadedAt || new Date()).toISOString(),
    }))
    .filter((item) => item.name && item.mimeType && item.dataUrl && item.size >= 0);
};

const toResponseComplaint = (doc: StoredComplaint) => ({
  id: doc.id,
  studentName: doc.studentName,
  rollNo: doc.rollNo || '',
  studentEmail: doc.studentEmail || '',
  category: doc.category,
  title: doc.title,
  description: doc.description,
  severity: doc.severity,
  status: doc.status,
  assignedDepartment: doc.assignedDepartment || '',
  assignedAdmin: doc.assignedAdmin || '',
  attachments: Array.isArray(doc.attachments)
    ? doc.attachments.map((attachment) => ({
        name: attachment.name,
        mimeType: attachment.mimeType,
        size: attachment.size,
        dataUrl: attachment.dataUrl,
        uploadedAt: new Date(attachment.uploadedAt).toISOString(),
      }))
    : [],
  adminNotificationCount: doc.adminNotificationCount || 0,
  lastAdminNotificationAt: doc.lastAdminNotificationAt ? new Date(doc.lastAdminNotificationAt).toISOString() : null,
  escalationCount: doc.escalationCount || 0,
  lastEscalatedAt: doc.lastEscalatedAt ? new Date(doc.lastEscalatedAt).toISOString() : null,
  statusUpdatedAt: doc.statusUpdatedAt ? new Date(doc.statusUpdatedAt).toISOString() : null,
  nextEscalationAt: getComplaintNextEscalationAt(doc)
    ? getComplaintNextEscalationAt(doc)?.toISOString()
    : null,
  createdAt: new Date(doc.createdAt).toISOString(),
});

export async function GET() {
  try {
    await dbConnect();

    const docs = await ComplaintModel.find({})
      .sort({ createdAt: -1 })
      .limit(HISTORY_LIMIT)
      .lean<StoredComplaint[]>();

    const complaints = docs
      .sort((left, right) => {
        const severityDiff = severityOrder[left.severity] - severityOrder[right.severity];
        if (severityDiff !== 0) {
          return severityDiff;
        }

        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      })
      .map(toResponseComplaint);

    const summary = complaints.reduce(
      (accumulator, complaint) => {
        accumulator.total += 1;
        accumulator[complaint.severity] += 1;
        return accumulator;
      },
      { total: 0, red: 0, yellow: 0, green: 0 }
    );

    return NextResponse.json({ complaints, summary });
  } catch (error) {
    console.error('Failed to fetch complaints:', error);
    return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const studentName = String(body.studentName || 'Anonymous Student').trim() || 'Anonymous Student';
    const rollNo = String(body.rollNo || '').trim();
    const studentEmail = String(body.studentEmail || '').trim();
    const category = String(body.category || '').trim();
    const title = String(body.title || '').trim();
    const description = String(body.description || '').trim();
    const severity = normalizeSeverity(body.severity);
    const status = normalizeStatus(body.status);
    const assignedDepartment = String(body.assignedDepartment || '').trim();
    const assignedAdmin = String(body.assignedAdmin || '').trim();
    const attachments = normalizeAttachments(body.attachments);

    if (!category || !title || !description) {
      return NextResponse.json({ error: 'Category, title, and description are required' }, { status: 400 });
    }

    const complaint = {
      id: String(body.id || randomUUID()),
      studentName,
      rollNo,
      studentEmail,
      category,
      title: title.slice(0, 120),
      description: description.slice(0, 2000),
      severity,
      status,
      assignedDepartment,
      assignedAdmin,
      attachments,
      adminNotificationCount: 1,
      lastAdminNotificationAt: new Date(),
      escalationCount: 0,
      lastEscalatedAt: null,
      statusUpdatedAt: new Date(),
      createdAt: body.createdAt ? new Date(body.createdAt) : new Date(),
    };

    await dbConnect();

    const saved = await ComplaintModel.findOneAndUpdate(
      { id: complaint.id },
      complaint,
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    ).lean<StoredComplaint | null>();

    if (!saved) {
      return NextResponse.json({ error: 'Failed to save complaint' }, { status: 500 });
    }

    return NextResponse.json({ complaint: toResponseComplaint(saved) });
  } catch (error) {
    console.error('Failed to save complaint:', error);
    return NextResponse.json({ error: 'Failed to save complaint' }, { status: 500 });
  }
}