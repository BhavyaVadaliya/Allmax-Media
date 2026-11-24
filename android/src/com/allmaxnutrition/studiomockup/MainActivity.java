package com.allmaxnutrition.studiomockup;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.DownloadManager;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.util.Base64;
import android.view.LayoutInflater;
import android.view.View;
import android.webkit.ConsoleMessage;
import android.webkit.DownloadListener;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import java.io.File;
import java.io.FileOutputStream;

public class MainActivity extends Activity {

    private static final String PREFS_NAME = "AllmaxStudioPrefs";
    private static final String KEY_SERVER_URL = "server_url";
    private static final String DEFAULT_SERVER_URL = "https://allmaxmedia.vercel.app";
    private static final int REQUEST_PERMISSIONS = 101;
    private static final int REQUEST_FILE_CHOOSER = 102;

    private WebView webView;
    private ProgressBar progressBar;
    private View errorView;
    private TextView tvErrorUrl;
    private TextView tvServerBadge;
    private ImageButton btnRefresh;
    private ImageButton btnSettings;
    private Button btnConnectVercel;
    private Button btnRetry;
    private Button btnChangeUrl;

    private SharedPreferences prefs;
    private ValueCallback<Uri[]> fileUploadCallback;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);

        initViews();
        setupWebView();
        checkAndRequestPermissions();
        loadCurrentUrl();
    }

    private void initViews() {
        webView = findViewById(R.id.webView);
        progressBar = findViewById(R.id.progressBar);
        errorView = findViewById(R.id.errorView);
        tvErrorUrl = findViewById(R.id.tvErrorUrl);
        tvServerBadge = findViewById(R.id.tvServerBadge);
        btnRefresh = findViewById(R.id.btnRefresh);
        btnSettings = findViewById(R.id.btnSettings);
        btnConnectVercel = findViewById(R.id.btnConnectVercel);
        btnRetry = findViewById(R.id.btnRetry);
        btnChangeUrl = findViewById(R.id.btnChangeUrl);

        btnRefresh.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (webView != null) {
                    webView.reload();
                    Toast.makeText(MainActivity.this, "Reloading latest code...", Toast.LENGTH_SHORT).show();
                }
            }
        });

        btnSettings.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                showServerUrlDialog();
            }
        });

        btnConnectVercel.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                saveServerUrl(DEFAULT_SERVER_URL);
                loadCurrentUrl();
                Toast.makeText(MainActivity.this, "Connecting to Live Vercel...", Toast.LENGTH_SHORT).show();
            }
        });

        btnRetry.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                loadCurrentUrl();
            }
        });

        btnChangeUrl.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                showServerUrlDialog();
            }
        });
    }

    private String getServerUrl() {
        String url = prefs.getString(KEY_SERVER_URL, DEFAULT_SERVER_URL);
        // Auto-migrate from old local development IPs to live Vercel URL
        if (url == null || url.trim().isEmpty() || url.contains("192.168.1.16") || url.contains("10.0.2.2") || url.contains("localhost")) {
            url = DEFAULT_SERVER_URL;
            prefs.edit().putString(KEY_SERVER_URL, url).apply();
        }
        return url;
    }

    private void saveServerUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            url = DEFAULT_SERVER_URL;
        }
        url = url.trim();
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "https://" + url;
        }
        prefs.edit().putString(KEY_SERVER_URL, url).apply();
    }

    private void loadCurrentUrl() {
        String url = getServerUrl();
        errorView.setVisibility(View.GONE);
        webView.setVisibility(View.VISIBLE);
        tvServerBadge.setText("Connecting...");
        tvServerBadge.setTextColor(0xFFD97706);
        webView.loadUrl(url);
    }

    private void setupWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);

        // Standard caching with support for live reload
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }

        webView.addJavascriptInterface(new WebAppInterface(this), "AndroidApp");

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                if (newProgress < 100) {
                    progressBar.setVisibility(View.VISIBLE);
                    progressBar.setProgress(newProgress);
                } else {
                    progressBar.setVisibility(View.GONE);
                }
            }

            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        request.grant(request.getResources());
                    }
                });
            }

            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                if (fileUploadCallback != null) {
                    fileUploadCallback.onReceiveValue(null);
                }
                fileUploadCallback = filePathCallback;

                Intent intent = null;
                if (fileChooserParams != null) {
                    try {
                        intent = fileChooserParams.createIntent();
                    } catch (Exception ignored) {}
                }

                if (intent == null) {
                    intent = new Intent(Intent.ACTION_GET_CONTENT);
                    intent.addCategory(Intent.CATEGORY_OPENABLE);
                    intent.setType("*/*");
                    intent.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"image/*", "video/*"});
                }

                try {
                    startActivityForResult(Intent.createChooser(intent, "Choose Video or Photo"), REQUEST_FILE_CHOOSER);
                } catch (Exception e) {
                    fileUploadCallback = null;
                    Toast.makeText(MainActivity.this, "Cannot open file picker", Toast.LENGTH_SHORT).show();
                    return false;
                }
                return true;
            }

            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                return super.onConsoleMessage(consoleMessage);
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String url = uri.toString();
                String host = uri.getHost();

                String currentServer = getServerUrl();
                Uri serverUri = Uri.parse(currentServer);

                // Keep same host or path inside WebView
                if (host != null && serverUri.getHost() != null && host.equalsIgnoreCase(serverUri.getHost())) {
                    return false;
                }

                // If external (like TikTok, Instagram, AllmaxNutrition website), open in device default browser or app
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                        startActivity(intent);
                        return true;
                    } catch (Exception e) {
                        return false;
                    }
                }
                return false;
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                errorView.setVisibility(View.GONE);
                webView.setVisibility(View.VISIBLE);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                tvServerBadge.setText("Live Cloud");
                tvServerBadge.setTextColor(0xFF059669);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                if (request.isForMainFrame()) {
                    webView.setVisibility(View.GONE);
                    errorView.setVisibility(View.VISIBLE);
                    tvErrorUrl.setText("Target: " + getServerUrl());
                    tvServerBadge.setText("Disconnected");
                    tvServerBadge.setTextColor(0xFFDC2626);
                }
            }
        });

        webView.setDownloadListener(new DownloadListener() {
            @Override
            public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimeType, long contentLength) {
                try {
                    DownloadManager.Request req = new DownloadManager.Request(Uri.parse(url));
                    req.setMimeType(mimeType != null ? mimeType : "video/mp4");
                    String filename = URLUtil.guessFileName(url, contentDisposition, mimeType);
                    req.setTitle(filename);
                    req.setDescription("Downloading Allmax Studio Mockup Video");
                    req.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                    req.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, filename);

                    DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
                    if (dm != null) {
                        dm.enqueue(req);
                        Toast.makeText(MainActivity.this, "Downloading video to phone storage...", Toast.LENGTH_SHORT).show();
                    }
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "Download error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                }
            }
        });
    }

    private void showServerUrlDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        LayoutInflater inflater = getLayoutInflater();
        View dialogView = inflater.inflate(R.layout.dialog_server_url, null);
        builder.setView(dialogView);

        final EditText etServerUrl = dialogView.findViewById(R.id.etServerUrl);
        Button btnPresetVercel = dialogView.findViewById(R.id.btnPresetVercel);
        Button btnPresetLan = dialogView.findViewById(R.id.btnPresetLan);
        Button btnPresetEmu = dialogView.findViewById(R.id.btnPresetEmu);

        etServerUrl.setText(getServerUrl());
        etServerUrl.setSelection(etServerUrl.getText().length());

        btnPresetVercel.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                etServerUrl.setText(DEFAULT_SERVER_URL);
            }
        });

        btnPresetLan.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                etServerUrl.setText("http://192.168.1.16:3000");
            }
        });

        btnPresetEmu.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                etServerUrl.setText("http://10.0.2.2:3000");
            }
        });

        builder.setTitle(R.string.server_url_dialog_title);
        builder.setPositiveButton(R.string.save_and_reload, new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                String input = etServerUrl.getText().toString();
                saveServerUrl(input);
                loadCurrentUrl();
                Toast.makeText(MainActivity.this, "Server updated to: " + getServerUrl(), Toast.LENGTH_SHORT).show();
            }
        });

        builder.setNegativeButton(R.string.cancel, null);
        builder.setNeutralButton(R.string.reset_default, new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                saveServerUrl(DEFAULT_SERVER_URL);
                loadCurrentUrl();
            }
        });

        builder.show();
    }

    private void checkAndRequestPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            String[] permissions = new String[]{
                    android.Manifest.permission.CAMERA,
                    android.Manifest.permission.RECORD_AUDIO,
                    android.Manifest.permission.MODIFY_AUDIO_SETTINGS
            };

            boolean needRequest = false;
            for (String p : permissions) {
                if (checkSelfPermission(p) != PackageManager.PERMISSION_GRANTED) {
                    needRequest = true;
                    break;
                }
            }

            if (needRequest) {
                requestPermissions(permissions, REQUEST_PERMISSIONS);
            }
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQUEST_FILE_CHOOSER) {
            if (fileUploadCallback == null) return;
            Uri[] results = null;
            if (resultCode == RESULT_OK && data != null) {
                if (data.getData() != null) {
                    results = new Uri[]{data.getData()};
                } else if (data.getClipData() != null) {
                    int count = data.getClipData().getItemCount();
                    results = new Uri[count];
                    for (int i = 0; i < count; i++) {
                        results[i] = data.getClipData().getItemAt(i).getUri();
                    }
                }
            }
            fileUploadCallback.onReceiveValue(results);
            fileUploadCallback = null;
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    public class WebAppInterface {
        Context context;

        WebAppInterface(Context c) {
            context = c;
        }

        @JavascriptInterface
        public void saveBase64Video(String base64Data, String filename) {
            try {
                if (base64Data.contains(",")) {
                    base64Data = base64Data.split(",")[1];
                }
                byte[] decoded = Base64.decode(base64Data, Base64.DEFAULT);
                File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                File file = new File(downloadsDir, filename != null ? filename : "allmax_mockup.mp4");
                FileOutputStream fos = new FileOutputStream(file);
                fos.write(decoded);
                fos.flush();
                fos.close();

                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        Toast.makeText(context, "Mockup saved to Downloads: " + file.getName(), Toast.LENGTH_LONG).show();
                    }
                });
            } catch (Exception e) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        Toast.makeText(context, "Save error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                    }
                });
            }
        }

        @JavascriptInterface
        public void openServerConfig() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    showServerUrlDialog();
                }
            });
        }
    }
}
