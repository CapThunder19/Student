package com.student.app.data.remote

import com.student.app.data.remote.dto.*
import kotlinx.coroutines.delay
import java.text.SimpleDateFormat
import java.util.*

class MockStudentApi : StudentApi {
    private val dateTimeFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US)
    private val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.US)

    private var messages = mutableListOf(
        CommunityMessageResponseDto(
            id = "1",
            author = "Anand",
            avatar = "👤",
            message = "Welcome to the Student App!",
            timestamp = "2023-10-27T10:00:00Z",
            likes = 5,
            likedBy = listOf("2")
        ),
        CommunityMessageResponseDto(
            id = "2",
            author = "System",
            avatar = "🤖",
            message = "This is demo data running locally on your phone.",
            timestamp = "2023-10-27T11:00:00Z",
            likes = 12,
            likedBy = listOf("1", "3")
        )
    )

    private var complaints = mutableListOf(
        ComplaintResponseDto(
            id = "1",
            studentName = "Demo Student",
            category = "Maintenance",
            title = "No Water",
            description = "Water cut in block A",
            severity = "red",
            status = "Pending",
            createdAt = "2023-10-27T08:00:00Z"
        )
    )

    private var currentBudget = BudgetDto(monthlyTarget = 3000.0, daysRemaining = 15)
    private var transactions = mutableListOf(
        TransactionDto(id = "1", desc = "Lunch", amount = 50.0, category = "Food", type = "Expense", date = "2023-10-27"),
        TransactionDto(id = "2", desc = "Bus", amount = 20.0, category = "Transport", type = "Expense", date = "2023-10-26")
    )
    private var sharedExpenses = mutableListOf<SharedExpenseDto>()

    override suspend fun login(body: LoginRequestDto): LoginResponseDto {
        delay(300)
        return LoginResponseDto(
            success = true,
            token = "mock-token",
            user = UserDto(id = "1", name = "Demo Student", email = body.email)
        )
    }

    override suspend fun signup(body: SignupRequestDto): LoginResponseDto {
        delay(300)
        return LoginResponseDto(
            success = true,
            token = "mock-token",
            user = UserDto(id = "1", name = body.name, email = body.email)
        )
    }

    override suspend fun getCommunityMessages(): CommunityResponseDto {
        delay(200)
        return CommunityResponseDto(messages = messages.toList().reversed())
    }

    override suspend fun postCommunityMessage(body: CommunityMessageCreateRequestDto): CommunityMessageCreateResponseDto {
        delay(300)
        val now = dateTimeFormat.format(Date())
        val saved = CommunityMessageResponseDto(
            id = body.id,
            author = body.author,
            avatar = body.avatar,
            message = body.message,
            timestamp = now,
            likes = 0,
            likedBy = emptyList()
        )
        messages.add(saved)
        return CommunityMessageCreateResponseDto(success = true, message = saved)
    }

    override suspend fun toggleCommunityReaction(body: CommunityMessageReactionRequestDto): BudgetActionResponseDto {
        delay(100)
        val index = messages.indexOfFirst { it.id == body.messageId }
        if (index != -1) {
            val msg = messages[index]
            val alreadyLiked = msg.likedBy.contains("1")
            val newLikedBy = if (alreadyLiked) msg.likedBy - "1" else msg.likedBy + "1"
            messages[index] = msg.copy(
                likes = if (alreadyLiked) msg.likes - 1 else msg.likes + 1,
                likedBy = newLikedBy
            )
        }
        return BudgetActionResponseDto(success = true)
    }

    override suspend fun getBudget(): BudgetResponseDto {
        delay(200)
        return BudgetResponseDto(
            success = true,
            budget = currentBudget,
            transactions = transactions.toList().reversed(),
            sharedExpenses = sharedExpenses.toList().reversed()
        )
    }

    override suspend fun updateBudgetTarget(body: BudgetTargetUpdateRequestDto): BudgetActionResponseDto {
        delay(300)
        currentBudget = currentBudget.copy(monthlyTarget = body.monthlyTarget)
        return BudgetActionResponseDto(success = true)
    }

    override suspend fun addTransaction(body: TransactionCreateRequestDto): BudgetActionResponseDto {
        delay(300)
        transactions.add(
            TransactionDto(
                id = System.currentTimeMillis().toString(),
                desc = body.desc,
                amount = body.amount,
                category = body.category,
                type = body.type,
                date = dateFormat.format(Date())
            )
        )
        return BudgetActionResponseDto(success = true)
    }

    override suspend fun addSharedExpense(body: SharedExpenseCreateRequestDto): BudgetActionResponseDto {
        delay(300)
        sharedExpenses.add(
            SharedExpenseDto(
                id = System.currentTimeMillis().toString(),
                desc = body.desc,
                amount = body.amount,
                paidBy = body.paidBy,
                splitWith = body.splitWith,
                splitType = body.splitType,
                impactAmount = body.impactAmount,
                date = dateFormat.format(Date())
            )
        )
        return BudgetActionResponseDto(success = true)
    }

    override suspend fun getComplaints(): ComplaintsResponseDto {
        delay(200)
        return ComplaintsResponseDto(
            complaints = complaints.toList().reversed(),
            summary = ComplaintSummaryDto(
                total = complaints.size,
                red = complaints.count { it.severity == "red" },
                yellow = complaints.count { it.severity == "yellow" },
                green = complaints.count { it.severity == "green" }
            )
        )
    }

    override suspend fun createComplaint(body: ComplaintCreateRequestDto): BudgetActionResponseDto {
        delay(300)
        complaints.add(
            ComplaintResponseDto(
                id = System.currentTimeMillis().toString(),
                studentName = body.studentName,
                category = body.category,
                title = body.title,
                description = body.description,
                severity = body.severity,
                status = "Pending",
                createdAt = dateTimeFormat.format(Date())
            )
        )
        return BudgetActionResponseDto(success = true)
    }

    override suspend fun updateComplaint(id: String, body: ComplaintUpdateRequestDto): BudgetActionResponseDto {
        delay(200)
        val index = complaints.indexOfFirst { it.id == id }
        if (index != -1) {
            val current = complaints[index]
            complaints[index] = current.copy(
                status = body.status ?: if (body.escalate) "Escalated" else current.status,
            )
        }
        return BudgetActionResponseDto(success = true)
    }

    override suspend fun getProfile(): MobileProfileResponseDto {
        delay(200)
        return MobileProfileResponseDto(
            _id = "1",
            name = "Demo Student",
            email = "demo@student.com",
            major = "Computer Science",
            year = "3rd Year",
            phone = "1234567890",
            location = "Hostel A",
            gpa = "3.8"
        )
    }

    override suspend fun updateProfile(body: ProfileUpdateRequestDto): MobileProfileResponseDto {
        return getProfile()
    }
}
