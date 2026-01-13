package de.fenecon.fems;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import android.webkit.WebView;
import android.content.Intent;
import android.net.Uri;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WebView.setWebContentsDebuggingEnabled(true);
        // Handle redirect when the app launches fresh
        handleAppUrl(getIntent().getData());
    }

    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);

          // VERY IMPORTANT — required for singleTask/singleTop
        setIntent(intent);

        // Handle redirect when the app is already running
        handleAppUrl(intent.getData());
    }

    private void handleAppUrl(Uri uri) {
        if (uri == null) return;

        // Debug log
        android.util.Log.d("DEEP_LINK", "URL received: " + uri.toString());

        // Send event to JavaScript (optional)
        this.bridge.triggerWindowJSEvent("appUrlOpen", uri.toString());
    }
}
