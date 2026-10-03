package com.aparaitech.hrms;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Apply dark navy system bars for authentic native mobile experience
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            getWindow().setStatusBarColor(android.graphics.Color.parseColor("#0a192f"));
            getWindow().setNavigationBarColor(android.graphics.Color.parseColor("#0a192f"));
        }
    }

    @Override
    public void onStart() {
        super.onStart();
        try {
            WebView webview = getBridge() != null ? getBridge().getWebView() : null;
            if (webview != null) {
                // Prevent browser-like overscroll bounce and scroll bars
                webview.setOverScrollMode(View.OVER_SCROLL_NEVER);
                webview.setVerticalScrollBarEnabled(false);
                webview.setHorizontalScrollBarEnabled(false);

                // Disable browser zoom controls so touch feels like native app
                WebSettings settings = webview.getSettings();
                settings.setDisplayZoomControls(false);
                settings.setBuiltInZoomControls(false);
                settings.setSupportZoom(false);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
