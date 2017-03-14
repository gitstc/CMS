/**
 * Copyright (C) 2012 30ideas (http://30ide.as)
 * MIT licensed
 * 
 * @author Josemando Sobral
 * @created Jul 2nd, 2012.
 */
package org.stc.FBScreenshot;

import java.io.*;

/*============CORDOVA 3.2==============*/
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.PluginResult;
/*===========/CORDOVA 3.2==============*/

/*============CORDOVA 2.9==============*/
//import org.apache.cordova.api.CordovaPlugin;
//import org.apache.cordova.api.CallbackContext;
//import org.apache.cordova.api.PluginResult;
/*============CORDOVA 2.9==============*/

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.graphics.Bitmap;
import android.os.Environment;
import android.view.View;
import android.util.Base64;

import android.view.Window;

public class FBScreenshot extends CordovaPlugin {
        @Override
        public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
                // starting on ICS, some WebView methods
                // can only be called on UI threads
                final CallbackContext that = callbackContext;
                /*
                int q = (Double.valueOf(Float.toString(Float.parseFloat(args.getString(0)) * 100))).intValue();
                if(q > 100){
                    q = 100;
                }
                final int quality = q;
                */
                try{
                    final int quality = Integer.parseInt(args.getString(0));

                    super.cordova.getActivity().runOnUiThread(new Runnable() {
                            //@Override
                            public void run() {
                                    //View view = webView.getRootView();
                                    View view = cordova.getActivity().getWindow().getDecorView().getRootView();

                                    view.setDrawingCacheEnabled(true);
                                    Bitmap bitmap = Bitmap.createBitmap(view.getDrawingCache());
                                    bitmap = Bitmap.createScaledBitmap(bitmap,view.getWidth() / quality,view.getHeight() / quality,true);
                                    view.setDrawingCacheEnabled(false);

                                    try {
                                            ByteArrayOutputStream baos = new ByteArrayOutputStream();  
                                            bitmap.compress(Bitmap.CompressFormat.PNG, 100, baos);  
                                            byte[] b = baos.toByteArray();
                                            String encoded = "data:image/png;base64," + Base64.encodeToString(b,Base64.DEFAULT);
                                            that.success(encoded);
        
                                    } catch (Exception e) {
                                            that.error("Fail");
                                    }
                            }
                    });
                }
                catch(Exception e){
                    that.error("Screenshot Exception: " + e.getMessage());
                }
                return true;
        }
}