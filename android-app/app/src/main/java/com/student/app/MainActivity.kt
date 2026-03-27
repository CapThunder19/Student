package com.student.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.student.app.data.AppRepository
import com.student.app.data.local.SessionStore
import com.student.app.data.remote.StudentApiClient
import com.student.app.ui.components.AppBottomBar
import com.student.app.ui.navigation.AppRoute
import com.student.app.ui.screens.AuthScreen
import com.student.app.ui.screens.BudgetScreen
import com.student.app.ui.screens.CommunityScreen
import com.student.app.ui.screens.ProfileScreen
import com.student.app.ui.screens.SplashScreen
import com.student.app.ui.screens.SosScreen
import com.student.app.ui.theme.StudentTheme
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val sessionStore = SessionStore(applicationContext)
        // Connected to Real Backend API
        val repository = AppRepository(StudentApiClient.create(sessionStore), sessionStore)

        setContent {
            StudentTheme {
                val scope = rememberCoroutineScope()
                var appReady by remember { mutableStateOf(false) }
                var isLoggedIn by remember { mutableStateOf(false) }

                LaunchedEffect(Unit) {
                    isLoggedIn = sessionStore.hasToken()
                    appReady = true
                }

                if (!appReady) {
                    SplashScreen()
                } else if (!isLoggedIn) {
                    AuthScreen(
                        repository = repository,
                        onLoginSuccess = { isLoggedIn = true },
                    )
                } else {
                    HomeScreen(
                        repository = repository,
                        onLogout = {
                            scope.launch {
                                repository.logout()
                                isLoggedIn = false
                            }
                        },
                    )
                }
            }
        }
    }
}

@Composable
private fun HomeScreen(
    repository: AppRepository,
    onLogout: () -> Unit,
) {
    var selectedTab by remember { mutableIntStateOf(1) } // Default to Community
    val tabs = listOf(AppRoute.Sos, AppRoute.Community, AppRoute.Budget, AppRoute.Profile)

    Scaffold(
        contentWindowInsets = WindowInsets.safeDrawing,
        bottomBar = {
            AppBottomBar(
                tabs = tabs,
                selectedIndex = selectedTab,
                onTabSelected = { selectedTab = it },
            )
        }
    ) { padding ->
        when (selectedTab) {
            0 -> SosScreen(repository = repository, modifier = Modifier.padding(padding))
            1 -> CommunityScreen(repository = repository, modifier = Modifier.padding(padding))
            2 -> BudgetScreen(repository = repository, modifier = Modifier.padding(padding))
            else -> ProfileScreen(repository = repository, onLogout = onLogout, modifier = Modifier.padding(padding))
        }
    }
}
