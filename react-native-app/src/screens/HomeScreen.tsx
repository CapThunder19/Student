import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { NeoButton, NeoCard, PageScroll, SectionTitle } from "../components/ui";
import { TabKey, User } from "../types";
import { tokens } from "../theme/tokens";

const modules: Array<{ title: string; copy: string; color: string; icon: keyof typeof Feather.glyphMap; tab: TabKey }> = [
  {
    title: "Community",
    copy: "Realtime campus chat, updates, and replies in the same warm visual system.",
    color: tokens.colors.orange,
    icon: "message-circle",
    tab: "community",
  },
  {
    title: "Budget",
    copy: "Monthly target, quick adds, and recent spending cards with high-contrast layout.",
    color: tokens.colors.lavender,
    icon: "credit-card",
    tab: "budget",
  },
  {
    title: "SOS",
    copy: "Urgent complaint submission flow mapped to the complaints backend for emergency reporting.",
    color: tokens.colors.yellow,
    icon: "alert-triangle",
    tab: "sos",
  },
  {
    title: "Profile",
    copy: "Editable student identity card with major, year, phone, location, and GPA.",
    color: tokens.colors.mint,
    icon: "user",
    tab: "profile",
  },
];

export function HomeScreen({ user, onNavigate }: { user: User; onNavigate: (tab: TabKey) => void }) {
  return (
    <PageScroll>
      <NeoCard color={tokens.colors.paper} rotate="-2deg">
        <SectionTitle
          eyebrow="Mobile Home"
          title={`Hi ${user.name || "Student"}, your campus life is synchronized.`}
          subtitle="This mobile home screen borrows the website palette, thick borders, stacked cards, and bold hierarchy."
        />
        <View style={styles.heroRow}>
          <Chip icon="book-open" label="Academics" fill={tokens.colors.lavender} />
          <Chip icon="users" label="Community" fill={tokens.colors.orange} />
          <Chip icon="home" label="Housing" fill={tokens.colors.mint} />
          <Chip icon="heart" label="Wellbeing" fill={tokens.colors.yellow} />
        </View>
      </NeoCard>

      {modules.map((module, index) => (
        <Pressable key={module.title} onPress={() => onNavigate(module.tab)}>
          <NeoCard color={module.color} rotate={index % 2 === 0 ? "1.5deg" : "-1.5deg"}>
            <View style={styles.moduleHeader}>
              <View style={styles.iconBubble}>
                <Feather name={module.icon} size={20} color={tokens.colors.ink} />
              </View>
              <Text style={styles.moduleTitle}>{module.title}</Text>
            </View>
            <Text style={styles.moduleCopy}>{module.copy}</Text>
          </NeoCard>
        </Pressable>
      ))}

      <NeoCard color={tokens.colors.ink} rotate="0deg">
        <Text style={styles.darkTitle}>Jump into the live modules.</Text>
        <Text style={styles.darkCopy}>
          Community, Budget, SOS, and Profile now run in a full demo data mode with local persistence on the device.
        </Text>
        <View style={{ gap: 10 }}>
          <NeoButton label="Open Community" onPress={() => onNavigate("community")} fill={tokens.colors.orange} textColor={tokens.colors.ink} icon="arrow-right" />
          <NeoButton label="Open Budget" onPress={() => onNavigate("budget")} fill={tokens.colors.yellow} textColor={tokens.colors.ink} icon="arrow-right" />
        </View>
      </NeoCard>
    </PageScroll>
  );
}

function Chip({ icon, label, fill }: { icon: keyof typeof Feather.glyphMap; label: string; fill: string }) {
  return (
    <View style={[styles.chip, { backgroundColor: fill }]}>
      <Feather name={icon} size={14} color={tokens.colors.ink} />
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18,
  },
  chip: {
    borderWidth: 2,
    borderColor: tokens.colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chipText: {
    fontWeight: "900",
    color: tokens.colors.ink,
  },
  moduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  moduleTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: tokens.colors.ink,
  },
  moduleCopy: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700",
    color: tokens.colors.ink,
  },
  darkTitle: {
    color: tokens.colors.paper,
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 8,
  },
  darkCopy: {
    color: "#E7E5E4",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
});
