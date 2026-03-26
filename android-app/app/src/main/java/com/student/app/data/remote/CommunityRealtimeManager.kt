package com.student.app.data.remote

import com.student.app.BuildConfig
import com.student.app.data.local.SessionUser
import com.student.app.data.remote.dto.CommunityMessageResponseDto
import com.student.app.data.remote.dto.ReplyDto
import io.socket.client.IO
import io.socket.client.Socket
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID

data class TypingCommunityUser(
    val typingId: String,
    val name: String,
    val userId: String,
)

class CommunityRealtimeManager {
    private var socket: Socket? = null

    fun connect(
        user: SessionUser,
        onConnected: () -> Unit,
        onDisconnected: () -> Unit,
        onHistory: (List<CommunityMessageResponseDto>) -> Unit,
        onReceiveMessage: (CommunityMessageResponseDto) -> Unit,
        onOnlineCount: (Int) -> Unit,
        onTypingUsers: (List<TypingCommunityUser>) -> Unit,
        onReaction: (messageId: String, userId: String, liked: Boolean, likes: Int) -> Unit,
    ) {
        if (socket != null) return

        val options = IO.Options.builder()
            .setPath("/api/socket_io")
            .setTransports(arrayOf("websocket"))
            .setForceNew(true)
            .setReconnection(true)
            .setReconnectionAttempts(5)
            .build()

        socket = IO.socket(BuildConfig.API_BASE_URL, options).apply {
            on(Socket.EVENT_CONNECT) {
                onConnected()
                joinCommunity(user)
            }

            on(Socket.EVENT_DISCONNECT) {
                onDisconnected()
            }

            on("chat_history") { args ->
                onHistory(args.firstOrNull().toCommunityMessages())
            }

            on("receive_message") { args ->
                args.firstOrNull().toCommunityMessage()?.let(onReceiveMessage)
            }

            on("online_count") { args ->
                onOnlineCount(args.firstOrNull().toIntValue())
            }

            on("typing_users") { args ->
                onTypingUsers(args.firstOrNull().toTypingUsers())
            }

            on("message_reaction") { args ->
                val payload = args.firstOrNull().toJsonObject()
                if (payload != null) {
                    onReaction(
                        payload.optString("messageId"),
                        payload.optString("userId"),
                        payload.optBoolean("liked"),
                        payload.optInt("likes"),
                    )
                }
            }

            connect()
        }
    }

    fun disconnect() {
        socket?.let { currentSocket ->
            currentSocket.off()
            currentSocket.disconnect()
        }
        socket = null
    }

    fun sendMessage(message: CommunityMessageResponseDto) {
        socket?.emit("send_message", message.toJsonObject())
    }

    fun sendTyping(name: String, userId: String, isTyping: Boolean) {
        socket?.emit(
            "typing",
            JSONObject()
                .put("name", name)
                .put("userId", userId)
                .put("isTyping", isTyping),
        )
    }

    fun likeMessage(messageId: String, userId: String) {
        socket?.emit(
            "like_message",
            JSONObject()
                .put("messageId", messageId)
                .put("userId", userId),
        )
    }

    private fun joinCommunity(user: SessionUser) {
        socket?.emit(
            "join_community",
            JSONObject()
                .put("name", user.name.ifBlank { "Student" })
                .put("email", user.email)
                .put("image", ""),
        )
    }
}

private fun Any?.toCommunityMessages(): List<CommunityMessageResponseDto> {
    return when (this) {
        is JSONArray -> (0 until length()).mapNotNull { get(it).toCommunityMessage() }
        is Collection<*> -> mapNotNull { it.toCommunityMessage() }
        is Array<*> -> mapNotNull { it.toCommunityMessage() }
        else -> emptyList()
    }
}

private fun Any?.toCommunityMessage(): CommunityMessageResponseDto? {
    val json = toJsonObject() ?: return null
    return CommunityMessageResponseDto(
        id = json.optString("id", UUID.randomUUID().toString()),
        author = json.optString("author", "Anonymous"),
        avatar = json.optString("avatar", "👤"),
        message = json.optString("message", ""),
        timestamp = json.optString("timestamp", ""),
        likes = json.optInt("likes", 0),
        likedBy = json.optJSONArray("likedBy").toStringList(),
        replyTo = json.optJSONObject("replyTo")?.let { reply ->
            ReplyDto(
                id = reply.optString("id", ""),
                author = reply.optString("author", "Anonymous"),
                message = reply.optString("message", ""),
            )
        },
    )
}

private fun Any?.toTypingUsers(): List<TypingCommunityUser> {
    return when (this) {
        is JSONArray -> (0 until length()).mapNotNull { index ->
            getJSONObject(index).let { json ->
                TypingCommunityUser(
                    typingId = json.optString("typingId", ""),
                    name = json.optString("name", "Someone"),
                    userId = json.optString("userId", ""),
                )
            }
        }
        else -> emptyList()
    }
}

private fun Any?.toJsonObject(): JSONObject? {
    return when (this) {
        is JSONObject -> this
        is String -> runCatching { JSONObject(this) }.getOrNull()
        is Map<*, *> -> JSONObject(this)
        else -> null
    }
}

private fun JSONArray?.toStringList(): List<String> {
    if (this == null) return emptyList()
    return (0 until length()).mapNotNull { index -> optString(index).takeIf { it.isNotBlank() } }
}

private fun Any?.toIntValue(): Int {
    return when (this) {
        is Number -> toInt()
        is String -> toIntOrNull() ?: 0
        else -> 0
    }
}
