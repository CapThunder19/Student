package com.student.app.data

import com.student.app.data.local.SessionStore
import com.student.app.data.local.SessionUser
import com.student.app.data.remote.StudentApi
import com.student.app.data.remote.dto.BudgetResponseDto
import com.student.app.data.remote.dto.BudgetTargetUpdateRequestDto
import com.student.app.data.remote.dto.BudgetActionResponseDto
import com.student.app.data.remote.dto.ComplaintCreateRequestDto
import com.student.app.data.remote.dto.ComplaintsResponseDto
import com.student.app.data.remote.dto.ComplaintResponseDto
import com.student.app.data.remote.dto.ComplaintUpdateRequestDto
import com.student.app.data.remote.dto.CommunityMessageCreateResponseDto
import com.student.app.data.remote.dto.CommunityResponseDto
import com.student.app.data.remote.dto.CommunityMessageResponseDto
import com.student.app.data.remote.dto.CommunityMessageCreateRequestDto
import com.student.app.data.remote.dto.CommunityMessageReactionRequestDto
import com.student.app.data.remote.dto.LoginRequestDto
import com.student.app.data.remote.dto.LoginResponseDto
import com.student.app.data.remote.dto.MobileProfileResponseDto
import com.student.app.data.remote.dto.ProfileUpdateRequestDto
import com.student.app.data.remote.dto.SharedExpenseCreateRequestDto
import com.student.app.data.remote.dto.SignupRequestDto
import com.student.app.data.remote.dto.TransactionCreateRequestDto

class AppRepository(
    private val api: StudentApi,
    private val sessionStore: SessionStore,
) {
    suspend fun login(email: String, password: String): LoginResponseDto {
        val response = api.login(LoginRequestDto(email = email, password = password))
        val token = response.token.orEmpty()
        val user = response.user

        if (token.isNotBlank() && user != null) {
            sessionStore.saveSession(
                token = token,
                user = SessionUser(
                    id = user.id.orEmpty(),
                    name = user.name.orEmpty(),
                    email = user.email.orEmpty(),
                ),
            )
        }

        return response
    }

    suspend fun signup(name: String, email: String, password: String): LoginResponseDto {
        val response = api.signup(SignupRequestDto(name = name, email = email, password = password))
        val token = response.token.orEmpty()
        val user = response.user

        if (token.isNotBlank() && user != null) {
            sessionStore.saveSession(
                token = token,
                user = SessionUser(
                    id = user.id.orEmpty(),
                    name = user.name.orEmpty(),
                    email = user.email.orEmpty(),
                ),
            )
        }

        return response
    }

    suspend fun fetchCommunity(): CommunityResponseDto {
        return api.getCommunityMessages()
    }

    suspend fun postCommunityMessage(message: CommunityMessageCreateRequestDto): CommunityMessageCreateResponseDto {
        return api.postCommunityMessage(message)
    }

    suspend fun toggleCommunityReaction(messageId: String): BudgetActionResponseDto {
        return api.toggleCommunityReaction(CommunityMessageReactionRequestDto(messageId = messageId))
    }

    suspend fun fetchBudget(): BudgetResponseDto {
        return api.getBudget()
    }

    suspend fun updateBudgetTarget(monthlyTarget: Double): BudgetActionResponseDto {
        return api.updateBudgetTarget(BudgetTargetUpdateRequestDto(monthlyTarget = monthlyTarget))
    }

    suspend fun addTransaction(request: TransactionCreateRequestDto): BudgetActionResponseDto {
        return api.addTransaction(request)
    }

    suspend fun addSharedExpense(request: SharedExpenseCreateRequestDto): BudgetActionResponseDto {
        return api.addSharedExpense(request)
    }

    suspend fun fetchComplaints(): ComplaintsResponseDto {
        return api.getComplaints()
    }

    suspend fun createComplaint(request: ComplaintCreateRequestDto): BudgetActionResponseDto {
        return api.createComplaint(request)
    }

    suspend fun updateComplaint(id: String, request: ComplaintUpdateRequestDto): BudgetActionResponseDto {
        return api.updateComplaint(id, request)
    }

    suspend fun fetchProfile(): MobileProfileResponseDto {
        return api.getProfile()
    }

    suspend fun updateProfile(request: ProfileUpdateRequestDto): MobileProfileResponseDto {
        return api.updateProfile(request)
    }

    suspend fun logout() {
        sessionStore.clear()
    }

    suspend fun currentSessionUser(): SessionUser = sessionStore.currentUser()
}