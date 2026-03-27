import AsyncStorage from "@react-native-async-storage/async-storage";
import { DemoDatabase, Session } from "../types";

const SESSION_KEY = "student_mobile_session";
const DEMO_DB_KEY = "student_mobile_demo_db";

export async function loadSession() {
  const sessionRaw = await AsyncStorage.getItem(SESSION_KEY);

  return {
    session: sessionRaw ? (JSON.parse(sessionRaw) as Session) : null,
  };
}

export async function saveSession(session: Session) {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function clearSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function loadDemoDatabase() {
  const raw = await AsyncStorage.getItem(DEMO_DB_KEY);
  return raw ? (JSON.parse(raw) as DemoDatabase) : null;
}

export async function saveDemoDatabase(database: DemoDatabase) {
  await AsyncStorage.setItem(DEMO_DB_KEY, JSON.stringify(database));
}
