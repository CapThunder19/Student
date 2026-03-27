import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { api } from "../lib/api";
import { NeoButton, NeoCard, PageScroll, SectionTitle } from "../components/ui";
import { CommunityMessage, Session } from "../types";
import { tokens } from "../theme/tokens";

export function CommunityScreen({ session, baseUrl }: { session: Session; baseUrl: string }) {
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [replyTarget, setReplyTarget] = useState<CommunityMessage | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMessages = async () => {
    try {
      const payload = await api.getCommunity(baseUrl);
      setMessages(payload.messages);
    } catch (error) {
      Alert.alert("Community error", error instanceof Error ? error.message : "Unable to load messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    const timer = setInterval(loadMessages, 8000);
    return () => clearInterval(timer);
  }, [baseUrl]);

  const headerCopy = useMemo(() => {
    if (loading) return "Loading live campus conversation...";
    return `${messages.length} demo messages saved locally on this device.`;
  }, [loading, messages.length]);

  const submit = async () => {
    if (!draft.trim()) return;

    try {
      await api.postCommunity(baseUrl, session, draft.trim(), replyTarget ? {
        id: replyTarget.id,
        author: replyTarget.author,
        message: replyTarget.message,
      } : undefined);
      setDraft("");
      setReplyTarget(null);
      await loadMessages();
    } catch (error) {
      Alert.alert("Message failed", error instanceof Error ? error.message : "Unable to send message.");
    }
  };

  const handleLike = async (messageId: string) => {
    try {
      await api.likeCommunity(baseUrl, session, messageId);
      await loadMessages();
    } catch (error) {
      Alert.alert("Like failed", error instanceof Error ? error.message : "Unable to react.");
    }
  };

  return (
    <PageScroll>
      <NeoCard color={tokens.colors.orange} rotate="-1deg">
        <SectionTitle eyebrow="Community" title="Campus chat, stacked like the website." subtitle={headerCopy} />
      </NeoCard>

      <NeoCard color={tokens.colors.white} rotate="1deg">
        {replyTarget ? (
          <View style={styles.replyBox}>
            <Text style={styles.replyTitle}>Replying to {replyTarget.author}</Text>
            <Text style={styles.replyText} numberOfLines={2}>{replyTarget.message}</Text>
          </View>
        ) : null}
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Write to your community..."
          placeholderTextColor="#6B7280"
          multiline
          style={[styles.input, { minHeight: 110 }]}
        />
        <NeoButton label="Send message" onPress={submit} fill={tokens.colors.ink} textColor={tokens.colors.white} icon="send" />
      </NeoCard>

      {messages.map((message, index) => {
        const mine = message.author === session.user.name;
        return (
          <NeoCard
            key={message.id}
            color={mine ? tokens.colors.lavender : tokens.colors.beige}
            rotate={index % 2 === 0 ? "1deg" : "-1deg"}
          >
            <View style={styles.messageMeta}>
              <Text style={styles.author}>{mine ? "You" : message.author}</Text>
              <Text style={styles.time}>{new Date(message.timestamp).toLocaleTimeString()}</Text>
            </View>
            {message.replyTo ? (
              <View style={styles.replyPreview}>
                <Text style={styles.replyTitle}>Reply to {message.replyTo.author}</Text>
                <Text style={styles.replyText} numberOfLines={2}>{message.replyTo.message}</Text>
              </View>
            ) : null}
            <Text style={styles.messageBody}>{message.message}</Text>
            <View style={styles.messageActions}>
              <Pressable onPress={() => setReplyTarget(message)} style={styles.actionPill}>
                <Text style={styles.actionText}>Reply</Text>
              </Pressable>
              <Pressable onPress={() => handleLike(message.id)} style={styles.actionPill}>
                <Text style={styles.actionText}>Like {message.likes > 0 ? `(${message.likes})` : ""}</Text>
              </Pressable>
            </View>
          </NeoCard>
        );
      })}
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 2,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radii.xl,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: tokens.colors.paper,
    marginBottom: 12,
    color: tokens.colors.ink,
    fontWeight: "700",
    textAlignVertical: "top",
  },
  replyBox: {
    borderWidth: 2,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radii.lg,
    backgroundColor: tokens.colors.paper,
    padding: 12,
    marginBottom: 12,
  },
  replyPreview: {
    borderWidth: 2,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radii.lg,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.7)",
    marginBottom: 12,
  },
  replyTitle: {
    fontWeight: "900",
    color: tokens.colors.ink,
    marginBottom: 4,
  },
  replyText: {
    color: "#57534E",
    fontWeight: "600",
  },
  messageMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  author: {
    fontWeight: "900",
    fontSize: 16,
    color: tokens.colors.ink,
  },
  time: {
    color: "#57534E",
    fontWeight: "700",
    fontSize: 12,
  },
  messageBody: {
    color: tokens.colors.ink,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700",
    marginBottom: 14,
  },
  messageActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionPill: {
    borderWidth: 2,
    borderColor: tokens.colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: tokens.colors.white,
  },
  actionText: {
    color: tokens.colors.ink,
    fontWeight: "900",
    fontSize: 12,
  },
});
