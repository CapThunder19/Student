import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ComplaintModel, { ComplaintSeverity } from '@/models/Complaint';

const cooldownMinutes: Record<ComplaintSeverity, number> = {
  red: 10,
  yellow: 120,
  green: 0,
};

const getCooldownMs = (severity: ComplaintSeverity) => cooldownMinutes[severity] * 60 * 1000;

const getRemainingMs = (lastAdminNotificationAt: Date | null | undefined, severity: ComplaintSeverity) => {
  if (!lastAdminNotificationAt) {
    return 0;
  }

  const cooldownMs = getCooldownMs(severity);
  if (cooldownMs <= 0) {
    return 0;
  }

  const elapsed = Date.now() - new Date(lastAdminNotificationAt).getTime();
  return Math.max(cooldownMs - elapsed, 0);
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const complaintId = String(body.complaintId || '').trim();

    if (!complaintId) {
      return NextResponse.json({ error: 'Complaint ID is required' }, { status: 400 });
    }

    await dbConnect();

    const complaint = await ComplaintModel.findOne({ id: complaintId });
    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    const severity = complaint.severity as ComplaintSeverity;
    const remainingMs = getRemainingMs(complaint.lastAdminNotificationAt, severity);
    if (remainingMs > 0) {
      return NextResponse.json(
        {
          error: 'Notification cooldown active',
          remainingMs,
          remainingMinutes: Math.ceil(remainingMs / 60000),
        },
        { status: 429 }
      );
    }

    complaint.adminNotificationCount = (complaint.adminNotificationCount || 0) + 1;
    complaint.lastAdminNotificationAt = new Date();
    complaint.status = complaint.status === 'resolved' ? complaint.status : 'open';

    await complaint.save();

    return NextResponse.json({
      success: true,
      complaintId,
      adminNotificationCount: complaint.adminNotificationCount,
      lastAdminNotificationAt: complaint.lastAdminNotificationAt,
      cooldownMinutes: cooldownMinutes[severity],
    });
  } catch (error) {
    console.error('Failed to resend complaint notification:', error);
    return NextResponse.json({ error: 'Failed to resend notification' }, { status: 500 });
  }
}