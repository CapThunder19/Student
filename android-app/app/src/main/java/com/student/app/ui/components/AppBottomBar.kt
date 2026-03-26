package com.student.app.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.student.app.ui.navigation.AppRoute

@Composable
fun AppBottomBar(
    tabs: List<AppRoute>,
    selectedIndex: Int,
    onTabSelected: (Int) -> Unit,
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp, vertical = 8.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF0B1220)),
        shape = androidx.compose.foundation.shape.RoundedCornerShape(24.dp),
    ) {
        NavigationBar(
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 4.dp),
            containerColor = Color.Transparent,
            contentColor = Color.White,
            tonalElevation = 0.dp,
            windowInsets = WindowInsets(0.dp),
        ) {
            tabs.forEachIndexed { index, route ->
                NavigationBarItem(
                    selected = selectedIndex == index,
                    onClick = { onTabSelected(index) },
                    icon = {
                        Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(2.dp)) {
                            Text(route.iconLabel)
                        }
                    },
                    label = { Text(route.label) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Color(0xFFBFDBFE),
                        selectedTextColor = Color.White,
                        unselectedIconColor = Color(0xFF94A3B8),
                        unselectedTextColor = Color(0xFF94A3B8),
                        indicatorColor = Color(0xFF172554),
                    ),
                )
            }
        }
    }
}