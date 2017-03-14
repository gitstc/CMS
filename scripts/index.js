var url = localStorage.getItem("url") || "http://192.168.1.50:511,441";

//var url = localStorage.getItem("url") || "http://76.12.247.19:508,441";
//var url = localStorage.getItem("url") || "http://82.212.67.141:502,504";

//var url = localStorage.getItem("url") || "http://172.16.17.100:507,441"; //PRIMARY
//var url = localStorage.getItem("url") || "http://172.16.18.100:507,441"; //SECONDARY
//var url = localStorage.getItem("url") || "http://172.168.1.125:508,441";
//var url = localStorage.getItem("url") || "http://192.168.1.50:508,441";
var mainURL = "", apiURL = "", nodeURL = "";

var app;
var appVersion = "1.0";

var isAndroid = false;
var currentDeviceSN = "";
var currentDeviceSerialNumber = "";

$(function() {
   
    document.addEventListener("deviceready", bootstrap, false);
    document.addEventListener("backbutton", function(){}, false);
    
    FastClick.attach(document.body);
    
    $("#settingsButton").on("trippleclick", function() {
        
        function showPasswordPrompt() {
            navigator.notification.prompt("Please enter the admin password", function(e) {
                
                if(e.buttonIndex === 1) {
                    return;
                }
                
                if(e.input1 !== "P@ssw0rdiec") {
                    Utils.alert("Server URL", "Incorrect password!", showPasswordPrompt);
                    return;
                }
                
                function showURLPrompt() {
                    navigator.notification.prompt("Please enter the server URL", function(e) {
                        if(e.buttonIndex === 2) {
                            url = $.trim(e.input1);
                            
                            if(!Utils.validateURL(url)) {
                                Utils.alert("Server URL", "Incorrect format!\nThe correct url should look like this: \"http://{ip}:{port1},{port2}\"", showURLPrompt);
                                return;
                            }
                            localStorage.setItem("url", url);
                        }
                        
                    }, "Server URL", ["Cancel", "Save"], url || "");
                }
                
                showURLPrompt();
                
            }, "Server URL", ["Cancel", "Ok"]);
        }
        
        showPasswordPrompt();
    });
    
});

function bootstrap() {
    
    isAndroid = (device.platform.toLowerCase() === "android");
    
    localStorage.setItem("url", url);
    
    try {
        cordova.getAppVersion.getVersionNumber(function (version) {
            $(".appVersion").html(version);
            appVersion = version.toString();
        });
    }
    catch(ex){
        $(".appVersion").html("1.0");
    }
    
    app = new kendo.mobile.Application(document.body, {
        skin: "flat",
        init: initApp
    });
    
    try {
        if(isAndroid) {
            Utils.deleteDirectory("tmp/appUpdates", function() {});
        }
    }
    catch(ex) {}
    
    try {
        window.plugins.insomnia.keepAwake();
    }
    catch(ex) {}
}

function initApp() {
    
    DB.initDB(null, function(){
        return;
        DB.getCurrentUser(function(user){
            if(user){
                $("#loginView #txtUsername").val(user.Username);
                $("#loginView #txtPassword").val(user.Password);
            }
        });
        
        DB.getPreference("DeviceSerial", function(deviceSerial){
            currentDeviceSN = deviceSerial;
            console.log("device serial: " + deviceSerial);
            
            DB.getPreference("DeviceSerialNumber", function(deviceSerialNumber){
                currentDeviceSerialNumber = deviceSerialNumber;
                console.log("device serial number: " + deviceSerialNumber);
                
                if($.trim(currentDeviceSerialNumber).length === 0) {
                    Utils.getDeviceSerial(function(serial) {
                        console.log("serial", serial);
                        if(serial["Serial"] && serial["SerialNumber"]) {
                            Utils.registerDevice(serial, function(result) {
                                
                                if(result.error && result.result !== "") {
                                    Utils.alert("Error", result.result);
                                    return;
                                }
                                
                                DB.setPreference("DeviceSerial", serial.Serial);
                                DB.setPreference("DeviceSerialNumber", serial.SerialNumber);

                            });
                        }
                        else {
                            console.log("Could not get device serial number!");
                        }
                    });
                }
                else {
                    Utils.registerDevice({
                        Serial: deviceSerial,
                        SerialNumber: deviceSerialNumber
                    }, function(result) {
                                
                        if(result.error && result.result !== "") {
                            Utils.alert("Error", result.result);
                            return;
                        }
                        
                        DB.setPreference("DeviceSerial", deviceSerial);
                        DB.setPreference("DeviceSerialNumber", deviceSerialNumber);

                    });
                }
            });
        });
    });
    
    Utils.getBundleID(function(bundleID) {
        console.log("Bundle ID: " + bundleID);
        localStorage.setItem("bundleID", bundleID);
    }, function() {
        console.log("Could not get bundle ID");
    });
    
    $("#loginView #txtUsername").keyup(function(event) {
        if (event.keyCode === 13) {
            loginClicked(event);
        }
    });
    $("#loginView #txtPassword").keyup(function(event) {
        if (event.keyCode === 13) {
            loginClicked(event);
        }
    });
    
}

