package com.student.app.ui.navigation

sealed class AppRoute(val route: String, val label: String) {
    data object Auth : AppRoute("auth", "Login")
    data object Home : AppRoute("home", "Home")
    data object Sos : AppRoute("sos", "SOS")
    data object Community : AppRoute("community", "Community")
    data object Budget : AppRoute("budget", "Budget")
    data object Profile : AppRoute("profile", "Profile")

    val iconLabel: String
        get() = when (this) {
            Sos -> "🛑"
            Community -> "💬"
            Budget -> "💰"
            Profile -> "👤"
            else -> "🏠"
        }
}