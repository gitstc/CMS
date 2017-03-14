var mainURL = localStorage.getItem("mainURL");
var apiURL = localStorage.getItem("apiURL");
var nodeURL = localStorage.getItem("nodeURL");

//===================================================================================//
var currentUserID = localStorage.getItem("currentUserID");
var currentUserCode = localStorage.getItem("currentUserCode");
var currentUserName = localStorage.getItem("currentUserName");
var currentUserShortName = localStorage.getItem("currentUserShortName");
var currentUserShortNameE = localStorage.getItem("currentUserShortNameE");
var currentUserMobileID = localStorage.getItem("currentUserMobileID");
var userID = currentUserID;
var isTeacher = 0;
var socket;
var socketConnected = false;
var socketRoom;// = localStorage.getItem("socketRoom") || 0;
var joinedRoom = false;

var currentSectionID;// = localStorage.getItem("currentSectionID") || 0;
var currentClassID;// = localStorage.getItem("currentClassID") || 0;
var currentSubjectID;// = localStorage.getItem("currentSubjectID") || 0;
var currentTeacherID;// = localStorage.getItem("currentTeacherID") || 0;
var currentSubjectName;// = localStorage.getItem("currentSubjectName") || "";
var currentLevel;// = localStorage.getItem("currentLevel") || "";

var SystemParameters;

var examIsActive = false;

var eyesOnTeacherEnabled = localStorage.getItem("eyesOnTeacherEnabled", false);

var currentTeacherView = "#welcomeView";

var currentPollID = 0;
var currentPollQuestion = "";
var currentScribbleID = 0;
var currentBroadcastID = 0;
var currentPresentationID = 0;
var currentPresentationSlideID = 0;
var examTimerInterval;
var examAnswers = [];
var fileURL = mainURL + "/uploads/";
var currentQuestionID;
var examDetailsData; //Used to store exam questions + details to use in the exams view

var updatesInterval;
var currentExamID;
var currentExamRerunID;
var currentMessageID = 0;
var messageLimit = 20;
var chatInterval;
var pollAnswered = 0;
var json = [];
var jsonObj;
var sharedScribbleID;
var sharedScribbleImage;
var inChatPage = false;
var inGroupChatPage = false;
var appIsLocked = false; //Used for MDM (single app mode)
//===================================================================================//

var app;

var isAndroid = false;
var prefs = null;

//===================================================================================//
//==================================== DATA SOURCES =================================//
//===================================================================================//
var pollAnswersDS = new kendo.data.DataSource({
                                                  transport: {
        read: function(options) {
            WebService.GET("getPollDetails", {
                               pollID: options.data.pollID || currentPollID || 0
                           }, function(data) {
                               options.success(data);
                           }, function(error) {
                               options.success([]);
                           });
        }
    },
                                                  schema: {
        model: {
                                                              id: "ID"
                                                          }
    }
                                              });

var whatsNewDS = new kendo.data.DataSource({
                                               transport: {
        read: function(options) {
            WebService.POST("wb_getWhatsNew", {}, function(resp) {
                if (resp.Error) {
                    options.success([]);
                    return;
                }
                
                options.success(resp.Result);
            }, function(error) {
                options.success([]);
            });
        }
    },
                                               schema: {
        model: {
                                                           id: "ID"
                                                       }
    }
                                           });

var presentationSlidesDS = new kendo.data.DataSource({
                                                         transport: {
        read: function(options) {
            getPresentationContents(options.data.presentationID || currentPresentationID || 0, function(data, isOnline) {
                options.success(data);
            });
        }
    },
                                                         schema: {
        model: {
                                                                     id: "ID"
                                                                 }
    }
                                                     });
var examsData = new kendo.data.DataSource({
      
                                              transport: {
        read: function(options) {
            WebService.GET("wb_GetStudentExams", {
                               id:localStorage.getItem("currentUserID")
                           }, function(resp) {
                               options.success(resp);
                           }, function(error) {
                               options.success([]);
                           });
        }
		
    },
                                              change: function() {
                                                  var data = this.data();
                                                  getExams(data);
                                              }
                                          });

//===================================================================================//
//==================================== DATA SOURCES =================================//
//===================================================================================//

$(function() {
    document.addEventListener("deviceready", bootstrap, false);
    document.addEventListener("backbutton", function() {
    }, false);
    
    FastClick.attach(document.body);
});

function bootstrap() {
    isAndroid = (device.platform.toLowerCase() === "android");
    
    SystemParameters = $.parseJSON(localStorage.getItem("SystemParameters") || "{}");
    
    prefs = window["ApplicationPreferencesPlugin"] || null;
    
    var drawerViews = [];
    $("[drawer-enabled]").each(function() {
        drawerViews.push($(this).attr("id"));
    });
    $("#drawer").attr("data-views", JSON.stringify(drawerViews));
    
    DB.initDB(true, function() {
        app = new kendo.mobile.Application(document.body, {
                                               skin: "flat",
                                               init: initApp
                                           });
    });
    
    try {
        window.plugins.insomnia.keepAwake();
    } catch (ex) {
    }
}

function initApp() {
    initSockets();
    
    setTimeout(function() {
        generateCSS();
    }, 0);
    
    document.addEventListener("pause", function() {
        socket ? socket.disconnect() : false;
    }, false);
    
    document.addEventListener("resume", function() {
        socket ? socket.connect() : false;
        if (socketRoom && socketRoom > 0) {
            setTimeout(function() {
                socket.emit("rejoinRoom", {
                                room: socketRoom,
                                userID: currentUserID,
                                userName: currentUserName,
                                isTeacher: isTeacher,
                                subjectID: currentSubjectID,
                                sectionID: currentSectionID
                            });
            }, 500);

            checkSessionLock();
        }
    }, false);
    $(document).on('disconnect', function() {
        socket ? socket.disconnect() : false;
    });
    $(document).on('connect', function() {
        socket ? socket.connect() : false;
        if (socketRoom && socketRoom > 0) {
            setTimeout(function() {
                socket.emit("rejoinRoom", {
                                room: socketRoom,
                                userID: currentUserID,
                                userName: currentUserName,
                                isTeacher: isTeacher,
                                subjectID: currentSubjectID,
                                sectionID: currentSectionID
                            });
            }, 500);

            checkSessionLock();
        }
    });
    
    $(".currentSubject").html(currentSubjectName);
}

function generateCSS() {
    var css = "";
    
    var contentHeight = app.view().element.find(".km-content").height();
    css += ".km-popup.km-pane{max-height:" + (contentHeight - 20) + "px;}";
    
    $(document.body).append($("<style>" + css + "</style>"));
}

function initSockets() {
    socket = io.connect(nodeURL);
    
    socket.on('connect', function() {
        console.log("Rejoining Room with subjectID: " + currentSubjectID + " and sectionID: " + currentSectionID);
        if (socketRoom && socketRoom > 0) {
            socket.emit("rejoinRoom", {
                            room: socketRoom,
                            userID: currentUserID,
                            userName: currentUserName,
                            isTeacher: isTeacher,
                            subjectID: currentSubjectID,
                            sectionID: currentSectionID
                        });
        } else {
            if (currentSubjectID && currentSectionID) {
                socket.emit("joinRoom", {
                                ID: currentUserID,
                                Name: currentUserName,
                                Subject: currentSubjectID,
                                Section: currentSectionID
                            });
            }
        }
    });
    
    socket.on('getMoreData', function() {
        socket.emit('moreData', {
                        userID: userID,
                        isTeacher: isTeacher,
                        userName: currentUserName,
                        groupID: parseInt(localStorage.getItem("groupID") || "0"),
                        Subject: currentSubjectID,
                        Section: currentSectionID
                    });
    });
    
    socket.on('joinedRoom', function(room) {
        socketRoom = room;
        joinedRoom = true;
    });

    socket.on('availableClasses', function(classes) {
        for (var i = 0; i < classes.length; i++) {
            try {
                if (classes[i].status === 1) {
                    $("#subjectsView #subjectsContainer .subject[id=" + classes[i].id + "]").removeClass("disabled");
                } else {
                    $("#subjectsView #subjectsContainer .subject[id=" + classes[i].id + "]").addClass("disabled");
                }
            } catch (ex) {
            }
        }
    });
    socket.on('none', function() {
        unlockNavBar();
    });

    socket.on('pollStarted', function(poll) {
        currentTeacherView = "#pollsView";
        currentPollID = poll.pollID;
        currentPollQuestion = poll.pollQuestion.replace(/=/g, "&#61;");

        Utils.navigate("#pollsView?id=" + poll.pollID);
    });
    
    socket.on("pollAnswerSaved", function() {
        currentTeacherView = "#homeView";
        Utils.navigate("#homeView");
    });

    socket.on('eyesOnTeacher', function(eot) {
        if (eot.status === "on") {
            if (window["inAppBrowser"] && window["inAppBrowser"] !== null) {
                window["inAppBrowser"].close();
                window["inAppBrowser"] = null;
            }

            $(".km-modalview.km-view").parents(".km-shim.k-state-border-down").css("opacity", "0");
            $("#eyesOnTeacherModal").parents(".km-shim.k-state-border-down").css("opacity", "1");
            $("#eyesOnTeacherModal").find("#eotMessage").html(eot.message);
            Utils.openModal("#eyesOnTeacherModal");

            if (!SystemParameters["SessionLock"]) {
                lockApp();
            }
        } else {
            $(".km-modalview.km-view").parents(".km-shim.k-state-border-down").css("opacity", "1");
            $("#eyesOnTeacherModal").parents(".km-shim.k-state-border-down").css("opacity", "1");
            $("#eyesOnTeacherModal").data("kendoMobileModalView").close();
            
            if (window["inAppBrowser"] && window["inAppBrowser"] !== null) {
                window["inAppBrowser"] = window.open(window["inAppBrowser"].url, '_blank', 'location=no,EnableViewPortScale=yes,toolbar=no');
                window["inAppBrowser"].addEventListener('loadstop', function(event) {
                    window["inAppBrowser"].url = event.url;
                });
            }

            if (!SystemParameters["SessionLock"]) {
                unlockApp();
            }
        }
    });
    
    socket.on('confirmRaiseHand', function() {
        $(".alertButton").attr("status", "on");
    });
    socket.on('TestSocket', function(msg) {
        Utils.alert("Error", msg.message);
    });

    socket.on('clearRaiseHand', function() {
        resetRaiseHand();
    });
    
    socket.on('linkShared', function(link) {
        if (!examIsActive) {
            Utils.viewLink(link);
        }
    });
    
    socket.on('linkUnshared', function(link) {
        if (window["inAppBrowser"] && window["inAppBrowser"] !== null) {
            window["inAppBrowser"].close();
            window["inAppBrowser"] = null;
        }
    });

    socket.on('scribbleShared', function(scribble) {		
        currentTeacherView = "#scribbleView";
        currentScribbleID = scribble.id;
        
        Utils.navigate("#scribbleView?image=" + scribble.img);
        //$("#scribbleView #scribbleCanvas").loadBackgroundImage(scribble.img, "");
    });

    socket.on('shareUnshareStudentScribble', function(scribble) {
        if (parseInt(scribble.share) === 1) {
            if (window["inAppBrowser"] && window["inAppBrowser"] !== null) {
                window["inAppBrowser"].close();
                window["inAppBrowser"] = null;
            }

            /*if (window.isPDFOpen) {
            fbPDF.dismissPDF();
            }*/

            viewScribble(scribble);
        } else {
            $("#scribbleResultModal").data("kendoMobileModalView").close();
        }
    });
    //firas
    socket.on('startSharedScribble', function(scribble) {
        if (window["inAppBrowser"] && window["inAppBrowser"] !== null) {
            window["inAppBrowser"].close();
            window["inAppBrowser"] = null;
        }
        /*
        if (window.isPDFOpen) {
        fbPDF.dismissPDF();
        }
        */
        
        currentTeacherView = "#broadcastView";
        //$("#broadcastView #broadcastCanvas").loadBackgroundImage(scribble.img, "");
        Utils.navigate("#broadcastView?image=" + scribble.img);
    });
    //firas
    socket.on('reflectScribble', function(canvasData) {
        var canvas = $("#broadcastCanvas").data("canvas");
        
        if (canvas) {
            canvas.draw(canvasData);
        }
    });
    //firas
    socket.on('clearSharedScribble', function() {
        var canvas = $("#broadcastCanvas").data("canvas");
        
        if (canvas) {
            canvas.clear();
        }
    });
    //firas
    socket.on('goHome', function() {
        currentTeacherView = "#welcomeView";

        var view = app.view().id;
        if (view === "#subjectsView") {
            return;
        }

        if (window["inAppBrowser"] && window["inAppBrowser"] !== null) {
            window["inAppBrowser"].close();
            window["inAppBrowser"] = "";
        }
        /*
        if (window.isPDFOpen) {
        fbPDF.dismissPDF();
        }
        */

        Utils.navigate("#homeView");
    });
    socket.on('teacherDisconnected', function() {
        Utils.showNotification("Teacher Disconnected!");
    });

    socket.on('teacherConnected', function() {
        Utils.showNotification("Teacher Connected!");
        //onResume();
    });

    socket.on('errorMessage', function(message) {
        Utils.showNotification(message);
    });
    socket.on("confirmRaiseHand", function() {
        $(".alertButton").each(function() {
            $(this).addClass("disabled");
            $(this).attr("status", "on");
        });
    });

    socket.on("clearRaiseHand", function() {
        $(".alertButton").each(function() {
            $(this).removeClass("disabled");
            $(this).attr("status", "off");
        });
    });
    
    //Presentations
    socket.on("share_content", function(data) {
        if (app.view().id === "#subjectsView") {
            return;
        }
        
        if (window["inAppBrowser"] && window["inAppBrowser"] !== null) {
            window["inAppBrowser"].close();
            window["inAppBrowser"] = "";
        }
        
        currentTeacherView = "#presentationDetailsView";
        console.log("data.presentation ", data.presentation)
        console.log("currentPresentationID ", currentPresentationID)
        // if (currentPresentationID !== data.presentation) {
        if(app.view().id !== "#presentationDetailsView") {
            Utils.navigate("#presentationDetailsView?id=" + data.presentation);
        }
        //}
        
        setTimeout(function() {
            var scrollView = $("#presentationDetailsView #mainSlidesScroller").data("kendoMobileScrollView");
            if (scrollView) {
                //scrollView.scrollTo(data.page);
                if ((data.page - scrollView.page) === 1) {
                    //next
                    scrollView.next();
                } else if ((scrollView.page - data.page) === 1) {
                    //prev
                    scrollView.prev();
                } else {
                    scrollView.scrollTo(data.page);
                }
            }
        }, 50);
            
    });
    
    socket.on('getExams', function() {
        examsData.read();
    });
    
    socket.on('examStarted', function(exam) {
        //Check if the student is in the list of students who should take the exam
        $(".footerNotifications").html("<span style='color:red'>Exam Mode ON</span>");
        
        //Prevent the student from retaking the same exam with the same RerunID
        //Scenario: student submits the exam and relogs in -> he could retake the ongoing exam which overwrites his marks
        currentExamRerunID = exam.RerunID;
        if ((exam.RerunID || 0).toString() === localStorage.getItem("ExamRerunID")) {
            return;
        }
        
        if ($.inArray(parseInt(currentUserID), exam.Students) > -1) {
            //Student is in the list
            setTimeout(function() {
                $("#examTimer").css("color", "black");
                Utils.navigate("#examReadyView?id=" + exam.ExamID + "&description=" + encodeURIComponent(exam.Description), "slide:right");
                currentTeacherView = "#examDetails?prevent";
                lockNavBar();
                
                if (SystemParameters.ExamLock) {
                    lockApp();
                }
            }, 500);
        } else {
            console.log("Not in the list of students!");
        }
    });
    socket.on('examStopped', function(exam) {
        currentTeacherView = "#welcomeView";
        if ($("#imageViewerModal").data("kendoMobileModalView")) {
            $("#imageViewerModal").data("kendoMobileModalView").close();
        }
        if (app.view().id === "#examDetails" || app.view().id === "#examReview" || app.view().id === "#examReadyView") {
            Utils.navigate("#homeView");
        }
        unlockNavBar();
        
        if (!SystemParameters.SessionLock && SystemParameters.ExamLock) {
            unlockApp();
        }
        
        clearInterval(examTimerInterval);
        examTimerInterval = undefined;
        currentExamID = undefined;
        $(".footerNotifications").html("");
    });
    socket.on('gotExamTimer', function(timer) {
        console.log(timer);
        var time = timer.split(":");
        var hrs = parseInt(time[0]);
        var mnt = parseInt(time[1]);
        var sec = parseInt(time[2]);

        console.log(hrs, mnt, sec);

        time = moment().hours(hrs).minutes(mnt).seconds(sec).milliseconds(0);

        $("#examTimer").css("color", "black");

        if (!examTimerInterval) {
            examTimerInterval = setInterval(function() {
                time.subtract(1000, "milliseconds");

                $("#examTimer").html(time.format("HH:mm:ss"));
                var h = parseInt(moment(time).hours() * 60 * 60);
                var m = parseInt(moment(time).minutes() * 60);
                var s = parseInt(moment(time).seconds());
                var remaining = h + m + s;
                if (remaining === 0) {
                    $("#examTimer").css("color", "red");
                }
            }, 1000);
        }
    });
    socket.on('shareExamResults', function(data) {
        Utils.navigate("#examResultsChartView");
        $("#examResultsChartView #examBasicInfo").html("<h1>Name: " + data.details.name + ", Mark: " + data.details.mark + "</h1>");
        $("#examResultsChartView").find("#examResultsChart").kendoChart(data.options);
        currentExamID = data.examID;
    });
    socket.on('unshareExamResults', function() {
        if ($("#examResultDetailsModal").data("kendoMobileModalView")) {
            $("#examResultDetailsModal").data("kendoMobileModalView").close();
        }
        Utils.navigate("#homeView", "fade");
    });
    socket.on('getDocuments', function() {
        currentTeacherView = "#documents";
        if (app.view().id !== "#documents") {
            Utils.navigate("#documents");
        } else {
            getDocuments();
        }
    });
    socket.on('checkDownloadableFiles', function() {
        if (app.view().id !== "#documents") {
            return;
        }
        getDocuments();
    });

    socket.on('getScreenshot', function() {
        if (window.plugins.FBScreenshot) {
            window.plugins.FBScreenshot.takeScreenshot(function(image) {
                socket.emit('shareScreenshot', image);
            }, function(error) {
                console.log("screenshotError: " + JSON.stringify(error));
                socket.emit('screenshotError');
            }, device.platform.toLowerCase() === "ios" ? 1.7 : 2); //the last parameter is the inverse scale factor, the higher the number is, the lower the quality of the image
        } else {
            console.log("screenshotError");
            socket.emit('screenshotError');
        }
    });
}