function loginClicked(e) {
    try {
        e.preventDefault();
        e.stopPropagation();
    }
    catch(ex) {}
    
    var username = $("#txtUsername").val();
    var password = $("#txtPassword").val();
    
    if($.trim(username).length === 0 || $.trim(password).length === 0) {
        Utils.alert("Error", "Please enter both username and password!");
        return;
    }
    
    login(username, password);
}

function login(username, password) {
    Utils.showLoading();
    
    console.log("Serial : " + window["currentDeviceSN"]);
    //return;
    
    WebService.GET("wb_Login", {
        username: username,
        password: password,
        serial: window["currentDeviceSN"] || "",
        verion: ""
    }, function(resp){
        if(resp.Status === "success") {
            
            if(resp.isAdmin === 1) {
                return;
            }
            
            DB.setPreference("Username", username, function() {
                DB.setPreference("Password", password, function() {
                    
                    $.each(localStorage, function(k,v){
                        //ExamRerunID -> persist_ExamRerunID
                        if(k.indexOf("persist_") > -1){
                            localStorage.removeItem(k);
                        }
                    });
                    
                    localStorage.setItem("currentUserID", resp.ID);
                    localStorage.setItem("currentUserCode", resp.Code);
                    localStorage.setItem("currentUserMobileID", resp.MobileID);
                    localStorage.setItem("currentUserName", resp.Name);
                    localStorage.setItem("currentUserShortName", resp.ShortNameA);
                    localStorage.setItem("currentUserShortNameE", resp.ShortNameE);
                    localStorage.setItem("isTeacher", resp.isTeacher);
                    
                    if(resp.isTeacher === 0) {
                        localStorage.setItem("TeacherName", resp.TeacherName);
                        localStorage.setItem("GroupID", resp.GroupID);
                    }
                    
                    Utils.getSystemParameters(function() {
                        
                        localStorage.removeItem("socketRoom");
                        localStorage.removeItem("currentSectionID");
                        localStorage.removeItem("currentClassID");
                        localStorage.removeItem("currentSubjectID");
                        localStorage.removeItem("currentUnitID");
                        
                        if(resp.isTeacher === 0) {
                            window.location.href = "student.html";
                        }
                        else {
                            window.location.href = "teacher.html";
                        }
                    });
                });
            });
            
            return;
        }
        else if(resp.Status === "-3") {
            //Unauthorized Device
            Utils.alert("Error", "This device is unauthorized!");
        }
        else if(resp.Status === "-2") {
            //Unregistered Device
            Utils.alert("Error", "This device is unregistered!");
        }
        else if(resp.Status === "-4") {
            //Unauthorized User
            Utils.alert("Error", "User not authorized to use this device!");
        }
        else if(resp.Status === "-6") {
            //Relogin Command
            login(username, password);
        }
        else if(resp.Status === "-10") {
            //Old Verion
            Utils.alert("Error", "This version is out of date.\nPlease contact the administrator to get the latest update");
        }
        else {
            //Incorrect Credentials
            Utils.alert("Error", "Incorrect username or password!");
        }
        
        Utils.hideLoading();
        
    }, function(error){
        Utils.alert("Server Error", "Could not login!");
        Utils.hideLoading();
    });
}

function getServerURL(callback){
    
    
}

