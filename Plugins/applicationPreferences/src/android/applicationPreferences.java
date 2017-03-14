package org.stc.applicationPreferences;

//===============CORDOVA < 3.0==============//
//import org.apache.cordova.api.CallbackContext;
//import org.apache.cordova.api.CordovaPlugin;
//import org.apache.cordova.api.PluginResult;
//==========================================//
//===============CORDOVA > 3.0==============//
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
//==========================================//
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
 
import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;
 
public class applicationPreferences extends CordovaPlugin {
 
    public static final String LOG_PROV = "PhoneGapLog";
	public static final String LOG_NAME = "applicationPreferences Plugin";
 
	@Override
	public boolean execute(String action, JSONArray args, CallbackContext callbackContext) {
		String preferenceLib = "";
		String preferenceName = "";
		String preferenceValue = "";
		SharedPreferences settings = null;
		SharedPreferences.Editor editor = null;
		try {
			preferenceLib = "MyPreferences";
			preferenceName = args.getString(0);
            
            if (action.equals("getSetting")){
				if (preferenceLib != null && preferenceName != null && preferenceLib != "" && preferenceName != "") {
				settings = cordova.getActivity().getSharedPreferences(preferenceLib, Context.MODE_PRIVATE);
				editor = settings.edit();
				
				String returnValue = settings.getString(preferenceName, "");
				Log.d(LOG_PROV, LOG_NAME + ": Get value: " + preferenceLib + ":" + preferenceName + ":" + returnValue);
				callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.OK, returnValue));
				return true;
				
				} else {
					Log.e(LOG_PROV, LOG_NAME + ": Error: " + PluginResult.Status.ERROR);
					callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.ERROR));
					return false;
				}
			}
			else if (action.equals("setSetting")){
				preferenceValue = args.getString(1);
				
				if (preferenceLib != null && preferenceName != null && preferenceValue != null && preferenceLib != "" && preferenceName != "") {
				settings = cordova.getActivity().getSharedPreferences(preferenceLib, Context.MODE_PRIVATE);
				editor = settings.edit();
				
				editor.putString(preferenceName, preferenceValue);
				editor.commit();
				Log.d(LOG_PROV, LOG_NAME + ": Set value: " + preferenceLib + ":" + preferenceName + ":" + settings.getString(preferenceName, ""));
				callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.OK));
				return true;
				
				} else {
					Log.e(LOG_PROV, LOG_NAME + ": Error: " + PluginResult.Status.ERROR);
					callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.ERROR));
					return false;
				}
			}
			else{
				callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.INVALID_ACTION));
				return false;
			}
		} catch (JSONException e) {
			e.printStackTrace();
			Log.e(LOG_PROV, LOG_NAME + ": Error: " + PluginResult.Status.JSON_EXCEPTION);
			callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION));
			return false;
		}
	}
}