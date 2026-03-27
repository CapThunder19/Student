package com.student.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.student.app.data.AppRepository
import com.student.app.data.remote.dto.MobileProfileResponseDto
import com.student.app.data.remote.dto.ProfileUpdateRequestDto
import kotlinx.coroutines.launch

@Composable
fun ProfileScreen(
    repository: AppRepository,
    onLogout: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val scope = rememberCoroutineScope()

    var profile by remember { mutableStateOf<MobileProfileResponseDto?>(null) }
    var loading by remember { mutableStateOf(true) }
    var saving by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    var name by remember { mutableStateOf("") }
    var major by remember { mutableStateOf("") }
    var year by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var location by remember { mutableStateOf("") }
    var gpa by remember { mutableStateOf("") }

    fun loadProfile() {
        scope.launch {
            loading = true
            runCatching {
                val response = repository.fetchProfile()
                profile = response
                name = response.name.orEmpty()
                major = response.major.orEmpty()
                year = response.year.orEmpty()
                phone = response.phone.orEmpty()
                location = response.location.orEmpty()
                gpa = response.gpa.orEmpty()
            }.onFailure {
                errorMessage = it.message
            }
            loading = false
        }
    }

    LaunchedEffect(Unit) { loadProfile() }

    val initials = profile?.name
        ?.trim()
        ?.split(" ")
        ?.take(2)
        ?.mapNotNull { it.firstOrNull()?.uppercaseChar() }
        ?.joinToString("")
        ?: "ST"

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Color(0xFF123128), Color(0xFF0F172A), Color(0xFF111111))))
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        Text("Profile", color = Color.White, fontWeight = FontWeight.Bold, style = androidx.compose.material3.MaterialTheme.typography.headlineLarge)
        Text("Update your details and keep your account in sync with backend.", color = Color(0xFFC7F6E8))

        if (loading) {
            CircularProgressIndicator()
        }

        if (!errorMessage.isNullOrBlank()) {
            Text(errorMessage ?: "", color = Color(0xFFFCA5A5))
        }

        Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF174F42)), shape = RoundedCornerShape(24.dp)) {
            Row(
                modifier = Modifier.padding(18.dp).fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(14.dp),
            ) {
                Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF0F766E)), shape = RoundedCornerShape(18.dp)) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(initials, color = Color.White, fontWeight = FontWeight.Bold)
                    }
                }
                Column(modifier = Modifier.weight(1f)) {
                    Text(name.ifBlank { "Student Name" }, color = Color.White, fontWeight = FontWeight.Bold)
                    Text(profile?.email ?: "Email not loaded", color = Color(0xFFC7F6E8))
                    Text("Major: ${major.ifBlank { "-" }}", color = Color(0xFFC7F6E8))
                }
            }
        }

        EditSectionCard(title = "Edit profile") {
            OutlinedTextField(value = name, onValueChange = { name = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Name") })
            OutlinedTextField(value = major, onValueChange = { major = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Major") })
            OutlinedTextField(value = year, onValueChange = { year = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Year") })
            OutlinedTextField(value = phone, onValueChange = { phone = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Phone") })
            OutlinedTextField(value = location, onValueChange = { location = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Location") })
            OutlinedTextField(value = gpa, onValueChange = { gpa = it }, modifier = Modifier.fillMaxWidth(), label = { Text("GPA") })

            Button(
                onClick = {
                    scope.launch {
                        saving = true
                        runCatching {
                            repository.updateProfile(
                                ProfileUpdateRequestDto(
                                    name = name,
                                    major = major,
                                    year = year,
                                    phone = phone,
                                    location = location,
                                    gpa = gpa,
                                )
                            )
                            loadProfile()
                        }.onFailure {
                            errorMessage = it.message
                        }
                        saving = false
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = !saving,
            ) {
                Text(if (saving) "Saving..." else "Save Profile")
            }

            Button(
                onClick = { loadProfile() },
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text("Refresh from backend")
            }
        }

        EditSectionCard(title = "Quick stats") {
            Text("Courses enrolled: ${profile?.coursesEnrolled ?: 0}", color = Color.White)
            Text("Achievements: ${profile?.achievements ?: 0}", color = Color.White)
            Text("Followers: ${profile?.followers ?: 0}", color = Color.White)
        }

        Button(
            onClick = {
                scope.launch { onLogout() }
            },
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text("Logout")
        }
    }
}

@Composable
private fun EditSectionCard(title: String, content: @Composable ColumnScope.() -> Unit) {
    Card(colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.06f)), shape = RoundedCornerShape(20.dp)) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text(title, color = Color.White, fontWeight = FontWeight.Bold)
            content()
        }
    }
}
