package com.student.app.data.remote

import com.student.app.data.local.SessionStore
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Response

class AuthInterceptor(private val sessionStore: SessionStore) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        // RunBlocking is used here because Interceptors are synchronous by nature
        val token = runBlocking { sessionStore.currentToken() }
        
        val request = chain.request().newBuilder()
        
        if (token.isNotBlank()) {
            request.addHeader("Authorization", "Bearer $token")
        }
        
        return chain.proceed(request.build())
    }
}
