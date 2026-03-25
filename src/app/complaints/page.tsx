'use client';

import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock3,
  Filter,
  Loader2,
  Megaphone,
  Copy,
  RefreshCcw,
  Send,
  Sparkles,
  Upload,
  User,
  Wrench,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type ComplaintSeverity = 'red' | 'yellow' | 'green';
type ComplaintStatus = 'open' | 'in-progress' | 'resolved' | 'escalated';

type ComplaintAttachment = {
  name: string;
  mimeType: string;
  size: number;
  dataUrl: string;
  uploadedAt: string;
};

type Complaint = {
  id: string;
  studentName: string;
  rollNo: string;
  studentEmail?: string;
  category: string;
  title: string;
  description: string;
  severity: ComplaintSeverity;
  status: ComplaintStatus;
  assignedDepartment: string;
  assignedAdmin: string;
  attachments: ComplaintAttachment[];
  adminNotificationCount: number;
  lastAdminNotificationAt: string | null;
  escalationCount: number;
  lastEscalatedAt: string | null;
  statusUpdatedAt: string | null;
  nextEscalationAt: string | null;
  createdAt: string;
};

type ComplaintSummary = {
  total: number;
  red: number;
  yellow: number;
  green: number;
};

type ComplaintFormState = {
  studentName: string;
  rollNo: string;
  studentEmail: string;
  category: string;
  title: string;
  description: string;
  severity: ComplaintSeverity;
  assignedDepartment: string;
  assignedAdmin: string;
};

const defaultForm: ComplaintFormState = {
  studentName: '',
  rollNo: '',
  studentEmail: '',
  category: 'Campus Facility',
  title: '',
  description: '',
  severity: 'yellow',
  assignedDepartment: '',
  assignedAdmin: '',
};

const severityMeta: Record<
  ComplaintSeverity,
  { label: string; description: string; badge: string; panel: string }
> = {
  red: {
    label: 'Red',
    description: 'Very urgent - needs immediate attention',
    badge: 'bg-red-500/15 text-red-700 border-red-200',
    panel: 'from-red-500 to-rose-600',
  },
  yellow: {
    label: 'Yellow',
    description: 'Important - should be handled soon',
    badge: 'bg-amber-500/15 text-amber-700 border-amber-200',
    panel: 'from-amber-500 to-orange-500',
  },
  green: {
    label: 'Green',
    description: 'Light problem - low urgency',
    badge: 'bg-emerald-500/15 text-emerald-700 border-emerald-200',
    panel: 'from-emerald-500 to-teal-500',
  },
};

const categories = [
  'Campus Facility',
  'Hostel / PG',
  'Academic',
  'Transport',
  'Food / Canteen',
  'Administration',
  'Other',
];

const departments = [
  'Maintenance',
  'Hostel Office',
  'Academics',
  'Transport Desk',
  'Canteen / Food',
  'Administration',
  'Security',
  'Other',
];

const departmentAdmins: Record<string, string[]> = {
  'Maintenance': ['Arjun Verma', 'Suresh Kumar', 'Rohit Mehta'],
  'Hostel Office': ['Neha Sharma', 'Priya Singh', 'Aman Gupta'],
  'Academics': ['Dr. Ananya Rao', 'Prof. Karan Shah', 'Ms. Pooja Nair'],
  'Transport Desk': ['Vikas Patel', 'Rahul Yadav'],
  'Canteen / Food': ['Ritika Jain', 'Mohit Bansal'],
  'Administration': ['Admin Office', 'Campus Admin'],
  'Security': ['Security Officer', 'Control Room'],
  'Other': ['General Support', 'Student Helpdesk'],
};

const filterOptions: Array<'all' | ComplaintSeverity> = ['all', 'red', 'yellow', 'green'];

const notificationCooldownMinutes: Record<ComplaintSeverity, number> = {
  red: 10,
  yellow: 120,
  green: 0,
};

const escalationCooldownMinutes: Record<ComplaintSeverity, number> = {
  red: 30,
  yellow: 360,
  green: 1440,
};

const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

