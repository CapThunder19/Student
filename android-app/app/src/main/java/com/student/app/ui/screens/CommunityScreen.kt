package com.student.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Reply
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.EmojiEmotions
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.Message
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.student.app.data.AppRepository
import com.student.app.data.local.SessionUser
import com.student.app.data.remote.CommunityRealtimeManager
import com.student.app.data.remote.TypingCommunityUser
import com.student.app.data.remote.dto.CommunityMessageCreateRequestDto
import com.student.app.data.remote.dto.CommunityMessageResponseDto
import com.student.app.data.remote.dto.ReplyDto
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID

@Composable
fun CommunityScreen(repository: AppRepository, modifier: Modifier = Modifier) {
    val realtime = remember { CommunityRealtimeManager() }
    val scope = rememberCoroutineScope()

    var currentUser by remember { mutableStateOf(SessionUser("", "", "")) }
    var userReady by remember { mutableStateOf(false) }
    var connected by remember { mutableStateOf(false) }
    var activeTab by remember { mutableStateOf("chat") }
    var messages by remember { mutableStateOf<List<CommunityMessageResponseDto>>(emptyList()) }
    var onlineCount by remember { mutableStateOf(0) }
    var typingUsers by remember { mutableStateOf<List<TypingCommunityUser>>(emptyList()) }
    var draft by remember { mutableStateOf("") }
    var replyTarget by remember { mutableStateOf<CommunityMessageResponseDto?>(null) }
    var loading by remember { mutableStateOf(true) }
    var sending by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var typingJob by remember { mutableStateOf<Job?>(null) }
    var showEmojiBar by remember { mutableStateOf(false) }

    val emojis = remember { listOf("😀", "😂", "😍", "🔥", "👏", "💯", "🎉", "🤝", "👀", "😅", "😎", "🙏") }

    fun mergeMessages(incoming: List<CommunityMessageResponseDto>) {
        val merged = buildMap<String, CommunityMessageResponseDto> {
            messages.forEach { put(it.id, it) }
            incoming.forEach { put(it.id, it) }
        }.values.toList()
        messages = merged.sortedBy { parseMessageTime(it.timestamp) }
    }

    LaunchedEffect(Unit) {
        loading = true
        runCatching {
            currentUser = repository.currentSessionUser()
            userReady = true
            mergeMessages(repository.fetchCommunity().messages)
        }.onFailure {
            errorMessage = it.message
        }
        loading = false
    }

    LaunchedEffect(userReady) {
        if (!userReady) return@LaunchedEffect

        realtime.connect(
            user = currentUser,
            onConnected = { connected = true },
            onDisconnected = { connected = false },
            onHistory = { mergeMessages(it) },
            onReceiveMessage = { mergeMessages(listOf(it)) },
            onOnlineCount = { onlineCount = it },
            onTypingUsers = { typingUsers = it },
            onReaction = { messageId, userId, liked, likes ->
                messages = messages.map { message ->
                    if (message.id != messageId) return@map message
                    val nextLikedBy = if (liked) {
                        (message.likedBy + userId).distinct()
                    } else {
                        message.likedBy.filterNot { it == userId }
                    }
                    message.copy(likedBy = nextLikedBy, likes = likes)
                }
            },
        )
    }

    DisposableEffect(Unit) {
        onDispose { realtime.disconnect() }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Color(0xFF111111), Color(0xFF1E2B4A), Color(0xFF0F172A))))
            .padding(16.dp),
    ) {
        HeaderSection(
            connected = connected,
            onlineCount = onlineCount,
            messageCount = messages.size,
            activeTab = activeTab,
            onChatSelected = { activeTab = "chat" },
            onUpdatesSelected = { activeTab = "updates" },
        )

        Spacer(modifier = Modifier.height(12.dp))

        if (activeTab == "updates") {
            CommunityUpdatesPanel(messages = messages, onlineCount = onlineCount)
        } else {
            CommunityChatPanel(
                loading = loading,
                errorMessage = errorMessage,
                messages = messages,
                typingUsers = typingUsers,
                currentUser = currentUser,
                draft = draft,
                replyTarget = replyTarget,
                showEmojiBar = showEmojiBar,
                emojis = emojis,
                onToggleEmojiBar = { showEmojiBar = !showEmojiBar },
                onEmojiClick = { emoji ->
                    draft += emoji
                    showEmojiBar = false
                },
                onDraftChange = { text ->
                    draft = text
                    realtime.sendTyping(currentUser.name.ifBlank { "Student" }, currentUser.email, text.isNotBlank())
                    typingJob?.cancel()
                    typingJob = scope.launch {
                        delay(1300)
                        realtime.sendTyping(currentUser.name.ifBlank { "Student" }, currentUser.email, false)
                    }
                },
                onSend = {
                    if (draft.isBlank()) return@CommunityChatPanel

                    val outgoing = CommunityMessageResponseDto(
                        id = UUID.randomUUID().toString(),
                        author = currentUser.name.ifBlank { "Anonymous" },
                        avatar = currentUser.name.firstOrNull()?.uppercaseChar()?.toString() ?: "👤",
                        message = draft.trim(),
                        replyTo = replyTarget?.let { ReplyDto(it.id, it.author, it.message) },
                        timestamp = nowIso(),
                        likes = 0,
                        likedBy = emptyList(),
                    )

                    scope.launch {
                        sending = true
                        runCatching {
                            val savedMessage = if (connected) {
                                realtime.sendMessage(outgoing)
                                outgoing
                            } else {
                                repository.postCommunityMessage(
                                    CommunityMessageCreateRequestDto(
                                        id = outgoing.id,
                                        author = outgoing.author,
                                        avatar = outgoing.avatar,
                                        message = outgoing.message,
                                        replyTo = outgoing.replyTo,
                                        timestamp = outgoing.timestamp,
                                        likes = 0,
                                        likedBy = emptyList(),
                                    )
                                ).message ?: outgoing
                            }

                            mergeMessages(listOf(savedMessage))
                            draft = ""
                            replyTarget = null
                            showEmojiBar = false
                            realtime.sendTyping(currentUser.name.ifBlank { "Student" }, currentUser.email, false)
                        }.onFailure {
                            errorMessage = it.message
                        }
                        sending = false
                    }
                },
                onReply = { replyTarget = it },
                onLike = { message ->
                    realtime.likeMessage(message.id, currentUser.email.ifBlank { currentUser.name.ifBlank { "Student" } })
                },
                onCancelReply = { replyTarget = null },
                sending = sending,
            )
        }
    }
}

