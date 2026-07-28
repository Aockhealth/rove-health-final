package com.rovehealth.app;

import android.os.Bundle;
import androidx.activity.EdgeToEdge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        EdgeToEdge.enable(this);
        super.onCreate(savedInstanceState);

        // Some devices (e.g. OnePlus/OxygenOS) apply the system font-size/display-size
        // setting to the WebView's text zoom, which blows up the whole layout. Lock it
        // to 100% so the app renders the same regardless of device accessibility settings.
        getBridge().getWebView().getSettings().setTextZoom(100);
    }
}
