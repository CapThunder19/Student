package com.student.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.student.app.data.AppRepository
import com.student.app.data.remote.dto.BudgetResponseDto
import com.student.app.data.remote.dto.SharedExpenseCreateRequestDto
import com.student.app.data.remote.dto.TransactionCreateRequestDto
import kotlinx.coroutines.launch
import kotlin.math.abs

@Composable
fun BudgetScreen(repository: AppRepository, modifier: Modifier = Modifier) {
    val scope = rememberCoroutineScope()

    var budgetResponse by remember { mutableStateOf<BudgetResponseDto?>(null) }
    var loading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    var monthlyTarget by remember { mutableStateOf("") }
    var transactionDesc by remember { mutableStateOf("") }
    var transactionAmount by remember { mutableStateOf("") }
    var transactionCategory by remember { mutableStateOf("Food") }
    var transactionType by remember { mutableStateOf("expense") }

    var sharedDesc by remember { mutableStateOf("") }
    var sharedAmount by remember { mutableStateOf("") }
    var sharedPaidBy by remember { mutableStateOf("You") }
    var sharedSplitWith by remember { mutableStateOf("") }
    var sharedImpactAmount by remember { mutableStateOf("") }

    fun refresh() {
        scope.launch {
            loading = true
            runCatching {
                val response = repository.fetchBudget()
                budgetResponse = response
                monthlyTarget = response.budget?.monthlyTarget?.toString().orEmpty()
            }.onFailure {
                errorMessage = it.message
            }
            loading = false
        }
    }

    LaunchedEffect(Unit) { refresh() }

    val budget = budgetResponse?.budget
    val transactions = budgetResponse?.transactions.orEmpty()
    val sharedExpenses = budgetResponse?.sharedExpenses.orEmpty()
    val totalSpent = transactions.filter { it.type != "income" }.sumOf { it.amount ?: 0.0 } +
            sharedExpenses.sumOf { abs(it.impactAmount ?: 0.0) }
    val targetValue = budget?.monthlyTarget ?: monthlyTarget.toDoubleOrNull() ?: 0.0
    val remaining = (targetValue - totalSpent).coerceAtLeast(0.0)
    val progress = if (targetValue > 0) ((totalSpent / targetValue).coerceIn(0.0, 1.0)).toFloat() else 0f

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Color(0xFF101827), Color(0xFF111111), Color(0xFF1E293B))))
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        Text("Budget", color = Color.White, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.headlineLarge)
        Text("Track your spending, target, and shared expenses in one place.", color = Color(0xFFB8C4D8))

        if (loading) {
            CircularProgressIndicator()
        }
        if (!errorMessage.isNullOrBlank()) {
            Text(errorMessage ?: "", color = Color(0xFFFCA5A5))
        }

        Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF0F3460)), shape = RoundedCornerShape(22.dp)) {
            Column(modifier = Modifier.padding(18.dp)) {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                    SummaryCard(label = "Target", value = "₹${targetValue.toInt()}", accent = Color(0xFF93C5FD))
                    SummaryCard(label = "Spent", value = "₹${totalSpent.toInt()}", accent = Color(0xFFFBBF24))
                }
                Spacer(modifier = Modifier.height(12.dp))
                LinearProgressIndicator(
                    progress = { progress },
                    modifier = Modifier.fillMaxWidth().height(10.dp),
                    color = Color(0xFF34D399),
                    trackColor = Color.White.copy(alpha = 0.08f),
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text("Remaining: ₹${remaining.toInt()}", color = Color(0xFFD6E4FF))
                Text("${budget?.daysRemaining ?: 0} days remaining", color = Color(0xFFD6E4FF))
            }
        }

        BudgetSectionCard(title = "Update monthly target") {
            OutlinedTextField(
                value = monthlyTarget,
                onValueChange = { monthlyTarget = it },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Monthly target") },
            )
            Button(
                onClick = {
                    scope.launch {
                        runCatching {
                            repository.updateBudgetTarget(monthlyTarget.toDouble())
                            refresh()
                        }.onFailure {
                            errorMessage = it.message
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text("Save target")
            }
        }

        BudgetSectionCard(title = "Add transaction") {
            OutlinedTextField(value = transactionDesc, onValueChange = { transactionDesc = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Description") })
            OutlinedTextField(value = transactionAmount, onValueChange = { transactionAmount = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Amount") })
            OutlinedTextField(value = transactionCategory, onValueChange = { transactionCategory = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Category") })
            OutlinedTextField(value = transactionType, onValueChange = { transactionType = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Type: expense/income") })
            Button(
                onClick = {
                    scope.launch {
                        runCatching {
                            repository.addTransaction(
                                TransactionCreateRequestDto(
                                    desc = transactionDesc,
                                    amount = transactionAmount.toDouble(),
                                    category = transactionCategory,
                                    type = transactionType,
                                )
                            )
                            transactionDesc = ""
                            transactionAmount = ""
                            transactionCategory = "Food"
                            transactionType = "expense"
                            refresh()
                        }.onFailure {
                            errorMessage = it.message
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text("Add transaction")
            }
        }

        BudgetSectionCard(title = "Add shared expense") {
            OutlinedTextField(value = sharedDesc, onValueChange = { sharedDesc = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Description") })
            OutlinedTextField(value = sharedAmount, onValueChange = { sharedAmount = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Amount") })
            OutlinedTextField(value = sharedPaidBy, onValueChange = { sharedPaidBy = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Paid by") })
            OutlinedTextField(value = sharedSplitWith, onValueChange = { sharedSplitWith = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Split with") })
            OutlinedTextField(value = sharedImpactAmount, onValueChange = { sharedImpactAmount = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Impact amount") })
            Button(
                onClick = {
                    scope.launch {
                        runCatching {
                            repository.addSharedExpense(
                                SharedExpenseCreateRequestDto(
                                    desc = sharedDesc,
                                    amount = sharedAmount.toDouble(),
                                    paidBy = sharedPaidBy,
                                    splitWith = sharedSplitWith,
                                    impactAmount = sharedImpactAmount.toDouble(),
                                )
                            )
                            sharedDesc = ""
                            sharedAmount = ""
                            sharedPaidBy = "You"
                            sharedSplitWith = ""
                            sharedImpactAmount = ""
                            refresh()
                        }.onFailure {
                            errorMessage = it.message
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text("Add shared expense")
            }
        }

        BudgetSectionCard(title = "Recent transactions") {
            if (transactions.isEmpty()) {
                Text("No transactions yet.", color = Color(0xFFB8C4D8))
            } else {
                transactions.take(8).forEach { transaction ->
                    TransactionRow(
                        title = transaction.desc.orEmpty(),
                        subtitle = transaction.category.orEmpty(),
                        amount = transaction.amount ?: 0.0,
                        isIncome = transaction.type == "income",
                    )
                }
            }
        }

        BudgetSectionCard(title = "Shared expenses") {
            if (sharedExpenses.isEmpty()) {
                Text("No shared expenses yet.", color = Color(0xFFB8C4D8))
            } else {
                sharedExpenses.take(8).forEach { expense ->
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(expense.desc.orEmpty(), color = Color.White, fontWeight = FontWeight.SemiBold)
                            Text("Paid by ${expense.paidBy.orEmpty()} · Split with ${expense.splitWith.orEmpty()}", color = Color(0xFFB8C4D8))
                        }
                        Text("₹${expense.amount?.toInt() ?: 0}", color = Color(0xFFFBBF24), fontWeight = FontWeight.Bold)
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                }
            }
        }
    }
}

@Composable
private fun RowScope.SummaryCard(label: String, value: String, accent: Color) {
    Card(colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.08f)), shape = RoundedCornerShape(18.dp), modifier = Modifier.weight(1f)) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(label, color = Color(0xFFD6E4FF))
            Text(value, color = accent, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun BudgetSectionCard(title: String, content: @Composable ColumnScope.() -> Unit) {
    Card(colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.05f)), shape = RoundedCornerShape(20.dp)) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text(title, color = Color.White, fontWeight = FontWeight.Bold)
            content()
        }
    }
}

@Composable
private fun TransactionRow(title: String, subtitle: String, amount: Double, isIncome: Boolean) {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        Column(modifier = Modifier.weight(1f)) {
            Text(title.ifBlank { "Untitled" }, color = Color.White, fontWeight = FontWeight.SemiBold)
            Text(subtitle, color = Color(0xFFB8C4D8))
        }
        Text(
            text = if (isIncome) "+₹${amount.toInt()}" else "-₹${amount.toInt()}",
            color = if (isIncome) Color(0xFF34D399) else Color(0xFFF87171),
            fontWeight = FontWeight.Bold,
        )
    }
    Spacer(modifier = Modifier.height(8.dp))
}