@Composable
private fun HeaderSection(
    connected: Boolean,
    onlineCount: Int,
    messageCount: Int,
    activeTab: String,
    onChatSelected: () -> Unit,
    onUpdatesSelected: () -> Unit,
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Row(
            modifier = Modifier.weight(1f)
                .padding(bottom = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .background(Brush.linearGradient(listOf(Color(0xFF2563EB), Color(0xFFF43F5E)))),
                contentAlignment = Alignment.Center,
            ) {
                Icon(Icons.Filled.Message, contentDescription = null, tint = Color.White)
            }
            Column(modifier = Modifier.padding(start = 12.dp)) {
                Text("Community Chat", color = Color.White, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                Text("Connect & Share", color = Color(0xFFB8C4D8))
            }
        }

        AssistChip(
            onClick = { },
            label = { Text(if (connected) "Connected" else "Reconnecting...", color = if (connected) Color(0xFF34D399) else Color(0xFFFCA5A5)) },
        )
    }

    Spacer(modifier = Modifier.height(12.dp))

    Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
        StatPill(label = "Online", value = onlineCount.toString(), accent = Color(0xFF34D399))
        StatPill(label = "Messages", value = messageCount.toString(), accent = Color(0xFF60A5FA))
        StatPill(label = "Groups", value = "5", accent = Color(0xFFA78BFA))
    }

    Spacer(modifier = Modifier.height(14.dp))

    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        FilterChip(selected = activeTab == "chat", onClick = onChatSelected, label = { Text("Realtime Chat") })
        FilterChip(selected = activeTab == "updates", onClick = onUpdatesSelected, label = { Text("Community Updates") })
    }
}

