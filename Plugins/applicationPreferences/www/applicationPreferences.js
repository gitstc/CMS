module.exports = {
    get: function(key,success,fail){
        console.log("Get Function");
        cordova.exec(success, fail, "applicationPreferences", "getSetting", [key]);
    },
    set: function(key,value,success,fail){
        console.log("Set Function");
        cordova.exec(success, fail, "applicationPreferences", "setSetting", [key,value]);
    }
};