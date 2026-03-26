package com.student.app.data.remote.dto

data class ComplaintsResponseDto(
    val complaints: List<ComplaintResponseDto> = emptyList(),
    val summary: ComplaintSummaryDto? = null,
)

data class ComplaintSummaryDto(
    val total: Int = 0,
    val red: Int = 0,
    val yellow: Int = 0,
    val green: Int = 0,
)

data class ComplaintResponseDto(
    val id: String,
    val studentName: String,
    val category: String,
    val title: String,
    val description: String,
    val severity: String,
    val status: String,
    val createdAt: String,
)

data class ComplaintCreateRequestDto(
    val studentName: String,
    val rollNo: String = "",
    val studentEmail: String = "",
    val category: String,
    val title: String,
    val description: String,
    val severity: String = "yellow",
)

data class ComplaintUpdateRequestDto(
    val status: String? = null,
    val assignedDepartment: String? = null,
    val assignedAdmin: String? = null,
    val escalate: Boolean = false,
)