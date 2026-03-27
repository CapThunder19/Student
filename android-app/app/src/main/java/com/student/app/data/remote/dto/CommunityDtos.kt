package com.student.app.data.remote.dto

data class CommunityResponseDto(
    val messages: List<CommunityMessageResponseDto> = emptyList(),
)

data class CommunityMessageCreateResponseDto(
    val success: Boolean = false,
    val message: CommunityMessageResponseDto? = null,
)

data class CommunityMessageCreateRequestDto(
    val id: String,
    val author: String,
    val avatar: String = "👤",
    val message: String,
    val timestamp: String,
    val replyTo: ReplyDto? = null,
    val likes: Int = 0,
    val likedBy: List<String> = emptyList(),
)

data class CommunityMessageReactionRequestDto(
    val messageId: String,
)

data class CommunityMessageResponseDto(
    val id: String,
    val author: String,
    val avatar: String,
    val message: String,
    val timestamp: String,
    val likes: Int = 0,
    val likedBy: List<String> = emptyList(),
    val replyTo: ReplyDto? = null,
)

data class ReplyDto(
    val id: String,
    val author: String,
    val message: String,
)