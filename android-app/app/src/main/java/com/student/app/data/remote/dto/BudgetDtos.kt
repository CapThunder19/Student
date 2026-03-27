package com.student.app.data.remote.dto

data class BudgetResponseDto(
    val success: Boolean = false,
    val budget: BudgetDto? = null,
    val transactions: List<TransactionDto> = emptyList(),
    val sharedExpenses: List<SharedExpenseDto> = emptyList(),
)

data class BudgetActionResponseDto(
    val success: Boolean = false,
    val message: String? = null,
)

data class BudgetTargetUpdateRequestDto(
    val monthlyTarget: Double,
)

data class TransactionCreateRequestDto(
    val desc: String,
    val amount: Double,
    val category: String,
    val type: String,
)

data class SharedExpenseCreateRequestDto(
    val desc: String,
    val amount: Double,
    val paidBy: String,
    val splitWith: String,
    val splitType: String = "Equally",
    val impactAmount: Double,
)

data class BudgetDto(
    val monthlyTarget: Double? = null,
    val daysRemaining: Int? = null,
)

data class TransactionDto(
    val id: String? = null,
    val desc: String? = null,
    val amount: Double? = null,
    val category: String? = null,
    val type: String? = null,
    val date: String? = null,
)

data class SharedExpenseDto(
    val id: String? = null,
    val desc: String? = null,
    val amount: Double? = null,
    val paidBy: String? = null,
    val splitWith: String? = null,
    val splitType: String? = null,
    val impactAmount: Double? = null,
    val date: String? = null,
)