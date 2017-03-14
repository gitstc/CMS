var Utils = {
    getServerURL: function(callback) {
        
        var url = localStorage.getItem("url");
        
        if(navigator.simulator || isAndroid || !ApplicationPreferencesPlugin) {
            setURL(url);
            callback ? callback(apiURL) : false;
            return;
        }
        
        ApplicationPreferencesPlugin.get("serverURL", function(serverURL) {
            
            setURL(serverURL);
            callback ? callback(apiURL) : false;
            
        }, function() {
            
            setURL(url);
            callback ? callback(apiURL) : false;
            
        });
        
        function setURL(_url) {
            /*apiURL = _url.split(",")[0] + "/Service.svc/Normal/";
            nodeURL = "http://" + _url.split("http://")[1].split(":")[0].split(",")[0] + ":" + _url.split(",")[1];
            mainURL = "http://" + _url.split("http://")[1].split(",")[0];
            
            localStorage.setItem("mainURL", mainURL);
            localStorage.setItem("apiURL", apiURL);
            localStorage.setItem("nodeURL", nodeURL);*/
            
            var protocol = _url.match(/\http[s]{0,1}:\/\//) || [];
            protocol.length > 0 ? protocol = protocol[0] : protocol = "http://";
            
            var ipReg = new RegExp(/(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/);
            //var ip = _url.match(/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/);
            var ip = _url.match(ipReg) || [];
            ip.length > 0 ? ip = ip[0] : ip = "0.0.0.0";
            
            var wcfPort = _url.match(/\:[0-9]{1,5}/) || [];
            wcfPort.length > 0 ? wcfPort = wcfPort[0].replace(/\:/g, '') : wcfPort = "0";
            
            var nodePort = _url.match(/\,[0-9]{1,5}/) || [];
            nodePort.length > 0 ? nodePort = nodePort[0].replace(/\,/g,'') : nodePort = "0";
            
            var host = protocol + ip;
            
            apiURL = host + ":" + wcfPort + "/Service.svc/Normal/";
            nodeURL = host + ":" + nodePort;
            mainURL = host + ":" + wcfPort;

            localStorage.setItem("mainURL", mainURL);
            localStorage.setItem("apiURL", apiURL);
            localStorage.setItem("nodeURL", nodeURL);
        }
        
    },
    getBundleID: function(successCB, errorCB) {
        var path = cordova.file.applicationDirectory;
        if (!path || path === "") {
            errorCB ? errorCB() : false;
            return;
        }

        var reg = "[a-zA-Z0-9]{8}\-[a-zA-Z0-9]{4}\-[a-zA-Z0-9]{4}\-[a-zA-Z0-9]{4}\-[a-zA-Z0-9]{12}";
        reg = new RegExp(reg);
        var res = path.match(reg);
        res && res.length > 0 ? (successCB ? successCB(res[0]) : false) : (errorCB ? errorCB() : false);
    },
    getDeviceSerial: function(callback) {
        
        var _serial = {};
        
        if(navigator.simulator || !window["DeviceIDPlugin"]) {
            _serial["Serial"] = device.uuid;
            _serial["SerialNumber"] = device.uuid;
            callback ? callback(_serial) : false;
        }
        else {
            DeviceIDPlugin.getUDID(function(serial) {
                
                _serial["Serial"] = serial;
                
                DeviceIDPlugin.getDeviceID(function(serialNumber) {
                    
                    _serial["SerialNumber"] = serialNumber;
                    callback ? callback(_serial) : false;
                    
                });
            });
        }
    },
    registerDevice: function(serial, callback) {
        
        WebService.POST("registerDevice", {
            serialNumber: serial.Serial,
            deviceSerialNumber: serial.SerialNumber
        }, function(data) {
            
            if (parseInt(data) > 0) {
                //success
                callback({
                    result: data,
                    error: false
                });
            } else {
                if (parseInt(data) === -101) {
                    //max limit reached
                    callback({
                        result: "",
                        error: "Maximum number of allowed devices has already been reached!"
                    });
                } else {
                    //server error
                    callback({
                        result: "",
                        error: "Server Error"
                    });
                }
            }

        }, function(error) {
            
            callback({
                result: "",
                error: error
            });
            
        });
        
    },
    getSystemParameters: function(callback) {
        var sysParams = {};
        WebService.POST("getSystemParams", {}, function(data) {
            try{
                for (d in data) {
                    var val = data[d].Value;
                    if (val.toString().toLowerCase() === "yes") {
                        val = true;
                    } else if (val.toString().toLowerCase() === "no") {
                        val = false;
                    }
                    sysParams[data[d].Key] = val;
                }

                localStorage.setItem("SystemParameters", JSON.stringify(sysParams));

                callback ? callback(true) : false;
            }
            catch(ex){
                callback ? callback(false) : false;
            }
            
        }, function(error) {
            console.log("Could not get system parameters!");
            callback ? callback(false) : false;
        });
    },
    handleClick: function(e) {
        try {
            e.preventDefault();
            e.stopPropagation();
        }
        catch(ex) {}
    },
    showLoading: function(timeout) {
        setTimeout(function() {
            app.showLoading();
            
            setTimeout(function() {
                Utils.hideLoading();
            }, timeout || 10000);
            
        }, 0);
    },
    hideLoading: function() {
        setTimeout(function() {
            app.hideLoading();
        }, 0);
    },
    alert: function(title, message, callback) {
        if(!message) {
            message = title;
            title = "Alert";
        }
        
        navigator.notification.alert(message, callback, title, "Ok");    
    },
    confirm: function(message, callback, title, buttons) {
        navigator.notification.confirm(message, callback, title, buttons);
    },
    openModal: function(modalID) {
        Utils.handleClick(modalID);
        
        var modal = $(modalID).data("kendoMobileModalView");
        if(modal) {
            modal.open();
        }
    },
    closeModal: function(e) {
        var modal;
    	if ($.type(e.target) !== "object") {
    		modal = e.target.closest("div[data-role='modalview']").data("kendoMobileModalView");
    	} else {
    		modal = $(e.target).closest("div[data-role='modalview']").data("kendoMobileModalView");
    	}
    	modal.close();
    },
    navigate: function(href, dir, popover) {
        //app.navigate(href, dir);
        
        dir = dir || "slide:left";
        popover = popover || "";
        
        if(href.indexOf(".html") < 0){
            if(href.indexOf("#") < 0){
                href = "#" + href;
            }
        }
        if(href === "#:back"){
            dir += " reverse";
        }
        
        if(popover.length > 0) {
            $(popover).data("kendoMobilePopOver").pane.navigate(href, dir);
            return;
        }
        
        if(!navigator.simulator && window["NativePageTransitionsKendoAdapter"]){
            
            if(dir.indexOf("reverse") >= 0){
                dir = "right";
            }
            else{
                dir = "left";
            }

            var androidDelay = "100";
            var iOSDelay = "200";
            var duration = "400";
    		setTimeout(function() {
    			window.kendo.mobile.application.pane.navigate(href);
    		}, 0);
            if(dir.indexOf("flip") > 0) {
                if(dir.indexOf(":") < 0) {
                    dir = dir.substr(dir.indexOf(":") + 1);
                }
                else {
                    dir = "left";
                }
                window.NativePageTransitionsKendoAdapter.flip(dir, null, androidDelay, iOSDelay, duration);
            }
            else {
                window.NativePageTransitionsKendoAdapter.slide(dir, null, androidDelay, iOSDelay, duration);
            }
        }
        else{
            console.log("Using KendoUI Transitions");
            app.navigate(href, dir);
        }
    },
    getPicturePath: function(pic) {
        return mainURL + ("/" + pic).replace("//", "/");
    },
    getProfilePicturePath: function(pic, isStudent) {
        return mainURL + "/ProfilePictures/" + (isStudent ? "students/" : "") + pic;
    },
    openPopover: function(popover, target) {
        popover = $(popover).data("kendoMobilePopOver");
        
        if(!popover) {
            return;
        }
        
        popover.open(target);
    },
    closePopover: function(popover) {
        popover = $(popover).data("kendoMobilePopOver");
        
        if(!popover) {
            return;
        }
        
        popover.close();
    },
    viewLink: function(link, options) {
        options = options || {};
        var _options = "EnableViewPortScale=yes";
        if(options["enableLocation"]) {
            _options += ",location=yes";
        }
        else {
            _options += ",location=no";
        }
        if(options["enableToolbar"]) {
            _options += ",toolbar=yes";
        }
        else {
            _options += ",toolbar=no";
        }
        
        if(window["inAppBrowser"] && window["inAppBrowser"] !== null) {
            window["inAppBrowser"].close();
            window["inAppBrowser"] = null;
        }
        
        try {
            window["inAppBrowser"] = window.open(encodeURI(link), "_blank", _options);
        }
        catch(ex) {
            console.log("Could not open link!");
        }
        
        return window["inAppBrowser"];
    },
    showNotification: function(message) {
        if (!SystemParameters.EnableNotifications) {
    		return;
    	}
        
        var bar = $("#notification-bar");
        bar.find(".message").text(message);
        bar.show();
        bar.addClass("visible");
        setTimeout(function() {
            bar.removeClass("visible");
            setTimeout(function() {
                bar.hide();
            }, 3000);
        }, 3000);
    },
    getPicture: function(callback, options){
        options = options || {};
        
        if(navigator.simulator){
            Utils.getPictureFromSource(navigator.camera.PictureSourceType.PHOTOLIBRARY, callback, options);
            return;
        }
        
        if(options.source){
            if(options.source === "gallery"){
                Utils.getPictureFromSource(navigator.camera.PictureSourceType.PHOTOLIBRARY, callback, options);
                return;
            }
            else if(options.source === "camera"){
                Utils.getPictureFromSource(navigator.camera.PictureSourceType.CAMERA, callback, options);
                return;
            }
        }

        //Show a Gallery/Camera action sheet to get the source of the picture
		window.plugins.actionsheet.show({
            'androidTheme': window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT, // default is THEME_TRADITIONAL
			'title': 'Get Picture',
			'buttonLabels': ['Take Photo', 'Choose From Library'],
			'androidEnableCancelButton': false, // default false
			'winphoneEnableCancelButton': true, // default false
			'addCancelButtonWithLabel': 'Cancel',
			'position': options.position || [20, 40] // for iPad pass in the [x, y] position of the popover
        }, function(buttonIndex){
            if(buttonIndex === 1) {
                //Camera
                Utils.getPictureFromSource(navigator.camera.PictureSourceType.CAMERA, callback, options);
                return;
            }
            else if(buttonIndex === 2) {
                //Gallery
                Utils.getPictureFromSource(navigator.camera.PictureSourceType.PHOTOLIBRARY, callback, options);
                return;
            }
        });
        
    },
    getPictureFromSource: function(source, callback, options){
        options = options || {};
        
        if(source.toString().toLowerCase() === "gallery"){
            source = navigator.camera.PictureSourceType.PHOTOLIBRARY;
        }
        if(source.toString().toLowerCase() === "camera"){
            source = navigator.camera.PictureSourceType.CAMERA;
        }
        
        window.gettingPicture = true;
        navigator.camera.getPicture(function(picture){
            if(!options.destinationType || (options.destinationType && options.destinationType === Camera.DestinationType.DATA_URL)){
                picture = "data:image/png;base64," + picture;
            }
            callback ? callback(picture) : false;
        }, function(err) {
            console.log(JSON.stringify(err));
			callback ? callback("") : false;
		}, {
			quality: options.quality || 50,
			targetWidth: options.targetWidth || 1024,
			targetHeight: options.targetHeight || 1024,
			destinationType: options.destinationType || Camera.DestinationType.DATA_URL,
			sourceType: source,
			correctOrientation: true
		});
    },
    validateURL: function(urlToValidate) {
        //RegExp http{s}://123.123.123.123:12345,12345
        var regExp = new RegExp(/http[s]*\:\/\/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\:[0-9]{1,5}\,[0-9]{1,5}/);
        return regExp.test(urlToValidate.toLowerCase());
    },
	getDownloadPath: function(target, callback) {
        
        if(window["mainURL"]) {
            target = target.replace(mainURL, "");
        }
        
		var fileDir = "";
		if (device.platform.toLowerCase() === "android") {
			fileDir = cordova.file.externalDataDirectory;
		} else {
			fileDir = cordova.file.dataDirectory;
		}

		window.resolveLocalFileSystemURL(fileDir, function(dir) {
			Utils.createDirectory(dir, target.substr(0, target.lastIndexOf("/")), function(res) {
				res.getFile(target.substr(target.lastIndexOf("/") + 1), {
					create: true,
					exclusive: false
				}, function(entry) {
					callback ? callback(entry.toURL()) : false;
				}, onError);
			}, onError);
		}, onError);

		function onError() {
			callback ? callback(target) : false;
		}
	},
	createDirectory: function(root, path, successCB, errorCB) {
		var dirs = path.split("/").reverse();

		var createDir = function(dir) {
			root.getDirectory(dir, {
				create: true,
				exclusive: false
			}, successGetDir, failGetDir);
		};

		var successGetDir = function(entry) {
			root = entry;
			if (dirs.length > 0) {
				createDir(dirs.pop());
			} else {
				successCB ? successCB(entry) : false;
			}
		};

		var failGetDir = function(error) {
			errorCB ? errorCB(error) : false;
		};

		createDir(dirs.pop());
	},
    deleteDirectory: function(target, callback) {
        var fileDir = "";
		if (device.platform.toLowerCase() === "android") {
			fileDir = cordova.file.externalDataDirectory;
		} else {
			fileDir = cordova.file.dataDirectory;
		}

		window.resolveLocalFileSystemURL(fileDir, function(dir) {
			Utils.createDirectory(dir, target.substr(0, target.lastIndexOf("/")), function(res) {
				dir.getDirectory(target, {create:false, exclusive: false}, function(targetDir) {
                    
                    targetDir.removeRecursively(function() {
                        console.log("Directory Deleted!");
                        callback ? callback(true) : false;
                    }, function() {
                        callback ? callback(false) : false;
                    });
                    
                }, function() {
                    //Directory not found
                    callback ? callback(true) : false;
                });
			}, function() {
                callback ? callback(false) : false;
            });
		}, function() {
            callback ? callback(false) : false;
        });

		function onError() {
			callback ? callback(target) : false;
		}
    }
}

$.prototype.loadBackgroundImage = function(image, fallbackImage, callback) {
    
    var element = $(this);
    
    element.css("background-image", "none");
    
    var img = new Image();
    img.onload = function() {
        element.css("background-image", "url(" + img.src + ")");
        callback ? callback(img) : false;
    };
    img.onerror = function() {
        if(!fallbackImage || fallbackImage === "") {
            fallbackImage = "./images/icons/imageIcon.png";
        }
        element.css("background-image", "url(" + fallbackImage + ")");
        callback ? callback(false) : false;
    };
    img.src = image;
}
$.prototype.fixScroll = function() {
    var scroll = $(this);
    var scroller = scroll.data("kendoMobileScroller");
    
    if(!scroller) {
        return;
    }
    
    var scrollTop = scroller.scrollTop;
    var maxScrollTop = scroller.scrollHeight() - scroll.height();
    if(maxScrollTop < 0) {
        maxScrollTop = 0;
    }
    
    if(scrollTop > maxScrollTop) {
        scroller.scrollTo(0, -maxScrollTop);
    }
    else if(scrollTop < 0) {
        scroller.scrollTo(0, 0);
    }
}

$.event.special.trippleclick = {

    setup: function(data, namespaces) {
        var elem = this, $elem = jQuery(elem);
        $elem.bind('click', jQuery.event.special.trippleclick.handler);
    },

    teardown: function(namespaces) {
        var elem = this, $elem = jQuery(elem);
        $elem.unbind('click', jQuery.event.special.trippleclick.handler)
    },

    handler: function(event) {
        var elem = this, $elem = jQuery(elem), clicks = $elem.data('clicks') || 0, timestamp = $elem.data('timestamp') || Date.now();
        
        var ts = Date.now();
        console.log(ts, timestamp, ts - timestamp);
        if(ts - timestamp > 500) {
            clicks = 0;
        }
        
        clicks += 1;
        if ( clicks === 3 ) {
            clicks = 0;

            // set event type to "trippleclick"
            event.type = "trippleclick";
            
            // let jQuery handle the triggering of "trippleclick" event handlers
            jQuery.event.dispatch.apply(this, arguments);
        }
        $elem.data('clicks', clicks);
        $elem.data('timestamp', ts);
    }
    
};

window.onerror = function(error, url, line) {
    Utils.alert("Error at line (" + line + "): " + JSON.stringify(error));
    //Utils.alert("Error in " + url + " at line (" + line + "): " + JSON.stringify(error));
}