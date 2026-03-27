import { loadDemoDatabase, saveDemoDatabase } from "./storage";
import { BudgetPayload, CommunityMessage, Complaint, DemoDatabase, ReplyTo, Session, User } from "../types";

type AuthResponse = {
  token: string;
  user: User;
  error?: string;
};

const now = () => new Date().toISOString();

const seedUsers: User[] = [
  {
    id: "u-demo-1",
    name: "Anjali Singh",
    email: "anjali@student.demo",
    password: "demo123",
    major: "Computer Science",
    year: "3rd Year",
    phone: "+91 98765 43210",
    location: "Delhi Campus Hostel A",
    gpa: "8.7",
  },
  {
    id: "u-demo-2",
    name: "Naina Kapoor",
    email: "naina@student.demo",
    password: "demo123",
    major: "Design",
    year: "2nd Year",
    phone: "+91 91234 56789",
    location: "Noida Sector 62",
    gpa: "9.1",
  },
];

const seedMessages: CommunityMessage[] = [
  {
    id: "m-1",
    author: "Naina Kapoor",
    avatar: "N",
    message: "Anyone up for a UI critique circle at 6 PM in the design lab?",
    timestamp: now(),
    likes: 3,
    likedBy: ["u-demo-1", "u-demo-2", "u-demo-3"],
  },
  {
    id: "m-2",
    author: "Campus Bot",
    avatar: "C",
    message: "Lost and found: black water bottle near Block B stairs.",
    timestamp: now(),
    likes: 1,
    likedBy: ["u-demo-2"],
  },
  {
    id: "m-3",
    author: "Anjali Singh",
    avatar: "A",
    message: "Budget template and startup pitch deck ka session kal 11 baje common room mein hai.",
    timestamp: now(),
    likes: 4,
    likedBy: ["u-demo-1", "u-demo-2", "u-demo-4", "u-demo-5"],
  },
];

function buildBudget(monthlyTarget: number): BudgetPayload {
  return {
    budget: {
      monthlyTarget,
      daysRemaining: 12,
    },
    transactions: [
      { _id: "t-1", desc: "Canteen lunch", amount: 180, category: "Food", type: "expense", date: now() },
      { _id: "t-2", desc: "Auto to metro", amount: 120, category: "Travel", type: "expense", date: now() },
      { _id: "t-3", desc: "Freelance payout", amount: 3500, category: "Income", type: "income", date: now() },
    ],
    sharedExpenses: [
      { _id: "s-1", desc: "Flat dinner", amount: 860, paidBy: "You", splitWith: "Naina", impactAmount: 430, date: now() },
      { _id: "s-2", desc: "Cab after event", amount: 300, paidBy: "Rohit", splitWith: "You", impactAmount: -150, date: now() },
    ],
  };
}

function buildComplaints(user: User): Complaint[] {
  return [
    {
      id: "c-1",
      studentName: user.name,
      studentEmail: user.email,
      category: "Emergency",
      title: "Streetlight not working near gate 2",
      description: "Late evening mein path dark ho jata hai. Security visibility improve karni hai.",
      severity: "yellow",
      status: "open",
      createdAt: now(),
    },
    {
      id: "c-2",
      studentName: user.name,
      studentEmail: user.email,
      category: "Medical",
      title: "Need first-aid support during sports practice",
      description: "Practice ground par basic first-aid availability low hai.",
      severity: "green",
      status: "in-progress",
      createdAt: now(),
    },
  ];
}

const initialDatabase: DemoDatabase = {
  users: seedUsers,
  communityMessages: seedMessages,
  budgetByUser: {
    "u-demo-1": buildBudget(18000),
    "u-demo-2": buildBudget(22000),
  },
  complaintsByUser: {
    "u-demo-1": buildComplaints(seedUsers[0]),
    "u-demo-2": buildComplaints(seedUsers[1]),
  },
};

function normalizeDemoDatabase(database: DemoDatabase): DemoDatabase {
  const normalizedUsers = database.users.map((user) => {
    if (
      user.id === "u-demo-1" ||
      user.name === "Aarav Mehta" ||
      user.email === "aarav@student.demo" ||
      user.email === "anjali@student.com"
    ) {
      return {
        ...user,
        name: "Anjali Singh",
        email: "anjali@student.demo",
      };
    }
    return user;
  });

  const normalizedMessages = database.communityMessages.map((message) => {
    if (message.author === "Aarav Mehta") {
      return {
        ...message,
        author: "Anjali Singh",
        avatar: "A",
      };
    }
    return message;
  });

  const complaintsByUser = Object.fromEntries(
    Object.entries(database.complaintsByUser).map(([userId, complaints]) => [
      userId,
      complaints.map((complaint) => {
        if (
          userId === "u-demo-1" ||
          complaint.studentName === "Aarav Mehta" ||
          complaint.studentEmail === "aarav@student.demo" ||
          complaint.studentEmail === "anjali@student.com"
        ) {
          return {
            ...complaint,
            studentName: "Anjali Singh",
            studentEmail: "anjali@student.demo",
          };
        }
        return complaint;
      }),
    ])
  );

  return {
    ...database,
    users: normalizedUsers,
    communityMessages: normalizedMessages,
    complaintsByUser,
  };
}

async function readDatabase() {
  const stored = await loadDemoDatabase();
  if (stored) {
    const normalized = normalizeDemoDatabase(stored);
    await saveDemoDatabase(normalized);
    return normalized;
  }
  await saveDemoDatabase(initialDatabase);
  return initialDatabase;
}

async function writeDatabase(database: DemoDatabase) {
  await saveDemoDatabase(database);
}

function safeUser(user: User): User {
  const { password, ...rest } = user;
  return rest;
}

