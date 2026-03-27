import type { ComplaintSeverity, ComplaintStatus } from "@/models/Complaint";

export type ComplaintForEscalation = {
  severity: ComplaintSeverity;
  status: ComplaintStatus;
  createdAt: Date | string;
  lastEscalatedAt?: Date | string | null;
};

export const complaintEscalationMinutes: Record<ComplaintSeverity, number> = {
  red: 30,
  yellow: 360,
  green: 1440,
};

export const complaintNotificationMinutes: Record<ComplaintSeverity, number> = {
  red: 10,
  yellow: 120,
  green: 0,
};

export const getComplaintNextEscalationAt = (
  complaint: ComplaintForEscalation,
): Date | null => {
  if (complaint.status === "resolved" || complaint.status === "escalated") {
    return null;
  }

  const cooldownMinutes = complaintEscalationMinutes[complaint.severity];
  const referenceTime = complaint.lastEscalatedAt || complaint.createdAt;
  return new Date(new Date(referenceTime).getTime() + cooldownMinutes * 60 * 1000);
};