@Composable
private fun CommunityChatPanel(
    loading: Boolean,
    errorMessage: String?,
    messages: List<CommunityMessageResponseDto>,
    typingUsers: List<TypingCommunityUser>,
    currentUser: SessionUser,
    draft: String,
    replyTarget: CommunityMessageResponseDto?,
    showEmojiBar: Boolean,
    emojis: List<String>,
    onToggleEmojiBar: () -> Unit,
    onEmojiClick: (String) -> Unit,
    onDraftChange: (String) -> Unit,
    onSend: () -> Unit,
    onReply: (CommunityMessageResponseDto) -> Unit,
    onLike: (CommunityMessageResponseDto) -> Unit,
    onCancelReply: () -> Unit,
    sending: Boolean,
) {
    Card(
        modifier = Modifier.fillMaxSize()
            .navigationBarsPadding()
            .imePadding(),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A)),
        shape = RoundedCornerShape(24.dp),
    ) {
        Column(modifier = Modifier.fillMaxSize().padding(14.dp)) {
            if (errorMessage != null) {
                Text(errorMessage, color = Color(0xFFFCA5A5), modifier = Modifier.padding(bottom = 8.dp))
            }

            if (loading && messages.isEmpty()) {
                Box(modifier = Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            } else {
                if (typingUsers.isNotEmpty()) {
                    Text(
                        text = typingUsers.joinToString { it.name } + " typing...",
                        color = Color(0xFF93C5FD),
                        modifier = Modifier.padding(bottom = 8.dp),
                    )
                }

                LazyColumn(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    reverseLayout = false,
                ) {
                    items(messages, key = { it.id }) { message ->
                        CommunityMessageCard(
                            message = message,
                            isMe = message.author == currentUser.name,
                            onReply = { onReply(message) },
                            onLike = { onLike(message) },
                        )
                    }
                }
            }

            if (replyTarget != null) {
                ReplyPreview(replyTarget = replyTarget, onCancel = onCancelReply)
            }

            if (showEmojiBar) {
                EmojiBar(emojis = emojis, onEmojiClick = onEmojiClick)
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.Bottom,
            ) {
                IconButton(onClick = onToggleEmojiBar) {
                    Icon(Icons.Filled.EmojiEmotions, contentDescription = "Emoji")
                }

                OutlinedTextField(
                    value = draft,
                    onValueChange = onDraftChange,
                    modifier = Modifier.weight(1f),
                    placeholder = { Text("Write a message...") },
                    shape = RoundedCornerShape(20.dp),
                    maxLines = 4,
                )

                Button(
                    onClick = onSend,
                    enabled = draft.isNotBlank() && !sending,
                ) {
                    Icon(Icons.AutoMirrored.Filled.Send, contentDescription = null)
                }
            }
        }
    }
}

@Composable
private fun CommunityMessageCard(
    message: CommunityMessageResponseDto,
    isMe: Boolean,
    onReply: () -> Unit,
    onLike: () -> Unit,
) {
    val bubbleBrush = if (isMe) {
        Brush.horizontalGradient(listOf(Color(0xFF2563EB), Color(0xFF4F46E5)))
    } else {
        Brush.horizontalGradient(listOf(Color(0xFF1E293B), Color(0xFF111827)))
    }

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (isMe) Arrangement.End else Arrangement.Start,
    ) {
        Column(horizontalAlignment = if (isMe) Alignment.End else Alignment.Start) {
            Text(
                text = if (isMe) "You" else message.author,
                color = Color(0xFFCBD5E1),
                style = MaterialTheme.typography.labelSmall,
                modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp),
            )

            Card(
                colors = CardDefaults.cardColors(containerColor = Color.Transparent),
                shape = RoundedCornerShape(18.dp),
                modifier = Modifier
                    .border(1.dp, Color.White.copy(alpha = 0.08f), RoundedCornerShape(18.dp))
                    .widthIn(max = 290.dp),
            ) {
                Column(
                    modifier = Modifier
                        .background(bubbleBrush)
                        .padding(horizontal = 12.dp, vertical = 10.dp),
                ) {
                    if (message.replyTo != null) {
                        Card(
                            colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.08f)),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.padding(bottom = 8.dp),
                        ) {
                            Column(modifier = Modifier.padding(8.dp)) {
                                Text("Reply to ${message.replyTo.author}", color = Color(0xFFBFDBFE), fontWeight = FontWeight.SemiBold)
                                Text(message.replyTo.message, color = Color(0xFFE2E8F0), maxLines = 1)
                            }
                        }
                    }

                    Text(
                        text = message.message,
                        color = Color.White,
                        maxLines = 6,
                        softWrap = true,
                        style = MaterialTheme.typography.bodyMedium,
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text(
                            text = formatTimestamp(message.timestamp),
                            color = Color(0xFFBFDBFE),
                            style = MaterialTheme.typography.labelSmall,
                        )

                        if (message.likes > 0) {
                            Text(
                                text = "${message.likes} likes",
                                color = Color(0xFFF8FAFC),
                                style = MaterialTheme.typography.labelSmall,
                            )
                        }
                    }
                }
            }

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.padding(top = 4.dp)) {
                AssistChip(
                    onClick = onLike,
                    label = { Text(if (message.likes > 0) message.likes.toString() else "Like") },
                    leadingIcon = {
                        Icon(
                            imageVector = if (message.likes > 0) Icons.Filled.Favorite else Icons.Filled.FavoriteBorder,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp),
                            tint = if (message.likes > 0) Color(0xFFF87171) else Color.Unspecified,
                        )
                    },
                )
                AssistChip(
                    onClick = onReply,
                    label = { Text("Reply") },
                    leadingIcon = {
                        Icon(Icons.AutoMirrored.Filled.Reply, contentDescription = null, modifier = Modifier.size(16.dp))
                    },
                )
            }
        }
    }
}

