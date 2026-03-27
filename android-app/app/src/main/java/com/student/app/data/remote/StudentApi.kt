package com.student.app.data.remote

import com.student.app.data.remote.dto.BudgetResponseDto
import com.student.app.data.remote.dto.CommunityMessageCreateResponseDto
import com.student.app.data.remote.dto.ComplaintCreateRequestDto
import com.student.app.data.remote.dto.ComplaintsResponseDto
import com.student.app.data.remote.dto.ComplaintUpdateRequestDto
import com.student.app.data.remote.dto.CommunityMessageCreateRequestDto
import com.student.app.data.remote.dto.CommunityMessageReactionRequestDto
import com.student.app.data.remote.dto.CommunityResponseDto
import com.student.app.data.remote.dto.LoginRequestDto
import com.student.app.data.remote.dto.LoginResponseDto
import com.student.app.data.remote.dto.MobileProfileResponseDto
import com.student.app.data.remote.dto.ProfileUpdateRequestDto
import com.student.app.data.remote.dto.SharedExpenseCreateRequestDto
import com.student.app.data.remote.dto.SignupRequestDto
import com.student.app.data.remote.dto.TransactionCreateRequestDto
import com.student.app.data.remote.dto.BudgetTargetUpdateRequestDto
import com.student.app.data.remote.dto.BudgetActionResponseDto
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PATCH
import retrofit2.http.PUT
import retrofit2.http.Path

interface StudentApi {
    @POST("api/auth/mobile/login")
    suspend fun login(@Body body: LoginRequestDto): LoginResponseDto

    @POST("api/auth/mobile/signup")
    suspend fun signup(@Body body: SignupRequestDto): LoginResponseDto

    @GET("api/community/messages")
    suspend fun getCommunityMessages(): CommunityResponseDto

    @POST("api/community/messages")
    suspend fun postCommunityMessage(@Body body: CommunityMessageCreateRequestDto): CommunityMessageCreateResponseDto

    @PATCH("api/community/messages")
    suspend fun toggleCommunityReaction(@Body body: CommunityMessageReactionRequestDto): BudgetActionResponseDto

    @GET("api/budget")
    suspend fun getBudget(): BudgetResponseDto

    @POST("api/budget/target")
    suspend fun updateBudgetTarget(@Body body: BudgetTargetUpdateRequestDto): BudgetActionResponseDto

    @POST("api/budget/transaction")
    suspend fun addTransaction(@Body body: TransactionCreateRequestDto): BudgetActionResponseDto

    @POST("api/budget/shared")
    suspend fun addSharedExpense(@Body body: SharedExpenseCreateRequestDto): BudgetActionResponseDto

    @GET("api/complaints")
    suspend fun getComplaints(): ComplaintsResponseDto

    @POST("api/complaints")
    suspend fun createComplaint(@Body body: ComplaintCreateRequestDto): BudgetActionResponseDto

    @PATCH("api/complaints/{id}")
    suspend fun updateComplaint(@Path("id") id: String, @Body body: ComplaintUpdateRequestDto): BudgetActionResponseDto

    @GET("api/user/profile")
    suspend fun getProfile(): MobileProfileResponseDto

    @PUT("api/user/profile")
    suspend fun updateProfile(@Body body: ProfileUpdateRequestDto): MobileProfileResponseDto
}