//=================Subjects View================
function initSubjectsView(e) {
    var view = e.view.element;
    
    var content = "";
    var template = kendo.template($("#subjectsTemplate").html());
    
    WebService.GET("wb_GetStudentSubjects", {
                       studentID: currentUserID
                   }, function(data) {
                       var subjectsDelimited = [];

                       content = "";
                       $.each(data, function(i, subject) {
                           console.log(i, i % 3);
                           if (i % 3 === 0) {
                               if (i > 0) {
                                   content += "</tr>";
                               }
                               content += "<tr>" + template(subject);
                           } else {
                               //New Row
                               content += template(subject);
                           }
            
                           subjectsDelimited.push(subject.SubjectID + "" + subject.SectionID);
                       });
                       content += "</tr>";
        
                       view.find("#subjectsContainer").html(content);
        
                       var _maxHeight = 0;
                       view.find("#subjectsContainer tr").each(function() {
                           if ($(this).height() > _maxHeight) {
                               _maxHeight = $(this).height();
                           }
                       });
                       view.find("#subjectsContainer tr").css("height", _maxHeight + "px");
                       view.find("#subjectsContainer td").each(function() {
                           var _btn = $(this);
                           _btn.kendoMobileButton();
                           _btn.click(function(e) {
                               currentSubjectID = _btn.find("#subjectID").text();
                               currentSectionID = _btn.find("#sectionID").text();
                               currentTeacherID = _btn.find("#teacherID").text();
                               currentSubjectName = _btn.find("#subjectName").text();
                               currentLevel = _btn.find("#level").text();
                
                               localStorage.setItem("currentSectionID", currentSectionID);
                               localStorage.setItem("currentSubjectID", currentSubjectID);
                               localStorage.setItem("currentTeacherID", currentTeacherID);
                               localStorage.setItem("currentSubjectName", currentSubjectName);
                               localStorage.setItem("currentLevel", currentLevel);
                
                               socket.emit("joinRoom", {
                                               ID: currentUserID || 0,
                                               Name: currentUserName || "",
                                               Subject: currentSubjectID || 0,
                                               Section: currentSectionID || 0
                                           });
                
                               Utils.navigate("#homeView");
                           });
                       });
        
                       socket.emit("checkActiveClasses", subjectsDelimited.join(","));
                   }, function(error) {
                       console.log("Get Subjects Error: " + JSON.stringify(error));
                   });
}
//=================Subjects View================

//=================Home View================
function initHomeView(e) {
    var view = e.view.element;
    
    setTimeout(function() {
        view.find(".mainLogo").css("height", view.find(".km-content").height() + "px");
        view.find(".mainLogo").loadBackgroundImage(Utils.getPicturePath("media/logo.jpg"), "", function() {
            view.find(".mainLogo").css("opacity", "1");
        });
        
        $(".currentSubject").html(currentSubjectName);
    }, 0);
}
//=================Home View================

//=================Profile View================
function initProfileView(e) {
    var view = e.view.element;
    
    setTimeout(function() {
        view.find(".content").css("height", view.find(".km-content").height() - view.find(".topActions").outerHeight(true) + "px");
        view.find(".content").kendoMobileScroller();
        $(".currentSubject").html(currentSubjectName);
    }, 0);
    
    Utils.showLoading();
    WebService.POST("wb_GetStudentProfile", {
                        ID: currentUserID
                    }, function(data) {
                        view.find("#stdPicture").loadBackgroundImage(Utils.getProfilePicturePath(data.Picture, true), "./images/user.png");
                        view.find("#stdName").html(data.FullEName);
                        view.find("#stdLevel").html(data.Level);
                    }, function(error) {
                        Utils.alert("Error", "Could not get your profile!");
                    }, function() {
                        Utils.hideLoading();
                    });
}
//=================Profile View================

