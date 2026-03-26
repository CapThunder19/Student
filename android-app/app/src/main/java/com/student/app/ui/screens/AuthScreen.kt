package com.student.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.student.app.data.AppRepository
import kotlinx.coroutines.launch

@Composable
fun AuthScreen(
    repository: AppRepository,
    onLoginSuccess: () -> Unit,
) {
    var isSignup by remember { mutableStateOf(false) }
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Color(0xFF1B1B1B), Color(0xFF2C2C2C))))
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
    ) {
        Text("Welcome back", color = Color.White, style = MaterialTheme.typography.headlineMedium)
        Text(if (isSignup) "Create an account to connect the app with backend" else "Login to connect the app with backend", color = Color(0xFFB6C0CC))
        Spacer(modifier = Modifier.height(24.dp))
        if (isSignup) {
            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Name") },
            )
            Spacer(modifier = Modifier.height(12.dp))
        }
        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            modifier = Modifier.fillMaxWidth(),
            label = { Text("Email") },
        )
        Spacer(modifier = Modifier.height(12.dp))
        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            modifier = Modifier.fillMaxWidth(),
            label = { Text("Password") },
        )
        Spacer(modifier = Modifier.height(20.dp))
        Button(
            onClick = {
                scope.launch {
                    loading = true
                    errorMessage = null
                    runCatching {
                        val response = if (isSignup) {
                            repository.signup(name, email, password)
                        } else {
                            repository.login(email, password)
                        }
                        if (!response.token.isNullOrBlank()) {
                            onLoginSuccess()
                        } else {
                            errorMessage = response.message ?: "Login failed"
                        }
                    }.onFailure {
                        errorMessage = it.message ?: "Login failed"
                    }
                    loading = false
                }
            },
            modifier = Modifier.fillMaxWidth(),
            enabled = !loading,
        ) {
            if (loading) {
                CircularProgressIndicator()
            } else {
                Text("Login")
            }
        }
        Text(
            text = if (isSignup) "Already have an account? Login" else "New here? Create account",
            color = Color(0xFFB6C0CC),
            modifier = Modifier.padding(top = 12.dp),
            maxLines = 1,
        )
        Button(
            onClick = { isSignup = !isSignup },
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text(if (isSignup) "Switch to Login" else "Switch to Signup")
        }
        if (!errorMessage.isNullOrBlank()) {
            Spacer(modifier = Modifier.height(12.dp))
            Text(errorMessage ?: "", color = Color(0xFFFFB3B3))
        }
    }
}