package com.student.app.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.student.app.data.AppRepository
import com.student.app.data.remote.dto.ComplaintCreateRequestDto
import com.student.app.data.remote.dto.ComplaintResponseDto
import com.student.app.data.remote.dto.ComplaintSummaryDto
import com.student.app.data.remote.dto.ComplaintUpdateRequestDto
import kotlinx.coroutines.launch

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun SosScreen(repository: AppRepository, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    var complaints by remember { mutableStateOf<List<ComplaintResponseDto>>(emptyList()) }
    var summary by remember { mutableStateOf<ComplaintSummaryDto?>(null) }
    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("Emergency") }
    var selectedSeverity by remember { mutableStateOf("red") }
    var loading by remember { mutableStateOf(true) }
    var sending by remember { mutableStateOf(false) }
    var statusMessage by remember { mutableStateOf<String?>(null) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var studentName by remember { mutableStateOf("Anonymous Student") }

    val scope = rememberCoroutineScope()
    val categories = remember { listOf("Emergency", "Security", "Hostel", "Transport", "Maintenance") }
    val severities = remember { listOf("red", "yellow", "green") }

    fun openDialer() {
        runCatching {
            context.startActivity(
                Intent(Intent.ACTION_DIAL).apply {
                    data = Uri.parse("tel:+911122334455")
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
            )
        }
    }

    fun openCampusLocation() {
        runCatching {
            context.startActivity(
                Intent(Intent.ACTION_VIEW).apply {
                    data = Uri.parse("geo:0,0?q=campus+security+student+hostel")
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
            )
        }
    }

    fun refresh() {
        scope.launch {
            loading = true
            errorMessage = null
            runCatching {
                val user = repository.currentSessionUser()
                studentName = user.name.ifBlank { "Anonymous Student" }
                val response = repository.fetchComplaints()
                complaints = response.complaints
                summary = response.summary
            }.onFailure {
                errorMessage = it.message
            }
            loading = false
        }
    }

    fun submitComplaint(emergency: Boolean = false) {
        if (!emergency && (title.isBlank() || description.isBlank())) {
            statusMessage = "Title aur description required hai."
            return
        }

        scope.launch {
            sending = true
            statusMessage = null
            errorMessage = null
            runCatching {
                val user = repository.currentSessionUser()
                repository.createComplaint(
                    ComplaintCreateRequestDto(
                        studentName = user.name.ifBlank { studentName },
                        studentEmail = user.email,
                        category = selectedCategory,
                        title = if (emergency) "SOS ALERT" else title.trim(),
                        description = if (emergency) {
                            "Immediate assistance required. ${description.ifBlank { "Please respond urgently." }}"
                        } else {
                            description.trim()
                        },
                        severity = selectedSeverity,
                    )
                )
                title = ""
                description = ""
                selectedCategory = "Emergency"
                selectedSeverity = "red"
                refresh()
                statusMessage = if (emergency) "Emergency alert sent." else "Complaint submitted."
            }.onFailure {
                errorMessage = it.message
            }
            sending = false
        }
    }

    fun patchComplaint(complaintId: String, status: String) {
        scope.launch {
            errorMessage = null
            statusMessage = null
            runCatching {
                repository.updateComplaint(
                    id = complaintId,
                    request = ComplaintUpdateRequestDto(status = status),
                )
                refresh()
                statusMessage = "Complaint updated to $status."
            }.onFailure {
                errorMessage = it.message
            }
        }
    }

    LaunchedEffect(Unit) {
        refresh()
    }

    val openCount = complaints.count { it.status.equals("open", ignoreCase = true) || it.status.equals("pending", ignoreCase = true) }
    val escalatedCount = complaints.count { it.status.equals("escalated", ignoreCase = true) }
    val resolvedCount = complaints.count { it.status.equals("resolved", ignoreCase = true) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .navigationBarsPadding()
            .imePadding()
            .background(Brush.verticalGradient(listOf(Color(0xFF2D0A0A), Color(0xFF150505), Color(0xFF0F172A))))
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text("SOS Support", color = Color.White, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.headlineLarge)
                Text("Emergency alerts, complaints, and status tracking.", color = Color(0xFFFCCACA))
            }

            AssistChip(onClick = { refresh() }, label = { Text("Refresh") })
        }

        Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
            SummaryChip(label = "Open", value = openCount.toString(), accent = Color(0xFFFCA5A5))
            SummaryChip(label = "Escalated", value = escalatedCount.toString(), accent = Color(0xFFFBBF24))
            SummaryChip(label = "Resolved", value = resolvedCount.toString(), accent = Color(0xFF34D399))
        }

        if (summary != null) {
            Text(
                text = "Total complaints: ${summary?.total ?: 0} • Red: ${summary?.red ?: 0} • Yellow: ${summary?.yellow ?: 0} • Green: ${summary?.green ?: 0}",
                color = Color(0xFFF8FAFC),
                fontSize = 12.sp,
            )
        }

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFD32F2F)),
            shape = RoundedCornerShape(24.dp),
        ) {
            Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Box(
                        modifier = Modifier
                            .size(56.dp)
                            .clip(CircleShape)
                            .background(Color.White.copy(alpha = 0.18f)),
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(Icons.Default.Warning, contentDescription = null, tint = Color.White)
                    }
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Emergency SOS", color = Color.White, fontWeight = FontWeight.Black, fontSize = 22.sp)
                        Text("One tap se urgent alert raise karo.", color = Color.White.copy(alpha = 0.85f))
                    }
                }

                Text("Last sender: $studentName", color = Color.White.copy(alpha = 0.8f), fontSize = 12.sp)

                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    AssistChip(onClick = { openDialer() }, label = { Text("Call Security") })
                    AssistChip(onClick = { openCampusLocation() }, label = { Text("Open Location") })
                    AssistChip(
                        onClick = {
                            selectedCategory = "Emergency"
                            selectedSeverity = "red"
                            title = "SOS ALERT"
                            description = "Immediate assistance required at campus."
                            submitComplaint(emergency = false)
                        },
                        label = { Text("Alert Warden") },
                    )
                }

                Button(
                    onClick = { submitComplaint(emergency = true) },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !sending,
                    colors = ButtonDefaults.buttonColors(containerColor = Color.White, contentColor = Color(0xFFD32F2F)),
                    shape = RoundedCornerShape(14.dp),
                ) {
                    Text(if (sending) "Sending..." else "Send Emergency Alert", fontWeight = FontWeight.Bold)
                }
            }
        }

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.05f)),
            shape = RoundedCornerShape(20.dp),
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text("Raise Complaint", color = Color.White, fontWeight = FontWeight.Bold)
                    Text("Pick a category, severity, and send it to the backend.", color = Color(0xFFC7D2FE), fontSize = 12.sp)
                }

                        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                    categories.forEach { category ->
                        FilterChip(
                            selected = selectedCategory == category,
                            onClick = { selectedCategory = category },
                            label = { Text(category) },
                        )
                    }
                }

                        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                    severities.forEach { severity ->
                        FilterChip(
                            selected = selectedSeverity == severity,
                            onClick = { selectedSeverity = severity },
                            label = { Text(severity.replaceFirstChar { it.uppercase() }) },
                        )
                    }
                }

                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Title") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                )

                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Description") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 3,
                    maxLines = 5,
                )

                Button(
                    onClick = { submitComplaint() },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !sending,
                ) {
                    Text(if (sending) "Submitting..." else "Submit Complaint")
                }
            }
        }

        if (!statusMessage.isNullOrBlank()) {
            Text(statusMessage ?: "", color = Color(0xFFFDE68A), fontWeight = FontWeight.SemiBold)
        }
        if (!errorMessage.isNullOrBlank()) {
            Text(errorMessage ?: "", color = Color(0xFFFCA5A5))
        }

        Card(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A)),
            shape = RoundedCornerShape(24.dp),
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Text("Recent Complaints", color = Color.White, fontWeight = FontWeight.Bold)
                    Text("${complaints.size} total", color = Color(0xFFCBD5E1), fontSize = 12.sp)
                }

                when {
                    loading && complaints.isEmpty() -> {
                        CircularProgressIndicator()
                    }

                    complaints.isEmpty() -> {
                        Text("No complaints yet.", color = Color(0xFFCBD5E1))
                    }

                    else -> {
                        LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            items(complaints.take(8), key = { it.id }) { complaint ->
                                ComplaintCard(
                                    complaint = complaint,
                                    onEscalate = { patchComplaint(complaint.id, "escalated") },
                                    onResolve = { patchComplaint(complaint.id, "resolved") },
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun RowScope.SummaryChip(label: String, value: String, accent: Color) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.08f)),
        shape = RoundedCornerShape(16.dp),
        modifier = Modifier.weight(1f),
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(label, color = Color(0xFFFFE4E6), style = MaterialTheme.typography.labelSmall)
            Text(value, color = accent, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun ComplaintCard(
    complaint: ComplaintResponseDto,
    onEscalate: () -> Unit,
    onResolve: () -> Unit,
) {
    val statusColor = when (complaint.status.lowercase()) {
        "resolved" -> Color(0xFF34D399)
        "escalated" -> Color(0xFFFBBF24)
        "open" -> Color(0xFF60A5FA)
        else -> Color(0xFFF59E0B)
    }

    val severityColor = when (complaint.severity.lowercase()) {
        "red" -> Color(0xFFF87171)
        "yellow" -> Color(0xFFFBBF24)
        else -> Color(0xFF34D399)
    }

    Card(
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.05f)),
        shape = RoundedCornerShape(18.dp),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(complaint.title, color = Color.White, fontWeight = FontWeight.Bold)
                    Text(complaint.description, color = Color(0xFFCBD5E1), maxLines = 2)
                }
                Column(horizontalAlignment = Alignment.End) {
                    StatusPill(text = complaint.status, color = statusColor)
                    Spacer(modifier = Modifier.height(6.dp))
                    StatusPill(text = complaint.severity, color = severityColor)
                }
            }

            Text("Category: ${complaint.category}", color = Color(0xFFF8FAFC), style = MaterialTheme.typography.labelMedium)

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                AssistChip(onClick = onEscalate, label = { Text("Escalate") })
                AssistChip(onClick = onResolve, label = { Text("Resolve") })
            }
        }
    }
}

@Composable
private fun StatusPill(text: String, color: Color) {
    Text(
        text = text,
        color = color,
        modifier = Modifier
            .background(color.copy(alpha = 0.12f), RoundedCornerShape(999.dp))
            .padding(horizontal = 10.dp, vertical = 4.dp),
        fontSize = 11.sp,
        fontWeight = FontWeight.Bold,
    )
}