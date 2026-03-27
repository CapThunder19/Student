export type TabKey = "home" | "community" | "budget" | "sos" | "profile";

export type User = {
  id?: string;
  name: string;
  email: string;
  password?: string;
  major?: string;
  year?: string;
  phone?: string;
  location?: string;
  gpa?: string;
  profilePhoto?: string;
};

export type Session = {
  token: string;
  user: User;
};

export type ReplyTo = {
  id: string;
  author: string;
  message: string;
};

export type CommunityMessage = {
  id: string;
  author: string;
  avatar: string;
  message: string;
  replyTo?: ReplyTo;
  timestamp: string;
  likes: number;
  likedBy: string[];
};

export type BudgetTransaction = {
  _id?: string;
  desc?: string;
  amount?: number;
  category?: string;
  type?: string;
  date?: string;
};

export type SharedExpense = {
  _id?: string;
  desc?: string;
  amount?: number;
  paidBy?: string;
  splitWith?: string;
  impactAmount?: number;
  date?: string;
};

export type BudgetPayload = {
  budget?: {
    monthlyTarget?: number;
    daysRemaining?: number;
  };
  transactions: BudgetTransaction[];
  sharedExpenses: SharedExpense[];
};

export type Complaint = {
  id: string;
  studentName: string;
  studentEmail?: string;
  category: string;
  title: string;
  description: string;
  severity: "red" | "yellow" | "green";
  status: string;
  createdAt: string;
};

export type DemoDatabase = {
  users: User[];
  communityMessages: CommunityMessage[];
  budgetByUser: Record<string, BudgetPayload>;
  complaintsByUser: Record<string, Complaint[]>;
};