function requireUser(database: DemoDatabase, session: Session) {
  const user = database.users.find((item) => item.id === session.user.id || item.email === session.user.email);
  if (!user) {
    throw new Error("Demo user not found");
  }
  return user;
}

export const api = {
  async login(_baseUrl: string, email: string, password: string) {
    const database = await readDatabase();
    const user = database.users.find(
      (item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password
    );

    if (!user) {
      throw new Error("Use demo credentials like Anjali Singh: anjali@student.demo / demo123");
    }

    return {
      token: `demo-token-${user.id}`,
      user: safeUser(user),
    } as AuthResponse;
  },
  async signup(_baseUrl: string, name: string, email: string, password: string) {
    const database = await readDatabase();
    const normalizedEmail = email.trim().toLowerCase();

    if (database.users.some((item) => item.email.toLowerCase() === normalizedEmail)) {
      throw new Error("Demo user already exists. Try logging in.");
    }

    const user: User = {
      id: `u-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      password,
      major: "Demo Major",
      year: "1st Year",
      phone: "",
      location: "Student Residence",
      gpa: "8.0",
    };

    database.users.unshift(user);
    database.budgetByUser[user.id!] = buildBudget(20000);
    database.complaintsByUser[user.id!] = buildComplaints(user);
    await writeDatabase(database);

    return {
      token: `demo-token-${user.id}`,
      user: safeUser(user),
    } as AuthResponse;
  },
  async getCommunity(_baseUrl: string) {
    const database = await readDatabase();
    return { messages: [...database.communityMessages].sort((a, b) => a.timestamp.localeCompare(b.timestamp)) };
  },
  async postCommunity(_baseUrl: string, session: Session, message: string, replyTo?: ReplyTo) {
    const database = await readDatabase();
    const nextMessage: CommunityMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      author: session.user.name || "Student",
      avatar: session.user.name?.slice(0, 1).toUpperCase() || "S",
      message,
      replyTo,
      timestamp: now(),
      likes: 0,
      likedBy: [],
    };
    database.communityMessages.push(nextMessage);
    await writeDatabase(database);
    return { message: nextMessage };
  },
  async likeCommunity(_baseUrl: string, session: Session, messageId: string) {
    const database = await readDatabase();
    const actorId = session.user.id || session.user.email;
    const message = database.communityMessages.find((item) => item.id === messageId);
    if (!message) {
      throw new Error("Message not found");
    }
    const hasLiked = message.likedBy.includes(actorId);
    message.likedBy = hasLiked ? message.likedBy.filter((item) => item !== actorId) : [...message.likedBy, actorId];
    message.likes = message.likedBy.length;
    await writeDatabase(database);
    return { messageId, liked: !hasLiked, likes: message.likes };
  },
  async getBudget(_baseUrl: string, session: Session) {
    const database = await readDatabase();
    const user = requireUser(database, session);
    return database.budgetByUser[user.id!] || buildBudget(20000);
  },
  async saveBudgetTarget(_baseUrl: string, session: Session, monthlyTarget: number) {
    const database = await readDatabase();
    const user = requireUser(database, session);
    const current = database.budgetByUser[user.id!] || buildBudget(20000);
    current.budget = {
      monthlyTarget,
      daysRemaining: current.budget?.daysRemaining ?? 12,
    };
    database.budgetByUser[user.id!] = current;
    await writeDatabase(database);
    return { success: true };
  },
  async addTransaction(
    _baseUrl: string,
    session: Session,
    transaction: { desc: string; amount: number; category: string; type: string }
  ) {
    const database = await readDatabase();
    const user = requireUser(database, session);
    const current = database.budgetByUser[user.id!] || buildBudget(20000);
    current.transactions.unshift({
      _id: `t-${Date.now()}`,
      desc: transaction.desc,
      amount: transaction.amount,
      category: transaction.category,
      type: transaction.type,
      date: now(),
    });
    database.budgetByUser[user.id!] = current;
    await writeDatabase(database);
    return { success: true };
  },
  async getComplaints(_baseUrl: string, session?: Session) {
    const database = await readDatabase();
    const complaints = session
      ? database.complaintsByUser[requireUser(database, session).id!] || []
      : Object.values(database.complaintsByUser).flat();
    const summary = complaints.reduce(
      (accumulator, complaint) => {
        accumulator.total += 1;
        accumulator[complaint.severity] += 1;
        return accumulator;
      },
      { total: 0, red: 0, yellow: 0, green: 0 }
    );
    return { complaints: [...complaints].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), summary };
  },
  async submitComplaint(
    _baseUrl: string,
    session: Session,
    complaint: { category: string; title: string; description: string; severity: "red" | "yellow" | "green" }
  ) {
    const database = await readDatabase();
    const user = requireUser(database, session);
    const nextComplaint: Complaint = {
      id: `c-${Date.now()}`,
      studentName: user.name,
      studentEmail: user.email,
      category: complaint.category,
      title: complaint.title,
      description: complaint.description,
      severity: complaint.severity,
      status: complaint.severity === "red" ? "escalated" : "open",
      createdAt: now(),
    };
    const existing = database.complaintsByUser[user.id!] || [];
    database.complaintsByUser[user.id!] = [nextComplaint, ...existing];
    await writeDatabase(database);
    return { complaint: nextComplaint };
  },
  async getProfile(_baseUrl: string, session: Session) {
    const database = await readDatabase();
    return safeUser(requireUser(database, session));
  },
  async updateProfile(_baseUrl: string, session: Session, user: Partial<User>) {
    const database = await readDatabase();
    const current = requireUser(database, session);
    Object.assign(current, user);
    await writeDatabase(database);
    return safeUser(current);
  },
};