//=================Scribble View================
function initScribbleView(e) {
    var view = e.view.element;
    
    var canvasContainer = view.find("#scribbleCanvasContainer");
    var canvas = view.find("#scribbleCanvas");
    setTimeout(function() {
        canvasContainer.css("height", view.find(".km-content").height() + "px");
        
        view.find(".drawingTools").css("height", view.find(".km-content").height() + "px");
        view.find(".drawingToolsContainer").css("height", view.find(".drawingTools").height() - view.find(".drawingTools .drawingActions").outerHeight(true) + "px");
        view.find(".drawingToolsContainer").kendoMobileScroller();
        
        view.find(".drawingToolsList .drawingTool").each(function() {
            var tool = $(this);
            
            tool.css("height", $(this).width() * 0.6 + "px");
            if (tool.attr("color") === "eraser") {
                tool.css("color", "black");
            }
            tool.css("color", $(this).attr("color"));
            
            tool.click(function() {
                tool.siblings(".drawingTool").removeClass("active");
                tool.addClass("active");
                
                canvas.data("canvas").setColor(tool.attr("color"));
            });
        });

        $(".currentSubject").html(currentSubjectName);
    }, 0);
}
function showScribbleView(e) {
    var view = e.view.element;
    var params = e.view.params;
    
    var image = params.image;
    
    var canvas = view.find("#scribbleCanvas");
    setTimeout(function() {
        canvas.loadBackgroundImage(image, "", function(loadedImage) {
            var cWidth = canvas.width();
            var cHeight = view.find("#scribbleCanvasContainer").height() - view.find(".scribbleActions").outerHeight(true);
                                    
            var iWidth = loadedImage.width;
            var iHeight = loadedImage.height;
            
            console.log("cWidth " + cWidth + ", cHeight " + cHeight + ", iWidth " + iWidth + ", iHeight " + iHeight);
            
            var iRatio = 1;
            
            var canvasRatio = cWidth / cHeight;
            var imageRatio = iWidth / iHeight;
            
            if (imageRatio > canvasRatio) {
                iRatio = cWidth / iWidth;
                iWidth = cWidth;
                iHeight = iHeight * iRatio;
            } else {
                iRatio = cHeight / iHeight;
                iHeight = cHeight;
                iWidth = iWidth * iRatio;
            }
            /*
            if(iWidth > iHeight) {
            console.log("iWidth > iHeight");
            iRatio = cWidth / iWidth;
            iWidth = cWidth;
            console.log("iRatio " + iRatio);
            iHeight = iHeight * iRatio;
            }
            else {
            console.log("iHeight > iWidth");
            iRatio = cHeight / iHeight;
            iHeight = cHeight;
            iWidth = iWidth * iRatio;
            }
            */
            console.log("cWidth " + cWidth + ", cHeight " + cHeight + ", iWidth " + iWidth + ", iHeight " + iHeight);
            
            canvas.css("width", iWidth + "px");
            canvas.css("height", iHeight + "px");
            canvas.css("margin-top", (cHeight - iHeight) / 2 + "px");
            canvas.css("opacity", "1");
            canvas.attr("width", canvas.width());
            canvas.attr("height", canvas.height());
            
            if (canvas.data("canvas")) {
                clearScribble();
                canvas.data("canvas").destroy();
            }
            
            canvas.canvas();
            
            canvas.css("opacity", "1");
        });
    }, 500);
}
function showScribbleView2(e) {
    var view = e.view.element;
    var params = e.view.params;
    
    var image = params.image;
    
    var canvas = view.find("#scribbleCanvas");
    setTimeout(function() {
        canvas.loadBackgroundImage(image, "", function(loadedImage) {
            var cWidth = canvas.width();
            var cHeight = view.find("#scribbleCanvasContainer").height() - view.find(".scribbleActions").outerHeight(true);
                                    
            var iWidth = loadedImage.width;
            var iHeight = loadedImage.height;
            
            var iRatio = 1;
            
            if (iWidth > cWidth || iHeight > cHeight) {
                console.log("--- 1");
                //image larger thatn canvas
                if (iWidth > cWidth && iHeight > cHeight) {
                    if (cWidth > cHeight) {
                        console.log("--- 2");
                        iRatio = cHeight / iHeight;
                        iHeight = cHeight;
                        iWidth = iWidth * iRatio;
                    } else {
                        console.log("--- 3");
                        /*iWidth = cWidth / iWidth;
                        iWidth = cWidth;
                        iHeight = iHeight * iRatio;*/
                        if (iWidth > iHeight) {
                            console.log("--- 4");
                            iWidth = cWidth / iWidth;
                            iWidth = cWidth;
                            iHeight = iHeight * iRatio;
                        } else {
                            console.log("--- 5");
                            iRatio = cHeight / iHeight;
                            iHeight = cHeight;
                            iWidth = iWidth * iRatio;
                        }
                    }
                } else {
                    if (iWidth > iHeight) {
                        console.log("--- 4");
                        iWidth = cWidth / iWidth;
                        iWidth = cWidth;
                        iHeight = iHeight * iRatio;
                    } else {
                        console.log("--- 5");
                        iRatio = cHeight / iHeight;
                        iHeight = cHeight;
                        iWidth = iWidth * iRatio;
                    }
                }
            } else {
                //image smaller than canvas
                if (cWidth > cHeight) {
                    console.log("--- 6");
                    iRatio = iHeight / cHeight;
                    iHeight = cHeight;
                    iWidth = iWidth * iRatio;
                } else {
                    console.log("--- 7");
                    iRatio = iWidth / cWidth;
                    iWidth = cWidth;
                    iHeight = iHeight * iRatio;
                }
            }
            
            canvas.css("width", iWidth + "px");
            canvas.css("height", iHeight + "px");
            canvas.css("margin-top", (cHeight - iHeight) / 2 + "px");
            canvas.css("opacity", "1");
            canvas.attr("width", canvas.width());
            canvas.attr("height", canvas.height());
            
            if (canvas.data("canvas")) {
                clearScribble();
                canvas.data("canvas").destroy();
            }
            
            canvas.canvas();
            
            canvas.css("opacity", "1");
        });
    }, 500);
}
function clearScribble(e) {
    Utils.handleClick(e);
    
    $("#scribbleCanvas").data("canvas").clear();
}
function submitScribble(e) {
    Utils.handleClick(e);
    
    Utils.confirm("Are you sure you want to send your scribble?", function(buttonIndex) {
        if (buttonIndex === 2) {
            Utils.showLoading(30000);
            $("#scribbleCanvas").data("canvas").export(function(scribbleImage) {
                WebService.POST("wb_SaveScribbleDetails", {
                                    imageData: scribbleImage.replace('data:image/png;base64,', ''),
                                    scribbleID: currentScribbleID,
                                    studentID: currentUserID,
                                    subjectID: currentSubjectID,
                                    sectionID: currentSectionID
                                }, function(data) {
                                    Utils.showNotification("Scribble Saved!");
                                    socket.emit("scribbleSubmitted", {
                                                    studentID: currentUserID,
                                                    scribbleID: currentScribbleID
                                                });
                                    Utils.navigate("#homeView", "slide:right");
                                }, function(error) {
                                    Utils.alert("Error", "Could not submit your scribble!");
                                    console.log(JSON.stringify(error));
                                }, function() {
                                    Utils.hideLoading();
                                });
                /*
                var image = new Image();
                image.onload = function() {
                var modal = $("<div id='modal'></div>");
                modal.css("width", this.width + "px");
                modal.css("height", this.height + "px");
                modal.css("background-image", "url(" + scribbleImage + ")");
                modal.css("background-size", "100% 100%");
                modal.css("background-position", "center");
                modal.css("background-repeat", "no-repeat");
                modal.css("position", "absolute");
                modal.css("top", "0px");
                modal.css("left", "0px");
                modal.css("z-index", "99999");
                $(document.body).append(modal);
                };
                image.src = scribbleImage;
                */
            });
        }
    }, "Warning", ["No", "Yes"]);
}
function viewScribble(scribble) {
    $("#scribbleResultModal").find(".image").loadBackgroundImage(scribble.scribble, "");
    Utils.openModal("#scribbleResultModal");
    
    if (!$("#scribbleResultModal").attr("initialized")) {
        var content = $("#scribbleResultModal .km-content");
        content.find(".image").css("height", content.height() + "px");
        $("#scribbleResultModal").attr("initialized", true);
    }
    
    $("#scribbleResultModal").find("[data-role=view-title]").text(scribble.student);
}
//=================Scribble View================

//=================Broadcast View================
function initBroadcastView(e) {
    var view = e.view.element;
    
    setTimeout(function() {
        view.find("#broadcastCanvasContainer").css("height", view.find(".km-content").height() + "px");
    }, 0);
}
function showBroadcastView(e) {
    var view = e.view.element;
    var params = e.view.params;
    
    var image = params.image;
    
    console.log("image", image);
    
    var canvas = view.find("#broadcastCanvas");
    
    setTimeout(function() {
        canvas.loadBackgroundImage(image, "", function(loadedImage) {
            var cWidth = canvas.width();
            var cHeight = view.find(".km-content").height();
            
            var iWidth = loadedImage.width;
            var iHeight = loadedImage.height;
            
            console.log("res: ", loadedImage.width, " x ", loadedImage.height);
            /*
            var iRatio = 1;
            if(iWidth > iHeight) {
            iRatio = iHeight / iWidth;
            }
            else {
            iRatio = iWidth / iHeight;
            }
            
            if(iWidth > cWidth || iHeight > cHeight) {
            if(iWidth > cWidth) {
            iWidth = cWidth;
            iHeight = iWidth * iRatio;
            }
            else {
            iHeight = cHeight;
            iWidth = iHeight * iRatio;
            }
            }
            else {
            iHeight = cHeight;
            iWidth = iHeight * iRatio;
            }
            */
            
            var iRatio = 1;
            
            var canvasRatio = cWidth / cHeight;
            var imageRatio = iWidth / iHeight;
            
            if (imageRatio > canvasRatio) {
                iRatio = cWidth / iWidth;
                iWidth = cWidth;
                iHeight = iHeight * iRatio;
            } else {
                iRatio = cHeight / iHeight;
                iHeight = cHeight;
                iWidth = iWidth * iRatio;
            }
            
            canvas.css("width", iWidth + "px");
            canvas.css("height", iHeight + "px");
            canvas.css("margin-top", (view.find(".km-content").height() - iHeight) / 2 + "px");
            canvas.css("opacity", "1");
            canvas.attr("width", canvas.width());
            canvas.attr("height", canvas.height());
            
            if (canvas.data("canvas")) {
                canvas.data("canvas").destroy();
            }
            canvas.canvas({
                              enabled: false
                          });
        });
    }, 500);
}
//=================Broadcast View================

//=================Polls View================
function initPollsView(e) {
    var view = e.view.element;
    
    setTimeout(function() {
        view.find(".content").css("height", view.find(".km-content").height() - view.find(".bottomActions").outerHeight(true) - view.find(".pollQuestion").outerHeight(true) + "px");
        view.find(".content").kendoMobileScroller();
        $(".currentSubject").html(currentSubjectName);
    }, 0);
}
function showPollsView(e) {
    var view = e.view.element;
    var params = e.view.params;
    
    view.find("#btnSubmitPoll").addClass("disabled");
    
    var pollID = params.id;
    if (!pollID) {
        return;
    }
    
    view.find(".pollQuestion").html(currentPollQuestion);
    
    currentPollID = pollID;
    pollAnswersDS.read({
                           pollID: pollID
                       });
}
function selectPollAnswer(e, id) {
    Utils.handleClick(e);
    
    var choice = $(e.target).closest("li");
    choice.siblings("li").removeClass("selected");
    choice.addClass("selected");
    
    $("#pollsView").find("#btnSubmitPoll").removeClass("disabled");
}
function pollAnswersListBound(e) {
    var list = e.sender.element;
    
    list.find("li").each(function() {
        var li = $(this);
        
        li.find(".choiceImageContainer").css("height", li.find(".choiceImageContainer").width() + "px");
        li.find(".choiceImage").loadBackgroundImage(li.find(".choiceImage").attr("background-image"), "");
    });
}
function onclickSubmitPoll(e) {
    var li = $("#pollsView #pollAnswersList li.selected");
    if (!li) {
        return;
    }
    
    var choiceID = li.find("#choiceID").text();
    if (!choiceID) {
        Utils.alert("Error", "Cannot submit poll!");
        return;
    }
    
    socket.emit("answerPollQuestion", {
                    pollID: currentPollID,
                    pollAns: choiceID,
                    studentID: currentUserID
                });
}
//=================Polls View================

/*======================= WHATS NEW ========================*/
function initWhatsNewView(e) {
    var view = e.view.element;
    
    setTimeout(function() {
        view.find(".content").css("height", view.find(".km-content").height() + "px");
        view.find(".content").kendoMobileScroller();
    }, 0);
}
function showWhatsNewView(e) {
    whatsNewDS.read();
}
/*======================= WHATS NEW ========================*/

/*=================== WHATS NEW DETAILS ====================*/
function initWhatsNewDetailsView(e) {
    var view = e.view.element;
    
    setTimeout(function() {
        view.find(".content").css("height", view.find(".km-content").height() - view.find(".header").outerHeight(true) + "px");
        view.find(".content").kendoMobileScroller();
    }, 0);
}
function showWhatsNewDetailsView(e) {
    var view = e.view.element;
    var params = e.view.params;
    
    var itemID = params.id;
    var item = null;
    
    try {
        item = whatsNewDS.get(itemID);
    } catch (ex) {
    }
    
    if (!item) {
        return;
    }
    
    view.find(".title").html(item.Title);
    view.find(".date").html(item.Date);
    view.find(".message").html(item.Message);
}
/*=================== WHATS NEW DETAILS ====================*/

/*=================== PRESENTATIONS ====================*/
function initPresentationsView(e) {
    var view = e.view.element;
    
    setTimeout(function() {
        view.find(".content").css("height", view.find(".km-content").height() - view.find(".header").outerHeight(true) + "px");
        //view.find(".content").kendoMobileScroller();
        
        view.find(".km-scrollview").css("height", view.find(".content").height() + "px");
    }, 0);
}
function showPresentationsView(e) {
    var view = e.view.element;
    var presentationID = e.view.params.id;
    
    if (!presentationID) {
        return;
    }
    
    view.find(".header .title .value").html("");
    
    currentPresentationID = presentationID;
    
    setTimeout(function() {
        var scrollView = view.find("#mainSlidesScroller");
        if (!scrollView.data("kendoMobileScrollView")) {
            scrollView.kendoMobileScrollView({
                                                 dataSource: presentationSlidesDS,
                                                 template: $("#presentationSlidesTemplate").html(),
                                                // template: $("#slidesTemplate").html(),
                                                 //autoBind: false,
                                                 contentHeight: scrollView.height() + "px",
                                                 enablePager: false
                                             });
            scrollView.data("kendoMobileScrollView").refresh();
        }
        
        presentationSlidesDS.read({
                                      presentationID: presentationID
                                  }).then(function() {
                                      var presentation = presentationSlidesDS.at(0);
                                      if (presentation) {
                                          view.find(".header .title .value").html(presentation.Title);
                                          view.find(".header .title .value").trigger("destroy");
                                          view.find(".header .title .value").dotdotdot();
                                      }
                                  });
    }, 10);
}
function getSlideContent(content) {
                return mainURL + "/" + content;
            }
