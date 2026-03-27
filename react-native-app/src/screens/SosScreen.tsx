import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { api } from "../lib/api";
import { NeoButton, NeoCard, PageScroll, SectionTitle } from "../components/ui";
import { Complaint, Session } from "../types";
import { tokens } from "../theme/tokens";

export function SosScreen({ session, baseUrl }: { session: Session; baseUrl: string }) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [severity, setSeverity] = useState<"red" | "yellow" | "green">("red");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Emergency");

  const loadComplaints = async () => {
    try {
      const result = await api.getComplaints(baseUrl, session);
      setComplaints(result.complaints);
    } catch (error) {
      Alert.alert("SOS error", error instanceof Error ? error.message : "Unable to load complaints.");
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [baseUrl]);

  const submit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Missing details", "Please enter a title and description.");
      return;
    }

    try {
      await api.submitComplaint(baseUrl, session, {
        category,
        title: title.trim(),
        description: description.trim(),
        severity,
      });
      setTitle("");
      setDescription("");
      await loadComplaints();
      Alert.alert("SOS sent", "Your complaint has been recorded.");
    } catch (error) {
      Alert.alert("Submit failed", error instanceof Error ? error.message : "Unable to create SOS complaint.");
    }
  };

  return (
    <PageScroll>
      <NeoCard color={tokens.colors.orange} rotate="-1deg">
        <SectionTitle
          eyebrow="SOS"
          title="Urgent reporting lives here."
          subtitle="This demo version stores emergency reports locally so you can test the full flow without any backend."
        />
      </NeoCard>

      <NeoCard color={severity === "red" ? "#FECACA" : severity === "yellow" ? "#FEF08A" : "#D1FAE5"} rotate="1deg">
        <Text style={styles.blockTitle}>Create emergency report</Text>
        <View style={styles.severityRow}>
          {(["red", "yellow", "green"] as const).map((item) => (
            <NeoButton
              key={item}
              label={item.toUpperCase()}
              onPress={() => setSeverity(item)}
              fill={severity === item ? tokens.colors.ink : tokens.colors.white}
              textColor={severity === item ? tokens.colors.white : tokens.colors.ink}
            />
          ))}
        </View>
        <TextInput value={category} onChangeText={setCategory} style={styles.input} placeholder="Emergency" placeholderTextColor="#6B7280" />
        <TextInput value={title} onChangeText={setTitle} style={styles.input} placeholder="Title" placeholderTextColor="#6B7280" />
        <TextInput
          value={description}
          onChangeText={setDescription}
          multiline
          style={[styles.input, { minHeight: 120 }]}
          placeholder="Describe what happened..."
          placeholderTextColor="#6B7280"
        />
        <NeoButton label="Send SOS" onPress={submit} fill={tokens.colors.ink} textColor={tokens.colors.white} icon="alert-triangle" />
      </NeoCard>

      {complaints.slice(0, 8).map((complaint, index) => (
        <NeoCard key={complaint.id} color={tokens.colors.white} rotate={index % 2 === 0 ? "1deg" : "-1deg"}>
          <View style={styles.complaintHead}>
            <Text style={styles.rowTitle}>{complaint.title}</Text>
            <Text style={styles.status}>{complaint.status}</Text>
          </View>
          <Text style={styles.rowMeta}>{complaint.category} · {complaint.severity.toUpperCase()}</Text>
          <Text style={styles.rowBody}>{complaint.description}</Text>
        </NeoCard>
      ))}
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
  severityRow: {
    gap: 10,
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
    textAlignVertical: "top",
  },
  complaintHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
  },
  rowTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "900",
    color: tokens.colors.ink,
  },
  status: {
    fontWeight: "900",
    color: tokens.colors.orange,
    textTransform: "uppercase",
    fontSize: 12,
  },
  rowMeta: {
    fontWeight: "800",
    color: "#57534E",
    marginBottom: 8,
  },
  rowBody: {
    color: tokens.colors.ink,
    lineHeight: 21,
    fontWeight: "600",
  },
});
