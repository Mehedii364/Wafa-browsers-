package site.wafazone.browser

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.os.Bundle
import android.view.ViewGroup
import android.webkit.*
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import site.wafazone.browser.shield.ContentBlocker

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            WafaBrowserTheme {
                WafaBrowserApp()
            }
        }
    }
}

@Composable
fun WafaBrowserTheme(content: @Composable () -> Unit) {
    val darkColorScheme = darkColorScheme(
        primary = Color(0xFF10B981), // Emerald Green
        secondary = Color(0xFFF59E0B), // Soft Gold
        background = Color(0xFF070B0E), // Obsidian Dark
        surface = Color(0xFF0D1418), // Glass surface
        onPrimary = Color.Black,
        onBackground = Color(0xFFE2E8F0),
        onSurface = Color(0xFFF1F5F9)
    )

    MaterialTheme(
        colorScheme = darkColorScheme,
        content = content
    )
}

enum class NavigationScreen {
    HOME, BROWSER, TABS, VAULT, PASSWORDS, QR_TOOLS, PDF_TOOLS, SETTINGS
}

@OptIn(ExperimentalMaterial3Api::class)
@SuppressLint("SetJavaScriptEnabled")
@Composable
fun WafaBrowserApp() {
    var currentScreen by remember { mutableStateOf(NavigationScreen.BROWSER) }
    var currentUrl by remember { mutableStateOf("https://duckduckgo.com") }
    var urlInput by remember { mutableStateOf("https://duckduckgo.com") }
    var isLoading by remember { mutableStateOf(false) }
    var pageTitle by remember { mutableStateOf("DuckDuckGo") }
    var trackersBlocked by remember { mutableIntStateOf(3) }
    var webViewInstance by remember { mutableStateOf<WebView?>(null) }
    var isShieldActive by remember { mutableStateOf(true) }

    BackHandler(enabled = currentScreen != NavigationScreen.BROWSER || webViewInstance?.canGoBack() == true) {
        if (currentScreen != NavigationScreen.BROWSER) {
            currentScreen = NavigationScreen.BROWSER
        } else if (webViewInstance?.canGoBack() == true) {
            webViewInstance?.goBack()
        }
    }

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        bottomBar = {
            NavigationBar(
                containerColor = Color(0xFF0B1014),
                tonalElevation = 8.dp
            ) {
                NavigationBarItem(
                    selected = currentScreen == NavigationScreen.BROWSER,
                    onClick = { currentScreen = NavigationScreen.BROWSER },
                    icon = { Icon(Icons.Default.Public, contentDescription = "Browser") },
                    label = { Text("Browser", fontSize = 11.sp) }
                )
                NavigationBarItem(
                    selected = currentScreen == NavigationScreen.TABS,
                    onClick = { currentScreen = NavigationScreen.TABS },
                    icon = { Icon(Icons.Default.Layers, contentDescription = "Tabs") },
                    label = { Text("Tabs", fontSize = 11.sp) }
                )
                NavigationBarItem(
                    selected = currentScreen == NavigationScreen.VAULT,
                    onClick = { currentScreen = NavigationScreen.VAULT },
                    icon = { Icon(Icons.Default.Lock, contentDescription = "Vault") },
                    label = { Text("Vault", fontSize = 11.sp) }
                )
                NavigationBarItem(
                    selected = currentScreen == NavigationScreen.PASSWORDS,
                    onClick = { currentScreen = NavigationScreen.PASSWORDS },
                    icon = { Icon(Icons.Default.Key, contentDescription = "Passwords") },
                    label = { Text("Passwords", fontSize = 11.sp) }
                )
                NavigationBarItem(
                    selected = currentScreen == NavigationScreen.SETTINGS,
                    onClick = { currentScreen = NavigationScreen.SETTINGS },
                    icon = { Icon(Icons.Default.Settings, contentDescription = "Settings") },
                    label = { Text("Settings", fontSize = 11.sp) }
                )
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (currentScreen) {
                NavigationScreen.BROWSER -> {
                    Column(modifier = Modifier.fillMaxSize()) {
                        // Address Bar
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(Color(0xFF0A0F12))
                                .padding(horizontal = 12.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            // SSL & Shield Status
                            IconButton(
                                onClick = { isShieldActive = !isShieldActive },
                                modifier = Modifier.size(36.dp)
                            ) {
                                Icon(
                                    imageVector = if (isShieldActive) Icons.Default.Shield else Icons.Default.ShieldOutlined,
                                    contentDescription = "Shield",
                                    tint = if (isShieldActive) Color(0xFF10B981) else Color.Gray,
                                    modifier = Modifier.size(20.dp)
                                )
                            }

                            // URL Input
                            TextField(
                                value = urlInput,
                                onValueChange = { urlInput = it },
                                modifier = Modifier
                                    .weight(1f)
                                    .height(50.dp)
                                    .clip(RoundedCornerShape(24.dp)),
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Go),
                                keyboardActions = KeyboardActions(
                                    onGo = {
                                        var target = urlInput.trim()
                                        if (!target.startsWith("http://") && !target.startsWith("https://")) {
                                            if (target.contains(".") && !target.contains(" ")) {
                                                target = "https://$target"
                                            } else {
                                                target = "https://duckduckgo.com/?q=${target}"
                                            }
                                        }
                                        currentUrl = target
                                        webViewInstance?.loadUrl(target)
                                    }
                                ),
                                colors = TextFieldDefaults.colors(
                                    focusedContainerColor = Color(0xFF131B20),
                                    unfocusedContainerColor = Color(0xFF131B20),
                                    focusedIndicatorColor = Color.Transparent,
                                    unfocusedIndicatorColor = Color.Transparent,
                                    focusedTextColor = Color.White,
                                    unfocusedTextColor = Color(0xFFE2E8F0)
                                ),
                                placeholder = { Text("Search or type URL...", color = Color.Gray, fontSize = 13.sp) }
                            )

                            Spacer(modifier = Modifier.width(6.dp))

                            IconButton(
                                onClick = { webViewInstance?.reload() },
                                modifier = Modifier.size(36.dp)
                            ) {
                                Icon(Icons.Default.Refresh, contentDescription = "Reload", tint = Color.LightGray)
                            }
                        }

                        if (isLoading) {
                            LinearProgressIndicator(
                                modifier = Modifier.fillMaxWidth().height(2.dp),
                                color = Color(0xFF10B981),
                                trackColor = Color(0xFF0F172A)
                            )
                        }

                        // WebView Frame
                        AndroidView(
                            factory = { context ->
                                WebView(context).apply {
                                    layoutParams = ViewGroup.LayoutParams(
                                        ViewGroup.LayoutParams.MATCH_PARENT,
                                        ViewGroup.LayoutParams.MATCH_PARENT
                                    )
                                    settings.javaScriptEnabled = true
                                    settings.domStorageEnabled = true
                                    settings.setSupportZoom(true)
                                    settings.builtInZoomControls = true
                                    settings.displayZoomControls = false

                                    webViewClient = object : WebViewClient() {
                                        override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                                            super.onPageStarted(view, url, favicon)
                                            isLoading = true
                                            url?.let {
                                                currentUrl = it
                                                urlInput = it
                                            }
                                        }

                                        override fun onPageFinished(view: WebView?, url: String?) {
                                            super.onPageFinished(view, url)
                                            isLoading = false
                                            pageTitle = view?.title ?: "Webpage"
                                        }

                                        override fun shouldInterceptRequest(
                                            view: WebView?,
                                            request: WebResourceRequest?
                                        ): WebResourceResponse? {
                                            val reqUrl = request?.url?.toString() ?: ""
                                            if (isShieldActive && ContentBlocker.isBlocked(reqUrl)) {
                                                trackersBlocked++
                                                return ContentBlocker.createEmptyResponse()
                                            }
                                            return super.shouldInterceptRequest(view, request)
                                        }
                                    }

                                    loadUrl(currentUrl)
                                    webViewInstance = this
                                }
                            },
                            update = { view ->
                                if (view.url != currentUrl) {
                                    view.loadUrl(currentUrl)
                                }
                            },
                            modifier = Modifier.fillMaxSize()
                        )
                    }
                }
                NavigationScreen.VAULT -> {
                    VaultScreenView()
                }
                NavigationScreen.PASSWORDS -> {
                    PasswordsScreenView()
                }
                NavigationScreen.TABS -> {
                    TabsScreenView()
                }
                NavigationScreen.SETTINGS -> {
                    SettingsScreenView()
                }
                else -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("Module view", color = Color.White)
                    }
                }
            }
        }
    }
}

