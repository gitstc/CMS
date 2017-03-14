module.exports = {
	getDeviceID: function(successCallback){
        cordova.exec(successCallback, false, 'DeviceIDPlugin',
			'getUniqueIdentifier', []);
        /*
		cordova.exec(successCallback, false, 'DeviceIDPlugin',
			'getDeviceID', []);
        */
	},
    getUDID: function(successCallback){
        cordova.exec(successCallback, false, 'DeviceIDPlugin',
			'getUniqueIdentifier', []);
    }
};