import { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { api } from "../lib/api";
import { NeoButton, NeoCard, PageScroll, SectionTitle } from "../components/ui";
import { BudgetPayload, Session } from "../types";
import { tokens } from "../theme/tokens";

export function BudgetScreen({ session, baseUrl }: { session: Session; baseUrl: string }) {
  const [payload, setPayload] = useState<BudgetPayload | null>(null);
  const [target, setTarget] = useState("");
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");

  const loadBudget = async () => {
    try {
      const next = await api.getBudget(baseUrl, session);
      setPayload(next);
      setTarget(String(next.budget?.monthlyTarget ?? 20000));
    } catch (error) {
      Alert.alert("Budget error", error instanceof Error ? error.message : "Unable to load budget.");
    }
  };

  useEffect(() => {
    loadBudget();
  }, [baseUrl, session.token]);

  const totalSpent = useMemo(
    () => payload?.transactions.filter((item) => item.type !== "income").reduce((sum, item) => sum + (item.amount || 0), 0) ?? 0,
    [payload]
  );
  const sharedBalance = useMemo(
    () => payload?.sharedExpenses.reduce((sum, item) => sum + (item.impactAmount || 0), 0) ?? 0,
    [payload]
  );

  const parsedTarget = Number(target) || 0;
  const monthlyTarget = payload?.budget?.monthlyTarget ?? parsedTarget;
  const remaining = Math.max(monthlyTarget - totalSpent, 0);

  return (
    <PageScroll>
      <NeoCard color={tokens.colors.lavender} rotate="-1.5deg">
        <SectionTitle
          eyebrow="Budget"
          title="Personal finance, but in the website's card language."
          subtitle={`Spent Rs ${Math.round(totalSpent)}, remaining Rs ${Math.round(remaining)}, split balance Rs ${Math.round(sharedBalance)}.`}
        />
      </NeoCard>

      <NeoCard color={tokens.colors.white} rotate="1deg">
        <Text style={styles.blockTitle}>Monthly target</Text>
        <TextInput value={target} onChangeText={setTarget} keyboardType="numeric" style={styles.input} placeholder="20000" placeholderTextColor="#6B7280" />
        <NeoButton
          label="Save target"
          onPress={async () => {
            try {
              await api.saveBudgetTarget(baseUrl, session, Number(target));
              await loadBudget();
            } catch (error) {
              Alert.alert("Save failed", error instanceof Error ? error.message : "Unable to save target.");
            }
          }}
        />
      </NeoCard>

      <NeoCard color={tokens.colors.yellow} rotate="-1deg">
        <Text style={styles.blockTitle}>Add expense</Text>
        <TextInput value={desc} onChangeText={setDesc} style={styles.input} placeholder="Description" placeholderTextColor="#6B7280" />
        <TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" style={styles.input} placeholder="Amount" placeholderTextColor="#6B7280" />
        <TextInput value={category} onChangeText={setCategory} style={styles.input} placeholder="Category" placeholderTextColor="#6B7280" />
        <NeoButton
          label="Add transaction"
          onPress={async () => {
            try {
              await api.addTransaction(baseUrl, session, {
                desc,
                amount: Number(amount),
                category,
                type: "expense",
              });
              setDesc("");
              setAmount("");
              setCategory("Food");
              await loadBudget();
            } catch (error) {
              Alert.alert("Transaction failed", error instanceof Error ? error.message : "Unable to add transaction.");
            }
          }}
          fill={tokens.colors.ink}
        />
      </NeoCard>

      <NeoCard color={tokens.colors.beige} rotate="1deg">
        <Text style={styles.blockTitle}>Recent transactions</Text>
        {(payload?.transactions ?? []).map((item, index) => (
          <View key={item._id || `${item.desc}-${index}`} style={[styles.row, index > 0 && { marginTop: 10 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{item.desc || "Untitled"}</Text>
              <Text style={styles.rowMeta}>{item.category || "General"}</Text>
            </View>
            <Text style={styles.rowAmount}>
              {item.type === "income" ? "+" : "-"}Rs {Math.round(item.amount || 0)}
            </Text>
          </View>
        ))}
      </NeoCard>

      <NeoCard color={tokens.colors.mint} rotate="-1deg">
        <Text style={styles.blockTitle}>Shared expenses</Text>
        {(payload?.sharedExpenses ?? []).map((item, index) => (
          <View key={item._id || `${item.desc}-${index}`} style={[styles.row, index > 0 && { marginTop: 10 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{item.desc || "Shared item"}</Text>
              <Text style={styles.rowMeta}>
                {item.paidBy || "Someone"} paid · split with {item.splitWith || "group"}
              </Text>
            </View>
            <Text style={styles.rowAmount}>
              {item.impactAmount && item.impactAmount > 0 ? "+" : ""}Rs {Math.round(item.impactAmount || 0)}
            </Text>
          </View>
        ))}
      </NeoCard>
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  blockTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: tokens.colors.ink,
    marginBottom: 12,
  },
  input: {
    borderWidth: 2,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radii.lg,
    backgroundColor: tokens.colors.white,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
    color: tokens.colors.ink,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 2,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radii.lg,
    padding: 12,
    backgroundColor: tokens.colors.white,
  },
  rowTitle: {
    fontWeight: "900",
    color: tokens.colors.ink,
    fontSize: 15,
  },
  rowMeta: {
    color: "#57534E",
    fontWeight: "700",
    marginTop: 4,
  },
  rowAmount: {
    fontWeight: "900",
    color: tokens.colors.ink,
  },
});