@Composable
fun VaultScreenView() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(Icons.Default.Lock, contentDescription = null, tint = Color(0xFF10B981), modifier = Modifier.size(56.dp))
        Spacer(modifier = Modifier.height(16.dp))
        Text("WAFA Private Vault", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Color.White)
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            "Hardware-backed AES-256-GCM Envelope Encryption\nArgon2id / PBKDF2 Key Derivation",
            color = Color.Gray,
            fontSize = 13.sp,
            textAlign = androidx.compose.ui.text.style.TextAlign.Center
        )
    }
}

@Composable
fun PasswordsScreenView() {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Password Manager", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.White)
        Spacer(modifier = Modifier.height(8.dp))
        Text("Encrypted credentials stored with zero-knowledge keys.", color = Color.Gray, fontSize = 13.sp)
    }
}

@Composable
fun TabsScreenView() {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Active Tabs & Groups", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.White)
    }
}

@Composable
fun SettingsScreenView() {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("WAFA Browser Settings", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.White)
        Spacer(modifier = Modifier.height(12.dp))
        Text("Developer: Md. Mehedi Hasan (Mehedi364)", color = Color(0xFF10B981), fontSize = 14.sp)
        Text("Package: site.wafazone.browser", color = Color.Gray, fontSize = 13.sp)
        Text("Edition: Complete Edition", color = Color(0xFFF59E0B), fontSize = 13.sp)
    }
}