function checkForUpdates(e) {
    Utils.handleClick(e);
    
    if(navigator.simulator) {
        Utils.alert("Error", "Cannot download updates on simulator!");
        return;
    }
    
    WebService.POST("wb_getLatestVersion", {
        CurrentVersion: appVersion || "",
        Platform: device.platform.toLowerCase()
    }, function(resp) {
        if(resp.Error) {
            if(resp.ErrorNumber === 0) {
                Utils.alert("UPDATE", resp.Result);
                return;
            }
            Utils.alert("Error", resp.Result);
            return;
        }
        
        var updateLink = resp.Result.Link;
        if(updateLink.indexOf("http") < 0) {
            updateLink = mainURL + "/" + updateLink;
        }
        /*
        var link = $("<a href='" + updateLink + "' target='blank'></a>");
        link.click();
        */
        
        Utils.confirm("An update is available (v." + resp.Result.Version + ")! Would you like to download it?", function(buttonIndex) {
            if(buttonIndex === 2) {
                if(!isAndroid) {
                    window.open(encodeURI(updateLink), "_blank", "location=no");
                    return;
                }
                
                //Android: download to tmp path and install it using fileOpener2
                var filePath = "tmp/appUpdates/" + Date.now() + updateLink.substr(updateLink.lastIndexOf("."));
                Utils.getDownloadPath(filePath, function(path) {
                    $("#progressModal").data("kendoMobileModalView").open();
                    
                    var ft = new FileTransfer();
                    ft.onprogress = function(progressEvent) {
                        var prog = progressEvent.loaded / progressEvent.total;
                        $("#progressModal").find(".progressBar").css("right", 100 - (prog * 100) + "%");
                        if (prog === 1) {
                    		$("#progressModal").data("kendoMobileModalView").close();
                    	}
                        $("#progressModal").find(".progressMessage").html("Downloading Updates " + parseInt(prog * 100) + "%");
                        console.log("prog : " + prog)
                        console.log("prog : " + (100 - (prog * 100)))
                    };
                    ft.download(
                        encodeURI(updateLink),
                        path,
                        function(fileEntry) {
                            if(!(cordova.plugins && cordova.plugins.fileOpener2)) {
                                Utils.alert("Error", "Could not install update!");
                                return;
                            }
                            
                            console.log("Local installation path: " + fileEntry.toURL());
                            
                            Utils.alert("Warning", "The application will close once the update finishes installing.", function() {
                                cordova.plugins.fileOpener2.open(
                                    fileEntry.toURL(),
                                    'application/vnd.android.package-archive',
                                    {
                                        error: function(error) {
                                            console.log("Update Install Error: " + JSON.stringify(error));
                                            Utils.alert("Error", "Could not install update!");
                                        },
                                        success: function() {
                                            console.log("Opened Update!");
                                        }
                                    }
                                );
                            });
                        },
                        function(error) {
                            $("#progressModal").data("kendoMobileModalView").close();
                            Utils.alert("Error", "Failed to download the update!");
                            console.log("App Install Error: " + JSON.stringify(error));
                        }
                    );
                    
                }, function(error) {
                    Utils.alert("Error", "Could not download update!");
                });
            }
        }, "UPDATE", ["No", "Yes"]);
        
    }, function(error) {
        Utils.alert("Error", "Could not get latest version!");
    });
}

//Set Progress Bar Precent 
function setProgress(current, total) {
    if($("#progressModal").closest(".km-modalview-root").length < 1 || !$("#progressModal").closest(".km-modalview-root").hasClass(".k-state-border-down")) {
        $("#progressModal").data("kendoMobileModalView").open();
    }
	var prog = 1;
	if (parseInt(current) === 0 || parseInt(total) === 0) {
		prog = 1;
	} else {
		prog = (parseInt(current) / parseInt(total));

	}
	console.log("prog : " + prog)
	$("#progressModal").find(".progressBar").css("right", 100 - (prog * 100) + "%");
	if (prog === 1) {
		$("#progressModal").data("kendoMobileModalView").close();
	}
	$("#progressModal").find(".progressMessage").html("Downloading Updates " + parseInt(prog * 100) + "%");
    
    console.log("Download Progress: " + parseInt(prog * 100));
}