function getPresentationContents(presentationID, callback) {
    WebService.GET("wb_GetContent", {
                       teacherID: currentTeacherID,
                       all: "no",
                       presentationID: presentationID
                   }, function(resOnline) {
                       DB.getPresentation(presentationID, function(resOffline) {
                           if (resOffline.length === 0 || resOffline === false) {
                               downloadPresentationSlides(resOnline, function(didSave) {
                                   if (didSave) {
                                       getLocalPresentation(presentationID, function(localData) {
                                           //if the localData is not found -> start the presentation in "ONLINE" mode
                                           callback ? callback(localData || [], localData === []) : false;
                                       });
                                       return;
                                   }
                                   callback ? callback(res, true) : false;
                               });
                               console.log("onlineMode")
                           } else {
                               console.log("offlineMode")
                               callback ? callback(resOffline, true) : false;
                           }
                       });
                       /*
                       callback ? callback(res, true) : false;
                       */
                   }, function(error) {
                       callback ? callback(null, true) : false;
                   });
}
function getPresentationContents_org(presentationID, callback) {
    getLocalPresentation(presentationID, function(data) {
        if (data) {
            callback ? callback(data, false) : false;
            return;
        }
        
        WebService.GET("wb_GetContent", {
                           teacherID: currentTeacherID,
                           all: "no",
                           presentationID: presentationID
                       }, function(res) {
                           if (res[0] && parseInt(res[0].Downloadable || "0") === 1) {
                               downloadPresentationSlides(res, function(didSave) {
                                   if (didSave) {
                                       getLocalPresentation(presentationID, function(localData) {
                                           //if the localData is not found -> start the presentation in "ONLINE" mode
                                           callback ? callback(localData || [], localData === []) : false;
                                       });
                                       return;
                                   }
                    
                                   callback ? callback(res, true) : false;
                               });
                           }
                       }, function(error) {
                           callback ? callback(null, true) : false;
                       });
    });
}
function getLocalPresentation(presentationID, callback) {
    DB.getPresentation(presentationID, function(slides) {
        callback ? callback(slides) : false;
    });
}
function downloadPresentationSlides(slideData, callback) {
    console.log("Slide Data ", slideData);
    var PresentaionData = [];
    DB.db.transaction(function(tx) {
        for (var i = 0; i < slideData.length; i++) {
            var item = [
                slideData[i].ID,
                slideData[i].PresentationID,
                slideData[i].SubjectID,
                slideData[i].SubjectA,
                slideData[i].SubjectE,
                slideData[i].SectionID,
                slideData[i].section,
                slideData[i].LevelID,
                slideData[i].Level,
                slideData[i].YearID,
                slideData[i].Year,
                slideData[i].SemesterID,
                slideData[i].Semester,
                currentUserID,
                currentUserName,
                slideData[i].Title,
                slideData[i].Date,
                slideData[i].SlideContent,
                slideData[i].SlideType,
                slideData[i].SlideIndex,
                slideData[i].isLocal,
                slideData[i].Thumbnail,
                ''
                               
            ];
            PresentaionData.push({
                                     ID: slideData[i].ID,
                                     PresentationID: slideData[i].PresentationID,
                                     SlideContent: slideData[i].SlideContent,
                                     SlideType: slideData[i].SlideType,
                                     Thumbnail: slideData[i].Thumbnail,
                                     isLocal: slideData[i].isLocal,
                                 });
            tx.executeSql("INSERT INTO Presentations ( ID, PresentationID , SubjectID , SubjectA, SubjectE, SectionID , Section, LevelID , Level, YearID , Year, SemesterID , Semester, StudentID , Student, Title, Date, SlideContent , SlideType , SlideIndex , isLocal , Thumbnail, Note) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", item);
        }
    }, function() {
        callback ? callback(false) : false;
    }, function() {
        downloadPresentation(PresentaionData.reverse(), function(didDownload) {
            callback ? callback(didDownload) : false;
        }, function(progress) {
            console.log(progress);
        });
    });
}
function downloadPresentation(PresentaionData, callback, progressCallback) {
    var PresentationDataCopy = $.merge([], PresentaionData);
    console.log("Download Presentation ", PresentationDataCopy);
    
    PresentationDownloader.downloadPresentation(PresentaionData, function(dlData) {
        //Update items
        if (DB.db) {
            DB.db.transaction(function(tx) {
                for (var i = 0; i < dlData.length; i++) {
                    tx.executeSql("UPDATE Presentations SET SlideContent = ?, Thumbnail = ? WHERE ID = ?", [
                                      dlData[i].SlideContent,
                                      dlData[i].Thumbnail,
                                      dlData[i].ID
                                  ]);
                }
            }, function() {
                callback ? callback(false) : false;
            }, function() {
                console.log("Finished updating Presentaions!");
                callback ? callback(true) : false;
                //setProgress(1, 1);
            });
        } else {
            callback ? callback(false) : false;
            //setProgress(1, 1);
        }
    });
    return;
    
    var downloadedData = [];
    var totalDownloads = PresentationDataCopy.length > 0 ? PresentationDataCopy.length : 0;
    var completedDownloads = 0;
    function checkDownload() {
        if (PresentationDataCopy.length > 0) {
            //  downloadedBatch(PresentationDataCopy.pop());
            downloadedBatch(PresentationDataCopy.splice(0, 5));
        } else {
            //Update items
            if (DB.db) {
                DB.db.transaction(function(tx) {
                    for (var i = 0; i < downloadedData.length; i++) {
                        tx.executeSql("UPDATE Presentations SET SlideContent = ?, Thumbnail = ? WHERE ID = ?", [
                                          downloadedData[i].SlideContent,
                                          downloadedData[i].Thumbnail,
                                          downloadedData[i].ID
                                      ]);
                    }
                }, function() {
                }, function() {
                    console.log("Finished updating Presentaions!");
                    callback ? callback() : false;
                    //setProgress(1, 1);
                });
            } else {
                callback ? callback() : false;
                //setProgress(1, 1);
            }
        }
    }
    function downloadedBatch(PresentationData) { //PresentationData (array from 0 to 5)
        var dlOperations = PresentationData.length;
        var totalItems = PresentationData.length;
        console.log("dlOperations ",dlOperations)
        function checkDL() {
            completedDownloads++;
            //setProgress(completedDownloads, totalDownloads);
            console.log("totalItems  ",totalItems)
            if (dlOperations === 0) {
                console.log("dlOperations Equal Zero")
                console.log("dlOperations Equal Zero")
                downloadedData.push(PresentationData);
                console.log("downloadedDatadownloadedData ",downloadedData)
                checkDownload();
            } else {
                for (var i=0 ; i < totalItems ; i++) {
                    var asset = PresentationData[i];
                    console.log("assest ",asset)
                    downloadAssets(PresentationData[i], function(localPath) {
                        PresentationData[i].SlideContent = localPath;
                        PresentationData[i].Thumbnail = localPath;
                        console.log("dlOperationscounter  ",dlOperations)
                    });
                    dlOperations--;
                    
                }
            }
        }
            
        function downloadAssets(presentationData, AssestCallback) {
           var prSlides = [];
            var type = parseInt(presentationData.SlideType);
            console.log("Type ",type)
            if (Boolean(presentationData.isLocal)) {
                if (type === 6) {
                    prSlides.push({
                                      data:presentationData,
                                      downloads: getURLs(presentationData.SlideContent)
                                  });
                } else if (type === 5) {
                    prSlides.push({
                                      data: presentationData,
                                      downloads: []
                                  });
                } else {
                    var dl = [];
                    dl.push(presentationData.SlideContent);
                    prSlides.push({
                                      data: presentationData,
                                      downloads: dl
                                  });
                }
            } else {
                prSlides.push({
                                  data: presentationData,
                                  downloads: []
                              });
            }
            downloadSlideContent(prSlides, prSlides[0].downloads, function (downloadCallback) {
                console.log("downloadSlideContentCallback ",downloadCallback)
                AssestCallback ? AssestCallback(downloadCallback):false;
            });
        }
        checkDL();
    }
    checkDownload();
}

var downloadedContent = [];
var downloadedSlides = [];

function downloadSlideContent(slide, downloads, callback) {
    
    slide = slide[0];
    
    var currentDownload = downloads[0];
    slidesDownloadPath = "Presentations";
    var downloadPath = cordova.file.dataDirectory + "/" + slidesDownloadPath;

    console.log("***Download : " + mainURL + "/" + currentDownload);
    console.log("***slide.data.PresentationID : " + slide.data.PresentationID);
    console.log("***Download : downloadPath " + mainURL + "/" + downloadPath + "/" + slide.data.PresentationID + "-" + slide.data.ID + currentDownload.substring(currentDownload.lastIndexOf(".")));

    var ft = new FileTransfer();
    ft.download(
        encodeURI(mainURL + "/" + currentDownload),
        downloadPath + "/" + slide.data.PresentationID + "-" + slide.data.ID + currentDownload.substring(currentDownload.lastIndexOf(".")),
        function(entry) {
            console.log("Downloaded " + entry.toURL());
            downloadedContent.push(entry.toURL());
            if (parseInt(slide.data.SlideType) === 6) {
                slide.data.SlideContent = slide.data.SlideContent.replace(currentDownload, entry.toURL());
            } else if (parseInt(slide.data.SlideType) !== 6 && parseInt(slide.data.SlideType) !== 5) {
                slide.data.SlideContent = entry.toURL();
            }
            console.log("Current Slide: " + JSON.stringify(slide));
            downloadedSlides[parseInt(slide.data.ID)] = slide;
            callback(downloadedContent);
            downloadedContent = [];
        },
        function(error) {
            console.log("Could not download file: " + JSON.stringify(error));
            downloadedSlides[parseInt(slide.data.ID)] = slide;
            if (downloads.length > 0) {
                downloadSlideContent(slide, downloads, callback);
            } else {
                callback(downloadedContent);
                downloadedContent = [];
            }
        }
        );
}
function getURLs(text) {
    /*
    var regSRC = new RegExp("(src=\")(.*)(\")","g");
    var regURL = new RegExp("(url\\()(.*)(\\))","g");
    var arrSRC = text.match(regSRC);
    var arrURL = text.match(regURL);
    */
    var arrSRC = (text.match(/src="([^"]+)"/g) !== null ? text.match(/src="([^"]+)"/g) : "");
    var arrURL = (text.match(/url\([^"]+\)/g) !== null ? text.match(/url\([^"]+\)/g) : "");
    var urls = [];
    var theURL = "";

    for (var s = 0; s < arrSRC.length; s++) {
        theURL = arrSRC[s].split("src=\"")[1].split("\"")[0];
        if (theURL.indexOf("youtube.com/embed") < 0 && theURL.indexOf("youtube.com/v") < 0) {
            if (theURL.substr(theURL.lastIndexOf("/") + 1, theURL.length) !== "undefined") {
                if ($.inArray(theURL, urls) < 0) {
                    urls.push(theURL);
                }
            }
        }
    }
    for (var u = 0; u < arrURL.length; u++) {
        theURL = arrURL[u].split("url(")[1].split(")")[0];
        var str = theURL.replace(/\?(.*).*$/m, '');
        theURL = theURL.replace(theURL, str);
        if (theURL.indexOf("youtube.com/embed") < 0 && theURL.indexOf("youtube.com/v") < 0) {
            if (theURL.substr(theURL.lastIndexOf("/") + 1, theURL.length) !== "undefined") {
                if ($.inArray(theURL, urls) < 0) {
                    urls.push(theURL);
                }
            }
        }
    }

    return urls;
}
/*================== /PRESENTATIONS ====================*/

function lockApp() {
    console.log("Not Supported!");
}

function lockNavBar() {
    $("[data-role=header]").addClass("disabled");
}
function unlockNavBar() {
    $("[data-role=header]").removeClass("disabled");
}

function openDrawer(e) {
    Utils.handleClick(e);
    
    var drawer = $("#drawer").data("kendoMobileDrawer");
    if (drawer) {
        drawer.show();
    }
}

function raiseHand(e) {
    Utils.handleClick(e);
    
    socket.emit("raiseHand", {
                    ID: currentUserID,
                    Name: currentUserName
                });
}

//Firas Update
function resetRaiseHand() {
    $(".alertButton").attr("status", "off");
}

function viewPicture(e, picture, title) {
    Utils.handleClick(e);
    
    $("#imageModal").find(".image").loadBackgroundImage(picture, "");
    Utils.openModal("#imageModal");
    
    if (!$("#imageModal").attr("initialized")) {
        var content = $("#imageModal .km-content");
        content.find(".image").css("height", content.height() + "px");
        $("#imageModal").attr("initialized", true);
    }
    
    $("#imageModal").find("[data-role=view-title]").text(title || "");
}

function goToClasses(e) {
    Utils.handleClick(e);
    
    Utils.confirm("Are you sure you want to go back to your classes?", function(buttonIndex) {
        if (buttonIndex === 2) {
            Utils.navigate('#subjectsView', 'slide:right');
        }
    }, "Warning", ["No", "Yes"]);
}

