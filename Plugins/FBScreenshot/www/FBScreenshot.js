module.exports = {
    takeScreenshot : function(successCallback, errorCallback, quality){
        console.log("Attempting to take screenshot!");
        onSuccess = function(imageData) {
            successCallback(imageData);  
        };
        onError = function(error) {
            errorCallback(error);
        };
        quality ? quality : (device.platform.toLowerCase() === "ios" ? 0 : 1);
        cordova.exec(onSuccess, onError, "FBScreenshot", "takeScreenshot", [quality]);
    }
}