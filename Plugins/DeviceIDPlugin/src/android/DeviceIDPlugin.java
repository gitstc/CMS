package com.stc.DeviceIDPlugin;

import org.apache.cordova.*;
import org.json.*;

import android.os.Build;
import android.content.Context;
import android.telephony.TelephonyManager;

public class DeviceIDPlugin extends CordovaPlugin {
	@Override
	public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
    	if(action.equals("getUniqueIdentifier")){
			try{
				Context context = this.cordova.getActivity().getApplicationContext();
				String deviceId = ((TelephonyManager) context.getSystemService(Context.TELEPHONY_SERVICE)).getDeviceId();
                if (deviceId == null) {
                    deviceId = android.os.Build.SERIAL;
                }
				PluginResult pluginRes = new PluginResult(PluginResult.Status.OK, deviceId);
				callbackContext.sendPluginResult(pluginRes);
			}
			catch(Exception ex){
				PluginResult pluginRes = new PluginResult(PluginResult.Status.ERROR, ex.getMessage());
				callbackContext.sendPluginResult(pluginRes);
			}
		}
		return true;
	}
}