const formatDuration = (ms: number) => {
  const safeMs = Math.max(ms, 0);
  const totalMinutes = Math.ceil(safeMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) {
    return `${minutes} min`;
  }

  if (minutes <= 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${minutes} min`;
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('Unable to read file'));
    reader.readAsDataURL(file);
  });

const getAdminOptions = (department: string) => departmentAdmins[department] || [];

export default function ComplaintsPage() {
  const [form, setForm] = useState<ComplaintFormState>(defaultForm);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [copiedComplaintId, setCopiedComplaintId] = useState<string | null>(null);
  const [summary, setSummary] = useState<ComplaintSummary>({ total: 0, red: 0, yellow: 0, green: 0 });
  const [activeFilter, setActiveFilter] = useState<'all' | ComplaintSeverity>('all');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [now, setNow] = useState(0);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [selectedAttachments, setSelectedAttachments] = useState<File[]>([]);

  const adminOptions = getAdminOptions(form.assignedDepartment);

  useEffect(() => {
    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      return;
    }

    try {
      const parsed = JSON.parse(userData) as { name?: string; email?: string; rollNo?: string };
      setForm((current) => ({
        ...current,
        studentName: parsed.name || current.studentName,
        rollNo: parsed.rollNo || current.rollNo,
        studentEmail: parsed.email || current.studentEmail,
      }));
    } catch {
      // ignore malformed localStorage values
    }
  }, []);

  useEffect(() => {
    const loadComplaints = async () => {
      try {
        const response = await fetch('/api/complaints', { cache: 'no-store' });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load complaints');
        }

        const loadedComplaints = (data.complaints || []) as Complaint[];
        setComplaints(loadedComplaints);
        setSummary(data.summary || { total: 0, red: 0, yellow: 0, green: 0 });
      } catch (error) {
        console.error(error);
        setStatusMessage('Complaints load nahi ho payi. Baad me retry karo.');
      } finally {
        setLoading(false);
      }
    };

    loadComplaints();
  }, []);

  const visibleComplaints = useMemo(
    () => complaints.filter((complaint) => activeFilter === 'all' || complaint.severity === activeFilter),
    [activeFilter, complaints]
  );

  const getCooldownMs = (complaint: Complaint) => notificationCooldownMinutes[complaint.severity] * 60 * 1000;

  const getNextAllowedAt = (complaint: Complaint) => {
    const referenceTime = complaint.lastAdminNotificationAt || complaint.createdAt;
    const cooldownMs = getCooldownMs(complaint);
    if (cooldownMs <= 0) {
      return null;
    }

    return new Date(new Date(referenceTime).getTime() + cooldownMs);
  };

  const getRemainingMs = (complaint: Complaint) => {
    const nextAllowedAt = getNextAllowedAt(complaint);
    if (!nextAllowedAt) {
      return 0;
    }

    return Math.max(nextAllowedAt.getTime() - now, 0);
  };

  const getEscalationRemainingMs = (complaint: Complaint) => {
    if (complaint.status === 'resolved' || complaint.status === 'escalated') {
      return 0;
    }

    const referenceTime = complaint.lastEscalatedAt || complaint.createdAt;
    const cooldownMs = escalationCooldownMinutes[complaint.severity] * 60 * 1000;
    return Math.max(new Date(referenceTime).getTime() + cooldownMs - now, 0);
  };

  const resendNotification = async (complaint: Complaint) => {
    if (complaint.severity === 'green') {
      setStatusMessage('Green label complaints ke liye auto resend disabled hai.');
      return;
    }

    const remainingMs = getRemainingMs(complaint);
    if (remainingMs > 0) {
      setStatusMessage(`${complaint.title} ka next resend ${formatDuration(remainingMs)} baad available hoga.`);
      return;
    }

    setResendingId(complaint.id);
    setStatusMessage('Admin ko notification resend ho rahi hai...');

    try {
      const response = await fetch('/api/complaints/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ complaintId: complaint.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          const waitMs = Number(data.remainingMs || 0);
          throw new Error(`Cooldown active. ${formatDuration(waitMs)} baad resend kar sakte ho.`);
        }

        throw new Error(data.error || 'Notification resend nahi ho saki');
      }

      setComplaints((current) =>
        current.map((item) =>
          item.id === complaint.id
            ? {
                ...item,
                adminNotificationCount: Number(data.adminNotificationCount || item.adminNotificationCount + 1),
                lastAdminNotificationAt: new Date(data.lastAdminNotificationAt || new Date()).toISOString(),
              }
            : item
        )
      );
      setStatusMessage(`Admin ko ${complaint.severity === 'red' ? 'red' : 'yellow'} complaint resend kar di gayi hai.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Notification resend nahi ho saki.');
    } finally {
      setResendingId(null);
    }
  };

  const handleChange = (field: keyof ComplaintFormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === 'assignedDepartment' ? { assignedAdmin: '' } : null),
    }));
  };

  const handleAttachmentSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedAttachments(files.slice(0, 5));
  };

  const copyComplaintId = async (complaintId: string) => {
    try {
      await navigator.clipboard.writeText(complaintId);
      setCopiedComplaintId(complaintId);
      window.setTimeout(() => {
        setCopiedComplaintId((current) => (current === complaintId ? null : current));
      }, 1500);
      setStatusMessage(`Complaint ID ${complaintId} copy ho gaya hai.`);
    } catch {
      setStatusMessage('Complaint ID copy nahi ho paya. Browser clipboard permission check karo.');
    }
  };

  const buildAttachmentPayload = async () => {
    const payload: Array<{
      name: string;
      mimeType: string;
      size: number;
      dataUrl: string;
      uploadedAt: string;
    }> = [];

    for (const file of selectedAttachments) {
      if (file.size > 5 * 1024 * 1024) {
        throw new Error(`File ${file.name} 5MB se badi hai`);
      }

      payload.push({
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        dataUrl: await readFileAsDataUrl(file),
        uploadedAt: new Date().toISOString(),
      });
    }

    return payload;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setStatusMessage('');

    try {
      const attachments = await buildAttachmentPayload();
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          attachments,
          status: 'open',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Complaint save nahi ho saki');
      }

      const savedComplaint = data.complaint as Complaint;
      setComplaints((current) => [savedComplaint, ...current]);
      setComplaintDrafts((current) => ({
        ...current,
        [savedComplaint.id]: {
          status: savedComplaint.status,
          assignedDepartment: savedComplaint.assignedDepartment || '',
          assignedAdmin: savedComplaint.assignedAdmin || '',
        },
      }));
      setSummary((current) => ({
        total: current.total + 1,
        red: current.red + (savedComplaint.severity === 'red' ? 1 : 0),
        yellow: current.yellow + (savedComplaint.severity === 'yellow' ? 1 : 0),
        green: current.green + (savedComplaint.severity === 'green' ? 1 : 0),
      }));
      setForm((current) => ({
        ...defaultForm,
        studentName: current.studentName,
        rollNo: current.rollNo,
        studentEmail: current.studentEmail,
      }));
      setSelectedAttachments([]);
      setStatusMessage(`Complaint submit ho gayi hai. Complaint ID: ${savedComplaint.id}. Team ko alert bhej diya gaya hai.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Complaint submit nahi ho saki.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7ed,#fffdf8_40%,#f7fafc_100%)] text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-4xl border-2 border-slate-900 bg-white shadow-[10px_10px_0_0_#1a1a1a]"
        >
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(249,115,22,0.08),rgba(244,114,182,0.08),rgba(14,165,233,0.05))]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] p-6 sm:p-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border-2 border-slate-900 bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-[4px_4px_0_0_#ea7a34]">
                <Megaphone className="h-4 w-4" />
                Complaint Center
              </div>
              <div className="space-y-4 max-w-2xl">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                  Student complaints, sorted by urgency.
                </h1>
                <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl">
                  Ab student apni problem submit kar sakta hai aur severity label choose kar sakta hai: red for very urgent, yellow for medium, aur green for light issues.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(['red', 'yellow', 'green'] as ComplaintSeverity[]).map((severity) => (
                  <div
                    key={severity}
                    className={`rounded-2xl border-2 border-slate-900 bg-linear-to-br ${severityMeta[severity].panel} p-4 text-white shadow-[4px_4px_0_0_#1a1a1a]`}
                  >
                    <div className="text-sm font-bold uppercase tracking-[0.2em] opacity-90">{severityMeta[severity].label} label</div>
                    <div className="mt-2 text-sm leading-relaxed">{severityMeta[severity].description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[
                { label: 'Total complaints', value: summary.total },
                { label: 'Red urgent', value: summary.red },
                { label: 'Yellow medium', value: summary.yellow },
                { label: 'Green light', value: summary.green },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="rounded-3xl border-2 border-slate-900 bg-slate-950 p-5 text-white shadow-[6px_6px_0_0_#ea7a34]"
                >
                  <p className="text-sm font-semibold text-slate-300">{item.label}</p>
                  <p className="mt-2 text-4xl font-black">{item.value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <div className="mt-10 grid gap-8 xl:grid-cols-[1fr_1.15fr]">
          <motion.section
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-[28px] border-2 border-slate-900 bg-white p-6 sm:p-8 shadow-[8px_8px_0_0_#1a1a1a]"
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black">File a complaint</h2>
                <p className="mt-2 text-slate-600">Problem ka clear title aur description likho, phir severity tag choose karo.</p>
              </div>
              <div className="rounded-2xl bg-amber-100 p-3 border-2 border-slate-900">
                <Sparkles className="h-6 w-6 text-amber-600" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-bold text-slate-700">Your name</span>
                  <div className="flex items-center gap-3 rounded-2xl border-2 border-slate-900 px-4 py-3 bg-slate-50">
                    <User className="h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={form.studentName}
                      onChange={(event) => handleChange('studentName', event.target.value)}
                      placeholder="Anonymous Student"
                      className="w-full bg-transparent outline-none placeholder:text-slate-400"
                    />
                  </div>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-bold text-slate-700">Roll number</span>
                  <input
                    type="text"
                    value={form.rollNo}
                    onChange={(event) => handleChange('rollNo', event.target.value)}
                    placeholder="22CS001"
                    className="w-full rounded-2xl border-2 border-slate-900 bg-slate-50 px-4 py-3 outline-none placeholder:text-slate-400"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-bold text-slate-700">Email optional</span>
                  <input
                    type="email"
                    value={form.studentEmail}
                    onChange={(event) => handleChange('studentEmail', event.target.value)}
                    placeholder="student@email.com"
                    className="w-full rounded-2xl border-2 border-slate-900 bg-slate-50 px-4 py-3 outline-none placeholder:text-slate-400"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-bold text-slate-700">Category</span>
                  <select
                    value={form.category}
                    onChange={(event) => handleChange('category', event.target.value)}
                    className="w-full rounded-2xl border-2 border-slate-900 bg-slate-50 px-4 py-3 outline-none"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-bold text-slate-700">Severity label</span>
                  <select
                    value={form.severity}
                    onChange={(event) => handleChange('severity', event.target.value as ComplaintSeverity)}
                    className="w-full rounded-2xl border-2 border-slate-900 bg-slate-50 px-4 py-3 outline-none"
                  >
                    <option value="red">Red - very urgent</option>
                    <option value="yellow">Yellow - medium urgency</option>
                    <option value="green">Green - light problem</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-bold text-slate-700">Assign department</span>
                  <select
                    value={form.assignedDepartment}
                    onChange={(event) => handleChange('assignedDepartment', event.target.value)}
                    className="w-full rounded-2xl border-2 border-slate-900 bg-slate-50 px-4 py-3 outline-none"
                  >
                    <option value="">Select department</option>
                    {departments.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-bold text-slate-700">Assign admin or role</span>
                  <select
                    value={form.assignedAdmin}
                    onChange={(event) => handleChange('assignedAdmin', event.target.value)}
                    disabled={!form.assignedDepartment}
                    className="w-full rounded-2xl border-2 border-slate-900 bg-slate-50 px-4 py-3 outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    <option value="">
                      {form.assignedDepartment ? 'Select admin or role' : 'Select department first'}
                    </option>
                    {adminOptions.map((admin) => (
                      <option key={admin} value={admin}>
                        {admin}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="space-y-2 block">
                <span className="text-sm font-bold text-slate-700">Attachments</span>
                <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border-2 border-slate-900 bg-white p-3 shadow-[3px_3px_0_0_#ea7a34]">
                      <Upload className="h-5 w-5 text-slate-700" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Upload images or files</p>
                      <p className="text-sm text-slate-600">Up to 5 files, each max 5MB.</p>
                    </div>
                  </div>
                  <input
                    type="file"
                    multiple
                    onChange={handleAttachmentSelection}
                    className="mt-4 block w-full text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:font-bold file:text-white hover:file:bg-slate-800"
                  />
                  {selectedAttachments.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedAttachments.map((file) => (
                        <span
                          key={`${file.name}-${file.size}`}
                          className="rounded-full border-2 border-slate-900 bg-white px-3 py-1 text-xs font-bold text-slate-700"
                        >
                          {file.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">No attachments selected yet.</p>
                  )}
                </div>
              </label>

              <label className="space-y-2 block">
                <span className="text-sm font-bold text-slate-700">Complaint title</span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => handleChange('title', event.target.value)}
                  placeholder="Hostel water supply is irregular"
                  className="w-full rounded-2xl border-2 border-slate-900 bg-slate-50 px-4 py-3 outline-none placeholder:text-slate-400"
                />
              </label>

              <label className="space-y-2 block">
                <span className="text-sm font-bold text-slate-700">Describe the issue</span>
                <textarea
                  value={form.description}
                  onChange={(event) => handleChange('description', event.target.value)}
                  placeholder="Problem details, location, time, and what help is needed."
                  rows={6}
                  className="w-full rounded-3xl border-2 border-slate-900 bg-slate-50 px-4 py-3 outline-none placeholder:text-slate-400 resize-none"
                />
              </label>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-900 bg-slate-950 px-5 py-4 font-black text-white shadow-[6px_6px_0_0_#ea7a34] transition-all disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                {submitting ? 'Submitting...' : 'Submit complaint'}
              </motion.button>

              {statusMessage ? (
                <div className="rounded-2xl border-2 border-slate-900 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                  {statusMessage}
                </div>
              ) : null}
            </form>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.16 }}
            className="rounded-[28px] border-2 border-slate-900 bg-white p-6 sm:p-8 shadow-[8px_8px_0_0_#1a1a1a]"
          >
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black">Recent complaints</h2>
                <p className="mt-2 text-slate-600">Latest issues appear here, sorted by urgency.</p>
              </div>
              <div className="rounded-2xl border-2 border-slate-900 bg-slate-50 p-3">
                <Filter className="h-5 w-5 text-slate-700" />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {filterOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setActiveFilter(option)}
                  className={`rounded-full border-2 border-slate-900 px-4 py-2 text-sm font-bold transition-all ${activeFilter === option ? 'bg-slate-950 text-white shadow-[3px_3px_0_0_#ea7a34]' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                >
                  {option === 'all' ? 'All' : severityMeta[option].label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex min-h-80 items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500">
                Loading complaints...
              </div>
            ) : visibleComplaints.length === 0 ? (
              <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
                <h3 className="mt-4 text-xl font-black">No complaints yet</h3>
                <p className="mt-2 text-slate-600">First complaint submit karke system start karo.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {visibleComplaints.map((complaint, index) => (
                  <motion.article
                    key={complaint.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="rounded-3xl border-2 border-slate-900 bg-slate-50 p-5 shadow-[4px_4px_0_0_#1a1a1a]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-3 flex-1 min-w-70">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.2em] ${severityMeta[complaint.severity].badge}`}>
                            {severityMeta[complaint.severity].label}
                          </span>
                          <span className="rounded-full border-2 border-slate-900 bg-white px-3 py-1 text-xs font-bold text-slate-700">
                            {complaint.category}
                          </span>
                          <span className="rounded-full border-2 border-slate-900 bg-white px-3 py-1 text-xs font-bold text-slate-700 capitalize">
                            {complaint.status}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-lg font-black text-slate-950">{complaint.title}</h3>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                              Roll No: {complaint.rollNo || 'Not provided'}
                            </p>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                              Complaint ID: {complaint.id}
                            </p>
                            <button
                              type="button"
                              onClick={() => copyComplaintId(complaint.id)}
                              className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-700 transition-colors hover:border-slate-900 hover:text-slate-950"
                            >
                              {copiedComplaintId === complaint.id ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                              {copiedComplaintId === complaint.id ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-slate-600">{complaint.description}</p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700">
                            <p className="font-bold text-slate-900">Tracking</p>
                            <p>Status updated: {complaint.statusUpdatedAt ? formatTime(complaint.statusUpdatedAt) : 'Not updated yet'}</p>
                            <p>Escalation: {complaint.lastEscalatedAt ? formatTime(complaint.lastEscalatedAt) : 'Not escalated yet'}</p>
                          </div>
                          <div className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700">
                            <p className="font-bold text-slate-900">Assignment</p>
                            <p>Department: {complaint.assignedDepartment || 'Unassigned'}</p>
                            <p>Admin: {complaint.assignedAdmin || 'Unassigned'}</p>
                          </div>
                        </div>

                        {(complaint.severity === 'red' || complaint.severity === 'yellow') ? (
                          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 flex flex-wrap items-center gap-3">
                            <Clock3 className="h-4 w-4 text-slate-500" />
                            <span>
                              Auto resend interval: <strong>{complaint.severity === 'red' ? '10 minutes' : '2 hours'}</strong>
                            </span>
                            <span className="text-slate-500">
                              {getRemainingMs(complaint) > 0
                                ? `Next resend in ${formatDuration(getRemainingMs(complaint))}`
                                : 'Resend available now'}
                            </span>
                          </div>
                        ) : null}

                          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 flex flex-wrap items-center gap-3">
                            <Wrench className="h-4 w-4 text-slate-500" />
                            <span>
                              Escalation interval: <strong>{complaint.severity === 'red' ? '30 minutes' : complaint.severity === 'yellow' ? '6 hours' : '24 hours'}</strong>
                            </span>
                            <span className="text-slate-500">
                              {getEscalationRemainingMs(complaint) > 0
                                ? `Escalate in ${formatDuration(getEscalationRemainingMs(complaint))}`
                                : complaint.status === 'resolved' || complaint.status === 'escalated'
                                  ? 'No escalation needed'
                                  : 'Escalation due now'}
                            </span>
                          </div>

                          {complaint.attachments.length > 0 ? (
                            <div className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700">
                              <p className="font-bold text-slate-900 mb-2">Attachments</p>
                              <div className="flex flex-wrap gap-2">
                                {complaint.attachments.map((attachment) => (
                                  <span
                                    key={`${attachment.name}-${attachment.uploadedAt}`}
                                    className="rounded-full border-2 border-slate-900 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700"
                                  >
                                    {attachment.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : null}
                      </div>

                      <div className="text-right text-sm text-slate-500 min-w-55">
                        <p className="font-bold text-slate-700">{complaint.studentName || 'Anonymous Student'}</p>
                        <p>{formatTime(complaint.createdAt)}</p>
                        <p className="mt-1">Admin notifications: {complaint.adminNotificationCount || 0}</p>
                        {complaint.lastAdminNotificationAt ? (
                          <p>Last sent: {formatTime(complaint.lastAdminNotificationAt)}</p>
                        ) : null}
                        {complaint.severity !== 'green' ? (
                          <button
                            type="button"
                            onClick={() => resendNotification(complaint)}
                            disabled={resendingId === complaint.id || getRemainingMs(complaint) > 0}
                            className="mt-3 inline-flex items-center gap-2 rounded-full border-2 border-slate-900 bg-slate-950 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white shadow-[3px_3px_0_0_#ea7a34] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {resendingId === complaint.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <RefreshCcw className="h-3.5 w-3.5" />
                            )}
                            {getRemainingMs(complaint) > 0 ? `Wait ${formatDuration(getRemainingMs(complaint))}` : 'Resend to admin'}
                          </button>
                        ) : (
                          <div className="mt-3 inline-flex items-center gap-2 rounded-full border-2 border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700">
                            Green labels do not use resend
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </motion.section>
        </div>
      </div>
    </div>
  );
}