function logout(e) {
    Utils.handleClick(e);
    
    Utils.confirm("Are you sure you want to logout?", function(buttonIndex) {
        if (buttonIndex === 2) {
            Utils.showLoading();
            WebService.GET("wb_Logout", {
                               id: currentUserID
                           }, function(data) {
                           }, function(error) {
                           }, function() {
                               doLogout();
                           });
            
            function doLogout() {
                $.each(localStorage, function(k, v) {
                    if (k.indexOf("persist_") > -1) {
                        localStorage.removeItem(k);
                    }
                });
                socket.disconnect();
                
                /*clearExamCachedAnswers(false, function() {
                console.log("Cleared Exam Cache!");
                });

                unlockApp(function() {
                window.location.href = "index.html?noReload";
                }, function(error) {
                console.log("Could not unlock app!");
                window.location.href = "index.html?noReload";
                });*/
                
                Utils.navigate("index.html", "slide:right");
            }
        }
    }, "Logout?", ["No", "Yes"]);
}
//======================student Exam ======================//
function getExamID(e) {
    var id = e.view.params.id;
    console.log("Examid: " + id);
    if (id) {
        var desc = decodeURIComponent(e.view.params.description);
        //$("#examReadyBtn").attr("href", "#examDetails?id=" + id + "&description=" + desc);
        //$("#examReviewBtn").attr("href", "#examReview?id=" + id);
        $("#examReadyBtn").data("href", "#examDetails?id=" + id + "&description=" + desc);
        $("#examReviewBtn").data("href", "#examReview?id=" + id);
    }
}
function takeExam(e) {
    var btn = $(e.target).closest(".km-button");
    console.log("TakeExam: " + btn.data("href"));
    Utils.navigate(btn.data("href"));
}
function reviewExam(e) {
    var btn = $(e.target).closest(".km-button");
    Utils.navigate(btn.data("href"));
}
function getExams(data) {
    if (data.length === 0) {
        $("#menu-list").find("#examsLI").find(".menuTitle").html("Exams");
        $("#homeView").find("#grd_exams").find(".notificationBadge").html("").removeClass("full");
    } else {
        $("#menu-list").find("#examsLI").find(".menuTitle").html("Exams (" + data.length + ")");
        $("#homeView").find("#grd_exams").find(".notificationBadge").html(data.length).addClass("full");
    }
}
function endExam() {
    currentTeacherView = "#homeView";
    //currentExamID = undefined;
}
function getExamDetails(e) {
    if (e.view.params.prevent) {
        Utils.hideLoading();
        return;
    }
    var id = e.view.params.id;
    //var desc = e.view.params.desc;

    currentExamID = id;

    Utils.showLoading();
    WebService.GET("wb_GetExamDetails", {
                       id: id 
                   }, function(data) {
                       examDetailsData = data;
                       currentQuestionID = 0;
                       /*
                       var examID = data[0].ID;
                       var examDescription = data[0].Description;
                       var startTime = data[0].StartDate;
                       var endTime = data[0].EndDate;
                       var duration = data[0].Duration;
                       var examMark = data[0].ExamMark;
                       var numOfQuestions = data[0].NumberOfQuestions;
                       */
                       $("#prevQuestionBtn").addClass("disabled"); //default state of the prev button
                       $("#nextQuestionBtn").removeClass("disabled"); //default state of the next button
                       examAnswers = {}; //Reset the student's answers array
                       hideSubmitExamBtn();

                       getExamCachedAnswers(id, function(cachedAnswers) {
                           localStorage.setItem("examAnswers", JSON.stringify(cachedAnswers));

                           setTimeout(function() {
                               Utils.hideLoading();
                               getQuestion(examDetailsData, 0);
                           }, 500);
                       });
                   }, function(error) {
                       Utils.alert(error.message, "Exam Error");
                       Utils.hideLoading();
                   });
}
function hideSubmitExamBtn() {
    $("#examDetails").find("#submitExamBtn").hide();
    $("#examDetails").find("#examContent").show();
}

function getExamCachedAnswers(examID, callback) {
    console.log("getExamCachedAnswers for exam: " + examID);

    try {
        DB.db.transaction(function(tx) {
            tx.executeSql("SELECT * FROM ExamCache WHERE ExamID = ?", [examID], function(tx, results) {
                console.log("Found " + results.rows.length + " cached results!");
                if (results.rows.length === 0) {
                    cachedAnswers = false;
                } else {
                    var cachedAnswers = results.rows.item(0).ExamData;
                    console.log("cachedAnswers Data: " + cachedAnswers);
                    if (cachedAnswers && cachedAnswers !== "") {
                        cachedAnswers = JSON.parse(decodeURIComponent(cachedAnswers));
                    } else {
                        cachedAnswers = false;
                    }
                }

                console.log("cachedAnswers: " + JSON.stringify(cachedAnswers));

                callback ? callback(cachedAnswers) : false;
            }, function(error) {
                console.log("getExamCachedAnswers Error: " + JSON.stringify(error));
                
                callback ? callback(false) : false;
            });
        });
    } catch (ex) {
        console.log("getExamCachedAnswers Catch: " + JSON.stringify(error));
        callback ? callback(false) : false;
    }
}
function getQuestion(data, id) {
    var getCachedAnswer = function(examObj) {
        if (!localStorage.getItem("examAnswers")) {
            return false;
        }

        var cachedAnswer = JSON.parse(localStorage.getItem("examAnswers"));
        console.log(cachedAnswer);
        console.log(examObj);
        cachedAnswer = cachedAnswer[examObj.QuestionID];

        if (!cachedAnswer) {
            return false;
        }
        if (cachedAnswer.ExamID !== currentExamID) {
            return false;
        }

        return cachedAnswer;
        /*var answerObj = {};
        answerObj.StudentID = parseInt(localStorage.getItem("currentUserID"));
        answerObj.ExamID = currentExamID;
        answerObj.QuestionID = questionID;
        answerObj.QuestionType = questionType;
        answerObj.AnswerString = answerString;
        answerObj.Answer = answer;*/
    };

    var cachedAnswer = getCachedAnswer(data[id]);
    console.log(cachedAnswer);

    $("#examQuestionCounter").html("Question " + (id + 1) + " of " + data[id].NumberOfQuestions);
    if ($("#examDetails").find("img.questionImage").data("kendoTouch")) {
        $("#examDetails").find("img.questionImage").data("kendoTouch").destroy();
    }
    $("#examDetails").find("#examContent").html("");
    var questionImage = fileURL + data[id].Image;
    questionImage = questionImage.replace("/uploads/uploads/", "/uploads/");
    $("#examDetails").find("#examContent").html("<li style='border-bottom-left-radius:5px;border-bottom-right-radius:5px;margin-top:10px;font-size:1.2rem'><span id='questionID' style='display:none'>" + data[id].QuestionID + "</span><span id='questionType' style='display:none'>" + data[id].QuestionType + "</span>" +
                                                "<span id='numberOfChoices' style='display:none'>" + data[id].NumberOfChoices + "</span><span class='questionName'>Q" + (id + 1) + ") </span>" +
                                                "<span class='questionDescription'>" + data[id].QuestionDescription + "</span><img class='questionImage' src='" + questionImage + "' onerror='showDefaultImage(this)' /></li>");

    $("#examDetails").find("#examContent li").find("img.questionImage").kendoTouch({
                                                                                       tap: function(e) {
                                                                                           var src = e.touch.target.closest("img").attr("src");
                                                                                           console.log("Image: " + src);
                                                                                           $("#imageViewerModal .km-content").css("background-image", "url(" + src + ")").css("background-size", "contain").css("background-position", "center").css("background-repeat", "no-repeat");
                                                                                           $("#imageViewerModal").find("img.detailedImage").css("display", "none");
                                                                                           //$("#imageViewerModal").find("img.detailedImage").attr("src", src);
                                                                                           //$("#imageViewerModal").find("img.detailedImage").css("height", "520px").css("margin", "0 auto").css("marginTop", "20px").css("width","100%");
                                                                                           $("#imageViewerModal").find(".km-header").removeClass("disabled");
                                                                                           $("#imageViewerModal").data("kendoMobileModalView").open();

                                                                                           initTools();
                                                                                       }
                                                                                   });

    $("#examDetails").find("#examContent").append("<li style='border:none;box-shadow:none;background:none'></li>");

    if (data[id].QuestionType === 3) { //Essay
        $("#examDetails").find("#examContent").append("<li class='answer'><span id='answerID' style='display:none'>" + data[id]._AnswerID[k] + "</span><span class='questionAnswer' style='height:auto;line-height:40px;width:100%'><label>Answer:<textarea id='answer' style='width:86%;height:300px;line-height:20px;font-size:1.2rem;margin:0px;padding:10px;resize:none;'></textarea></label></span></li>");
        //$("#examDetails").find("#examContent").append("<li class='answer'><label>Answer:<input id='answer' type='text' style='width:86%;height:40px;line-height:40px;font-size:1rem;margin-right:1%;'/></label></li>");
        //save the student's essay answer onblur
        $("#examDetails").find("#examContent").find("li.answer:not(.matching) textarea").on("blur", function() {
            var questionID = parseInt($("#examDetails").find("#examContent").find("li:first").find("#questionID").html());
            /*
            var _ans = lookupObj(examAnswers,"questionID",questionID);
            if(!_ans){
            examAnswers.push({
            questionID: questionID,
            type: 3,
            choices: [],
            essay: $(this).val()
            });
            }
            else{
            _ans.essay = $(this).val();
            }
            */
            examAnswers[questionID] = {
                type: 3,
                choices: [],
                essay: $(this).val()
            };

            //examAnswers[currentQuestionID] = "3" + $(this).val(); //currentQuestionID is only used as an index
            saveQuestionAnswer(questionID, $(this).val(), data[id].QuestionType); //questionID is the actual question ID
            
            try {
                $("#examDetails").data("kendoMobileView").scroller.scrollTo(0, 0);
            } catch (ex) {
            }
        });

        if (cachedAnswer) {
            $("#examDetails").find("#examContent li textarea").val(cachedAnswer.Answer);
            saveQuestionAnswer(cachedAnswer.QuestionID, cachedAnswer.Answer, cachedAnswer.QuestionType);
        }
    } else if (data[id].QuestionType === 5) { //Matching
        for (var j = 0; j < data[id].NumberOfChoices; j++) {
            //$("#examDetails").find("#examContent").append("<li class='answer'><span id='answerID' style='display:none'>" + data[id]._AnswerID[j] + "</span><span class='questionAnswer' style='width:100%'>" + getChoice(data[id]._ChoiceTitle[j]) + "<span id='answer'><span class='answerChoice' style='line-height:normal;width:50%'>" + data[id]._ChoiceValue[j].split("^")[0] + "</span><span class='answerChoiceValue' style='line-height:normal;width:50%;float:right'>" + data[id]._ChoiceValue[j].split("^")[1] + "</span></span></span><span class='questionAnswerImage' style='background-image:url(" + fileURL + data[id]._ChoiceImage[j] + ");display:none;'></span></li>");
            $("#examDetails").find("#examContent").append("<li class='answer matching'><span id='answerID' style='display:none'>" + data[id]._AnswerID[j] + "</span><span class='questionAnswer' style='width:100%'><span style='float:left'>" + getChoice(data[id]._ChoiceTitle[j]) + "</span><span id='answer'><textarea class='answerChoice' disabled style='width:42%'>" + data[id]._ChoiceValue[j].split("^")[0] + "</textarea><input type='text' class='answerChoiceAnswer' /><span style='float:left;margin-left:2%'>" + (j + 1) + ")</span><textarea class='answerChoiceValue' disabled style='width:46%'>" + data[id]._ChoiceValue[j].split("^")[1] + "</textarea></span></span><span class='questionAnswerImage' style='background-image:url(" + (fileURL + data[id]._ChoiceImage[j]).replace("uploads/uploads/", "uploads/") + ");display:none;'></span></li>");
        }
        //save the student's matching answer onblur
        $("#examDetails").find("#examContent").find("li.answer.matching input.answerChoiceAnswer").on("blur", function() {
            answers = "";
            var answerString = "";
            var questionID = parseInt($("#examDetails").find("#examContent").find("li:first").find("#questionID").html());
            $(this).closest("ul").find("input.answerChoiceAnswer").each(function() {
                answers += $(this).val() === "" ? "-1," : $(this).val() + ",";
                answerString += $(this).val() + ",";
            });
            answers = answers.slice(0, -1);
            examAnswers[currentQuestionID] = "5" + answerString.slice(0, -1); //currentQuestionID is only used as an index
            saveQuestionAnswer(questionID, answers, data[id].QuestionType); //questionID is the actual question ID
        });
    } else {
        for (var k = 0; k < data[id].NumberOfChoices; k++) {
            var bgImage = "images/default.png";
            var imgStyle = "";
            var liStyle = "";
            if (data[id]._ChoiceImage[k] !== "") {
                bgImage = fileURL + data[id]._ChoiceImage[k];
                bgImage = bgImage.replace("/uploads/uploads/", "/uploads/");
            } else {
                imgStyle = "display:none;pointer-events:none;";
                liStyle = "width:100%";
            }
            $("#examDetails").find("#examContent").append("<li class='answer' answerID='" + data[id]._AnswerID[k] + "' ><span id='answerID' style='display:none'>" + data[id]._AnswerID[k] + "</span><span class='questionAnswer' style=" + liStyle + ">" + getChoice(data[id]._ChoiceTitle[k]) + " <span id='answer'>" + data[id]._ChoiceValue[k] + "</span></span><span class='questionAnswerImage' style='background-image:url(" + bgImage + ");" + imgStyle + "'></span></li>");
        }

        var answers = ""; //used to create delimited string of answers to be used in the examAnswers array

        //save the student's multiple/true-false/multivalue answers
        $("#examDetails").find("#examContent").find("li.answer .questionAnswer").kendoTouch({
                                                                                                tap: function(e) {
                                                                                                    var item = e.touch.target.closest("li");
                                                                                                    var questionType = parseInt(item.closest("ul").find("li:first").find("#questionType").html());
                                                                                                    var questionID = parseInt(item.closest("ul").find("li:first").find("#questionID").html());
                                                                                                    var numberOfChoices = parseInt(item.closest("ul").find("li:first").find("#numberOfChoices").html());
                                                                                                    //var index = item.index();

                                                                                                    var answerString = "";

                                                                                                    if (questionType === 1 || questionType === 2) { //True-False OR Multiple Choice
                                                                                                        $("#examDetails").find("#examContent").find("li.answer").removeClass("activeLink");
                                                                                                        item.addClass("activeLink");
                                                                                                        saveQuestionAnswer(questionID, item.find("#answerID").html(), questionType); //currentQuestionID is only used as an index
                                                                                                        examAnswers[questionID] = {
                                                                                                            type: questionType,
                                                                                                            choices: [{
                                                                                                                        answerID: item.find("#answerID").html(),
                                                                                                                        isSelected: 1
                                                                                                                    }
                                                                                                            ],
                                                                                                            essay: ""
                                                                                                        };
                                                                                                    } else if (questionType === 4) { //Multiple Choice With Multiple Values
                                                                                                        //var _ans = lookupObj(examAnswers,"questionID",questionID);
                                                                                                        if (!examAnswers[questionID]) {
                                                                                                            examAnswers[questionID] = {};
                                                                                                        }
                                                                                                        examAnswers[questionID].choices = [];

                                                                                                        if (item.hasClass("activeLink")) {
                                                                                                            item.removeClass("activeLink");
                                                                                                        } else {
                                                                                                            item.addClass("activeLink");
                                                                                                        }

                                                                                                        item.closest("ul").find("li.answer").each(function() {
                                                                                                            if (item.hasClass("activeLink")) {
                                                                                                                console.log("has class");
                                                                                                                examAnswers[questionID].choices.push({
                                                                                                                                                         answerID: $(this).find("#answerID").html(),
                                                                                                                                                         isSelected: $(this).hasClass("activeLink") ? 1 : 0
                                                                                                                                                     });
                                                                                                            } else {
                                                                                                                console.log("does not have class");
                                                                                                                examAnswers[questionID].choices.push({
                                                                                                                                                         answerID: $(this).find("#answerID").html(),
                                                                                                                                                         isSelected: $(this).hasClass("activeLink") ? 1 : 0
                                                                                                                                                     });
                                                                                                            }
                                                                                                        });

                                                                                                        if (answers.length % 2 > 0) { //type already appended to beginning of string
                                                                                                            answers = answers.substring(1, answers.length);
                                                                                                        }
                                                                                                        answers = questionType + answers;
                                                                                                        //examAnswers[currentQuestionID] = answers;

                                                                                                        examAnswers[questionID] = {
                                                                                                            type: questionType,
                                                                                                            choices: examAnswers[questionID].choices,
                                                                                                            essay: ""
                                                                                                        };

                                                                                                        //var numOfAnswers = item.closest("ul").find("li.activeLink").length;
                                                                                                        item.closest("ul").find("li.activeLink").each(function() {
                                                                                                            answerString += $(this).find("#answerID").html() + ",";
                                                                                                        });
                                                                                                        var currentCommas = answerString.slice(0, -1).split(",").length;
                                                                                                        var missingCommas = numberOfChoices - currentCommas;
                                                                                                        //alert("currentCommas: " + currentCommas + "\nNumber Of Choices: " + numberOfChoices + "\nmissingCommas: " + missingCommas);
                                                                                                        for (var t = 0; t < missingCommas; t++) {
                                                                                                            answerString += "-1,";
                                                                                                        }
                                                                                                        answerString = answerString.slice(0, -1); //This removes the last ',' and adds a ';'
                                                                                                        saveQuestionAnswer(questionID, answerString, questionType);
                                                                                                    }
                                                                                                }
                                                                                            });

        $("#examDetails").find("#examContent").find("li.answer .questionAnswerImage").kendoTouch({
                                                                                                     tap: function(e) {
                                                                                                         var src = e.touch.target.css("background-image");
                                                                                                         $("#imageViewerModal .km-content").css("background-image", src).css("background-size", "contain").css("background-position", "center").css("background-repeat", "no-repeat");
                                                                                                         $("#imageViewerModal").find("img.detailedImage").css("display", "none");
                                                                                                         //$("#imageViewerModal").find("img.detailedImage").attr("src", src);
                                                                                                         //$("#imageViewerModal").find("img.detailedImage").css("height", "520px").css("margin", "0 auto").css("marginTop", "20px").css("width","100%");
                                                                                                         $("#imageViewerModal").data("kendoMobileModalView").open();

                                                                                                         initTools();
                                                                                                     }
                                                                                                 });

        if (cachedAnswer) {
            $("#examDetails").find("#examContent li").removeClass("activeLink");
            $("#examDetails").find("#examContent li[answerID=" + cachedAnswer.Answer.replace(",,,;", "") + "]").addClass("activeLink");
            saveQuestionAnswer(cachedAnswer.QuestionID, cachedAnswer.AnswerString, cachedAnswer.QuestionType);
        }
    }
}
function saveQuestionAnswer(questionID, answer, questionType) {
    var answerString = "";
    if (questionType === 1 || questionType === 2) {
        answer = answer.replace(",,,;", "");
        answerString = answer + ",,,;";
    } else if (questionType === 3 || questionType === 4 || questionType === 5) {
        answerString = answer;
    }

    var answerObj = {};
    answerObj.StudentID = parseInt(localStorage.getItem("currentUserID"));
    answerObj.ExamID = currentExamID;
    answerObj.QuestionID = questionID;
    answerObj.QuestionType = questionType;
    answerObj.AnswerString = answerString;
    answerObj.Answer = answer;

    socket.emit("saveAnswer", answerObj, function(didSave) {
        if (!didSave) {
            Utils.showNotification("Could not save answer!");
        }
    });

    try {
        DB.db.transaction(function(tx) {
            tx.executeSql("SELECT * FROM ExamCache WHERE ExamID = ?", [currentExamID], function(tx, results) {
                if (results.rows.length === 0) {
                    cachedAnswers = {};
                } else {
                    var cachedAnswers = results.rows.item(0).ExamData;
                    if (cachedAnswers && cachedAnswers !== "") {
                        cachedAnswers = JSON.parse(decodeURIComponent(cachedAnswers));
                    } else {
                        cachedAnswers = {};
                    }
                }

                cachedAnswers[questionID] = answerObj;

                tx.executeSql("DELETE FROM ExamCache WHERE ExamID = ?", [currentExamID], function(tx, results) {
                    tx.executeSql("INSERT INTO ExamCache (ExamID, ExamData) VALUES (?,?)", [currentExamID, encodeURIComponent(JSON.stringify(cachedAnswers))]);
                });
            });
        });
    } catch (ex) {
        console.log("Could not cache question: " + JSON.stringify(ex));
    }
}
function getChoice(i) {
    var choice = '';
    if (isNaN(i)) {
        if (i.length > 1) {
            choice = i;
        } else {
            choice = i + ")";
        }
    } else {
        switch (parseInt(i)) {
            case 1:
                choice = 'a)';
                break;
            case 2:
                choice = 'b)';
                break;
            case 3:
                choice = 'c)';
                break;
            case 4:
                choice = 'd)';
                break;
            case 5:
                choice = 'e)';
                break;
            case 6:
                choice = 'f)';
        }
    }
    return choice;
}
function showDefaultImage(img) {
    $(img).attr("src", "images/default.png");
}
function getNextQuestion() {
    ++currentQuestionID;
    if ((currentQuestionID) < examDetailsData.length) {
        getQuestion(examDetailsData, (currentQuestionID));
    } else {
        showSubmitExamBtn();
    }
    if ((currentQuestionID) === examDetailsData.length) {
        $("#nextQuestionBtn").addClass("disabled");
        $("#prevQuestionBtn").removeClass("disabled"); //needed in case the exam consists of only 2 questions
    } else {
        $("#nextQuestionBtn").removeClass("disabled");
        $("#prevQuestionBtn").removeClass("disabled");
    }
    selectPrevAnswer($("#examContent #questionID").text());
    $("#examDetails").data("kendoMobileView").scroller.reset();
}

