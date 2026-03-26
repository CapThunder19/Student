package com.student.app.data.local

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "student_session")

data class SessionUser(
    val id: String = "",
    val name: String = "",
    val email: String = "",
)

class SessionStore(private val context: Context) {
    private val tokenKey = stringPreferencesKey("auth_token")
    private val userIdKey = stringPreferencesKey("user_id")
    private val userNameKey = stringPreferencesKey("user_name")
    private val userEmailKey = stringPreferencesKey("user_email")

    val tokenFlow = context.dataStore.data.map { preferences -> preferences[tokenKey].orEmpty() }
    val userFlow = context.dataStore.data.map { preferences ->
        SessionUser(
            id = preferences[userIdKey].orEmpty(),
            name = preferences[userNameKey].orEmpty(),
            email = preferences[userEmailKey].orEmpty(),
        )
    }

    suspend fun saveSession(token: String, user: SessionUser) {
        context.dataStore.edit { preferences ->
            preferences[tokenKey] = token
            preferences[userIdKey] = user.id
            preferences[userNameKey] = user.name
            preferences[userEmailKey] = user.email
        }
    }

    suspend fun clear() {
        context.dataStore.edit { preferences ->
            preferences.remove(tokenKey)
            preferences.remove(userIdKey)
            preferences.remove(userNameKey)
            preferences.remove(userEmailKey)
        }
    }

    suspend fun hasToken(): Boolean = tokenFlow.first().isNotBlank()
    suspend fun currentToken(): String = tokenFlow.first()
    suspend fun currentUser(): SessionUser = userFlow.first()
}
