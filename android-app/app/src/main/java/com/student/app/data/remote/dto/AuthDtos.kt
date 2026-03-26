package com.student.app.data.remote.dto

data class LoginRequestDto(
    val email: String,
    val password: String,
)

data class SignupRequestDto(
    val name: String,
    val email: String,
    val password: String,
)

data class LoginResponseDto(
    val success: Boolean? = null,
    val message: String? = null,
    val token: String? = null,
    val user: UserDto? = null,
)

data class UserDto(
    val id: String? = null,
    val name: String? = null,
    val email: String? = null,
    val rollNo: String? = null,
)

data class MobileProfileResponseDto(
    val _id: String? = null,
    val name: String? = null,
    val email: String? = null,
    val major: String? = null,
    val year: String? = null,
    val phone: String? = null,
    val location: String? = null,
    val gpa: String? = null,
    val profilePhoto: String? = null,
    val coursesEnrolled: Int? = 0,
    val achievements: Int? = 0,
    val followers: Int? = 0,
)

data class ProfileUpdateRequestDto(
    val name: String? = null,
    val major: String? = null,
    val year: String? = null,
    val phone: String? = null,
    val location: String? = null,
    val gpa: String? = null,
    val profilePhoto: String? = null,
)