@Composable
private fun ReplyPreview(replyTarget: CommunityMessageResponseDto, onCancel: () -> Unit) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1F2937)),
        shape = RoundedCornerShape(16.dp),
        modifier = Modifier.padding(top = 8.dp, bottom = 8.dp),
    ) {
        Row(
            modifier = Modifier.padding(12.dp).fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text("Replying to ${replyTarget.author}", color = Color(0xFF93C5FD), fontWeight = FontWeight.SemiBold)
                Text(replyTarget.message, color = Color(0xFFD1D5DB), maxLines = 1)
            }
            AssistChip(onClick = onCancel, label = { Text("Cancel") })
        }
    }
}

@Composable
private fun EmojiBar(emojis: List<String>, onEmojiClick: (String) -> Unit) {
    Row(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.padding(vertical = 8.dp)) {
        emojis.forEach { emoji ->
            AssistChip(onClick = { onEmojiClick(emoji) }, label = { Text(emoji) })
        }
    }
}

@Composable
private fun CommunityUpdatesPanel(messages: List<CommunityMessageResponseDto>, onlineCount: Int) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxSize()) {
        Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF0F3460)), shape = RoundedCornerShape(20.dp)) {
            Column(modifier = Modifier.padding(18.dp)) {
                Text("Community Updates", color = Color.White, fontWeight = FontWeight.Bold)
                Text("Realtime chat is available in the chat tab.", color = Color(0xFFD6E4FF))
                Spacer(modifier = Modifier.height(10.dp))
                Text("Online now: $onlineCount", color = Color(0xFFD6E4FF))
                Text("Total messages: ${messages.size}", color = Color(0xFFD6E4FF))
            }
        }

        Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF1F2937)), shape = RoundedCornerShape(18.dp)) {
            Column(modifier = Modifier.padding(18.dp)) {
                Text("Recent posts", color = Color.White, fontWeight = FontWeight.SemiBold)
                Spacer(modifier = Modifier.height(8.dp))
                messages.take(5).forEach { message ->
                    Text("• ${message.author}: ${message.message}", color = Color(0xFFE5E7EB), maxLines = 1)
                }
            }
        }
    }
}

@Composable
private fun RowScope.StatPill(label: String, value: String, accent: Color) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color(0xFF101827)),
        shape = RoundedCornerShape(16.dp),
        modifier = Modifier.weight(1f),
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(label, color = Color(0xFF94A3B8), style = MaterialTheme.typography.labelSmall)
            Text(value, color = accent, fontWeight = FontWeight.Bold)
        }
    }
}

private fun parseMessageTime(timestamp: String): Long {
    return runCatching {
        SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSX", Locale.getDefault()).parse(timestamp)?.time
            ?: SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssX", Locale.getDefault()).parse(timestamp)?.time
            ?: Date().time
    }.getOrDefault(Date().time)
}

private fun nowIso(): String = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX", Locale.getDefault()).format(Date())

private fun formatTimestamp(timestamp: String): String {
    return runCatching {
        val date = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSX", Locale.getDefault()).parse(timestamp)
            ?: SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssX", Locale.getDefault()).parse(timestamp)
            ?: Date()
        SimpleDateFormat("dd MMM, HH:mm", Locale.getDefault()).format(date)
    }.getOrElse { timestamp }
}