function getPrevQuestion() {
    hideSubmitExamBtn();
    --currentQuestionID;
    if ((currentQuestionID) > -1) {
        getQuestion(examDetailsData, (currentQuestionID));
    }
    if ((currentQuestionID - 1) === -1) {
        $("#prevQuestionBtn").addClass("disabled");
        $("#nextQuestionBtn").removeClass("disabled"); //needed in case the exam consists of only 2 questions
    } else {
        $("#prevQuestionBtn").removeClass("disabled");
        $("#nextQuestionBtn").removeClass("disabled");
    }
    selectPrevAnswer($("#examContent #questionID").text());
    $("#examDetails").data("kendoMobileView").scroller.reset();
}
function showSubmitExamBtn() {
    $("#examDetails").find("#examContent").hide();
    $("#examDetails").find("#submitExamBtn").show();
}
function selectPrevAnswer(qID) {
    var answers;
    //var _ans = lookupObj(examAnswers,"questionID",qID);
    var _ans = examAnswers[qID];
    if (_ans) {
        if (_ans.type === 3) {
            $("#examDetails").find("#examContent").find("li.answer textarea").val(_ans.essay);
        } else if (_ans.type === 1 || _ans.type === 2) {
            $("#examDetails").find("#examContent").find("#answerID:contains(" + _ans.choices[0].answerID + ")").closest("li").addClass("activeLink");
        } else if (_ans.type === 4) {
            for (var i = 0; i < _ans.choices.length; i++) {
                if (_ans.choices[i].isSelected === 1) {
                    $("#examDetails").find("#examContent").find("#answerID:contains(" + parseInt(_ans.choices[i].answerID) + ")").closest("li").addClass("activeLink");
                } else {
                    $("#examDetails").find("#examContent").find("#answerID:contains(" + parseInt(_ans.choices[i].answerID) + ")").closest("li").removeClass("activeLink");
                }
            }
        } else if (_ans.type === 5) {
            answers = examAnswers[qID].substring(1, examAnswers[qID].length).split(",");
            $("#examDetails").find("#examContent").find("li.answer").each(function() {
                var index = $(this).index() - 2;
                var answer = answers[index];
                $(this).find("input").val(answer);
            });
        }
    }
}
function submitExam() {
    Utils.navigate("#submitExamView");
}
function confirmSubmitExam() {
    navigator.notification.confirm("Are you sure you want to submit your exam?", function(buttonIndex) {
        if (buttonIndex === 2) {
            console.log("confirmSubmit");
            console.log("currentExamID ", currentExamID)
            console.log("currentUserID ", currentUserID)
            socket.emit("submitExam", {
                            examID: currentExamID,
                            studentID: currentUserID
                        });
            clearInterval(examTimerInterval);
            examTimerInterval = undefined;
            Utils.navigate("#homeView", "fade");

            clearExamCachedAnswers(false, function() {
                console.log("Cleared Exam Cache!");
                currentExamID = undefined;
                localStorage.setItem("ExamRerunID", (currentExamRerunID || 0).toString());
            });
        }
    }, "Warning", ["No", "Yes"]);
}
function clearExamCachedAnswers(examID, callback) {
    var query = "DELETE FROM ExamCache";
    var params = [];
    if (examID) {
        query += " WHERE ExamID = ?";
        params = [examID];
    }

    DB.db.transaction(function(tx) {
        tx.executeSql(query, params, function(error) {
            console.log("Failed to clear the ExamCache table: " + JSON.stringify(error));
            callback ? callback() : false;
        }, function() {
            callback ? callback() : false;
        });
    });
}
function getExamReviewQuestions(e) {
    if (e.view.params.prevent) {
        return;
    }
    var id = currentExamID;

    if (e.view.params && e.view.params.id && e.view.params.id !== "undefined") {
        id = e.view.params.id;
        currentExamID = id;
    }
    WebService.GET("wb_GetExamReviewQuestions", {
                       id: id
                   }, function(data) {
                       var content = "";
                       for (var i = 0; i < data.length; i++) {
                           content += "<table class='rv_question'>";

                           var mark = parseFloat(data[i].Mark).toFixed(1);
                           if (parseFloat(mark) > 1) {
                               mark += " Marks";
                           } else {
                               mark += " Mark";
                           }

                           content += "<tr>" +
                                      "<td class='title'>" + data[i].QuestionName + ") " + data[i].Question + " (" + mark + ")</td>" +
                                      "<td class='image' image='" + getFullPath(data[i].Image) + "'></td>" +
                                      "</tr>";
                           content += "</table>";

                           content += "<table class='rv_question_answers'>";
                           for (var j = 0; j < data[i].Answers.length; j++) {
                               var ans = data[i].Answers[j];
                               content += "<tr>" +
                                          "<td class='rv_question_answer title'>" + ans.ChoiceTitle + ") " + ans.ChoiceValue + "</td>" +
                                          "<td class='rv_question_answer_image image' image='" + getFullPath(ans.Image) + "'></td>" +
                                          "</tr>";
                           }
                           content += "</table>";
                       }

                       $("#examQuestionsContainer").html(content);

                       $("#examQuestionsContainer .image").each(function() {
                           var el = $(this);
                           if (el.attr("image")) {
                               var img = new Image();
                               img.onload = function() {
                                   el.css("background-image", "url(" + img.src + ")");
                               };
                               img.src = el.attr("image");
                           }
                       });
                   }, function(error) {
                       Utils.alert("Could not get exam details", "Error");
                       console.log("Exam Details Error: " + JSON.stringify(error));
                   });
}
function getFullPath(path) {
    var server = mainURL.split("Service.svc")[0];
    var fullPath = server + path;
    return fullPath;
}
function viewExamResultDetails(e) {
    WebService.GET("wb_GetExamResultDetails", {
                       examID:currentExamID
                   }, function(data) {
                       $("#examResultDetailsTable tbody").html("");
                       for (var i = 0; i < data.length; i++) {
                           var qNum = "<td>Q" + (i + 1) + ")</td>";
                           var imgTD = "<td><img src='" + (fileURL + data[i].Image).replace("uploads/uploads/", "uploads/") + "' onerror='showDefaultImage(this);' style='width:150px;height:150px;' /></td>";
                           var questionTD = "<td>" + data[i].Question + "</td>";
                           var ansTD = "<td>" + data[i].Answer + "</td>";
                           var tr = "<tr>" + qNum + imgTD + questionTD + ansTD + "</tr>";
                           $("#examResultDetailsTable tbody").append(tr);
                       }
                       $("#examResultDetailsModal").data("kendoMobileModalView").open(); 
                   }, function(error) {
                       Utils.alert("Could not get details", "Error");
                   });
}
/*---------------------Documents---------------------------*/

