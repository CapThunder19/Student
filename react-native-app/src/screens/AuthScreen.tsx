import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { api } from "../lib/api";
import { NeoButton, NeoCard, PageScroll, SectionTitle } from "../components/ui";
import { Session } from "../types";
import { tokens } from "../theme/tokens";

export function AuthScreen({
  onAuthenticated,
}: {
  onAuthenticated: (session: Session) => void;
}) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password.trim() || (mode === "signup" && !name.trim())) {
      Alert.alert("Missing fields", "Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);
      const result =
        mode === "login"
          ? await api.login("demo://", email.trim(), password)
          : await api.signup("demo://", name.trim(), email.trim(), password);
      onAuthenticated({ token: result.token, user: result.user });
    } catch (error) {
      Alert.alert("Auth failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageScroll>
      <NeoCard color={tokens.colors.paper} rotate="-2deg">
        <SectionTitle
          eyebrow="Student.App"
          title="Your campus life, now in React Native."
          subtitle="Same chunky visual style, same modules, mobile-first flow."
        />
      </NeoCard>

      <NeoCard color={mode === "login" ? tokens.colors.yellow : tokens.colors.lavender} rotate="1.5deg">
        <Text style={styles.heading}>{mode === "login" ? "Welcome back" : "Create account"}</Text>
        <Text style={styles.copy}>
          Full demo mode is enabled. Use demo login or create a new demo account and all modules will persist locally.
        </Text>

        <View style={styles.demoBox}>
          <Text style={styles.demoTitle}>Demo credentials</Text>
          <Text style={styles.demoCopy}>Name: Anjali Singh</Text>
          <Text style={styles.demoCopy}>Email: anjali@student.demo</Text>
          <Text style={styles.demoCopy}>Password: demo123</Text>
        </View>

        {mode === "signup" ? (
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor="#6B7280"
            style={styles.input}
          />
        ) : null}
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          placeholder="Email"
          placeholderTextColor="#6B7280"
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Password"
          placeholderTextColor="#6B7280"
          style={styles.input}
        />
        <NeoButton label={loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"} onPress={submit} />

        <NeoButton
          label={mode === "login" ? "Switch to signup" : "Switch to login"}
          onPress={() => setMode(mode === "login" ? "signup" : "login")}
          fill={tokens.colors.white}
          textColor={tokens.colors.ink}
        />
      </NeoCard>
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 28,
    fontWeight: "900",
    color: tokens.colors.ink,
    marginBottom: 8,
  },
  copy: {
    fontSize: 14,
    lineHeight: 20,
    color: "#44403C",
    fontWeight: "600",
    marginBottom: 16,
  },
  input: {
    borderWidth: 2,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radii.lg,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: tokens.colors.white,
    marginBottom: 12,
    color: tokens.colors.ink,
    fontWeight: "700",
  },
  demoBox: {
    borderWidth: 2,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radii.lg,
    backgroundColor: "#FFF7D6",
    padding: 12,
    marginBottom: 12,
  },
  demoTitle: {
    color: tokens.colors.ink,
    fontWeight: "900",
    marginBottom: 4,
  },
  demoCopy: {
    color: "#44403C",
    fontWeight: "700",
  },
});
