import { Feather } from "@expo/vector-icons";
import { PropsWithChildren } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { TabKey } from "../types";
import { tokens } from "../theme/tokens";

export function ScreenBackground({ children }: PropsWithChildren) {
  return (
    <View style={styles.background}>
      <View style={[styles.blob, styles.blobOrange]} />
      <View style={[styles.blob, styles.blobMint]} />
      <View style={[styles.blob, styles.blobLavender]} />
      {children}
    </View>
  );
}

export function PageScroll({ children }: PropsWithChildren) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 20, paddingBottom: 120, gap: 16 }}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

export function NeoCard({
  children,
  color = tokens.colors.white,
  rotate = "0deg",
}: PropsWithChildren<{ color?: string; rotate?: string }>) {
  return (
    <View style={[styles.card, { backgroundColor: color, transform: [{ rotate }] }]}>
      <View style={{ transform: [{ rotate: `${-parseFloat(rotate)}deg` }] }}>{children}</View>
    </View>
  );
}

export function SectionTitle({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

export function NeoButton({
  label,
  onPress,
  fill = tokens.colors.ink,
  textColor = tokens.colors.white,
  icon,
}: {
  label: string;
  onPress: () => void;
  fill?: string;
  textColor?: string;
  icon?: keyof typeof Feather.glyphMap;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.button, { backgroundColor: fill }]}>
      <View style={styles.buttonRow}>
        <Text style={[styles.buttonText, { color: textColor }]}>{label}</Text>
        {icon ? <Feather name={icon} size={16} color={textColor} /> : null}
      </View>
    </Pressable>
  );
}

const navItems: Array<{ key: TabKey; label: string; icon: keyof typeof Feather.glyphMap }> = [
  { key: "home", label: "Home", icon: "home" },
  { key: "community", label: "Community", icon: "message-circle" },
  { key: "budget", label: "Budget", icon: "credit-card" },
  { key: "sos", label: "SOS", icon: "alert-triangle" },
  { key: "profile", label: "Profile", icon: "user" },
];

export function BottomNav({ activeTab, onChange }: { activeTab: TabKey; onChange: (tab: TabKey) => void }) {
  return (
    <View style={styles.bottomWrap}>
      <View style={styles.bottomBar}>
        {navItems.map((item) => {
          const active = activeTab === item.key;
          return (
            <Pressable key={item.key} onPress={() => onChange(item.key)} style={styles.navItem}>
              <View style={[styles.navBubble, active && styles.navBubbleActive]}>
                <Feather name={item.icon} size={16} color={tokens.colors.ink} />
              </View>
              <Text style={styles.navText}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: tokens.colors.paper,
  },
  blob: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.7,
  },
  blobOrange: {
    width: 260,
    height: 260,
    backgroundColor: "#F9C7AD",
    top: -60,
    right: -80,
  },
  blobMint: {
    width: 240,
    height: 240,
    backgroundColor: "#D8F5E8",
    left: -100,
    top: 240,
  },
  blobLavender: {
    width: 200,
    height: 200,
    backgroundColor: "#DDD6FE",
    right: -70,
    bottom: 160,
  },
  card: {
    borderWidth: 2,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radii.xl,
    padding: 18,
    ...tokens.shadow,
  },
  eyebrow: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: tokens.radii.pill,
    backgroundColor: tokens.colors.ink,
    color: tokens.colors.paper,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  title: {
    color: tokens.colors.ink,
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "900",
  },
  subtitle: {
    color: "#44403C",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
  },
  button: {
    borderWidth: 2,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...tokens.shadow,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  buttonText: {
    fontWeight: "900",
    fontSize: 15,
  },
  bottomWrap: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
  },
  bottomBar: {
    borderWidth: 2,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.white,
    borderRadius: 36,
    paddingHorizontal: 8,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    ...tokens.shadow,
  },
  navItem: {
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  navBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.beige,
    alignItems: "center",
    justifyContent: "center",
  },
  navBubbleActive: {
    backgroundColor: tokens.colors.yellow,
  },
  navText: {
    fontSize: 11,
    fontWeight: "800",
    color: tokens.colors.ink,
  },
});