/*---------------------Documents---------------------------*/
function getDocuments() {
    if ($("#documents").data("kendoMobileView")) {
        $("#documents").data("kendoMobileView").scroller.reset();
    }
    WebService.GET("wb_GetAllDocuments", {
                       subjectID: currentSubjectID,
                       sectionID:currentSectionID,
                       all:'no'
                   }, function(data) {
                       downloadsArr = [];
                       $("#documents-list").html("");
                       if (data.length === 0) {
                           //find("#menu-list").find("#documentsLI").find(".menuTitle").html("Documents");
                           //	$("#homeView").find("#grd_documents").find(".notificationBadge").html("").removeClass("full");
                       } else {
                           //	find("#menu-list").find("#documentsLI").find(".menuTitle").html("Documents (" + data.length + ")");
                           //	$("#homeView").find("#grd_documents").find(".notificationBadge").html(data.length).addClass("full");
                           var category;
                           $("#documents-list").html("");
                           var lineCounter = 1;
                           for (var i = 0; i < data.length; i++) {
                               if (data[i].Category !== category) {
                                   category = data[i].Category;
                                   id = data[i].CategoryID;
                               }

                               var downloadable = data[i].Downloadable.toString() === "1" ? true : false;

                               var theFile = data[i];

                               var thumbnail = "";
                               var extension = data[i].Path.substring(data[i].Path.lastIndexOf("."));
                               switch (extension) {
                                   case ".pdf":
                                       thumbnail = "images/thumbnails/extensions/PDF.png";
                                       break;
                                   case ".ppt":
                                   case ".pptx":
                                       thumbnail = "images/thumbnails/extensions/PPT.png";
                                       break;
                                   case ".doc":
                                   case ".docx":
                                       thumbnail = "images/thumbnails/extensions/DOC.png";
                                       break;
                                   case ".xls":
                                   case ".xlsx":
                                       thumbnail = "images/thumbnails/extensions/XLS.png";
                                       break;
                                   default:
                                       thumbnail = "images/thumbnails/extensions/DEFAULT.png";
                                       break;
                               }
                               $("#documents-list").append("<li id='doc_" + data[i].ID + "' class='catContent' isDownloadable='" + data[i].Downloadable + "'>" +
                                                           "<span style='display:none' id='docID'>" + data[i].ID + "</span>" +
                                                           "<span style='display:none' id='docPath'>" + encodeURI(getFullPath(data[i].Path)) + "</span>" +
                                                           "<div class='progressBarContainer'>" +
                                                           "<div class='progressBar'></div>" +
                                                           "<span class='progressLabel'></span>" +
                                                           "</div>" +
                                                           "<div class='iconContainer' style='background-image:url(" + thumbnail + ")'>" +
                                                           "<div class='loader'></div>" +
                                                           "<a data-role='button' class='cancelDownload' data-click='cancelDownload'>x</a>" +
                                                           "<div class='downloadComplete'></div>" +
                                                           "</div>" +
                                                           "<div class='documentInfoContainer'>" +
                                                           "<div class='documentInfo'>" +
                                                           "<span id='docTitle'>" +
                                                           "<span id='documentTitle'>" +
                                                           data[i].Title +
                                                           "</span>" +
                                                           "</span>" +
                                                           "</div>" +
                                                           "</div>" +
                                                           "</li>");

                               if (lineCounter === 4) {
                                   $("#documents-list").append("<div style='display:block;width:100%;height:1px;box-shadow:0px 0px 5px #000;background:#000;clear:both;'></div>");
                                   lineCounter = 0;
                               }
                               lineCounter++;

                               theLI = $("#documents-list li:last-child");
                               if (downloadable) {
                                   downloadsArr.push({
                                                         file: theFile
                                                     });
                               }
                           }

                           if (data.length > 0 && data.length < 4) {
                               $("#documents-list").append("<div style='display:block;width:100%;height:1px;box-shadow:0px 0px 5px #000;background:#000;clear:both;'></div>");
                           }

                           if (downloadsArr.length > 0) {
                               downloadFiles(downloadsArr.reverse().pop());
                           }
                       }
                       $("#documents-list li.catContent").kendoTouch({
                                                                         tap: function(e) {
                                                                             var item = e.touch.target.closest("li");
                                                                             var docPath = item.find("#docPath").html();
                                                                             //var docTitle = item.find("#documentTitle").html();

                                                                             if (item.closest("li").attr("isDownloadable") === "1") {
                                                                                 while (docPath.indexOf("%2") > -1) {
                                                                                     //docPath = decodeURI(docPath);
                                                                                     docPath = decodeURIComponent(docPath);
                                                                                 }
                                                                                 docPath = getUpdatedPath(docPath);
                                                                                 docPath = encodeURI(docPath);
                                                                                 //fbPDF.presentPDF(docPath);
                                                                                 inappbrowser = window.open(encodeURI(decodeURIComponent(docPath)), '_blank', 'location=no,EnableViewPortScale=yes');
                                                                                 inappbrowser.addEventListener('exit', function() {
                                                                                     inappbrowser = "";
                                                                                 });
                                                                             } else {
                                                                                 inappbrowser = window.open(encodeURI(decodeURIComponent(docPath)), '_blank', 'location=no,EnableViewPortScale=yes');
                                                                                 inappbrowser.addEventListener('exit', function() {
                                                                                     inappbrowser = "";
                                                                                 });
                                                                             }
                                                                         }
                                                                     });
                   }, function(error) {
                       Utils.alert(error);
                   });
}
function downloadFiles(dl) {
    var processNextFile = function() {
        if (downloadsArr.length > 0) {
            downloadFiles(downloadsArr.pop());
        }
    };

    checkDownloadFile(dl.file, "Documents", function(resp) {
        documentID = resp.ID;
        documentName = resp.Name;
        documentDescription = resp.Description;
        documentPath = resp.Path;
        $("#doc_" + dl.file.ID).find("#docPath").html(documentPath);
        processNextFile();
    }, function(error) {
        //_alert("Error\n" + JSON.stringify(error),"Error");
        console.log("CheckDownloadFile Error: " + JSON.stringify(error));
        processNextFile();
    });
}
function checkDownloadFile(targetFile, table, successCB, errorCB) {
    var downloadPath = "Documents";
    console.log("=================================================================================================Checking...");
    console.log("=================================================================================================TargetFileID: " + targetFile.ID + "........");
    //var loader = $("#documents-list #doc_" + targetFile.ID + " #docProgressLoading");
    var listItem = $("#documents-list #doc_" + targetFile.ID);
    var theFile = {};
    console.log(JSON.stringify(targetFile));
    DB.db.transaction(function(tx) {
        tx.executeSql("SELECT * FROM " + table + " WHERE ID = " + parseInt(targetFile.ID), [], function(tx, results) {
            console.log(results.rows.length + " documents found!");
            var result;
            if (results.rows.length === 1) {
                //Record Found
                //Check for the actual file
                result = results.rows.item(0);
                while (result.Path.indexOf("%2") > -1) {
                    //result.Path = decodeURI(result.Path);
                    result.Path = decodeURIComponent(result.Path);
                }
                console.log("result.path: " + result.Path);
                result.Path = getUpdatedPath(result.Path);
                console.log("updated result.path: " + result.Path);
                window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(rootDir) {
                    rootDir.getDirectory(downloadPath, {
                                             create: true,
                                             exclusive: false
                                         }, function(dir) {
                                             dir.getFile(result.Path.substr(result.Path.lastIndexOf("/") + 1), {
                                                             create: false,
                                                             exclusive: false
                                                         }, function(fileEntry) {
                                                             //Successfully got the file
                                                             theFile.ID = targetFile.ID;
                                                             theFile.Name = result.Name;
                                                             theFile.Description = result.Description;
                                                             theFile.Path = fileEntry.toURL();
                                                             listItem.setProgress(100, 0);
                                                             successCB(theFile);
                                                         }, function(error) {
                                                             //Could not get file
                                                             console.log("Get File Error: " + error.code);
                                                             if (error.code.toString() === "1") {
                                                                 //File not found
                                                                 //Attempt to download file
                                                                 console.log("Attempting to download files!!!");
                                                                 var downloadTargetPath = "";

                                                                 try {
                                                                     downloadTargetPath = dir.toURL();
                                                                     var extension = targetFile.Path.substring(targetFile.Path.lastIndexOf("."));
                                                                     downloadTargetPath = downloadTargetPath + "/" + targetFile.ID + extension;
                                                                 } catch (ex) {
                                                                     listItem.setProgress(100, 1);
                                                                     errorCB("Could not start the download!\n" + ex);
                                                                     reportException("checkDownloadFile() - Could not start the download: " + JSON.stringify(ex));
                                                                     return;
                                                                 }
                                                                 var ft = new FileTransfer();
                                                                 ft.onprogress = function(progressEvent) {
                                                                     console.log(progressEvent.loaded / progressEvent.total);
                                                                     try {
                                                                         listItem.setProgress(progressEvent.loaded / progressEvent.total);
                                                                         console.log(parseInt(progressEvent.loaded / progressEvent.total));
                                                                     } catch (ex) {
                                                                         //Could not compute progress
                                                                         console.log("Could not compute progress!\n" + JSON.stringify(ex));
                                                                         reportException("checkDownloadFile() - Could not compute progress: " + JSON.stringify(ex));
                                                                     }
                                                                 };
                                                                 listItem.data("fileTransfer", ft);
                                                                 ft.download(
                                                                     encodeURI(mainURL + "/" + targetFile.Path),
                                                                     downloadTargetPath,
                                                                     function(entry) {
                                                                         //Download complete
                                                                         //Save record in DB
                                                                         var entryPath = entry.toURL();
                                                                         DB.db.transaction(function(trx) {
                                                                             trx.executeSql('UPDATE ' + table + ' SET Name="' + targetFile.Name + '",Description="' + targetFile.Description + '",Path="' + encodeURIComponent(entryPath) + '",SubjectID="' + parseInt(targetFile.SubjectID) + '",SectionID="' + targetFile.SectionID + '" WHERE ID=' + parseInt(targetFile.ID), [], function(trx, results) {
                                                                                 //Record inserted successfully
                                                                                 theFile.ID = targetFile.ID;
                                                                                 theFile.Name = targetFile.Name;
                                                                                 theFile.Description = targetFile.Description;
                                                                                 theFile.Path = encodeURIComponent(entryPath);
                                                                                 console.log("Downloaded File: " + encodeURIComponent(entryPath));
                                                                                 listItem.setProgress(100, 0);
                                                                                 successCB(theFile);
                                                                             }, function(error) {
                                                                                 //Could not insert record
                                                                                 listItem.setProgress(100, 1);
                                                                                 errorCB("Could not insert record!\n" + error);
                                                                                 return;
                                                                             });
                                                                         }, function(error) {
                                                                             //Transaction Error
                                                                             listItem.setProgress(100, 1);
                                                                             errorCB("Transaction Error: " + JSON.stringify(error));
                                                                             return;
                                                                         }, function() {
                                                                             //Transaction Complete
                                                                         });
                                                                     },
                                                                     function(error) {
                                                                         //Could not download file
                                                                         listItem.setProgress(100, 1);
                                                                         errorCB("Could not download file!\n" + JSON.stringify(error));
                                                                         return;
                                                                     }
                                                                     );
                                                             } else {
                                                                 listItem.setProgress(100, 1);
                                                                 errorCB("Could not get the file(\"" + result.Path + "\"\n" + error);
                                                                 return;
                                                             }
                                                         });
                                         }, function(error) {
                                             //Could not create directory
                                             errorCB("Could not create directory: " + JSON.stringify(error));
                                         });
                }, function(error) {
                    //Could not create directory
                    errorCB("Could not create directory: " + JSON.stringify(error));
                });
            } else {
                if (results.rows.length > 1) {
                    //Duplicate files found!
                    listItem.setProgress(100, 1);
                    errorCB("Duplicate Files Found!");
                    return;
                } else {
                    //Record Not Found
                    //Attempt to download file
                    console.log("Attempting to download files!!!");
                    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(rootDir) {
                        rootDir.getDirectory(downloadPath, {
                                                 create: true,
                                                 exclusive: false
                                             }, function(dir) {
                                                 try {
                                                     var downloadTargetPath = dir.toURL();
                                                     var extension = targetFile.Path.substring(targetFile.Path.lastIndexOf("."));
                                                     downloadTargetPath = downloadTargetPath + "/" + targetFile.ID + extension;
                                                 } catch (ex) {
                                                     console.log("Exception: " + JSON.stringify(ex));
                                                     listItem.setProgress(100, 1);
                                                     errorCB("Could not start the download!\n" + ex);
                                                     reportException("checkDownloadFile() - createDirectory() - Could not start the download: " + JSON.stringify(ex));
                                                     return;
                                                 }
                                                 var ft = new FileTransfer();
                                                 ft.onprogress = function(progressEvent) {
                                                     console.log(progressEvent.loaded / progressEvent.total);
                                                     try {
                                                         listItem.setProgress(progressEvent.loaded / progressEvent.total);
                                                         console.log(parseInt(progressEvent.loaded / progressEvent.total));
                                                     } catch (ex) {
                                                         //Could not compute progress
                                                         console.log("Could not compute progress!\n" + JSON.stringify(ex));
                                                         reportException("checkDownloadFile() - createDirectory() - Could not compute progress: " + JSON.stringify(ex));
                                                     }
                                                 };
                                                 listItem.data("fileTransfer", ft);
                                                 ft.download(
                                                     encodeURI(mainURL + "/" + targetFile.Path),
                                                     downloadTargetPath,
                                                     function(entry) {
                                                         //Download complete
                                                         //Save record in DB
                                                         var entryPath = entry.toURL();
                                                         DB.db.transaction(function(trx) {
                                                             trx.executeSql('INSERT INTO ' + table + ' (ID,SubjectID,SubjectA,SubjectE,SectionID,Section,LevelID,Level,YearID,Year,SemesterID,Semester,StudentID,Student,Name,Description,Path) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [parseInt(targetFile.ID), parseInt(targetFile.SubjectID), targetFile.SubjectA, targetFile.SubjectE, parseInt(targetFile.SectionID), targetFile.Section, parseInt(targetFile.LevelID), targetFile.Level, parseInt(targetFile.YearID), targetFile.Year, parseInt(targetFile.SemesterID), targetFile.Semester, currentUserID, currentUserName, targetFile.Name, targetFile.Description, encodeURIComponent(entryPath)], function(trx, results) {
                                                                 //Record inserted successfully
                                                                 theFile.ID = targetFile.ID;
                                                                 theFile.Name = targetFile.Name;
                                                                 theFile.Description = targetFile.Description;
                                                                 theFile.Path = encodeURIComponent(entryPath);
                                                                 console.log("Downloaded File: " + encodeURIComponent(entryPath));
                                                                 listItem.setProgress(100, 0);
                                                                 successCB(theFile);
                                                             }, function(error) {
                                                                 //Could not insert record
                                                                 listItem.setProgress(100, 1);
                                                                 errorCB("Could not insert record!\n" + error);
                                                                 return;
                                                             });
                                                         }, function(error) {
                                                             //Transaction Error
                                                             listItem.setProgress(100, 1);
                                                             errorCB("Transaction Error: " + JSON.stringify(error));
                                                             return;
                                                         }, function() {
                                                             //Transaction Complete
                                                         });
                                                     },
                                                     function(error) {
                                                         //Could not download file
                                                         listItem.setProgress(100, 1);
                                                         errorCB("Could not download file!\n" + JSON.stringify(error));
                                                         return;
                                                     }
                                                     );
                                             }, function(error) {
                                                 //Could not create directory
                                                 console.log("Directory Error: " + JSON.stringify(error));
                                                 errorCB("Could not create directory: " + JSON.stringify(error));
                                             });
                    }, function(error) {
                        //Could not create directory
                        console.log("Directory Error: " + JSON.stringify(error));
                        errorCB("Could not create directory: " + JSON.stringify(error));
                    });
                }
            }
        }, function(error) {
            //ExecuteSql Error
            listItem.setProgress(100, 1);
            errorCB("ExecuteSql Error\n" + error);
            return;
        });
    }, function(error) {
        //Transaction Error
        listItem.setProgress(100, 1);
        errorCB("Transaction Error\n" + error);
        return;
    }, function() {
        //Transaction Complete
    });
}
function editDocuments(e) {
    var btn = e.target.closest("a");
    if (btn.attr("isEdit") === "true") {
        //Show the edit buttons and turn this button into a "Done" button
        btn.attr("isEdit", "false").html("Done");
        $(".docViewButton").hide();
        $(".docDeleteButton").show();
    } else {
        //Hide the edit buttons and turn this button back to "Edit"
        btn.attr("isEdit", "true").html("Edit");
        $(".docDeleteButton").hide();
        $(".docViewButton").show();
    }
}
function checkSessionLock() {
    if (SystemParameters.SessionLock) {
        lockApp(function() {
            console.log("App Locked!");
        }, function(error) {
            console.log("Failed to lock the app: " + JSON.stringify(error));
        });
    }
}
function initTools() {
    if (!$("#imageViewerModal").find("#tool").data("kendoTouch")) {
        var currentPosX = 0;
        var currentPosY = 0;
        var currentRotation = 0;
        var newRotation = 0;
        var dX = 0;
        var dY = 0;
        var multiTouchEnabled = false;
        var pro = $("#imageViewerModal").find("#tool");
        $("#imageViewerModal").find("#tool").kendoTouch({
                                                            multiTouch: true,
                                                            drag: function(e) {
                                                                //dX = e.touch.x.delta + parseInt(pro.css("left").split("px")[0]);
                                                                //dY = e.touch.y.delta + parseInt(pro.css("top").split("px")[0]);
                                                                //pro.css("left", dX + "px").css("top", dY + "px");
                                                                var style = window.getComputedStyle($('#imageViewerModal #tool').get(0)); // Need the DOM object
                                                                var matrix = new WebKitCSSMatrix(style.webkitTransform);

                                                                currentPosX = matrix.m41;
                                                                currentPosY = matrix.m42;
                                                                dX = e.touch.x.delta + currentPosX;
                                                                dY = e.touch.y.delta + currentPosY;
                                                                pro.css("-webkit-transform", "translate3d(" + dX + "px, " + dY + "px, 0) rotate(" + newRotation + "deg)");
                                                            },
                                                            gesturestart: function() {
                                                                multiTouchEnabled = true;
                                                            },
                                                            gestureend: function() {
                                                                multiTouchEnabled = false;
                                                            }
                                                        });

        var hm = $("#imageViewerModal").find("#tool").hammer();
        hm.bind("transformstart", function(e) {
            var matrix = pro.css("-webkit-transform");
            if (matrix === "none") {
                currentRotation = 0;
            } else {
                var values = matrix.split('(')[1].split(')')[0].split(',');
                var a = values[0];
                var b = values[1];
                currentRotation = Math.round(Math.atan2(b, a) * (180 / Math.PI));
            }
        });

        hm.bind("transform", function(e) {
            newRotation = currentRotation + e.rotation;
            if (multiTouchEnabled) {
                pro.css("-webkit-transform", "translate3d(" + dX + "px, " + dY + "px, 0) rotate(" + newRotation + "deg)");
            }
        });

        hm.bind("transformend", function(e) {
            currentRotation = newRotation;
        });
    }
}
function showHideTool(e) {
    var tool = $(e.target).closest("li").attr("tool");
    switch (tool) {
        case 'none':
            $("#tool").hide();
            break;
        case 'ruler':
            showRuler();
            break;
        case 'protractor':
            showProtractor();
            break;
    }
}
function showRuler() {
    $("#tool").attr("src", "images/ruler.png");
    $("#tool").show();
}

