import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { api } from "../lib/api";
import { NeoButton, NeoCard, PageScroll, SectionTitle } from "../components/ui";
import { Session, User } from "../types";
import { tokens } from "../theme/tokens";

export function ProfileScreen({
  session,
  baseUrl,
  onLogout,
  onProfileUpdate,
}: {
  session: Session;
  baseUrl: string;
  onLogout: () => void;
  onProfileUpdate: (user: User) => void;
}) {
  const [profile, setProfile] = useState<User>(session.user);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const result = await api.getProfile(baseUrl, session);
      setProfile(result);
      onProfileUpdate(result);
    } catch (error) {
      Alert.alert("Profile error", error instanceof Error ? error.message : "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [baseUrl, session.token]);

  return (
    <PageScroll>
      <NeoCard color={tokens.colors.mint} rotate="-1deg">
        <SectionTitle
          eyebrow="Profile"
          title={loading ? "Loading profile..." : profile.name || "Student profile"}
          subtitle="Editable student card saved in demo storage on this device."
        />
      </NeoCard>

      <NeoCard color={tokens.colors.white} rotate="1deg">
        <Text style={styles.blockTitle}>Identity</Text>
        <Field label="Name" value={profile.name || ""} onChange={(value) => setProfile({ ...profile, name: value })} />
        <Field label="Major" value={profile.major || ""} onChange={(value) => setProfile({ ...profile, major: value })} />
        <Field label="Year" value={profile.year || ""} onChange={(value) => setProfile({ ...profile, year: value })} />
        <Field label="Phone" value={profile.phone || ""} onChange={(value) => setProfile({ ...profile, phone: value })} />
        <Field label="Location" value={profile.location || ""} onChange={(value) => setProfile({ ...profile, location: value })} />
        <Field label="GPA" value={profile.gpa || ""} onChange={(value) => setProfile({ ...profile, gpa: value })} />
        <NeoButton
          label="Save profile"
          onPress={async () => {
            try {
              const updated = await api.updateProfile(baseUrl, session, profile);
              setProfile(updated);
              onProfileUpdate(updated);
              Alert.alert("Saved", "Profile updated.");
            } catch (error) {
              Alert.alert("Save failed", error instanceof Error ? error.message : "Unable to save profile.");
            }
          }}
        />
      </NeoCard>

      <NeoCard color={tokens.colors.lavender} rotate="1deg">
        <Text style={styles.blockTitle}>Snapshot</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Major</Text>
          <Text style={styles.summaryValue}>{profile.major || "Demo Major"}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Year</Text>
          <Text style={styles.summaryValue}>{profile.year || "1st Year"}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Location</Text>
          <Text style={styles.summaryValue}>{profile.location || "Student Residence"}</Text>
        </View>
      </NeoCard>

      <NeoCard color={tokens.colors.ink} rotate="-1deg">
        <Text style={styles.darkTitle}>Session</Text>
        <Text style={styles.darkCopy}>{profile.email}</Text>
        <NeoButton label="Log out" onPress={onLogout} fill={tokens.colors.orange} textColor={tokens.colors.ink} icon="log-out" />
      </NeoCard>
    </PageScroll>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput value={value} onChangeText={onChange} style={styles.input} placeholder={label} placeholderTextColor="#6B7280" />
    </View>
  );
}

const styles = StyleSheet.create({
  blockTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: tokens.colors.ink,
    marginBottom: 12,
  },
  label: {
    fontWeight: "900",
    color: tokens.colors.ink,
    marginBottom: 6,
  },
  input: {
    borderWidth: 2,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radii.lg,
    backgroundColor: tokens.colors.paper,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: tokens.colors.ink,
    fontWeight: "700",
  },
  darkTitle: {
    color: tokens.colors.paper,
    fontWeight: "900",
    fontSize: 22,
    marginBottom: 8,
  },
  darkCopy: {
    color: "#E7E5E4",
    fontWeight: "700",
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radii.lg,
    backgroundColor: tokens.colors.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  summaryLabel: {
    color: "#57534E",
    fontWeight: "800",
  },
  summaryValue: {
    color: tokens.colors.ink,
    fontWeight: "900",
    maxWidth: "55%",
    textAlign: "right",
  },
});
