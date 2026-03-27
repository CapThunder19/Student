import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { SafeAreaView, View } from "react-native";
import { AuthScreen } from "./src/screens/AuthScreen";
import { BottomNav, ScreenBackground } from "./src/components/ui";
import { BudgetScreen } from "./src/screens/BudgetScreen";
import { CommunityScreen } from "./src/screens/CommunityScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { SosScreen } from "./src/screens/SosScreen";
import { clearSession, loadSession, saveSession } from "./src/lib/storage";
import { Session, TabKey } from "./src/types";

function normalizeSession(session: Session | null) {
  if (!session) {
    return null;
  }

  if (
    session.user.id === "u-demo-1" ||
    session.token === "demo-token-u-demo-1" ||
    session.user.name === "Aarav Mehta" ||
    session.user.email === "aarav@student.demo" ||
    session.user.email === "anjali@student.com"
  ) {
    return {
      ...session,
      user: {
        ...session.user,
        name: "Anjali Singh",
        email: "anjali@student.demo",
      },
    };
  }

  return session;
}

export default function App() {
  const [booting, setBooting] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("home");

  useEffect(() => {
    (async () => {
      const stored = await loadSession();
      if (stored?.session) {
        const normalized = normalizeSession(stored.session);
        setSession(normalized);
        if (normalized) {
          await saveSession(normalized);
        }
      }
      setBooting(false);
    })();
  }, []);

  if (booting) {
    return (
      <ScreenBackground>
        <SafeAreaView style={{ flex: 1 }} />
      </ScreenBackground>
    );
  }

  if (!session) {
    return (
      <ScreenBackground>
        <StatusBar style="dark" />
        <AuthScreen
          onAuthenticated={async (nextSession) => {
            setSession(nextSession);
            await saveSession(nextSession);
          }}
        />
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          {activeTab === "home" && <HomeScreen user={session.user} onNavigate={setActiveTab} />}
          {activeTab === "community" && <CommunityScreen session={session} baseUrl="demo://" />}
          {activeTab === "budget" && <BudgetScreen session={session} baseUrl="demo://" />}
          {activeTab === "sos" && <SosScreen session={session} baseUrl="demo://" />}
          {activeTab === "profile" && (
            <ProfileScreen
              session={session}
              baseUrl="demo://"
              onLogout={async () => {
                setSession(null);
                setActiveTab("home");
                await clearSession();
              }}
              onProfileUpdate={async (user) => {
                const updated = { ...session, user };
                setSession(updated);
                await saveSession(updated);
              }}
            />
          )}
        </View>
        <BottomNav activeTab={activeTab} onChange={setActiveTab} />
      </SafeAreaView>
    </ScreenBackground>
  );
}