function showProtractor() {
    $("#tool").attr("src", "images/protractor.png");
    $("#tool").show();
}
 
function viewDocument(e) {
    var docPath = e.view.params.url;
    docPath = decodeURI(decodeURIComponent(docPath));
    docPath = getUpdatedPath(docPath);
    docPath = encodeURI(docPath);
    //fbPDF.getPDF(docPath, '', 'Documents/');
	
    inappbrowser = window.open(encodeURI(getFullPath(e.view.params.url)), '_blank', 'location=yes,EnableViewPortScale=yes');
}
function getUpdatedPath(path) {
    var updatedPath;

    if (!path) {
        return "";
    }

    while (path.indexOf("%2") > -1) {
        try {
            path = decodeURI(path);
            path = decodeURIComponent(path);
        } catch (ex) {
            break;
        }
    }

    path = path.replace(new RegExp("file://", "g"), "");

    if (path.indexOf("../") > -1) { //files saved since v3.2
        updatedPath = cordova.file.applicationStorageDirectory + path.substr(path.indexOf("../") + 3);
        console.log('UpdatedPath ', updatedPath);
        //ex: /var/mobile/Containers/Data/Application/CDDD06D9-5013-4849-BE44-119E695946A6/Documents/../Library/NoCloud/Presentations/8-193.mp4
        //becomes: file:///var/mobile/Containers/Data/Application/00000000-0000-0000-0000-000000000000/Library/NoCloud/Presentatoins/8-193.mp4
    } else { //files saved since v3.3 or not a path (ex:(255,255,255))
        var reg = new RegExp("[a-zA-Z0-9]{8}\-[a-zA-Z0-9]{4}\-[a-zA-Z0-9]{4}\-[a-zA-Z0-9]{4}\-[a-zA-Z0-9]{12}");
        if (path.match(reg) !== null && path.match(reg).length > 0) {
            var ap = cordova.file.applicationStorageDirectory;
            try {
                var newBundleID = ap.match(reg)[0];
                var orgBundleID = path.match(reg)[0];
                console.log("Original BundleID: " + orgBundleID + ", New BundleID: " + newBundleID);
                //updatedPath = ap.substr(0,ap.indexOf(ap.match(reg)) + ap.match(reg)[0].length) + path.substr(path.indexOf(path.match(reg)) + path.match(reg)[0].length);
                //updatedPath = path.replace(orgBundleID,newBundleID);
                updatedPath = ap.split(newBundleID)[0] + newBundleID + "/" + path.split(orgBundleID)[1];
                var doubleSlashReg = new RegExp("//", "g");
                updatedPath = updatedPath.replace(doubleSlashReg, "/");
                updatedPath = updatedPath.replace(new RegExp("file://", "g"), "");
                updatedPath = "file:///" + updatedPath;
            } catch (error) {
                console.log("Catch in path (" + path + ")");
                updatedPath = path;
            }
        } else {
            updatedPath = path;
        }
    }

    console.log("Updated Path: " + updatedPath);

    return updatedPath;
}

function getRootPath(callback) {
    callback ? callback(cordova.file.applicationStorageDirectory) : false;
}

function goBack() {
    Utils.navigate("#:back");
}
$.prototype.setProgress = function(progress, withOptions) {
    progress = Math.floor(progress * 100);
    if (progress > 100) {
        progress = 100;
    }
    //console.log("Progress: " + progress + "%");
    //console.log("Setting Progress" + (withOptions ? " With Options" : ""));
    if (withOptions) {
        if (withOptions === 0) {
            //Options but no error
            //--->Download Complete
            $(this).find(".iconContainer .downloadComplete").css("opacity", "1");
        } else {
            $(this).find(".iconContainer .downloadComplete").css("opacity", "0");
        }
        $(this).find("*").removeClass("active");
    } else {
        var opacity = 0;
        if (progress > 0) {
            opacity = 1;
            $(this).find("*").addClass("active");
            if (progress === 100) {
                opacity = 0;
                $(this).find("*").removeClass("active");
                $(this).find(".iconContainer .downloadComplete").css("opacity", "1");
            }
        } else {
            $(this).find("*").removeClass("active");
        }
        $(this).find(".progressBarContainer").css("opacity", opacity);
        $(this).find(".progressBar").css("width", progress + "%");
        $(this).find(".progressLabel").html(progress);
        //$(this).find(".iconContainer .cancelDownload").css("opacity",opacity);
    }
};