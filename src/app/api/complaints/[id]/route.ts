import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ComplaintModel, { ComplaintSeverity, ComplaintStatus } from '@/models/Complaint';
import { getComplaintNextEscalationAt } from '../escalation';

type ComplaintPatchBody = {
  status?: ComplaintStatus;
  assignedDepartment?: string;
  assignedAdmin?: string;
  escalate?: boolean;
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
  nextEscalationAt: getComplaintNextEscalationAt(doc)?.toISOString() || null,
  createdAt: new Date(doc.createdAt).toISOString(),
});

const normalizeStatus = (value: unknown): ComplaintStatus | undefined => {
  const status = String(value || '').toLowerCase();
  if (status === 'open' || status === 'in-progress' || status === 'resolved' || status === 'escalated') {
    return status;
  }

  return undefined;
};

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const complaintId = String(id || '').trim();
    const body = (await req.json()) as ComplaintPatchBody;

    if (!complaintId) {
      return NextResponse.json({ error: 'Complaint ID is required' }, { status: 400 });
    }

    await dbConnect();

    const complaint = await ComplaintModel.findOne({ id: complaintId });
    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    const status = normalizeStatus(body.status);
    if (typeof body.assignedDepartment === 'string') {
      complaint.assignedDepartment = body.assignedDepartment.trim();
    }
    if (typeof body.assignedAdmin === 'string') {
      complaint.assignedAdmin = body.assignedAdmin.trim();
    }
    if (status) {
      complaint.status = status;
    }

    if (body.escalate) {
      complaint.status = 'escalated';
      complaint.lastEscalatedAt = new Date();
      complaint.escalationCount = (complaint.escalationCount || 0) + 1;
    }

    complaint.statusUpdatedAt = new Date();
    await complaint.save();

    return NextResponse.json({ complaint: toResponseComplaint(complaint.toObject() as StoredComplaint) });
  } catch (error) {
    console.error('Failed to update complaint:', error);
    return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 });
  }
}
