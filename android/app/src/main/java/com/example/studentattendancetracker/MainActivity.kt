package com.example.studentattendancetracker

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.View
import android.webkit.ConsoleMessage
import android.webkit.GeolocationPermissions
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.ProgressBar
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.webkit.WebViewAssetLoader

import android.webkit.JavascriptInterface
import android.widget.Toast
import androidx.core.content.FileProvider
import java.io.File
import android.os.Environment

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar
    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private var lastBackPressTime = 0L

    private val fileChooserLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val data: Intent? = result.data
            val uris = WebChromeClient.FileChooserParams.parseResult(result.resultCode, data)
            filePathCallback?.onReceiveValue(uris)
        } else {
            filePathCallback?.onReceiveValue(null)
        }
        filePathCallback = null
    }

    private val requestNotificationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            DailyReminderReceiver.scheduleAll(this)
        }
    }

    inner class WebAppInterface {
        @JavascriptInterface
        fun saveFile(fileName: String, content: String, mimeType: String): Boolean {
            return try {
                val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                if (!downloadsDir.exists()) downloadsDir.mkdirs()
                val targetFile = File(downloadsDir, fileName)
                targetFile.writeText(content, Charsets.UTF_8)
                runOnUiThread {
                    Toast.makeText(this@MainActivity, "Downloaded $fileName to Downloads", Toast.LENGTH_LONG).show()
                }
                true
            } catch (e: Exception) {
                Log.e("AttendanceApp", "Direct file save to Downloads failed", e)
                false
            }
        }

        @JavascriptInterface
        fun exportAndShare(fileName: String, content: String, mimeType: String) {
            runOnUiThread {
                try {
                    val exportDir = File(cacheDir, "exports").apply { mkdirs() }
                    val file = File(exportDir, fileName)
                    file.writeText(content, Charsets.UTF_8)

                    val contentUri = FileProvider.getUriForFile(
                        this@MainActivity,
                        "${packageName}.fileprovider",
                        file
                    )

                    val intent = Intent(Intent.ACTION_SEND).apply {
                        type = mimeType
                        putExtra(Intent.EXTRA_STREAM, contentUri)
                        putExtra(Intent.EXTRA_SUBJECT, fileName)
                        putExtra(Intent.EXTRA_TEXT, "Attendance Tracker Export: $fileName")
                        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                    }

                    startActivity(Intent.createChooser(intent, "Save or Share $fileName"))
                } catch (e: Exception) {
                    Log.e("AttendanceApp", "FileProvider export failed, fallback to text", e)
                    try {
                        val textIntent = Intent(Intent.ACTION_SEND).apply {
                            type = "text/plain"
                            putExtra(Intent.EXTRA_SUBJECT, fileName)
                            putExtra(Intent.EXTRA_TEXT, content)
                        }
                        startActivity(Intent.createChooser(textIntent, "Save or Share $fileName"))
                    } catch (ex: Exception) {
                        Log.e("AttendanceApp", "Text share failed", ex)
                        Toast.makeText(this@MainActivity, "Could not open share sheet", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }

        @JavascriptInterface
        fun scheduleReminders(
            collegeStartTime: String,
            morningEnabled: Boolean,
            preCollegeEnabled: Boolean,
            eveningEnabled: Boolean
        ) {
            try {
                DailyReminderReceiver.savePreferences(
                    this@MainActivity,
                    collegeStartTime,
                    morningEnabled,
                    preCollegeEnabled,
                    eveningEnabled
                )
                DailyReminderReceiver.scheduleAll(this@MainActivity)
            } catch (e: Exception) {
                Log.e("AttendanceApp", "Failed to schedule reminders from WebAppInterface", e)
            }
        }

        @JavascriptInterface
        fun triggerTestNotification(title: String, message: String) {
            runOnUiThread {
                try {
                    DailyReminderReceiver.triggerNotification(
                        this@MainActivity,
                        DailyReminderReceiver.ID_TEST,
                        title,
                        message
                    )
                } catch (e: Exception) {
                    Log.e("AttendanceApp", "Failed to trigger test notification", e)
                    Toast.makeText(this@MainActivity, "$title: $message", Toast.LENGTH_LONG).show()
                }
            }
        }

        @JavascriptInterface
        fun requestNotificationPermission() {
            runOnUiThread {
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
                    if (ContextCompat.checkSelfPermission(
                            this@MainActivity,
                            Manifest.permission.POST_NOTIFICATIONS
                        ) != PackageManager.PERMISSION_GRANTED
                    ) {
                        requestNotificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                    }
                }
            }
        }

        @JavascriptInterface
        fun isNotificationPermissionGranted(): Boolean {
            return if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
                ContextCompat.checkSelfPermission(
                    this@MainActivity,
                    Manifest.permission.POST_NOTIFICATIONS
                ) == PackageManager.PERMISSION_GRANTED
            } else {
                true
            }
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Initialize alarm & notification channels
        DailyReminderReceiver.createNotificationChannel(this)

        // Request notification permission if Android 13+
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(
                    this,
                    Manifest.permission.POST_NOTIFICATIONS
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                requestNotificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }

        // Initialize scheduled alarms on startup
        DailyReminderReceiver.scheduleAll(this)

        webView = findViewById(R.id.webView)
        progressBar = findViewById(R.id.progressBar)

        setupWebView()

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                // Query web application if it wants to handle back (e.g. close modals or switch tabs)
                webView.evaluateJavascript("typeof window.handleAndroidBack === 'function' ? window.handleAndroidBack() : false") { result ->
                    val handled = result?.trim()?.equals("true", ignoreCase = true) == true
                    if (!handled) {
                        if (webView.canGoBack()) {
                            webView.goBack()
                        } else {
                            val currentTime = System.currentTimeMillis()
                            if (currentTime - lastBackPressTime < 2000) {
                                isEnabled = false
                                finish()
                            } else {
                                lastBackPressTime = currentTime
                                Toast.makeText(this@MainActivity, "Press back again to exit", Toast.LENGTH_SHORT).show()
                            }
                        }
                    }
                }
            }
        })

        // Load via secure HTTPS virtual domain using WebViewAssetLoader
        webView.loadUrl("https://appassets.androidplatform.net/assets/index.html")
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        // Enable Chrome DevTools remote debugging
        WebView.setWebContentsDebuggingEnabled(true)

        // AssetLoader routes https://appassets.androidplatform.net/assets/ to app assets
        val assetLoader = WebViewAssetLoader.Builder()
            .setDomain("appassets.androidplatform.net")
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        val settings: WebSettings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.allowFileAccessFromFileURLs = true
        settings.allowUniversalAccessFromFileURLs = true
        settings.loadWithOverviewMode = true
        settings.useWideViewPort = true
        settings.setSupportZoom(false)
        settings.builtInZoomControls = false
        settings.displayZoomControls = false
        settings.cacheMode = WebSettings.LOAD_NO_CACHE
        webView.clearCache(true)
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        settings.setSupportMultipleWindows(true)
        settings.javaScriptCanOpenWindowsAutomatically = true

        // Register native bridge for export and share
        webView.addJavascriptInterface(WebAppInterface(), "AndroidApp")

        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView,
                request: WebResourceRequest
            ): WebResourceResponse? {
                return assetLoader.shouldInterceptRequest(request.url)
            }

            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url?.toString() ?: return false
                // Keep internal appassets navigation inside WebView
                if (url.startsWith("https://appassets.androidplatform.net/") || url.startsWith("file:///android_asset/")) {
                    return false
                }
                // Open external links (like websites or docs) in browser
                try {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                    startActivity(intent)
                } catch (e: Exception) {
                    Log.e("AttendanceApp", "Error opening external link: $url", e)
                }
                return true
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                Log.e("AttendanceApp", "Resource Error: ${request?.url} - ${error?.description}")
            }

            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                progressBar.visibility = View.VISIBLE
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                progressBar.visibility = View.GONE
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                Log.d("AttendanceApp", "[JS] ${consoleMessage?.message()} (${consoleMessage?.sourceId()}:${consoleMessage?.lineNumber()})")
                return true
            }

            override fun onCreateWindow(
                view: WebView?,
                isDialog: Boolean,
                isUserGesture: Boolean,
                resultMsg: android.os.Message?
            ): Boolean {
                val tempWebView = WebView(this@MainActivity)
                tempWebView.webViewClient = object : WebViewClient() {
                    override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                        val url = request?.url?.toString() ?: return false
                        try {
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                            startActivity(intent)
                        } catch (e: Exception) {
                            Log.e("AttendanceApp", "Error opening ad window link: $url", e)
                        }
                        return true
                    }
                }
                val transport = resultMsg?.obj as? WebView.WebViewTransport
                transport?.webView = tempWebView
                resultMsg?.sendToTarget()
                return true
            }

            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                if (newProgress < 100) {
                    progressBar.visibility = View.VISIBLE
                    progressBar.progress = newProgress
                } else {
                    progressBar.visibility = View.GONE
                }
            }

            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                this@MainActivity.filePathCallback?.onReceiveValue(null)
                this@MainActivity.filePathCallback = filePathCallback

                val intent = fileChooserParams?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
                    type = "*/*"
                }

                try {
                    fileChooserLauncher.launch(intent)
                } catch (e: Exception) {
                    this@MainActivity.filePathCallback?.onReceiveValue(null)
                    this@MainActivity.filePathCallback = null
                    return false
                }
                return true
            }
        }

        // Enable download listener for export files
        webView.setDownloadListener { url, _, _, mimeType, _ ->
            try {
                if (url.startsWith("data:")) {
                    val intent = Intent(Intent.ACTION_SEND).apply {
                        type = mimeType ?: "text/plain"
                        putExtra(Intent.EXTRA_TEXT, Uri.decode(url.substringAfter(",")))
                    }
                    startActivity(Intent.createChooser(intent, "Save Attendance Export"))
                } else {
                    val intent = Intent(Intent.ACTION_VIEW).apply {
                        setDataAndType(Uri.parse(url), mimeType)
                    }
                    startActivity(intent)
                }
            } catch (e: Exception) {
                Log.e("AttendanceApp", "Download listener error", e)
            }
        }
    }

    override fun onResume() {
        super.onResume()
        webView.onResume()
    }

    override fun onPause() {
        super.onPause()
        webView.onPause()
    }

    override fun onDestroy() {
        super.onDestroy()
        webView.destroy()
    }
}
