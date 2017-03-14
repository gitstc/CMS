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
var isTeacher = 1;
var socket;
var socketConnected = false;
var socketRoom = localStorage.getItem("socketRoom") || 0;
var joinedRoom = false;

var currentSectionID = localStorage.getItem("currentSectionID");
var currentClassID = localStorage.getItem("currentClassID");
var currentSubjectID = localStorage.getItem("currentSubjectID");
var currentUnitID = localStorage.getItem("currentUnitID");

var SystemParameters;

var examIsActive = false;

var eyesOnTeacherEnabled = false;
var eyesOnTeacherMessage = "Eyes On Teacher";

var onlineStudents = 0, totalStudents = 0, currentScreen = "";

var currentPollID = 0;
var currentPresentationID = 0;
//===================================================================================//

var app;

var isAndroid = false;
var prefs = null;
var currentExamID;
var fileURL = mainURL + "/uploads/";
var examTimerInterval;
//===================================================================================//
//==================================== DATA SOURCES =================================//
//===================================================================================//
var studentsDS = new kendo.data.DataSource({
    transport: {
        read: function(options) {
            try{
                WebService.GET("wb_GetSectionStudents", {
                    subjectID: options.data.SubjectID || currentSubjectID || 0,
                    sectionID: options.data.SectionID || currentSectionID || 0,
                    status: "all"
                }, function(data) {
                    options.success(data);                    
                }, function(error) {
                    options.success([]);
                });
            }
            catch(ex){
                options.success([]);
            }
        }
    },
    schema: {
        model: {
            id: "ID"
        }
    },
    sort: [{
        field: "isPresent",
        dir: "desc"
    }, {
        field: "FullEName",
        dir: "asc"
    }],
    change: function() {
        var data = this.data();
        
        var loggedOutStudents = 0;
        for(var i=0; i<data.length; i++) {
            if (!data[i].isPresent) {
				loggedOutStudents++;
			}
        }
        
        onlineStudents = data.length - loggedOutStudents;
        totalStudents = data.length;
        
        $(".studentsTotal").html(onlineStudents + "/" + totalStudents);
        
        updatePresentStudents();
        
        onlineStudentsData.read();
		offlineStudentsData.read();
    }
});
var onlineStudentsData = new kendo.data.DataSource({
    
	transport: {
		read:function(options){
			/*WebService.GET("wb_GetSectionStudents", {
                    subjectID:currentSubjectID,
                    sectionID: currentSectionID,
                    status: 1
                }, function(data) {
                    options.success(data);                    
                }, function(error) {
                    options.success([]);
                });*/
            
            var onlineStudents = studentsDS.data().filter(function(student) {
                return student.isPresent;
            });
            
            options.success(onlineStudents);
		}
	},
	change: function() {
		onlineStudentsTotal = this.data().length;
		$("#studentsListModal").find("#studentsTotal").html("Total: " + onlineStudentsTotal);
		$("#onlineStudentsCounter").html(onlineStudentsTotal + "/" + studentsDS.data().length);
	}
});
var offlineStudentsData = new kendo.data.DataSource({
   
	transport: {
		read:function(options) {
			 /*WebService.GET("wb_GetSectionStudents", {
                    subjectID:currentSubjectID,
                    sectionID: currentSectionID,
                    status: 0
                }, function(data) {
                    options.success(data);                    
                }, function(error) {
                    options.success([]);
                });*/
            
            var offlineStudents = studentsDS.data().filter(function(student) {
                return !student.isPresent;
            });
            
            options.success(offlineStudents);
		}
	},
	change: function() {
		offlineStudentsTotal = this.data().length;
		//alert(offlineStudentsTotal + "/" + studentsDS.data().length);
		$("#studentsListModal").find("#studentsTotal").html("Total: " + offlineStudentsTotal);
		//$("#onlineStudentsCounter").html(offlineStudentsTotal + "/" + studentsDS.data().length);
	}
});
var attendanceDS = new kendo.data.DataSource({
    transport: {
        read: function(options) {
            try{
                WebService.GET("wb_GetSectionStudents", {
                    subjectID: options.data.SubjectID || currentSubjectID || 0,
                    sectionID: options.data.SectionID || currentSectionID || 0,
                    status: "all"
                }, function(data) {
                    options.success(data);                    
                }, function(error) {
                    options.success([]);
                });
            }
            catch(ex){
                options.success([]);
            }
        }
    },
    schema: {
        model: {
            id: "ID"
        }
    },
    sort: {
        field: "FullEName",
        dir: "asc"
    }
});

var participatingStudentsDS = new kendo.data.DataSource({
    data: [],
    schema: {
        model: {
            id: "ID"
        }
    },
    change: function() {
        var data = this.data();
        if(data.length > 0) {
            $(".alertButton").attr("status", "on");
        }
        else {
            $(".alertButton").attr("status", "off");
        }
    }
});

var presentStudentsDS = new kendo.data.DataSource({
    data: [],
    /*transport: {
        read: function(options) {
            try{
                WebService.GET("wb_GetPresentSectionStudents", {
                    subjectID: options.data.SubjectID || currentSubjectID || 0,
                    sectionID: options.data.SectionID || currentSectionID || 0,
                    status: "all"
                }, function(data) {
                    options.success(data);                    
                }, function(error) {
                    options.success([]);
                });
            }
            catch(ex){
                options.success([]);
            }
        }
    },*/
    schema: {
        model: {
            id: "ID"
        }
    }
});

var shareLinksDS = new kendo.data.DataSource({
    transport: {
        read: function(options) {
            DB.getLinks(function(links) {
                options.success(links);
            });
        }
    },
    schema: {
        model: {
            id: "ID"
        }
    }
});

var unitsDS = new kendo.data.DataSource({
    transport: {
        read: function(options) {
            WebService.POST("wb_GetSubjectUnits", {
                teacherID: options.data.teacherID || currentUserID || 0,
                subjectID: options.data.subjectID || currentSubjectID || 0,
                sectionID: options.data.sectionID || currentSectionID || 0,
                getAll: options.data.getAll || false
            }, function(data) {
                if(data.Error) {
                    options.success([{
                        ID: 0,
                        Code: "0",
                        Name: "All"
                    }]);
                    return;
                }
                data.Result.unshift({
                    ID: 0,
                    Code: "0",
                    Name: "All"
                });
                options.success(data.Result);
            }, function(error) {
                options.success([{
                    ID: 0,
                    Code: "0",
                    Name: "All"
                }]);
            });
        }
    },
    schema: {
        model: {
            id: "ID"
        }
    }
});

var broadcastsDS = new kendo.data.DataSource({
    transport: {
        read: function(options) {
            WebService.GET("wb_GetBroadcastContent", {
                teacherID: options.data.teacherID || currentUserID || 0,
                subjectID: options.data.subjectID || currentSubjectID || 0,
                sectionID: options.data.sectionID || currentSectionID || 0,
                unitID: options.data.unitID || currentUnitID || 0,
                getAll: options.data.getAll || false
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

var scribblesDS = new kendo.data.DataSource({
    transport: {
        read: function(options) {
            WebService.GET("wb_GetAllScribbles", {
                teacherID: options.data.teacherID || currentUserID || 0,
                subjectID: options.data.subjectID || currentSubjectID || 0,
                sectionID: options.data.sectionID || currentSectionID || 0,
                unitID: options.data.unitID || currentUnitID || 0
            }, function(data) {
                options.success(data);
            }, function(error) {
                options.success([]);
            });
        }
    },
    sort: {
        field: "ID",
        dir: "desc"
    },
    schema: {
        model: {
            id: "ID"
        }
    }
});

var scribbleContentsDS = new kendo.data.DataSource({
    transport: {
        read: function(options) {
            WebService.GET("wb_GetScribbleContent", {
                teacherID: options.data.teacherID || currentUserID || 0,
                subjectID: options.data.subjectID || currentSubjectID || 0,
                sectionID: options.data.sectionID || currentSectionID || 0,
                getAll: options.data.getAll || false
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

var pollsDS = new kendo.data.DataSource({
    transport: {
        read: function(options) {
            WebService.GET("wb_GetPolls", {
                teacherID: options.data.teacherID || currentUserID || 0,
                subjectID: options.data.subjectID || currentSubjectID || 0,
                sectionID: options.data.sectionID || currentSectionID || 0,
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

var pollChoicesDS = new kendo.data.DataSource({
    data: [],
    change: function() {
        if(pollChoicesDS.data().length === 4) {
            $("#btnAddPollChoice").addClass("disabled");
        }
        else {
            $("#btnAddPollChoice").removeClass("disabled");
        }
    }
});

var pollResultsDS = new kendo.data.DataSource({
    transport: {
        read: function(options) {
            WebService.GET("getPollResults", {
                pollID: currentPollID || 0
            }, function(data) {
                options.success(data);
            }, function(error) {
                options.success([]);
            });
        }
    }
});

var scribbleTemplatesDS = new kendo.data.DataSource({
    transport: {
        read: function(options) {
            WebService.POST("wb_GetScribbleTemplates", false, function(data) {
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
    },
    pageSize: 24
});

var youtubeVideosDS = new kendo.data.DataSource({
    transport: {
        read: function(options) {
            
            if(!options.data.query) {
                options.success([]);
                return;
            }
            
            Utils.showLoading();
            WebService.GET_EXTERNAL("https://www.googleapis.com/youtube/v3/search?part=snippet&safeSearch=strict&key=AIzaSyAnSm4_1WZSqh2OrD-hmuAalumj9SBLq0w&maxResults=50", {
                q: options.data.query || ""
            }, function(data) {
                options.success(data.items);
            }, function(error) {
                options.success([]);
            }, function() {
                Utils.hideLoading();
            });
        }
    }
});

var whatsNewDS = new kendo.data.DataSource({
    transport: {
        read: function(options) {
            WebService.POST("wb_getWhatsNew", {}, function(resp) {
                
                if(resp.Error) {
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

var presentationsDS = new kendo.data.DataSource({
    transport: {
        read: function(options) {
            WebService.GET("wb_GetAllPresentations", {
                teacherID: options.data.teacherID || currentUserID || 0,
                subjectID: options.data.subjectID || currentSubjectID || 0,
                sectionID: options.data.sectionID || currentSectionID || 0
            }, function(data) {
                options.success(data);
            }, function(error) {
                options.success([]);
            });
        }
    },
    sort: {
        field: "ID",
        dir: "desc"
    },
    schema: {
        model: {
            id: "ID"
        }
    }
});

var examsDS = new kendo.data.DataSource({
    transport: {
        read: function(options) {
            WebService.GET("wb_GetExams", {
                subjectID: options.data.subjectID || currentSubjectID || 0,
                sectionID: options.data.sectionID || currentSectionID || 0,
                unitID: options.data.unitID || 0,
                type: 'all'
            }, function(data) {
                options.success(data);
            }, function(error) {
                options.success([]);
            });
        }
    },
    sort: {
        field: "ID",
        dir: "desc"
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
            WebService.POST("wb_GetPresentationSlides", {
                presentationID: options.data.presentationID || currentPresentationID || 0
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
    },
    change: function(e) {
        var data = e.items;
        
        $(".slidesThumbnailsScroller .listContainer").css("width", data.length * ($(".slidesThumbnailsScroller").height() * 1.5) + "px"); //width of each slide is 1.5 times its height
        if($(".slidesThumbnailsScroller").data("kendoMobileScroller"))
        {
            $(".slidesThumbnailsScroller").data("kendoMobileScroller").scrollTo(0, 0);
        }
    }
});

//===================================================================================//
//==================================== DATA SOURCES =================================//
//===================================================================================//

$(function() {
    
    document.addEventListener("deviceready", bootstrap, false);
    document.addEventListener("backbutton", function(){}, false);
    
    FastClick.attach(document.body);
    
});

function bootstrap() {
    
    isAndroid = (device.platform.toLowerCase() === "android");
    
	SystemParameters = $.parseJSON(localStorage.getItem("SystemParameters") || "{}");
    
    prefs = window["ApplicationPreferencesPlugin"] || null;
    
    var drawerViews = [];
    $("[drawer-enabled]").each(function(){
        drawerViews.push($(this).attr("id"));
    });
    $("#drawer").attr("data-views", JSON.stringify(drawerViews));
    
    DB.initDB(true, function() {
        app = new kendo.mobile.Application(document.body, {
            skin: "flat",
            initial: "#subjectsView",
            init: initApp
        });
    });
    
    try {
        window.plugins.insomnia.keepAwake();
    }
    catch(ex) {}
}

function initApp() {
    initSockets();
    
    setTimeout(function() {
        generateCSS();
    }, 0);
    
    document.addEventListener("pause", function() {
        if(!window.gettingPicture) {
            socket ? socket.disconnect() : false;
        }
    }, false);
    
    document.addEventListener("resume", function() {
        if(!window.gettingPicture) {
            socket ? socket.connect() : false;
        }
        window.gettingPicture = false;
    }, false);
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
        console.log("connected ", socketRoom);
		if (socketRoom && socketRoom > 0) {
			socket.emit("rejoinRoom", {
				room: socketRoom,
				userID: currentUserID,
				userName: currentUserName,
				isTeacher: 1,
				subjectID: parseInt(currentSubjectID),
				sectionID: parseInt(currentSectionID)
			});
		} else {
            if(currentSubjectID && currentSectionID) {
                socket.emit("createRoom", {
    				Subject: parseInt(currentSubjectID || 0),
    				Section: parseInt(currentSectionID || 0)
    			});
            }
		}
	});
    
    socket.on('getMoreData', function() {
		socket.emit('moreData', {
			userID: userID,
			isTeacher: 1,
			Subject: currentSubjectID,
			Section: currentSectionID
		});
	});
    
    socket.on('roomCreated', function(room) {
        
        console.log('roomCreated!');
        Utils.hideLoading();
        
		socketRoom = room;
		joinedRoom = true;
		localStorage.setItem("socketRoom", socketRoom);
        
        studentsDS.read({
            SubjectID: currentSubjectID,
            SectionID: currentSectionID
        }).then(function() {
            Utils.navigate("#homeView");
        });
	});
    
    socket.on('roomJoined', function(room) {
        socketRoom = room;
		joinedRoom = true;
		localStorage.setItem("socketRoom", socketRoom);
        console.log("Rejoined!!!");
        studentsDS.read({
            SubjectID: currentSubjectID,
            SectionID: currentSectionID
        });
    });
    
    socket.on('student_logged_in', function(data) {
        
        if(SystemParameters["AutomaticAttendance"]) {
            var studentID = parseInt(data.id);
            
            var _student = studentsDS.get(studentID);
            
            setStudentPresent(studentID, true);
            
            if(!_student) {
                return;
            }
            Utils.showNotification(_student.FullEName + " Logged In!");
        }
        
    });
    
    socket.on('student_logged_out', function(data) {
        
        if(SystemParameters["AutomaticAttendance"]) {
            var studentID = parseInt(data.id);
            
            var _student = studentsDS.get(studentID);
            
            setStudentPresent(studentID, false);
            
            if(!_student) {
                return;
            }
            Utils.showNotification(_student.FullEName + " Logged Out!");
        }
        
    });
    
    socket.on('handRaised', function(student) {
		console.log("Hand Raised " + JSON.stringify(student));
		handRaised(student);
	});
    
    socket.on('pollQuestionAnswered', function() {
		onPollAnswered();
	});

	socket.on('scribbleShared', function(scribble) {
		/*$("#content-pane").data("kendoMobilePane").navigate("#scribbleResults?id=" + scribble.id, "slide:left");
		scribbleData.read();
		$("#scribble #scribbleList").data("kendoMobileListView").refresh();*/
        console.log("Scribble Shared", scribble);
        Utils.navigate("#scribbleDetailsView?id=" + scribble.id + "&image=" + scribble.img);
	});

	socket.on('scribbleSubmitted', function(scribble) {
		console.log("Student " + scribble.studentID + " shared scribble: " + scribble.scribbleID);
		onScribbleSubmitted(scribble);
	});

	socket.on('errorMessage', function(message) {
		Utils.showNotification(message);
		console.log(message);
	});
    socket.on('startExamStatus', function(data) {
		if (data.Status === "success") {
			startTheExam("00:00:00");
			$("#exams-list").find("#" + data.Exam).closest("li").find("img").attr("src", "images/icons/green.png");
			getExamUpdates(data.Exam, true);

			if (!SystemParameters.SessionLock && SystemParameters.ExamLock) {
				//socket.emit("lockDevices");
			}
		} else if (data.Status === "no students") {
			Utils.alert("There are no online students available", "Error");
			console.log("Could not start the exam: " + JSON.stringify(data));
		} else {
			Utils.alert("Could not start the exam", "Error");
			console.log("Could not start the exam: " + JSON.stringify(data));
		}
	});
    socket.on('stopExamStatus', function(data) {
		if (data.Status === "success") {
			$("#endExamBtn").addClass("disabled");
			//$("#startExamBtn").removeClass("disabled");
			$("#startExamBtn").html("START EXAM");
			clearInterval(examTimerInterval);
			$("#examTimer").html("00:00:00");
			$("#exams-list").find("#" + data.Exam).closest("li").find("img").attr("src", "images/icons/red.png");

			if (SystemParameters.SessionLock && SystemParameters.ExamLock) {
				//socket.emit("unlockDevices");
			}
		} else {
			Utils.alert("Could not stop the exam", "Error");
		}
	});
    socket.on('questionAnswered', function(answer) {
		//updateResults(answer);
		console.log(answer.ExamID);
		//getExamUpdates(answer.ExamID);

		var result = "&#8212;";
		var color = "#1e90ff";
		var isCorrect;
		if (parseInt(answer.isCorrect) === 1) {
			result = "&#10004;";
			color = "green";
			isCorrect = "correct";
		} else if (parseInt(answer.isCorrect) === 0) {
			result = "&#x2717;";
			color = "red";
			isCorrect = "wrong";
		} else {
			result = "&#8212;";
			color = "#1e90ff";
			isCorrect = "unanswered";
		}

		$("#studentResults #std" + answer.StudentID + " #m_" + answer.QuestionID).attr("grade", answer.Grade).attr("result", isCorrect);
		$("#studentResults #std" + answer.StudentID + " #m_" + answer.QuestionID + " .result").css("color", color).html(result);

		var stdGrade = 0;
		$("#studentResults #std" + answer.StudentID + " .mark[result=correct]").each(function() {
			stdGrade += parseFloat($(this).attr("grade"));
		});

		$("#studentResults #std" + answer.StudentID).find("#score").html(stdGrade + "/" + answer.ExamMark);

		correct = $("#studentResults .mark[result=correct]").length;
		wrong = $("#studentResults .mark[result=wrong]").length;
		unanswered = $("#studentResults .mark[result=unanswered]").length;

		console.log("Correct: " + correct);
		console.log("Wrong: " + wrong);
		console.log("Unanswered: " + unanswered);

		var chart = $("#examResultsChart").data("kendoChart");
		chart.options.series[0].data = [{
			category: "Correct",
			value: correct,
			color: "#32CD32" //9de219
		}, {
			category: "Incorrect",
			value: wrong,
			color: "#B22222" //068c35
		}, {
			category: "No Answer",
			value: unanswered,
			color: "#1E90FF" //90cc38
		}];
		chart.refresh();
	});
    socket.on('examSubmitted', function(studentID) {
        console.log("submited1111");
		$("#examResultsView .basicInfo #std" + studentID + " .studentName").css("color", "green");
	});
    socket.on("screenshotError", function() {
		Utils.hideLoading();
		navigator.notification.alert("Could not get screenshot!", false, "Error", "Ok");
	});
    socket.on('gotScreenshot', function(image) {
		Utils.hideLoading();
		$("#screenShareModal").data("kendoMobileModalView").open();
		$("#screenShareModal").find("#studentScreenContainer").css("height", "100%");
		$("#studentScreenContainer #studentScreen").css("width", "100%").attr("src", image);
		//insertTheImage(image, "#studentScreenContainer", false, false);
	});
    
}

//=================Subjects View================
function initSubjectsView(e) {
    var view = e.view.element;
    
    var content = "";
    var template = kendo.template($("#subjectsTemplate").html());
    
    WebService.POST("wb_GetTeacherSubjects", {
        TeacherID: currentUserID
    }, function(data) {

        /*content = "<tr>";
        $.each(data, function(i, subject) {
                        
            content += template(subject);
            
            if((i + 1) % 3 === 0){
                //New Row
                content += "</tr><tr>";
            }
            
        });
        content += "</tr>";*/
        
        content = "";
        $.each(data, function(i, subject) {
            if(i % 3 === 0){
                if(i > 0) {
                    content += "</tr>";
                }
                content += "<tr>" + template(subject);
            }
            else {
                //New Row
                content += template(subject);
            }
        });
        content += "</tr>";
        
        view.find("#subjectsContainer").html(content);
        
        var _maxHeight = 0;
        view.find("#subjectsContainer tr").each(function(){
            if($(this).height() > _maxHeight){
                _maxHeight = $(this).height();
            }
        });
        view.find("#subjectsContainer tr").css("height", _maxHeight + "px");
        view.find("#subjectsContainer td").each(function(){
            var _btn = $(this);
            _btn.kendoMobileButton();
            _btn.click(function(e) {
                currentSubjectID = _btn.find("#subjectID").text();
                currentSectionID = _btn.find("#sectionID").text();
                
                localStorage.setItem("currentSectionID", currentSectionID);
				localStorage.setItem("currentSubjectID", currentSubjectID);
                studentsDS.read();
               
                Utils.showLoading();
                socket.emit("createRoom", {
					Subject: parseInt(currentSubjectID || 0),
					Section: parseInt(currentSectionID || 0)
				}, function() {
					/*studentsDS.read({
                        SubjectID: currentSubjectID,
                        SectionID: currentSectionID
                    }).then(function() {
                        Utils.navigate("#homeView");
                    });*/
                    //Utils.navigate("#homeView");
				});
            });
        });
        
    }, function(error) {
        console.log("Get Subjects Error: " + JSON.stringify(error));
    });
    
}
//=================Subjects View================

//=================Home View================
function initHomeView(e) {
    var view = e.view.element;
    
    setTimeout(function() {
        
        view.find("#menuContainer").css("height", view.find(".km-content").height() + "px");
        view.find("#studentsSideListContainer").css("height", view.find(".km-content").height() + "px");
        
        view.find("#studentsSideListContainer").kendoMobileScroller();
        view.find("#menuContainer").kendoMobileScroller();
        
        var mainMenuMargin = view.find("#menuContainer").height();
        mainMenuMargin -= view.find("#mainMenu").outerHeight(true);
        mainMenuMargin /= 2;
        if(mainMenuMargin < 0) {
            mainMenuMargin = 0;
        }
        view.find("#mainMenu").css("margin-top", mainMenuMargin + "px").css("opacity", "1");
        view.find("#mainMenu .menuItem").kendoMobileButton();
        view.find("#mainMenu .menuItem").click(function(e) {
            console.log(e);
        });
        
        view.find("#studentsSideList").data("kendoMobileListView").refresh();
        $(".studentsTotal").html(onlineStudents + "/" + totalStudents);
        $(".currentScreen").html(currentScreen);
        
    }, 0);
}
//=================Home View================

//=================Attendance View================
function initAttendanceView(e) {
    var view = e.view.element;
    
    setTimeout(function() {
        view.find(".content").css("height", view.find(".km-content").height() - view.find(".topActions").outerHeight(true) + "px");
        view.find(".content").kendoMobileScroller();
        $(".studentsTotal").html(onlineStudents + "/" + totalStudents);
        $(".currentScreen").html(currentScreen);
        
        attendanceDS.read({
            SubjectID: currentSubjectID,
            SectionID: currentSectionID
        });
        
    }, 0);
}
function attendanceListBound(e) {
    var list = e.sender.element;
    
    list.find("li").each(function() {
        var li = $(this);
        
        li.find(".profilePicture").loadBackgroundImage(li.find(".profilePicture").attr("background-image"), "images/user.png");
    });
}
//Popover View
function initAttendanceNotesView(e) {
    var view = e.view.element;
    
    setTimeout(function() {
        view.find("#attendanceNoteTextArea").css("height", view.find(".km-content").height() + "px");
        $(".studentsTotal").html(onlineStudents + "/" + totalStudents);
        $(".currentScreen").html(currentScreen);
    }, 0);
}

function addRegistrationNote(e) {
    Utils.handleClick(e);
    
    $("#attendanceNotesPopover").find("#attendanceNoteTextArea").val("");
	$("#attendanceNotesPopover").data("kendoMobilePopOver").open($(e.target));

	var studentID = attendanceDS.getByUid($(e.target).closest("li").attr("data-uid")).ID;
    $("#attendanceNotesPopover").attr("studentID", studentID);
    WebService.GET("wb_getAttendanceNotes", {
        studentID: studentID
    }, function(note) {
        $("#attendanceNotesPopover #attendanceNoteTextArea").attr("noteID", note.ID);
		$("#attendanceNotesPopover #attendanceNoteTextArea").val(note.Note);
    }, function(error) {
        console.log("Add Note Error: " + JSON.strinigify(error));
    });
}

function deleteAttendanceNote(e) {
	Utils.handleClick(e);

    Utils.confirm("Delete attendance note?", function(buttonIndex) {
        if (buttonIndex === 2) {
			var noteID = $("#attendanceNotesPopover #attendanceNoteTextArea").attr("noteID");
			
            WebService.GET("wb_deleteAttendanceNote", {
                id: noteID
            }, function() {
                $("#attendanceNotesPopover").data("kendoMobilePopOver").close();
            }, function(error) {
                consle.log("Delete Note Error: " + JSON.stringify(error));
            });
		}
    }, "Warning", ["No", "Yes"]);
}

function saveAttendanceNote(e) {
	Utils.handleClick(e);

	var note = $("#attendanceNotesPopover").find("#attendanceNoteTextArea").val();
	var studentID = $("#attendanceNotesPopover").attr("studentID");

	$("#attendanceNotesPopover").data("kendoMobilePopOver").close();

    WebService.POST("wb_saveAttendanceNote", {
        StudentID: studentID,
        Note: note
    }, function() {
        console.log("Note saved successfully!");
    }, function(error) {
        console.log("Save Note Error: " + JSON.stringify(error));
    });
}

function changeStudentStatus(e) {
    Utils.handleClick(e);
    
    var _student = attendanceDS.getByUid($(e.target).closest("li").attr("data-uid"));
    
    WebService.GET("wb_ChangeAttendanceStatus", {
        id: _student.ID,
        subjectID: currentSubjectID,
        sectionID: currentSectionID,
        status: (!_student.isPresent) ? 1 : 0,
        forced: 1
    }, function(data) {
        if (data === "error") {
			Utils.alert("Error", "Could not change attendance.");
		} else if (data === "final") {
			Utils.alert("Attendance", "Attendance has been finalized");
		} else {
            setStudentPresent(_student.ID, !_student.isPresent);
		}
    }, function(error) {
        console.log("Change Attendance Error: " + JSON.stringify(error));
		Utils.alert("Error", "Could not change attendance.");
    });
}
//=================Attendance View================

//=================Share Links View================
function initShareLinksView(e) {
    var view = e.view.element;
    
    setTimeout(function() {
        view.find(".content").css("height", view.find(".km-content").height() - view.find(".topActions").outerHeight(true) - view.find("#shareTabs").outerHeight(true) + "px");
        view.find(".content").kendoMobileScroller();
        $(".studentsTotal").html(onlineStudents + "/" + totalStudents);
        $(".currentScreen").html(currentScreen);
        
        /*var panes = view.find(".buttonGroupPane");
        view.find("#shareTabs").kendoMobileButtonGroup({
            index: 0,
            select: function(e) {
                panes.hide().eq(e.index).show();
            }
        });*/
    }, 0);
}
function saveSharedLink(e) {
    Utils.handleClick(e);
    
    var view = $(e.target).closest("[data-role=view]");
    var title = view.find("#txtLinkTitle").val();
    var url = view.find("#txtLinkURL").val();
    
    if($.trim(title).length === 0 || $.trim(url).length === 0) {
        Utils.alert("Error", "Please enter both the title and URL");
        return;
    }
    
    if(url.toLowerCase().indexOf("http://") < 0) {
        url = "http://" + url;
    }
    
    var link = {
        Title: title,
        Link: url
    };
    
    DB.saveLink(link, function(_link) {
        console.log(_link);
        shareLinksDS.add(_link);
        
        view.find("#txtLinkTitle").val("");
        view.find("#txtLinkURL").val("");
        
        Utils.closePopover("#addSharedLinkPopover");
    });
}
function deleteSharedLink(e) {
    Utils.handleClick(e);
    
    var _linkID = $("#linkDetailsPopover #txtLinkID").val();
    
    Utils.confirm("Are you sure you want to delete this link?", function(buttonIndex) {
        
        if(buttonIndex === 2) {
            DB.deleteLink(_linkID, function(didDelete) {
                if(didDelete) {
                    shareLinksDS.remove(shareLinksDS.get(_linkID));
                }
                else {
                    Utils.alert("Error", "Link could not be deleted!");
                }
                
                Utils.closePopover("#linkDetailsPopover");
            });
        }
        
    }, "Warning", ["No", "Yes"]);
}
function updateSharedLink(e) {
    Utils.handleClick(e);
    
    var _linkID = $("#linkDetailsPopover #txtLinkID").val();
    var _linkTitle = $("#linkDetailsPopover #txtLinkTitle").val();
    var _linkURL = $("#linkDetailsPopover #txtLinkURL").val();
    
    if($.trim(_linkTitle).length === 0 || $.trim(_linkURL).length === 0) {
        Utils.alert("Error", "Please enter both the title and URL");
        return;
    }
    
    var _link = {
        ID: _linkID,
        Title: _linkTitle,
        Link: _linkURL
    }
    
    DB.updateLink(_link, function(didUpdate) {
        if(didUpdate) {
            shareLinksDS.read();
        }
        else {
            Utils.alert("Error", "Link could not be updated!");
        }
        
        Utils.closePopover("#linkDetailsPopover");
    });
}
function viewSharedLink(e) {
    Utils.handleClick(e);
    
    var _linkURL = $("#linkDetailsPopover #txtLinkURL").val();
    
    Utils.viewLink(_linkURL, {
        enableLocation: true,
        enableToolbar: true
    });
    
    Utils.closePopover("#linkDetailsPopover");
}
function shareUnshareSharedLink(e) {
    Utils.handleClick(e);
    
    var _linkURL = $("#linkDetailsPopover #txtLinkURL").val();
    
    var btn = $(e.target).closest(".km-button");
    if(btn.hasClass("share")) {
    
    	if (examIsActive || eyesOnTeacherEnabled) {
    		if (examIsActive) {
    			Utils.alert("Warning", "Cannot share link with an exam in progress");
    		} else if (eyesOnTeacherEnabled) {
    			Utils.alert("Warning", "Cannot lock devices with an exam in progress");
    		}
    		return;
    	}
            
        btn.removeClass("share");
        btn.addClass("unshare");
        btn.find(".km-text").text("Unshare Link");
        
        socket.emit("shareLink", _linkURL);

        currentScreen = "Web Browser";
    	$(".currentScreen").html(currentScreen);
    }
    else {
        btn.removeClass("unshare");
        btn.addClass("share");
        btn.find(".km-text").text("Share Link");
        
        socket.emit("unShareLink");

        currentScreen = "";
    	$(".currentScreen").html(currentScreen);
    }
}
function viewSharedLinkDetails(e) {
    Utils.handleClick(e);
    
    var li = $(e.target).closest("li");
    
    var _link = shareLinksDS.getByUid($(e.target).closest("li").attr("data-uid"));
    
    $("#linkDetailsPopover #txtLinkID").val(_link.ID);
    $("#linkDetailsPopover #txtLinkTitle").val(_link.Title);
    $("#linkDetailsPopover #txtLinkURL").val(_link.Link);
    Utils.openPopover("#linkDetailsPopover", li.find(".linkTitle"));
}
//=================Share Links View================

//=================Screen Broadcast View================
function initBroadcastUnitsView(e) {
    
    var view = e.view.element;
    
    setTimeout(function() {
        view.find(".content").css("height", view.find(".km-content").height() - view.find(".topActions").outerHeight(true) + "px");
        view.find(".content").kendoMobileScroller();
        $(".studentsTotal").html(onlineStudents + "/" + totalStudents);
        $(".currentScreen").html(currentScreen);
    }, 0);
}
function showBroadcastUnitsView(e) {
    unitsDS.read({
        teacherID: currentUserID,
        subjectID: currentSubjectID,
        sectionID: currentSectionID,
        getAll: false
    });
}
function initBroadcastView(e) {
    
    var view = e.view.element;
    
    setTimeout(function() {
        view.find(".content").css("height", view.find(".km-content").height() - view.find(".topActions").outerHeight(true) + "px");
        view.find(".content").kendoMobileScroller();
        $(".studentsTotal").html(onlineStudents + "/" + totalStudents);
        $(".currentScreen").html(currentScreen);
    }, 0);
}
function showBroadcastView(e) {
    
    var view = e.view.element;
    
    var unitID = e.view.params.unitID || "0";
    var unit = e.view.params.unit || "";
    console.log("unitID ",unitID)
    console.log("unit ",unit)
    currentUnitID = unitID;
    
    view.find(".currentUnit").text(unit);
    
    broadcastsDS.read({
        teacherID: currentUserID,
        subjectID: currentSubjectID,
        sectionID: currentSectionID,
        unitID: currentUnitID,
        getAll: false
    });
}
function broadcastsListBound(e) {
    var list = e.sender.element;
    
    list.find("li").each(function() {
        var li = $(this);
        
        li.find(".imageContainer").css("height", li.find(".imageContainer").width() - 50 + "px");
        li.find(".image").loadBackgroundImage(li.find(".image").attr("background-image"), "");
    });
}
function getBroadcastPicture(e) {
    Utils.handleClick(e);
    
    Utils.getPicture(function(image) {
        
        uploadBroadcast({
            TeacherID: currentUserID,
            SubjectID: currentSubjectID,
            SectionID: currentSectionID,
            ImageData: image
        }, function(data) {
            
            Utils.hideLoading();
            
            if(data.Error) {
                Utils.alert("Error", data.Response);
                return;
            }
            
            var uploadedImage = encodeURI(Utils.getPicturePath(data.Response));
            startBroadcast(uploadedImage);
            
        }, function(error) {
            Utils.hideLoading();
            
            Utils.alert("Error", "A server error has occurred!");
        });
        
    }, {
        position: [$(e.target).offset().left + $(e.target).width(), $(e.target).offset().top + $(e.target).height()]
    });
}
function onclickStartBroadcast(e, id) {
    Utils.handleClick(e);
    
    var _broadcast = broadcastsDS.get(id);
    if(!_broadcast) {
        return;
    }
    
    startBroadcast(Utils.getPicturePath(_broadcast.Path));
}
function startBroadcast(image) {
    var broadcast = {
        title: "",
        teacherID: currentUserID,
        subjectID: currentSubjectID,
        sectionID: currentSectionID,
        date: moment().format("DD/MM/YYYY"),
        img: image
    }
    
    socket.emit("startSharedScribble", broadcast);
    currentScreen = "Screen Broadcast";
	$(".currentScreen").html(currentScreen);
    
    /*Utils.showLoading();
    $("#broadcastDetailsView #broadcastCanvas").loadBackgroundImage(image, "", function() {
        setTimeout(function() {
            Utils.hideLoading();
            Utils.navigate("#broadcastDetailsView");
        }, 1000);
    });*/
    
    Utils.navigate("#broadcastDetailsView?image=" + image);
}
function getBroadcastPictureFromTemplate(e) {
    Utils.handleClick(e);
    
    var modal = $("#scribbleTemplatesModal");
    
    modal.data("callback", function(image) {
        startBroadcast(image);
    });
    
    Utils.openModal("#scribbleTemplatesModal");
    
    if(!modal.attr("initialized")) {
        var sv = modal.find("#scribbleTemplatesScrollView");
        sv.css("height", modal.find(".km-content").height() + "px");
        
        var templateContentHeight = (modal.find(".km-content").height() / 2) - 40;
        var templateContentCSS = $("<style id='templateContentStyle'>#scribbleTemplatesModal .scribbleTemplate{height:" + templateContentHeight + "px;}</style>");
        $(document.body).append(templateContentCSS);
        
        modal.attr("initialized", true);
    }
    else {
        scribbleTemplatesDS.read();
    }
}
//=================Screen Broadcast View================

//=================Screen Broadcast Details View================
function initBroadcastDetailsView(e) {
    var view = e.view.element;
    
    var canvas = view.find("#broadcastCanvas");
    setTimeout(function() {
        
        view.find("#broadcastCanvasContainer").css("height", view.find(".km-content").height() + "px");
        view.find(".drawingTools").css("height", view.find(".km-content").height() + "px");
        view.find(".drawingToolsContainer").css("height", view.find(".drawingTools").height() - view.find(".drawingTools .drawingActions").outerHeight(true) + "px");
        view.find(".drawingToolsContainer").kendoMobileScroller();
        
        view.find(".drawingToolsList .drawingTool").each(function() {
            
            var tool = $(this);
            
            tool.css("height", $(this).width() * 0.6 + "px");
            if(tool.attr("color") === "eraser") {
                tool.css("color", "black");
            }
            tool.css("color", $(this).attr("color"));
            
            tool.click(function() {
                tool.siblings(".drawingTool").removeClass("active");
                tool.addClass("active");
                
                canvas.data("canvas").setColor(tool.attr("color"));
            });
        });
        
        $(".studentsTotal").html(onlineStudents + "/" + totalStudents);
        $(".currentScreen").html(currentScreen);
    }, 0);
    
}
function showBroadcastDetailsView(e) {
    var view = e.view.element;
    var params = e.view.params;
    
    var image = params.image;
    
    var canvas = view.find("#broadcastCanvas");
    
    setTimeout(function() {
        canvas.loadBackgroundImage(image, "", function(loadedImage) {
            var cWidth = canvas.width();
            var cHeight = view.find(".km-content").height();
            
            var iWidth = loadedImage.width;
            var iHeight = loadedImage.height;
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
                    iHeight = iHeight * iRatio;
                }
                else {
                    iHeight = cHeight;
                    iWidth = iWidth * iRatio;
                }
            }
            else {
                iHeight = cHeight;
                iWidth = iWidth * iRatio;
            }
            */
            
            var iRatio = 1;
            
            var canvasRatio = cWidth / cHeight;
            var imageRatio = iWidth / iHeight;
            
            if(imageRatio > canvasRatio) {
                iRatio = cWidth / iWidth;
                iWidth = cWidth;
                iHeight = iHeight * iRatio;
            }
            else {
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
            
            if(canvas.data("canvas")) {
                canvas.data("canvas").destroy();
            }
            canvas.canvas({
                onchange: function(data) {
                    socket.emit("reflectScribble", data);
                }
            });
        });
    }, 1);
}
function clearBroadcast(e) {
    Utils.handleClick(e);
    
    $("#broadcastCanvas").data("canvas").clear();
}
//=================Screen Broadcast Details View================

//=================Scribbles View================
function initScribbleUnitsView(e) {
    
    var view = e.view.element;
    
    setTimeout(function() {
        view.find(".content").css("height", view.find(".km-content").height() - view.find(".topActions").outerHeight(true) + "px");
        view.find(".content").kendoMobileScroller();
        $(".studentsTotal").html(onlineStudents + "/" + totalStudents);
        $(".currentScreen").html(currentScreen);
    }, 0);
}
function showScribbleUnitsView(e) {
    unitsDS.read({
        teacherID: currentUserID,
        subjectID: currentSubjectID,
        sectionID: currentSectionID,
        getAll: false
    });
}
function initScribblesView(e) {
    
    var view = e.view.element;
    
    setTimeout(function() {
        view.find(".content").css("height", view.find(".km-content").height() - view.find(".topActions").outerHeight(true) + "px");
        view.find(".content").kendoMobileScroller();
        $(".studentsTotal").html(onlineStudents + "/" + totalStudents);
        $(".currentScreen").html(currentScreen);
    }, 0);
}
function showScribblesView(e) {
    
    var view = e.view.element;
    
    var unitID = e.view.params.unitID || "0";
    var unit = e.view.params.unit || "";
    
    currentUnitID = unitID;
    
    view.find(".currentUnit").text(unit);
        
    scribblesDS.read({
        teacherID: currentUserID,
        subjectID: currentSubjectID,
        sectionID: currentSectionID,
        unitID: currentUnitID
    });
}
//=================Scribbles View================

//=================Add Scribble View================
function initAddScribbleView(e) {
    var view = e.view.element;
    
    setTimeout(function() {
        view.find(".content").css("height", view.find(".km-content").height() - view.find(".topActions").outerHeight(true) + "px");
        view.find(".content").kendoMobileScroller();
        $(".studentsTotal").html(onlineStudents + "/" + totalStudents);
        $(".currentScreen").html(currentScreen);
        
        scribbleContentsDS.read({
            teacherID: currentUserID,
            subjectID: currentSubjectID,
            sectionID: currentSectionID,
            getAll: false
        });
    }, 0);
}
function scribbleContentsListBound(e) {
    var list = e.sender.element;
    
    list.find("li").each(function() {
        var li = $(this);
        
        li.find(".imageContainer").css("height", li.find(".imageContainer").width() - 50 + "px");
        li.find(".image").loadBackgroundImage(li.find(".image").attr("background-image"), "");
    });
}
//=================Add Scribble View================

//=================Scribble Details View================
function initScribbleDetailsView(e) {
    
    var view = e.view.element;
    
    setTimeout(function() {
        view.find(".content").css("height", view.find(".km-content").height() - view.find(".topActions").outerHeight(true) + "px");
        view.find(".content").kendoMobileScroller();
        $(".studentsTotal").html(onlineStudents + "/" + totalStudents);
        $(".currentScreen").html(currentScreen);
    }, 0);
}
function showScribbleDetailsView(e) {
    var view = e.view.element;
    var params = e.view.params;
    
    if(!params.id) {
        return;
    }

    //Get Scribble Results
    setTimeout(function() {
        view.find("#scribbleResultsList").empty();
        viewScribbleResults({
            scribbleID: params.id,
            scribbleImage: params.image
        });
    }, 0);
}
function scribblesListBound(e) {
    var list = e.sender.element;
    
    list.find("li").each(function() {
        var li = $(this);
        
        li.find(".imageContainer").css("height", li.find(".imageContainer").width() - 50 + "px");
        li.find(".image").loadBackgroundImage(li.find(".image").attr("background-image"), "");
    });
}
function getScribblePicture(e) {
    Utils.handleClick(e);
    
    Utils.getPicture(function(image) {
       
        Utils.showLoading();
        
        uploadScribble({
            TeacherID: currentUserID,
            SubjectID: currentSubjectID,
            SectionID: currentSectionID,
            ImageData: image
        }, function(data) {
            
            Utils.hideLoading();
            
            if(data.Error) {
                Utils.alert("Error", data.Response);
                return;
            }
            
            var uploadedImage = encodeURI(Utils.getPicturePath(data.Response));
            startScribble(uploadedImage);
            
        }, function(error) {
            Utils.hideLoading();
            
            Utils.alert("Error", "A server error has occurred!");
        });
        
    }, {
        position: [$(e.target).offset().left + $(e.target).width(), $(e.target).offset().top + $(e.target).height()]
    });
}
function getScribblePictureFromTemplate(e) {
    Utils.handleClick(e);
    
    var modal = $("#scribbleTemplatesModal");
    
    modal.data("callback", function(image) {
        startScribble(image);
    });
    
    Utils.openModal("#scribbleTemplatesModal");
    
    if(!modal.attr("initialized")) {
        var sv = modal.find("#scribbleTemplatesScrollView");
        sv.css("height", modal.find(".km-content").height() + "px");
        
        var templateContentHeight = (modal.find(".km-content").height() / 2) - 40;
        var templateContentCSS = $("<style id='templateContentStyle'>#scribbleTemplatesModal .scribbleTemplate{height:" + templateContentHeight + "px;}</style>");
        $(document.body).append(templateContentCSS);
        
        modal.attr("initialized", true);
    }
    else {
        scribbleTemplatesDS.read();
    }
}
function onRefreshScribbleTemplate(e) {
    var sv = $("#scribbleTemplatesModal #scribbleTemplatesScrollView");
    sv.find(".scribbleTemplate").each(function() {
        
        var tmp = $(this);
        setTimeout(function() {
            tmp.find(".templateImage").loadBackgroundImage(tmp.find(".templateImage").attr("background-image"), "");
            tmp.css("opacity", "1");
        }, tmp.index() * 300);
        
    });
}
function onChangingScribbleTemplate(e) {
    $("#scribbleTemplatesScrollView .scribbleTemplate").each(function() {
        var itemID = $(this).find("#itemID").text();
        var item = scribbleTemplatesDS.get(itemID);
        
        if(item.isSelected) {
            $(this).addClass("selected");
        }
        else {
            $(this).removeClass("selected");
        }
    });
}
function selectScribbleTemplate(e) {
    Utils.handleClick(e);
    
    if(!e) {
        $("#scribbleTemplatesScrollView .scribbleTemplate").removeClass("selected");
    }
    
    var item = $(e.target).closest(".scribbleTemplate");
    var dsItem = scribbleTemplatesDS.get(item.find("#itemID").text());
    
    if(!dsItem) {
        return;
    }
    
    $("#scribbleTemplatesScrollView .scribbleTemplate").removeClass("selected");
    
    $.each(scribbleTemplatesDS.data(), function(i, _item) {
        if(_item.hasOwnProperty("isSelected")) {
            _item.isSelected = false;
        }
    });
    
    if(dsItem.isSelected) {
        dsItem.set("isSelected", false);
    }
    else {        
        dsItem.set("isSelected", true);
        item.addClass("selected");
    }
}
function onclickStartScribble(e, id) {
    Utils.handleClick(e);
    
    var _scribble = scribbleContentsDS.get(id);
    if(!_scribble) {
        return;
    }
    
    startScribble(Utils.getPicturePath(_scribble.Path));
}
function startScribble(image) {
    var scribble = {
        title: "",
        teacherID: currentUserID,
        subjectID: currentSubjectID,
        sectionID: currentSectionID,
        date: moment().format("DD/MM/YYYY"),
        img: image
    }
    
    socket.emit("shareScribble", scribble);
    currentScreen = "Scribble";
	$(".currentScreen").html(currentScreen);
}
function startScribbleFromTemplate(e) {
    Utils.handleClick(e);
    
    var template = $("#scribbleTemplatesScrollView .scribbleTemplate.selected .templateImage").attr("background-image");
    /*startScribble(template);*/
    
    var modal = $("#scribbleTemplatesModal");
    if(modal.data("callback")) {
        modal.data("callback")(template);
    }
    
    Utils.closeModal(e);
}
function onScribbleSubmitted(scribble) {

    viewScribbleResults(scribble);
}
function viewScribbleResults(scribble) {
    
    var template = kendo.template($("#scribbleResultTemplate").html());
    
    getScribbleResults(scribble, function(data) {
        
        if($("#scribbleDetailsView #scribbleResultsList li").length === 0) {
            data.unshift({
                StudentName: "Waiting...",
                Scribble: (scribble.scribbleImage || "").replace(mainURL, "").replace(/\/\//g, "").replace(/\\/g, ""),
                DefaultScribble: true
            });
        }
        
        for(var i=0; i<data.length; i++) {
            data[i].DefaultScribble = false;
            var li = template(data[i]);

            $("#scribbleDetailsView #scribbleResultsList").prepend(li);
            
            li = $("#scribbleDetailsView #scribbleResultsList li:first-child");
            
            li.find(".imageContainer").css("height", li.find(".imageContainer").width() - 50 + "px");
            li.find(".image").loadBackgroundImage(li.find(".image").attr("background-image"), "");
            li.find(".action").kendoMobileButton();
            li.data("data", data[i]);
        }
        
    }, function(error) {
        console.log("Could not get scribble results: " + JSON.stringify(scribble));
    });
}
function getScribbleResults(scribble, successCB, errorCB) {
    WebService.GET("wb_GetScribbleResults", {
        scribbleID: scribble.scribbleID,
        studentID: scribble.studentID
    }, successCB, errorCB);
}
function onclickShareScribble(e) {
    Utils.handleClick(e);
    
    var btn = $(e.target).closest(".km-button");
    
    var li = btn.closest("li");
    var scribble = li.data("data");
    
    if(btn.attr("action") === "share") {
        shareScribble(scribble);
        btn.attr("action", "unshare");
        btn.find(".km-text").text("Unshare");
    }
    else {
        unShareScribble(scribble);
        btn.attr("action", "share");
        btn.find(".km-text").text("Share");
    }
}
function shareScribble(scribble) {
    socket.emit("shareUnshareStudentScribble", {
        scribble: Utils.getPicturePath(scribble.Scribble),
		student: scribble.StudentName,
		share: 1
    });
}
function unShareScribble(scribble) {
    socket.emit("shareUnshareStudentScribble", {
        scribble: Utils.getPicturePath(scribble.Scribble),
		student: scribble.StudentName,
		share: 0
    });
}
function viewScribble(e) {
    Utils.handleClick(e);
    
    var li = $(e.target).closest("li");
    var scribble = li.data("data");
    
    if(scribble.DefaultScribble) {
        return;
    }
    
    $("#scribbleResultModal").find(".image").loadBackgroundImage(Utils.getPicturePath(scribble.Scribble), "");
    $("#scribbleResultModal").data("scribbleID", scribble.ID);
    Utils.openModal("#scribbleResultModal");
    
    if(!$("#scribbleResultModal").attr("initialized")) {
        var content = $("#scribbleResultModal .km-content");
        content.find(".image").css("height", content.height() + "px");
        $("#scribbleResultModal").attr("initialized", true);
    }
    
    $("#scribbleResultModal").find("[data-role=view-title]").text(scribble.StudentName);
}
function gradeScribble(e) {
    Utils.handleClick(e);
    
    var grade = $("#txtScribbleGrade").val();
    
    Utils.showLoading();
    WebService.GET("wb_GradeScribble", {
        id: $("#scribbleResultModal").data("scribbleID"),
        grade: grade
    }, function(data) {
        if(data === "success") {
            //scribble has been graded!
        }
        else {
            Utils.alert("Error", "Could not grade scribble!");
        }
    }, function(error) {
        Utils.alert("Error", "Could not grade scribble!");
    }, function() {
        Utils.hideLoading();
    });
}
//=================Sribble View================

//=================Polls View================
function initPollUnitsView(e) {
    
    var view = e.view.element;
    
    setTimeout(function() {
        view.find(".content").css("height", view.find(".km-content").height() - view.find(".topActions").outerHeight(true) + "px");
        view.find(".content").kendoMobileScroller();
        $(".studentsTotal").html(onlineStudents + "/" + totalStudents);
        $(".currentScreen").html(currentScreen);
    }, 0);
}
function showPollUnitsView(e) {
    unitsDS.read({
        teacherID: currentUserID,
        subjectID: currentSubjectID,
        sectionID: currentSectionID,
        getAll: false
    });
}
function initPollsView(e) {
    
    var view = e.view.element;
    
    setTimeout(function() {
        view.find(".content").css("height", view.find(".km-content").height() - view.find(".topActions").outerHeight(true) + "px");
        view.find(".content").kendoMobileScroller();
        $(".studentsTotal").html(onlineStudents + "/" + totalStudents);
        $(".currentScreen").html(currentScreen);
    }, 0);
}
function showPollsView(e) {
    
    var view = e.view.element;

    var unitID = e.view.params.unitID || "0";
    var unit = e.view.params.unit || "";
    
    currentUnitID = unitID;
    
    view.find(".currentUnit").text(unit);
        
    pollsDS.read({
        teacherID: currentUserID,
        subjectID: currentSubjectID,
        sectionID: currentSectionID,
        unitID: currentUnitID
    });
}
function viewPollDetails(e, id) {
    Utils.handleClick(e);
    
    Utils.showLoading
    WebService.GET("getPollDetails", {
        pollID: id || 0
    }, function(data) {

        for(var i=0; i<data.length; i++) {
            data[i].ChoiceImage = mainURL + "/" + data[i].ChoiceImage;
        }
        
        pollChoicesDS.data(data);
        Utils.navigate("#pollDetailsView?id=" + id);
        
    }, function(error) {
        
        Utils.alert("Error", "Could not get poll details!");
        
    }, function() {
        Utils.hideLoading();
    });
}
//=================Polls View================

//================= Edit Poll View================
function initEditPollView(e) {
    var view = e.view.element;
    var params = e.view.params;
    
    setTimeout(function() {
        view.find(".content").css("height", view.find(".km-content").height() - view.find(".topActions").outerHeight(true) - view.find("#pollQuestionContainer").outerHeight(true) + "px");
        view.find(".content").kendoMobileScroller();
        $(".studentsTotal").html(onlineStudents + "/" + totalStudents);
        $(".currentScreen").html(currentScreen);
        
        if(!params.id) {
            //pollChoicesDS.read();
        }
        
        var liHeight = view.find(".content").height() - view.find(".content .form").outerHeight(true) - 10;
        var pollLIStyle = $("<style id='pollChoiceStyle'>#pollChoicesList li {height:" + liHeight + "px}</style>");
        $(document.body).append(pollLIStyle);
        
    }, 0);
}
function showEditPollView(e) {
    var view = e.view.element;
    
    view.find("#txtPollQuestion").val("");
    pollChoicesDS.data([]);
    setTimeout(function() {
        addPollChoice();
    }, 0);
}
function addPollChoice(e) {
    Utils.handleClick(e);
    
    pollChoicesDS.add({
        ID: 0,
        Choice: "",
        ChoiceImage: "",
        isCorrect: false
    });
}
function removePollChoice(e) {
    Utils.handleClick(e);
    
    var li = $(e.target).closest("li");
    var uid = li.attr("data-uid");
    
    var choice = pollChoicesDS.getByUid(uid);
    if(!choice) {
        li.remove();
        return;
    }
    
    pollChoicesDS.remove(choice);
}
function editPollChoice(e) {
    Utils.handleClick(e);
    
    var choice = pollChoicesDS.getByUid($(e.target).closest("li").attr("data-uid"));
    
    $("#editPollChoiceModal").data("callback", function(value) {
        choice.set("Choice", value);
    });
    $("#editPollChoiceModal").find("#pollChoice").val(choice.Choice);
    Utils.openModal("#editPollChoiceModal");
    setTimeout(function() {
        $("#editPollChoiceModal").find("#pollChoice").focus();
    }, 100);
}
function savePollChoice(e) {
    Utils.handleClick(e);
    
    var modal = $("#editPollChoiceModal");
    var value = modal.find("#pollChoice").val();
    
    if(modal.data("callback")) {
        modal.data("callback")(value);
    }
    
    Utils.closeModal(e);
}
function pollChoicesListBound(e) {
    var list = e.sender.element;
    
    var disableDelete = false;
    if(list.find("li").length <= 1) {
        disableDelete = true;
    }
    
    list.find("li").each(function() {
        var li = $(this);
        
        if(disableDelete) {
            li.find(".action.delete").addClass("disabled");
        }
        else {
            li.find(".action.delete").removeClass("disabled");
        }
    });
}
function getPollChoiceImage(e) {
    Utils.handleClick(e);
    
    var choice = pollChoicesDS.getByUid($(e.target).closest("li").attr("data-uid"));
    
    Utils.getPicture(function(image) {
        choice.set("ChoiceImage", image);
    });
}
function checkPollChoiceRadio(e) {
    //e.preventDefault();
    
    var check = $(e.target).closest(".action");
    var choice = check.closest("li");
    choice.siblings("li").each(function() {
        $(this).find(".action.check").prop("checked", false);
    });
    if(check.is(":checked")) {
        check.prop("checked", false);
    }
    else {
        check.prop("checked", true);
    }
}
function savePoll(e) {
    Utils.handleClick(e);
    
    var btn = $(e.target).closest(".km-button");
    var view = btn.closest(".km-view");
    var pollQuestion = view.find("#txtPollQuestion").val();
    
    var emptyError = false;
    
    if($.trim(pollQuestion).length === 0) {
        Utils.alert("Warning", "Please fill the poll question");
        return;
    }
    
    $.each(pollChoicesDS.data(), function(index, choice) {
        if($.trim(choice.Choice).length === 0) {
            emptyError = true;
            return false;
        }
    });
    
    if(emptyError) {
        Utils.alert("Warning", "Please fill all of the choices");
        return;
    }
    
    Utils.showLoading();
    uploadPollChoicesImages(pollChoicesDS.data(), function(choices) {
        console.log(choices);
        
        WebService.POST("createNewPoll", {
            question: pollQuestion || "",
            teacherID: currentUserID || 0,
            subjectID: currentSubjectID || 0,
            sectionID: currentSectionID || 0,
            choices: JSON.stringify(choices)
        }, function(data) {
            
            if(data === "Error") {
                Utils.alert("Error", "Could not save poll");
                return;
            }
            
            var pollID = parseInt(data.split(",")[1] || "0");
            currentPollID = pollID;
            
            //check button action
            if(btn.attr("action") === "saveAndRun") {
                startThePoll(pollID, pollQuestion, false);
            }
            else {
                pollsDS.read({
                    teacherID: currentUserID,
                    subjectID: currentSubjectID,
                    sectionID: currentSectionID
                });
                
                Utils.navigate("#pollResultsView?id=" + pollID + "&rerun=false");
            }
            
        }, function(error) {
            Utils.alert("Error", "Could not save poll");
        }, function() {
            Utils.hideLoading();
        });
    });
}
function startThePoll(id, question, rerun) {
    socket.emit("startPoll", {
		pollID: id,
		pollQuestion: question,
		subjectID: currentSubjectID,
		sectionID: currentSectionID
	});
    
    Utils.navigate("#pollResultsView?id=" + id + "&rerun=" + rerun);
    currentScreen = "Polls";
    $(".currentScreen").html(currentScreen);
}
function uploadPollChoicesImages(choices, callback) {
    //Final array that will be passed in the callback
    var _uploadedChoices = [];
    
    var _choices = []
    for(var i=0; i<choices.length; i++) {
        if(choices[i].ChoiceImage !== "") {
            _choices.push(choices[i]);
        }
        else {
            //No need to upload, just add it to the array
            _uploadedChoices.push(generateChoice(choices[i]));
        }
    }
    _choices.reverse();
    
    function checkUpload() {
        if(_choices.length > 0) {
            uploadChoiceImage(_choices.pop());
        }
        else {
            callback ? callback(_uploadedChoices) : false;
        }
    }
    
    function uploadChoiceImage(choice) {
        var params = {
            TeacherID: currentUserID,
            SubjectID: currentSubjectID,
            SectionID: currentSectionID,
            ImageData: choice.ChoiceImage
        };
        
        WebService.POST("upload", {
            data: JSON.stringify(params)
        }, function(data) {
            choice.ChoiceImage = data.Error ? "" : data.Response;
            _uploadedChoices.push(generateChoice(choice));
        }, function(error) {
            choice.ChoiceImage = "";
            _uploadedChoices.push(generateChoice(choice));
        }, function() {
            checkUpload();
        });
    }
    
    function generateChoice(choice) {
        return {
            Choice: choice.Choice,
            Image: choice.ChoiceImage,
            IsCorrect: (choice.isCorrect ? 1 : 0)
        }
    }
    
    checkUpload();
}
//================= Edit Poll View================


//================= Poll Details View================
function initPollDetailsView(e) {
    var view = e.view.element;
    var params = e.view.params;
    
    setTimeout(function() {
        view.find(".content").css("height", view.find(".km-content").height() - view.find(".topActions").outerHeight(true) - view.find("#pollQuestionContainer").outerHeight(true) + "px");
        view.find(".content").kendoMobileScroller();
        $(".studentsTotal").html(onlineStudents + "/" + totalStudents);
        $(".currentScreen").html(currentScreen);
        
        if(!params.id) {
            pollChoicesDS.read();
        }
    }, 0);
}
function showPollDetailsView(e) {
    var view = e.view.element;
    var params = e.view.params;
    
    view.find("#txtPollQuestion").html("");
    
    if(!params.id) {
        return;
    }
    
    var pollID = params.id;
    currentPollID = pollID;
    var poll = pollsDS.get(pollID);
    
    if(!poll) {
        return;
    }
    
    view.find("#txtPollQuestion").html(poll.Question);
}
function viewPollResults(e) {
    Utils.handleClick(e);
    
    Utils.navigate("#pollResultsView?id=" + currentPollID + "&rerun=false");
}
function rerunPoll(e) {
    Utils.handleClick(e);
    
    var poll = pollsDS.get(currentPollID);
    
    if(!poll) {
        return;
    }
    
    startThePoll(currentPollID, poll.Question, true);
}
//================= Poll Details View================

//=================Polls Results View================
function initPollResultsView(e) {
    var view = e.view.element;
    
    setTimeout(function() {
        view.find(".content").css("height", view.find(".km-content").height() - view.find(".topActions").outerHeight(true) - view.find("#pollQuestionContainer").outerHeight(true) + "px");
        view.find(".content").kendoMobileScroller();
        $(".studentsTotal").html(onlineStudents + "/" + totalStudents);
        $(".currentScreen").html(currentScreen);
        
        view.find("#pollResultsChart").css("height", view.find(".content").height() - 10 + "px");
    }, 0);
}
function showPollResultsView(e) {
    var view = e.view.element;
    
    var poll = pollsDS.get(currentPollID);
    if(poll) {
        view.find("#txtPollQuestion").html(poll.Question);
    }
    else {
        view.find("#txtPollQuestion").html("");
    }
    
    setTimeout(function() {
        if(view.find("#pollResultsChart").data("kendoChart")) {
            view.find("#pollResultsChart").data("kendoChart").options.transitions = true;
            pollResultsDS.read();
        }
        else {
            view.find("#pollResultsChart").kendoChart({
                dataSource: pollResultsDS,
    			series: [{
    				field: "Count",
    				name: "Count",
    				labels: {
    					visible: true,
    					format: "{0}",
                        background: "transparent",
                        color: "#FFFFFF",
                        font: "20px sans-serif"
    				},
                    color: "#1E8BDE"
    			}],
    			legend: {
    				visible: false,
                    position: "bottom",
    			},
    			valueAxis: {
    				labels: {
    					format: "{0}",
    					visible: true
    				}
    			},
    			categoryAxis: {
    				field: "Choice",
    				labels: {
    					format: "{0}",
                        font: "20px sans-serif"
    				}
    			},
    			transitions: true,
                theme: "bootstrap"
            });
        }
    }, 0);
}
function onPollAnswered() {
    $("#pollResultsView").find("#pollResultsChart").data("kendoChart").options.transitions = false;
    pollResultsDS.read();
    fillPollResultsTable();
}
function viewPollResultsDetails(e) {
    Utils.handleClick(e);
    
    Utils.navigate("#pollResultDetailsView");
}
//=================Polls Results View================

//=================Polls Result Details View================
function initPollResultDetailsView(e) {
    var view = e.view.element;
    
    setTimeout(function() {
        view.find(".content").css("height", view.find(".km-content").height() - view.find(".topActions").outerHeight(true) - view.find("#pollQuestionContainer").outerHeight(true) + "px");
        view.find(".content").kendoMobileScroller();
        $(".studentsTotal").html(onlineStudents + "/" + totalStudents);
        $(".currentScreen").html(currentScreen);
        
        view.find("#pollResultTables").css("height", view.find(".content").height() - 40 + "px")
                                      .css("margin-top", "10px");
    }, 0);
}
function showPollResultDetailsView(e) {
    var view = e.view.element;
    
    var poll = pollsDS.get(currentPollID);
    if(poll) {
        view.find("#txtPollQuestion").html(poll.Question);
    }
    else {
        view.find("#txtPollQuestion").html("");
    }
    
    view.find("#pollResultTables").css("opacity", "0");
    
    view.find("#pollResultTables").empty();
    
    Utils.showLoading
    WebService.GET("getPollDetails", {
        pollID: currentPollID || 0
    }, function(data) {

        var thead = "";
        var tbody = "";
        
        var width = view.find("#pollResultTables").width() / (data.length + 1);
        
        for(var i=0; i<data.length; i++) {
            var choice = data[i];
            
            thead += "<th style='width:" + width + "px'>" + choice.Choice + "</th>";
            tbody += "<td style='width:" + width + "px'><div class='choiceStudents' choiceID=" + choice.ID + "><div class='container'></div></div></td>";
        }
        thead += "<th style='width:" + width + "px'>Not Responded</th>";
        tbody += "<td style='width:" + width + "px'><div class='choiceStudents' choiceID='-1'><div class='container'></div></div></td>";
        
        thead = "<thead><tr>" + thead + "</tr><thead>";
        tbody = "<tbody><tr>" + tbody + "</tr></tbody>";
        
        view.find("#pollResultTables").html(thead + tbody);
        view.find("#pollResultTables").attr("pollID", currentPollID);
        
        view.find("#pollResultTables .choiceStudents").css("height", (view.find("#pollResultTables").height() - view.find("#pollResultTables thead").height()) + "px");
        view.find("#pollResultTables .choiceStudents").kendoMobileScroller();
        
        fillPollResultsTable();
        
        view.find("#pollResultTables").css("opacity", "1");
        
    }, function(error) {
        
        Utils.alert("Error", "Could not get poll details!");
        
    }, function() {
        Utils.hideLoading();
    });
}
function fillPollResultsTable() {
    var view = $("#pollResultDetailsView");
    
    WebService.GET("getPollResultsDetails", {
        pollID: currentPollID
    }, function(data) {
        
        var table = view.find("#pollResultTables");
        table.find("tbody .choiceStudents .container").html("");
        
        for(var i=0; i<data.length; i++) {
            table.find(".choiceStudents[choiceID=" + data[i].ChoiceID + "] .container").append("<div class='student flex'>" + data[i].StudentName + "</div>");
        }
        
        if(table.attr("pollID") !== currentPollID) {
            table.find(".choiceStudents").each(function() {
                if($(this).data("kendoMobileScroller")) {
                    $(this).data("kendoMobileScroller").scrollTo(0, 0);
                }
            });
        }
        else {
            table.find(".choiceStudents").each(function() {
                $(this).fixScroll();
            });
        }
        
    }, function(error) {
        console.log("Could not get poll result details!");
    });
}
//=================Polls Result Details View================

//=================Attendance Popover View================
function onShowAttendanceListPopover(e) {
    var view = e.view.element;
    
    setTimeout(function() {
        
        var tabs = view.find(".popoverAttendanceList");
        
        var buttonGroup = view.find("#attendanceListTabs").data("kendoMobileButtonGroup");
        if(buttonGroup) {
            buttonGroup.select(0);
            tabs.hide().eq(0).show();
            view.find(".content").data("kendoMobileScroller").scrollTo(0,0);
        }
        else {
            buttonGroup = view.find("#attendanceListTabs").kendoMobileButtonGroup({
                index: 0,
                select: function(e) {
                    tabs.hide().eq(e.index).show();
                    view.find(".content").data("kendoMobileScroller").scrollTo(0,0);
                }
            });
        }
        
        view.find(".content").css("height", view.find(".km-content").height() - view.find("#attendanceListTabs").outerHeight(true) + "px");
        view.find(".content").kendoMobileScroller();
        
    }, 0);
}
//=================Attendance Popover View================

function navigateStudentsToHome(e) {
    if (examIsActive) {
		return;
	}
	socket.emit("goHome");
    currentScreen = "Home";
	$(".currentScreen").html(currentScreen);
}

function eyesOnTeacher(e) {
    
    Utils.handleClick(e);
    
    var btn = $(".eyeButton");
	var status = btn.attr("status");
    
    if(status === "off") {
        //Turn ON
        if (prefs) {
			prefs.get('eotMessage', function(message) {
				message !== "" ? eyesOnTeacherMessage = message : false;
				console.log("Eyes On Teacher Message: " + eyesOnTeacherMessage);
				//turn on
				btn.attr("status", "on");
				socket.emit("eyesOnTeacher", {
					status: "on",
					message: eyesOnTeacherMessage
				});
				eyesOnTeacherEnabled = true;
			}, function(error) {
				console.log("Application Preferences Error: " + JSON.stringify(error));
				//turn on
				btn.attr("status", "on");
				socket.emit("eyesOnTeacher", {
					status: "on",
					message: eyesOnTeacherMessage
				});
				eyesOnTeacherEnabled = true;
			});
		} else {
			//turn on
			btn.attr("status", "on");
			socket.emit("eyesOnTeacher", {
				status: "on",
				message: eyesOnTeacherMessage
			});
			eyesOnTeacherEnabled = true;
		}
    }
    else {
        //Turn OFF
        $(".eyeBtn").find(".km-icon").css("background", "white");
		btn.attr("status", "off");
		socket.emit("eyesOnTeacher", {
			status: "off",
			message: eyesOnTeacherMessage
		});
		eyesOnTeacherEnabled = false;
    }
}

function handRaised(student) {    
    var _student = participatingStudentsDS.get(student.ID);
    if(_student) {
        var count = _student.Count;
        _student.set("Count", count + 1);
    }
    else {
        participatingStudentsDS.add({
            ID: student.ID,
            Name: student.Name,
            Count: 1
        });
    }
    //setAlertBadge();
    /*
	if ($("#studentsParticipationList").find("#std_" + student.ID).index() < 0) {
		$("#studentsParticipationList").append("<li id='std_" + student.ID + "'><span id='studentID' style='display:none'>" + student.ID + "</span>" +
			"<span id='studentName' style='float:left;margin-left:20px;margin-top:30px;'>" + student.Name + "</span>" +
			"<a class='doneBtn' style='float:right;margin-right:20px;margin-top:25px;'>Done</a>" +
			"<span id='counter' style='float:right;margin-right:20px;margin-top:30px;'>(1)</span>" +
			"</li>");
		$("#studentsParticipationList").find("#std_" + student.ID + " .doneBtn").kendoMobileButton({
			click: function(e) {
				var id = e.target.closest("li").find("#studentID").html();
				e.target.closest("li").remove();
				if ($("#studentsParticipationList li").length === 0) {
	                $(".alertButton").attr("status", "off");
				}
				//Firas Update
				socket.emit("clearRaiseHand", id);
				setAlertBadge();
				//unraiseHand(id);
			}
		});
	} else {
		var cnt = parseInt($("#studentsParticipationList").find("#std_" + student.ID).find("#counter").html().split("(")[1].split(")")[0]);
		cnt++;
		$("#studentsParticipationList").find("#std_" + student.ID).find("#counter").html("(" + cnt + ")");
	}
	setAlertBadge();
    */
}

function clearStudentParticipation(e, id) {
    Utils.handleClick(e);
    
    socket.emit("clearRaiseHand", id);
    
    participatingStudentsDS.remove(participatingStudentsDS.get(id));
}

function setStudentPresent(studentID, isPresent) {
    try {
        studentsDS.get(studentID).set("isPresent", isPresent);
        studentsDS.sort([{field:"isPresent", dir: "desc"}, {field:"FullEName", dir: "asc"}]);
    }
    catch(ex) {
        
    }
    
    try {
        var _uid = attendanceDS.get(studentID).uid;
        attendanceDS.get(studentID).isPresent = isPresent;
        if(isPresent) {
            $("#attendanceList [data-uid=" + _uid + "] .container").addClass("online");
            $("#attendanceList [data-uid=" + _uid + "] .container").removeClass("offline");
        }
        else {
            $("#attendanceList [data-uid=" + _uid + "] .container").removeClass("online");
            $("#attendanceList [data-uid=" + _uid + "] .container").addClass("offline");
        }
    }
    catch(ex) {
        
    }
    
    try {
        if(isPresent) {
            $("#studentResults").find("#std" + studentID).find("img").attr("src", "images/icons/green.png");
        }
        else {
            $("#studentResults").find("#std" + studentID).find("img").attr("src", "images/icons/red.png");
        }
    }
    catch(ex) {
        
    }
    
    updatePresentStudents();
}

function updatePresentStudents() {
    presentStudentsDS.data([]);
    
    var data = studentsDS.data();
    for(var i=0; i<data.length; i++) {
        if(data[i].didLogin) {
            presentStudentsDS.add(data[i]);
        }
    }
}

function goToClasses(e) {
    Utils.handleClick(e);
    
    Utils.confirm("Are you sure you want to go back to your classes?", function(buttonIndex) {
        
        if(buttonIndex === 2) {
            Utils.navigate('#subjectsView', 'slide:right');
        }
        
    }, "Warning", ["No", "Yes"]);
}

function initMenuOptionsView(e) {
    var view = e.view.element;
    
    view.css("height", view.parent().height() + "px");
    
    view.find(".form").css("height", view.find(".km-content").height() + "px");
    view.find(".form").kendoMobileScrollView();
}

function openDrawer(e) {
    Utils.handleClick(e);
    
    var drawer = $("#drawer").data("kendoMobileDrawer");
    if(drawer) {
        drawer.show();
    }
}

function uploadBroadcast(scribble, successCB, errorCB) {
    WebService.POST("uploadBroadcast", {
        data: JSON.stringify(scribble)
    }, successCB, errorCB);
}

function uploadScribble(scribble, successCB, errorCB) {
    WebService.POST("uploadScribble", {
        data: JSON.stringify(scribble)
    }, successCB, errorCB);
}

function logout(e) {
    Utils.handleClick(e);
    
    Utils.confirm("Are you sure you want to logout?", function(buttonIndex) {
        
        if(buttonIndex === 2) {
            Utils.showLoading();
            WebService.GET("wb_Logout", {
                id: currentUserID
            }, function(data) {
                
            }, function(error) {
                
            }, function() {
                doLogout();
            });
            
            function doLogout() {
                $.each(localStorage, function(k,v){
                    if(k.indexOf("persist_") > -1){
                        localStorage.removeItem(k);
                    }
                });
                socket.disconnect();
                
                Utils.navigate("index.html", "slide:right");
            }
        }
        
    }, "Logout?", ["No", "Yes"]);
}

/*==========================================================*/
/*==================== YOUTUBE VIDEOS ======================*/
function addYoutubeVideo(e) {
    Utils.handleClick(e);
    
    $("#youtubeModal").data("kendoMobileModalView").open();
}

function searchYoutubeVideos(e) {
    Utils.handleClick(e);
    
    if(youtubeVideosDS) {
        youtubeVideosDS.read({
            query: $("#txtSearchYoutube").val()
        }).then(function() {
            $("#youtubeModal").data("kendoMobileModalView").scroller.scrollTo(0,0);
        });
    }
}

function youtubeListBound(e) {
    var list = e.sender.element;
    
    list.find("li").each(function() {
        var li = $(this);
        var thumb = li.find(".thumbnail");
        
        thumb.loadBackgroundImage(thumb.attr("background-image"), "");
    });
}

function viewYoutubeVideo(videoID) {
    /*cordova.exec(function(result) {
		console.log(result);
	},function(error) {
		console.log(error);
	},"YoutubeVideoPlayer","openVideo",[videoID]);*/
    
    window.open(encodeURI("http://www.youtube.com/embed/" + videoID + "?rel=0&showinfo=0&autoplay=1&cc_load_policy=0"), "_blank", "location=no");
    //window.open(encodeURI("mediasource:https://www.youtube.com/1f64c444-af6c-4ca0-901d-3c3fa61eec7f"), "_blank", "location=no");
    
    //openYoutubePlayer(videoID);
}

function openYoutubePlayer(videoID) {
    var p = $("#youtubePlayer");
    var m = p.data("kendoMobileModalView");
    
    if(!p.closest(".km-modalview-root").hasClass(".k-state-border-down")) {
        m.open();
        setTimeout(function() {
            //p.find("iframe").css("height", p.find(".km-content").height() + "px");
            p.find("video").css("height", p.find(".km-content").height() + "px");
            //p.find("iframe").attr("height", p.find(".km-content").height() + "px");
            p.find("video").attr("height", p.find(".km-content").height() + "px");
        });
    }
    
    //p.find("iframe").attr("src", encodeURI("http://www.youtube.com/embed/" + videoID + "?rel=0&amp;showinfo=0&amp;autoplay=1&amp;cc_load_policy=0"));
    p.find("video").attr("src", encodeURI("mediasource:https://www.youtube.com/1f64c444-af6c-4ca0-901d-3c3fa61eec7f"));
}
/*==================== YOUTUBE VIDEOS ======================*/
/*==========================================================*/

/*==========================================================*/
/*======================= WHATS NEW ========================*/
function initWhatsNewView(e) {
    var view = e.view.element;
    
    setTimeout(function() {
        view.find(".content").css("height", view.find(".km-content").height() + "px");
        view.find(".content").kendoMobileScroller();
        $(".studentsTotal").html(onlineStudents + "/" + totalStudents);
        $(".currentScreen").html(currentScreen);
    }, 0);
}
function showWhatsNewView(e) {
    whatsNewDS.read();
}
/*======================= WHATS NEW ========================*/
/*==========================================================*/
/*==========================================================*/
/*=================== WHATS NEW DETAILS ====================*/
function initWhatsNewDetailsView(e) {
    var view = e.view.element;
    
    setTimeout(function() {
        view.find(".content").css("height", view.find(".km-content").height() - view.find(".header").outerHeight(true) + "px");
        view.find(".content").kendoMobileScroller();
        $(".studentsTotal").html(onlineStudents + "/" + totalStudents);
        $(".currentScreen").html(currentScreen);
    }, 0);
}
function showWhatsNewDetailsView(e) {
    var view = e.view.element;
    var params = e.view.params;
    
    var itemID = params.id;
    var item = null;
    
    try {
        item = whatsNewDS.get(itemID);
    }
    catch(ex) {}
    
    if(!item) {
        return;
    }
    
    view.find(".title").html(item.Title);
    view.find(".date").html(item.Date);
    view.find(".message").html(item.Message);
}
/*=================== WHATS NEW DETAILS ====================*/
/*==========================================================*/

/*=================================================*/
//=================Presentations View================
function initPresentationUnitsView(e) {
    
    var view = e.view.element;
    
    setTimeout(function() {
        view.find(".content").css("height", view.find(".km-content").height() - view.find(".topActions").outerHeight(true) + "px");
        view.find(".content").kendoMobileScroller();
        $(".studentsTotal").html(onlineStudents + "/" + totalStudents);
        $(".currentScreen").html(currentScreen);
    }, 0);
}
function showPresentationUnitsView(e) {
    unitsDS.read({
        teacherID: currentUserID,
        subjectID: currentSubjectID,
        sectionID: currentSectionID,
        getAll: false
    });
}
function initPresentationsView(e) {
    
    var view = e.view.element;
    
    setTimeout(function() {
        view.find(".content").css("height", view.find(".km-content").height() - view.find(".topActions").outerHeight(true) + "px");
        view.find(".content").kendoMobileScroller();
        $(".studentsTotal").html(onlineStudents + "/" + totalStudents);
        $(".currentScreen").html(currentScreen);
    }, 0);
}
function showPresentationsView(e) {
    
    var view = e.view.element;
    
    var unitID = e.view.params.unitID || "0";
    var unit = e.view.params.unit || "";
    
    currentUnitID = unitID;
    
    view.find(".currentUnit").text(unit);
    
    presentationsDS.read({
        teacherID: currentUserID,
        subjectID: currentSubjectID,
        sectionID: currentSectionID,
        unitID: currentUnitID
    });
    
}
function presentationsListBound(e) {
    var list = e.sender.element;
    
    list.find("li").each(function() {
        var li = $(this);
        
        li.find(".detailsContainer").css("height", li.find(".detailsContainer").width() - 50 + "px");
        li.find(".image").loadBackgroundImage(li.find(".image").attr("background-image"), "");
    });
}
function onclickStartPresentation(e, id) {
    Utils.handleClick(e);
    
    var _presentation = presentationsDS.get(id);
    if(!_presentation) {
        return;
    }
    
    Utils.navigate("#presentationDetailsView?id=" + id);
}
//=================Presentations View================
/*=================================================*/

/*========================================================*/
//=================Presentation Details View================
function initPresentationDetailsView(e) {
    var view = e.view.element;
    
    setTimeout(function() {
        view.find(".content").css("height", view.find(".km-content").height() - view.find(".header").outerHeight(true) + "px");
        //view.find(".content").kendoMobileScroller();
        $(".studentsTotal").html(onlineStudents + "/" + totalStudents);
        $(".currentScreen").html(currentScreen);
        
        view.find(".km-scrollview").css("height", view.find(".mainContentContainer").height() + "px");
        view.find("#slidesThumbnailsList").css("height", view.find(".slidesThumbnailsScroller").height() + "px");
        
    }, 0);
}
function showPresentationDetailsView(e) {
    
    var view = e.view.element;
    var presentationID = e.view.params.id;
    
    if(!presentationID) {
        presentationID = currentPresentationID;
    }
    
    var presentation = presentationsDS.get(presentationID);
    if(!presentation) {
        return;
    }
    
    view.find(".header .title .value").html(presentation.Title);
    view.find(".header .title .value").trigger("destroy");
    view.find(".header .title .value").dotdotdot();
    
    currentPresentationID = presentationID;
    
    setTimeout(function() {
        var scrollView = view.find("#mainSlidesScroller");
        if(!scrollView.data("kendoMobileScrollView")) {
            scrollView.kendoMobileScrollView({
                dataSource: presentationSlidesDS,
                template: $("#presentationSlidesTemplate").html(),
                //autoBind: false,
                change: onPresentationSlideChanged,
                contentHeight: scrollView.height() + "px",
                enablePager: false
            });
            scrollView.data("kendoMobileScrollView").refresh();
        }
        
        presentationSlidesDS.read({
            presentationID: presentationID
        });
    }, 10);
}
function slideThumbnailsListBound(e) {
    var list = e.sender.element;
    
    list.find("li").each(function() {
        var li = $(this);
        
        li.css("width", li.closest(".slidesThumbnailsScroller").height() * 1.5 + "px");
        li.find(".slide").loadBackgroundImage(li.find(".slide").attr("background-image"), "");
    });
}
function slideThumbnailClicked(e) {
    socket.emit('sharePage', {
		presentation: currentPresentationID,
		page: e.item.index(),
		slideID: e.dataItem.ID
	});
    
    toggleSlidesThumbnails(e);
    
    setTimeout(function() {
        $("#presentationDetailsView #mainSlidesScroller").data("kendoMobileScrollView").scrollTo(e.item.index());
    });
}
function onPresentationSlideChanged2(e) {
    console.log("Slide Changed ", e);
    
    var page = e.element;
    var slideData = presentationSlidesDS.at(e.page);
    
    page.siblings(".km-virtual-page").removeClass("current");
    page.addClass("current");
    
    var slide = page.find(".slide");
    
    switch(slideData.Type) {
        case 1: //image
            handleSlideImage(slide, slideData);
            break;
        case 2: //pdf
            handleSlidePDF(slide, slideData);
            break;
        case 3: //video
            handleSlideVideo(slide, slideData);
            break;
        case 4: //canvas
            handleSlideCanvas(slide, slideData);
            break;
        case 5: //text
            handleSlideText(slide, slideData);
            break;
        case 6: //custom content
            handleSlideCustomContent(slide, slideData);
            break;
    }
    
    socket.emit('sharePage', {
		presentation: currentPresentationID,
		page: e.page,
		slideID: slideData.ID
	});
    
    $("#presentationDetailsView").find(".header #presentationProgress .value").html((e.page + 1) + "/" + presentationSlidesDS.total());
}
function onPresentationSlideChanged(e) {
    console.log("Slide Changed ", e);
    
    var page = e.element;
    var slideData = presentationSlidesDS.at(e.page);
    
    page.siblings(".km-virtual-page").removeClass("current");
    page.addClass("current");
    
    var slide = page.find(".slide");
    var img = new Image();
    img.onload = function() {
        
        var ratio = this.width / this.height;
        
        slide.css("width", slide.height() * ratio + "px");
        
        if(slide.data("canvas")) {
            slide.data("canvas").destroy();
        }
        slide.canvas({
            enabled: false
        });
    };
    img.src = Utils.getPicturePath(slideData.Content);
    
    socket.emit('sharePage', {
		presentation: currentPresentationID,
		page: e.page,
		slideID: slideData.ID
	});
    
    $("#presentationDetailsView").find(".header #presentationProgress .value").html((e.page + 1) + "/" + presentationSlidesDS.total());
}
function fullScreenPresentation(e) {
    
}
function toggleSlidesThumbnails(e) {
    Utils.handleClick(e);
    
    $("#presentationDetailsView").find(".slidesThumbnailsContainer").toggleClass("visible");
}

function handleSlideImage(slide, slideData) {
    var content = slideData.Content;
    
    console.log("handleSlideImage ", slide, " content : ", content);
    
    var canvas = $("<canvas class='slideContent'></canvas>");
    canvas.css({
        width: slide.width(),
        height: slide.height()
    });
    canvas.attr({
        width: slide.width(),
        height: slide.height()
    });
    slide.css({
        textAlign: "center"
    });
    
    slide.html(canvas);
    
    console.log(Utils.getPicturePath(content));
    
    var img = new Image();
    img.onload = function() {
        
        var ratio = this.width / this.height;
        
        canvas.css("width", slide.height() * ratio + "px");
        
        if(canvas.data("canvas")) {
            canvas.data("canvas").destroy();
        }
        canvas.canvas({
            enabled: false
        });
    
        slide.css("background-image", "url(" + img.src + ")");
    };
    img.src = Utils.getPicturePath(content);
}

function handleSlidePDF(slide, slideData) {
    
}

function handleSlideVideo(slide, slideData) {
    
}

function handleSlideCanvas(slide, slideData) {
    
}

function handleSlideText(slide, slideData) {
    
}

function handleSlideCustomContent(slide, slideData) {
    var content = slideData.Content;
    
    var regEX = new RegExp("url\\(", "g");
    var regEXImages = new RegExp("src=\"", "g");
    
    content += content.replace(regEX, "url(" + mainURL + "/");
    content += content.replace(regEXImages, "src=\"" + mainURL + "/");
    
    var customContent = $("<div class='slideContent'></div>");
    customContent.css({
        width: slide.width(),
        height: slide.height()
    });
    slide.css({
        textAlign: "center"
    });
    
    customContent.html(content);
    
    customContent.find("iframe").each(function() {
        var src = $(this).attr("src");
        src = src.replace(mainURL + "/", "");
        $(this).attr("src", src);
        
        $(this).attr({
            width: $(this).closest(".videodiv").width(),
            height: $(this).closest(".videodiv").height()
        });
    });
    
    slide.html(customContent);
}
//================/Presentation Details View================
function TestSockets(e){
    Utils.handleClick(e);
    console.log("testSocket");
    socket.emit("TestSocket", {
					message: "test Socket!!"
				});
}
/*========================================================*/
//=================exams Unit View================
function initExamUnitsView(e) {
    
    var view = e.view.element;
    
    setTimeout(function() {
        view.find(".content").css("height", view.find(".km-content").height() - view.find(".topActions").outerHeight(true) + "px");
        view.find(".content").kendoMobileScroller();
        $(".studentsTotal").html(onlineStudents + "/" + totalStudents);
        $(".currentScreen").html(currentScreen);
    }, 0);
}
function showExamUnitsView(e) {
    unitsDS.read({
        teacherID: currentUserID,
        subjectID: currentSubjectID,
        sectionID: currentSectionID,
        getAll: false
    });
}
//=================exams Unit View================
//=================exams  View================
function initExamsView(e) {
    
    var view = e.view.element;
    
    setTimeout(function() {
        view.find(".content").css("height", view.find(".km-content").height() - view.find(".topActions").outerHeight(true) + "px");
        view.find(".content").kendoMobileScroller();
        $(".studentsTotal").html(onlineStudents + "/" + totalStudents);
        $(".currentScreen").html(currentScreen);
    }, 0);
}
function showExamsView(e) {
    
    var view = e.view.element;
    
    var unitID = e.view.params.unitID || "0";
    var unit = e.view.params.unit || "";
    
    currentUnitID = unitID;
    
    view.find(".currentUnit").text(unit);
    
    examsDS.read({
        teacherID: currentUserID,
        subjectID: currentSubjectID,
        sectionID: currentSectionID,
        unitID: currentUnitID
    });
    
}

function examsListBound(e) {
    var list = e.sender.element;
    
    list.find("li").each(function() {
        var li = $(this);
        
        li.find(".detailsContainer").css("height", li.find(".detailsContainer").width() - 50 + "px");
       // li.find(".image").loadBackgroundImage(li.find(".image").attr("background-image"), "");
    });
}

function onclickGoToExam(e, id) {
    Utils.handleClick(e);
    
    var _exam = examsDS.get(id);
    if(!_exam) {
        return;
    }
    
    Utils.navigate("#examsDetailsView?id=" + id);
}
//=================exams  View================
function createNewExam(e) {
	$("#createExamView").find("#examTitle").val("");
	$("#createExamView").prop("selectedIndex", 0);
	$("#createExamView").find("#examMark").val("");
	var now = new Date();
	var day = ("0" + now.getDate()).slice(-2);
	var month = ("0" + (now.getMonth() + 1)).slice(-2);
	var today = now.getFullYear() + "-" + (month) + "-" + (day);

	$("#examDate").val(today);
	/*$("#examStartTime").val("");
	$("#examEndTime").val("");*/

	Utils.navigate("#createExamView", "slide:left");
}
function saveExam() {
	var errors = 0;

	var showEmptyError = function(msg) {
		errors++;
		Utils.alert(msg, "Error");
		return;
	};

	if (errors > 0) {
		return;
	}

	Utils.showLoading();

	var title = $("#createExamView").find("#examTitle").val() || showEmptyError("Please enter a title");
	var type = $("#createExamView").find("#examType option:selected").attr("value");
	var mark = $("#createExamView").find("#examMark").val() || showEmptyError("Please enter the exam's mark");
	var examDate = $("#examDate").val() ? moment($("#examDate").val()).format("MM/DD/YYYY") : showEmptyError("Please enter the exam's date");
	var startTime = "09:00:00 AM";
	var endTime = "10:00:00 AM";
	//var startTime = $("#examStartTime").val() ? moment().hours($("#examStartTime").val().split(":")[0]).minutes($("#examStartTime").val().split(":")[1]).seconds(0).milliseconds(0).format("h:mm:ss A") : showEmptyError("Please enter the exam's start time");
	//var endTime = $("#examEndTime").val() ? moment().hours($("#examEndTime").val().split(":")[0]).minutes($("#examEndTime").val().split(":")[1]).seconds(0).milliseconds(0).format("h:mm:ss A") : showEmptyError("Please enter the exam's end time");
         WebService.GET("saveExamMaster", {
                    type: type ,
                    title:title,
                    mark:mark,
                    date:examDate,
                    startTime:startTime,
                    endTime:endTime,
                    teacherID:currentUserID,
                    subjectID:currentSubjectID,
                    sectionID:currentSectionID,
                    unitID:currentUnitID
                }, function(data) {
                    if (data > 0) {
        				currentExamID = data;
        				console.log("Saved Exam, currentExamID: " + currentExamID);
        				Utils.navigate("examFillDetails?id=" + currentExamID, "slide:left");
        				examsDS.read();
			      } else {
				       console.log("DB error");
			      }
                    Utils.hideLoading();
                },function(error){
                    Utils.alert("Error, could not save exam.");
                    console.log("Error, could not save exam.");
                });
}
function getExamMasterDetails(e) {
	var id;
	if (jQuery.type(e) === "number" || jQuery.type(e) === "string") {
		id = parseInt(e);
	} else {
		id = e.view.params.id;
	}
	currentExamID = id;
    WebService.GET("wb_GetExamDetails", {
                    id: id 
                }, function(data) {
                        $("#examDetailsQuestionsList").html("");
            			if (data.length === 0) {
            				return;
            			}

            			$("#exam_detail_title").html(data[0].Description);
            			$("#exam_detail_mark").html(data[0].ExamMark);
            			$("#exam_detail_date").html(moment(data[0].StartDate).format("DD/MM/YYYY"));
            			//$("#exam_detail_startTime").html(moment(data[0].startTime).format("hh:mm A"));
            			//$("#exam_detail_endTime").html(moment(data[0].endTime).format("hh:mm A"));

            			var content = "";
            			for (var i = 0; i < data.length; i++) {
            				var count = i + 1;

            				if (parseInt(data[i].QuestionID) > 0) {
            					var mark;
            					if (data[i].QuestionMark === 1) {
            						mark = "Mark";
            					} else {
            						mark = "Marks";
            					}
            					//content += "<li id='q_" + data[i].QuestionID + "'>Q<span id='questionNumber'>" + count + "</span>) <span class='examDetailsQuestion'>" + decodeURIComponent(data[i].QuestionDescription) + "</span><a class='deleteQuestionBtn' style='background:red'>Delete</a><a class='editQuestionBtn'>Edit</a><span class='examDetailsQuestionMark'> (" + data[i].QuestionMark + " " + mark + ")</span></li>";
            					content += "<li id='q_" + data[i].QuestionID + "'>Q<span id='questionNumber'>" + count + "</span>) <span class='examDetailsQuestion'>" + data[i].QuestionDescription + "</span><a class='deleteQuestionBtn' style='background:red;font-size:1.6em;color:white;'>Delete</a><a class='editQuestionBtn' style='font-size:1.6em;'>Edit</a><span class='examDetailsQuestionMark'> (" + data[i].QuestionMark + " " + mark + ")</span></li>";
            				}
            			}
            			$("#examDetailsQuestionsList").html(content);
            			$("#examDetailsQuestionsList").find(".deleteQuestionBtn").kendoMobileButton({
            				click: function(e) {
            					var qID = parseInt(e.target.closest("li").attr("id").split("q_")[1]);
            					deleteQuestion(qID);
            					console.log("QuestionID: " + qID);
            				}
            			});

            			$("#examDetailsQuestionsList").find(".editQuestionBtn").kendoMobileButton({
            				click: function(e) {
            					var qID = parseInt(e.target.closest("li").attr("id").split("q_")[1]);
            					var qNo = parseInt(e.target.closest("li").find("#questionNumber").html());
            					editQuestion(qID, qNo);
            					console.log("QuestionID: " + qID);
            				}
            			});
                },function(error){
                            console.log("Error, could not get exam master details");
                            Utils.alert("Error, could not get exam master details");
           });
}
function addExamQuestion(e) {
	selectedImage = "";

	var item = e.target.closest("li");
	var type = item.attr("type");

	if (type === "5") {
		addMatchingQuestion(e);
		return;
	}
	$("#addQuestionModal").find("#questionsContainer").html("");
	insertImage("images/default.png", "#questionImageContainer", "#questionImage");
	var count = $("#examDetailsQuestionsList li").length + 1;
	var content = "";
	var cnt = 0;
	var answers = "";
	$("#addQuestionModal").find("#qType").html(type);
	if (!item.attr("action")) {
		return;
	}
	$("#addQuestionModal").find(".fb_q_grade").val("");
	$("#addQuestionModal").find("#fb_question").val("");
	$("#addQuestionModal").find(".fb_q_number").html("Q" + count + ")");
	if (type === "1") {
		answers = "<div id='choice_1' class='fb_q_container'><span class='fb_q_answer_number'>1)</span><input type='text' class='fb_q_answer inputWithImage' imgSrc='' placeholder='True' /><div class='fb_radio' name='radio_" + count + "'></div></div>";
		answers += "<div id='choice_2' class='fb_q_container'><span class='fb_q_answer_number'>2)</span><input type='text' class='fb_q_answer inputWithImage' imgSrc='' placeholder='False' /><div class='fb_radio' name='radio_" + count + "'></div></div>";
	} else if (type === "2") {
		cnt = item.attr("val");
		answers = "";
		for (var i = 1; i <= cnt; i++) {
			answers += "<div id='choice_" + i + "' class='fb_q_container'><span class='fb_q_answer_number'>" + i + ")</span><input type='text' class='fb_q_answer inputWithImage' imgSrc='' placeholder='Choice " + i + "' /><div class='fb_radio' name='radio_" + count + "'></div></div>";
		}
	} else if (type === "3") {
		answers = "";
	} else if (type === "4") {
		cnt = item.attr("val");
		answers = "";
		for (var i = 1; i <= cnt; i++) {
			answers += "<div id='choice_" + i + "' class='fb_q_container'><span class='fb_q_answer_number'>" + i + ")</span><input type='text' class='fb_q_answer inputWithImage' imgSrc='' placeholder='Choice " + i + "' /><div class='fb_checkbox' ></div></div>";
		}
	} else if (type === "5") {
		//Matching
		answers = "";
		for (var i = 1; i <= 4; i++) {
			answers += "<div id='choice_" + i + "' class='fb_q_container'><span class='fb_q_answer_number'>" + i + ")</span><input type='text' class='fb_q_answer' placeholder='Choice " + i + "' /><input type='text' class='fb_q_answer' placeholder='' style='width:5%;margin-left:1%' /><input type='text' class='fb_q_answer' placeholder='Answer " + i + "' style='margin-left:2%' /><div class='fb_checkbox' ></div></div>";
		}
	}
	$("#addQuestionModal").find("#questionsContainer").html(answers);
	$("#questionTypePopover").data("kendoMobilePopOver").pane.navigate("#mainQTypeView");
	$("#questionTypePopover").data("kendoMobilePopOver").close();
	$("#addQuestionModal").find("#newExamQuestionsList").html(content);
	$("#addQuestionModal").find(".fb_checkbox").kendoTouch({
		tap: function(e) {
			var item = e.touch.target.closest(".fb_checkbox");
			item.toggleClass("checked");
		},
		doubletap: function(e) {
			var item = e.touch.target.closest(".fb_checkbox");
			item.toggleClass("checked");
		}
	});
	$("#addQuestionModal").find(".fb_radio").kendoTouch({
		tap: function(e) {
			var item = e.touch.target.closest(".fb_radio");
			var name = item.attr("name");
			$("#addQuestionModal .fb_radio[name='" + name + "']").removeClass("checked");
			item.addClass("checked");
		},
		doubletap: function(e) {
			var item = e.touch.target.closest(".fb_radio");
			var name = item.attr("name");
			$("#addQuestionModal .fb_radio[name='" + name + "']").removeClass("checked");
			item.addClass("checked");
		}
	});
	$("#addQuestionModal #questionsContainer .inputWithImage").each(function() {
		$(this).inputWithImage();
	});

	$("#addQuestionModal #questionsContainer .fb_q_container").removeClass("edited");

	$("#addQuestionModal").data("kendoMobileModalView").open();
}
function addMatchingQuestion(e) {
	//insertImage("images/default.png", "#questionImageContainer", "#questionImage");
	var item = e.target.closest("li");
	var count = $("#examDetailsQuestionsList li").length + 1;
	var content = "";
	var cnt = 0;
	var answers = "";
	$("#addMatchingQuestionModal").find("#qType").html("5");
	if (!item.attr("action")) {
		return;
	}
	$("#addMatchingQuestionModal").find(".fb_q_grade").css("margin-top", "5%").css("margin-bottom", "5%").css("margin-right", "2%").val("");
	$("#addMatchingQuestionModal").find("#fb_question").val("");
	$("#addMatchingQuestionModal").find(".fb_q_number").html("Q" + count + ")");
	answers = "";
	for (var i = 1; i <= 4; i++) {
		answers += "<div id='choice_" + i + "' class='fb_q_container'><span class='fb_q_answer_number' style='margin-top:1%;width:3%;float:none;'>" + i + ")</span><input type='text' class='fb_q_answer match_title' placeholder='Choice " + i + "' style='float:none;' /><input type='text' class='fb_q_answer match_answer' placeholder='' style='width:5%;margin-left:1%;float:none;' /><span class='fb_q_answer_number' style='margin-top:1%;width:3%;float:none;'>" + i + ")</span><input type='text' class='fb_q_answer match_choice' placeholder='Answer " + i + "' style='float:none;' /></div>";
	}
	$("#addMatchingQuestionModal").find("#questionsContainer").html(answers);
	$("#questionTypePopover").data("kendoMobilePopOver").close();
	$("#addMatchingQuestionModal").find("#newExamQuestionsList").html(content);
	$("#addMatchingQuestionModal").find(".fb_checkbox").kendoTouch({
		tap: function(e) {
			var item = e.touch.target.closest(".fb_checkbox");
			item.toggleClass("checked");
		},
		doubletap: function(e) {
			var item = e.touch.target.closest(".fb_checkbox");
			item.toggleClass("checked");
		}
	});
	$("#addMatchingQuestionModal").find(".fb_radio").kendoTouch({
		tap: function(e) {
			var item = e.touch.target.closest(".fb_radio");
			var name = item.attr("name");
			$("#addMatchingQuestionModal .fb_radio[name='" + name + "']").removeClass("checked");
			item.addClass("checked");
		},
		doubletap: function(e) {
			var item = e.touch.target.closest(".fb_radio");
			var name = item.attr("name");
			$("#addMatchingQuestionModal .fb_radio[name='" + name + "']").removeClass("checked");
			item.addClass("checked");
		}
	});
	$("#addMatchingQuestionModal").data("kendoMobileModalView").open();
}
function insertImage(imageFile, container, image, offsetX, offsetY) {
	var img = new Image();
	img.onload = function() {
		var offX = offsetX || 0;
		var offY = offsetY || 0;

		var contHeight = parseInt($(container).css("height").split("px")[0]);
		var contWidth = parseInt($(container).css("width").split("px")[0]);
		var imgHeight = ((this.height * contWidth) / this.width) - (2 * offY);
		var imgWidth = ((this.width * contHeight) / this.height) - (2 * offX);
		var margX = offX;
		var margY = offY; // = (contHeight - imgHeight) / 2;
        console.log('contHeight ',contHeight);
        console.log('contWidth ',contWidth);
        console.log('imgHeight ',imgHeight);
        console.log('imgWidth ',imgWidth);
        console.log('offX ',offX);
        console.log('offY ',offY);
        console.log('margX ',margX);
        console.log('margY ',margY);
		//Reset image
		//$(container).find(image).css("width", "0px").css("height", "0px").css("margin", "0px").show();
		$(container).find(image).css("width", "200px").css("height", "150px").css("margin", "0px").show();

		if (imgHeight > contHeight) {
			console.log("Image taller than container");
             if(contHeight ===0){
                contHeight=200;
            }
            if(imgWidth ===0){
                imgWidth=230;
            }
			$(container).find(image).css("height", (contHeight - (2 * offY)) + "px");
           
            console.log("image height ",$(container).find(image).height())
            console.log("image width ",$(container).find(image).width())
			margX = ((contWidth - imgWidth) / 2);
			$(container).find(image).css("width", imgWidth + "px").css("marginLeft", margX + "px").css("marginTop", margY + "px");
		} else if (imgWidth > contWidth) {
			console.log("Image wider than container");
			$(container).find(image).css("width", (contWidth - (2 * offX)) + "px");
			margY = (contHeight - imgHeight) / 2;
			$(container).find(image).css("height", imgHeight + "px").css("marginTop", margY + "px").css("marginLeft", margX + "px");
		} else if (imgWidth === contWidth || imgHeight === contHeight) {
			console.log("Image equal to container");
			margX = (contWidth - (contWidth * 0.9)) / 2;
			margY = (contHeight - (contHeight * 0.9)) / 2;
			$(container).find(image).css("width", ((contWidth - (2 * offX)) * 0.9) + "px").css("marginLeft", margX + "px");
			$(container).find(image).css("height", ((contHeight - (2 * offY)) * 0.9) + "px").css("marginTop", margY + "px");
		} else {
			console.log("Image smaller than container");
			margX = (contWidth - imgWidth) / 2;
			margY = (contHeight - imgHeight) / 2;
			$(container).find(image).css("width", this.width + "px").css("marginLeft", margX + "px");
			$(container).find(image).css("height", this.height + "px").css("marginTop", margY + "px");
		}

		$(container).find(image).attr("src", img.src);
		console.log("Image inserted");
	}
	img.src = imageFile;
}
function cancelAddQuestion(e, theModal) {
	var modal;
	if (theModal && theModal !== "") {
		modal = theModal;
	} else {
		modal = e.target.closest("div[data-role='modalview']").attr("id");
	}
	$("#" + modal + " #questionsContainer").find("input").val("");
	$("#" + modal + " #addQuestionImage").attr("src", "images/default.png");
	$("#" + modal + " #questionsContainer").find("div.checked").removeClass("checked");
	$("#" + modal + "").data("kendoMobileModalView").close();
}
function addQuestion(imgArr) {
	console.log(JSON.stringify(imgArr));

	Utils.showLoading();

	var mainContainer = $("#addQuestionModal");
	var container = $("#addQuestionModal #questionsContainer");
	var questionName = mainContainer.find(".fb_q_number").html();
	//var question = encodeURIComponent(mainContainer.find("#fb_question").val()); //encodeURIComponent is used to make sure that some characters are sent with the string ex: '+,?'
	var question = mainContainer.find("#fb_question").val(); //encodeURIComponent is used to make sure that some characters are sent with the string ex: '+,?'
	var numberOfChoices = container.find(".fb_q_container").length;
	var numberOfCorrectChoices = container.find("div.checked").length;
	var questionGrade = mainContainer.find(".fb_q_grade").toEnglish();

	//Check for arabic characters
	/*
	if(mainContainer.find(".fb_q_grade").hasArabicLetters()){
	alert("The grade cannot be entered in Arabic!\nPlease change your keyboard to English and try again.","Error");
	return;
	}
	*/

	var qType = mainContainer.find("#qType").html();
	var qImage;
	if (selectedImage !== "") {
		//qImage = selectedImage.substr(selectedImage.lastIndexOf('/') + 1);
		qImage = selectedImage;
	} else {
		qImage = "";
	}

	var count = $("#examDetailsQuestionsList li").length + 1;

	var str = "";
	if (qType === "1" || qType === "2") { //true-false or multiple choice
		console.log("True-False or Multiple Choice");
		for (var j = 1; j <= numberOfChoices; j++) {
			var testStr = j + "," + container.find("#choice_" + j).find(".fb_q_answer").val() + "," + (container.find("#choice_" + j).find(".fb_radio").hasClass('checked') === true ? "1" : "0") + "," + (container.find("#choice_" + j).find(".fb_radio").hasClass('checked') === true ? (parseInt(questionGrade) / parseInt(numberOfCorrectChoices)) : "0") + "," + (imgArr[j - 1] ? imgArr[j - 1] : "") + ";";
            str += testStr;
            console.log("testStr ", testStr);
		}
	} else if (qType === "4") { //multivalue
		for (var j = 1; j <= numberOfChoices; j++) {
			str += j + "," + container.find("#choice_" + j).find(".fb_q_answer").val() + "," + (container.find("#choice_" + j).find(".fb_checkbox").hasClass('checked') === true ? "1" : "0") + "," + (container.find("#choice_" + j).find(".fb_checkbox").hasClass('checked') === true ? (parseInt(questionGrade) / parseInt(numberOfCorrectChoices)) : "0") + "," + (imgArr[j - 1] ? imgArr[j - 1] : "") + ";";
		}
	}
	console.log(apiURL + "saveQuestionMaster?examID=" + currentExamID + "&questionName=Q" + count + "&question=" + question + "&numberOfChoices=" + numberOfChoices + "&numberOfCorrectChoices=" + numberOfCorrectChoices + "&questionGrade=" + questionGrade + "&questionType=" + qType + "&questionImage=" + qImage + "&details=" + str);
	//alert(url + "saveQuestionMaster?examID=" + currentExamID + "&question=" + question + "&numberOfChoices=" + numberOfChoices + "&numberOfCorrectChoices=" + numberOfCorrectChoices + "&questionGrade=" + questionGrade + "&questionType=" + qType + "&details=" + str);
	 console.log("testStrGlobal ", testStr);
	 console.log("StrGlobal ", str);
         WebService.GET("saveQuestionMaster", {
                examID: currentExamID,
                questionName: 'Q'+count,
                question:question,
                numberOfChoices:numberOfChoices,
                numberOfCorrectChoices:numberOfCorrectChoices,
                questionGrade:questionGrade,
                questionType:qType,
                questionImage:qImage,
                details:str
            }, function(data) {
                console.log("afterSave ",str)
                if (parseInt(data) > 0) {
        				//alert("Saved");
        				cancelAddQuestion(null, "addQuestionModal");
        				getExamMasterDetails(currentExamID);
        			} else {
        				Utils.alert("Not Saved");
        			}
                Utils.hideLoading();
        			selectedImage = "";
            },function(error){
                
            });    
	
}
function getPhoto(e) {
	var source = e.target.closest("a").attr("source");
	var container = "#" + e.target.closest("a").attr("container");
	var imageContainer = container.split("Container")[0];

	var pictureSource;
	if (source === "CAMERA") {
		pictureSource = Camera.PictureSourceType.CAMERA;
	} else {
		pictureSource = Camera.PictureSourceType.PHOTOLIBRARY;
	}

	function onSuccess(image) {
		selectedImage = "data:image/png;base64," + image;
		insertImage(selectedImage, container, imageContainer);
	}

	var onError = function(err) {
		if (JSON.stringify(err) !== "\"no image selected\"") {
			if (JSON.stringify(err) === "\"no camera available\"") {
				navigator.notification.alert("The camera has been disabled", false, "Error", "Ok");
			} else {
				navigator.notification.alert(JSON.stringify(err), false, "Error", "Ok");
			}
		}
	};

	navigator.camera.getPicture(onSuccess, onError, {
		destinationType: Camera.DestinationType.DATA_URL,
		sourceType: pictureSource,
		quality: 50
	});
}
function getChoicePhoto(e) {
	var source = e.target.closest("a").attr("source");

	var pictureSource;
	if (source === "CAMERA") {
		pictureSource = Camera.PictureSourceType.CAMERA;
	} else {
		pictureSource = Camera.PictureSourceType.PHOTOLIBRARY;
	}

	function onSuccess(image) {
		//selectedImage = image;
		choiceImageTarget.css("background-image", "url(data:image/png;base64," + image + ")");
		choiceImageTarget.attr("imageFile", encodeURI(image));
		choiceImageTarget.closest(".fb_q_container").addClass("edited");
	}

	var onError = function(err) {
		if (JSON.stringify(err) !== "\"no image selected\"") {
			if (JSON.stringify(err) === "\"no camera available\"") {
				navigator.notification.alert("The camera has been disabled", false, "Error", "Ok");
			} else {
				navigator.notification.alert(JSON.stringify(err), false, "Error", "Ok");
			}
		}
	};

	navigator.camera.getPicture(onSuccess, onError, {
		destinationType: Camera.DestinationType.DATA_URL,
		sourceType: pictureSource,
		quality: 50
	});
}
function updateMatchingPhoto() {
	if ($("#editMatchingQuestionModal").find(".fb_q_grade").val() === "") {
		Utils.alert("Please enter the question's grade", "Exam");
		return;
	}
	if (selectedImage !== "") {
		Utils.showLoading();

		var params = {};
		params.ImageData = selectedImage;
         WebService.POST("upload", {
                    data: JSON.stringify(params)
                }, function(data) {
                       if (data.Error) {
        					console.log("Failed: " + data.Response);
        					selectedImage = "";
        					updateMatchingQuestion();
        					Utils.hideLoading();
    				} else {
    					selectedImage = data.Response;
    					updateMatchingQuestion();
    					Utils.hideLoading();
    				}
                },function(error){
                       console.log("Failed: " + JSON.stringify(error));
        				selectedImage = "";
        				updateMatchingQuestion();
        				Utils.hideLoading();
                });
        
		
	} else {
		updateMatchingQuestion();
	}
}
function uploadPhoto() {
	if ($("#addQuestionModal").find(".fb_q_grade").val() === "") {
		Utils.alert("Please enter the question's grade", "Exam");
		return;
	}
	console.log("Checkbox: " + $("#addQuestionModal input[type='checkbox']:checked").length);
	console.log("Radio: " + $("#addQuestionModal input[type='adiocheckbox']:checked").length);
	console.log("QType: " + $("#addQuestionModal #qType").html().toString());
	if ($("#addQuestionModal .fb_checkbox.checked").length === 0 && $("#addQuestionModal .fb_radio.checked").length === 0 && $("#addQuestionModal #qType").html().toString() !== "3" && $("#addQuestionModal #qType").html().toString() !== "5") {
		Utils.alert("Please select the correct answer", "Exam");
		return;
	}
	if (selectedImage !== "") {
		Utils.showLoading();

		var params = {};
		params.ImageData = selectedImage;
        
         WebService.POST("upload", {
                    data: JSON.stringify(params)
                }, function(data) {
                            if (data.Error) {
        					console.log("Upload Failed " + data.Response);
        					uploadChoicePhotos(function(imgArr) {
                                console.log("image Array ",imgArr);
        						addQuestion(imgArr);
        						Utils.hideLoading();
        					});
        				} else {
        					selectedImage = data.Response;
                           
        					console.log("Question Image: " + selectedImage);
        					uploadChoicePhotos(function(imgArr) {
                                 console.log("image Array ",imgArr);
        						addQuestion(imgArr);
        						Utils.hideLoading();
        					});
        				}
                    },function(error){
                            Utils.alert("cann't upload image")
                    });
   } else {
		uploadChoicePhotos(function(imgArr) {
			addQuestion(imgArr);
			Utils.hideLoading();
		});
	}
}
function uploadChoicePhotos(callback) {
	Utils.showLoading();

	var uploadedImages = [];
	var total = $("#addQuestionModal #questionsContainer .fb_q_container.edited").length;

	var imagesToUpload = [];

	var checkLoop = function() {
		if (imagesToUpload.length > 0) {
			uploadChoicePhoto(imagesToUpload.pop());
		} else {
			callback(uploadedImages);
		}
	};

	if (total === 0) {
		//No choice photos have been edited
		callback(uploadedImages);
	} else {
		$("#addQuestionModal #questionsContainer .fb_q_container.edited").each(function() {
			var index = $(this).index();
			var item = $(this).find(".inputContainer");
			var source = item.find(".inputImage").attr("imageFile") ? decodeURI(item.find(".inputImage").attr("imageFile")) : "";

			imagesToUpload[index] = {
				index: index,
				source: source
			};
		});

		imagesToUpload.reverse();
		checkLoop();
	}

	function uploadChoicePhoto(photo) {
		if (photo.source === "") {
			uploadedImages[photo.index] = "";
			checkLoop();
		} else {
			var params = {};
			params.ImageData = photo.source;
            WebService.POST("upload", {
                    data: JSON.stringify(params),
                }, function(data) {
                    if (data.Error) {
						console.log("Upload Error: " + data.Response);
						uploadedImages[photo.index] = "";
						checkLoop();
					} else {
						uploadedImages[photo.index] = data.Response;
						checkLoop();
					}
                },function(error){
                    console.log("Upload Error: " + JSON.stringify(error));
					uploadedImages[photo.index] = "";
					checkLoop();
                });
		}
	}
}
function updateQuestion(imgArr) {
	var mainContainer = $("#editQuestionModal");
	var container = $("#editQuestionModal #questionsContainer");
	var questionID = mainContainer.find("#qID").html();
	var questionName = mainContainer.find(".fb_q_number").html();
	var question = encodeURIComponent(mainContainer.find("#fb_question").val()); //encodeURIComponent is used to make sure that some characters are sent with the string ex: '+,?'
	var numberOfChoices = container.find(".fb_q_container").length;
	var numberOfCorrectChoices = container.find("div.checked").length;
	var questionGrade = mainContainer.find(".fb_q_grade").val();
	var qType = mainContainer.find("#qType").html();
	var qImage;
	if (selectedImage !== "") {
		//qImage = selectedImage.substr(selectedImage.lastIndexOf('/') + 1);
		qImage = selectedImage;
		/*
		if (qImage.indexOf(".png") < 0) {
		qImage += ".png";
		}
		*/
	} else {
		qImage = "";
	}

	var str = "";
	if (qType === "1" || qType === "2") { //true-false or multiple choice
		for (var j = 0; j < numberOfChoices; j++) {
			console.log(container.find("#choice_" + (j + 1)).html());
			str += container.find("#choice_" + (j + 1)).find(".answerID").html() + "," + container.find("#choice_" + (j + 1)).find(".fb_q_answer").val() + "," + (container.find("#choice_" + (j + 1)).find(".fb_radio").hasClass('checked') === true ? "1" : "0") + "," + (container.find("#choice_" + (j + 1)).find(".fb_radio").hasClass('checked') === true ? (parseInt(questionGrade) / parseInt(numberOfCorrectChoices)) : "0") + "," + (imgArr[j] ? imgArr[j].response : "") + ";";
		}
	} else if (qType === "4") { //multivalue
		for (var j = 0; j < numberOfChoices; j++) {
			str += container.find("#choice_" + (j + 1)).find(".answerID").html() + "," + container.find("#choice_" + (j + 1)).find(".fb_q_answer").val() + "," + (container.find("#choice_" + (j + 1)).find(".fb_checkbox").hasClass('checked') === true ? "1" : "0") + "," + (container.find("#choice_" + (j + 1)).find(".fb_checkbox").hasClass('checked') === true ? (parseInt(questionGrade) / parseInt(numberOfCorrectChoices)) : "0") + "," + (imgArr[j] ? imgArr[j].response : "") + ";";
			console.log(container.find("#choice_" + (j + 1)).html());
			console.log(str);
		}
	} else if (qType === "5") { //matching
		for (var j = 0; j < numberOfChoices; j++) {
			str += container.find("#choice_" + (j + 1)).find(".answerID").html() + "," + container.find("#choice_" + (j + 1)).find(".fb_q_answer").val() + "," + (container.find("#choice_" + (j + 1)).find(".fb_checkbox").hasClass('checked') === true ? "1" : "0") + "," + (container.find("#choice_" + (j + 1)).find(".fb_checkbox").hasClass('checked') === true ? (parseInt(questionGrade) / parseInt(numberOfCorrectChoices)) : "0") + "," + (imgArr[j] ? imgArr[j].response : "") + ";";
		}
	}

	//console.log(url + "wb_UpdateQuestion?questionID=" + questionID + "&question=" + question + "&grade=" + questionGrade + "&questionImage=" + qImage + "&details=" + str);
	//return;
    WebService.GET("wb_UpdateQuestion", {
                    questionID: questionID,
                    question:question,
                    grade:questionGrade,
                    questionImage:qImage,
                    questionType:qType,
                    details:str
                }, function(data) {
                   if (data === "good") {
        				$("#editQuestionModal #questionsContainer").html("");
        				$("#editQuestionModal #editQuestionImage").attr("src", "images/default.png");
        				$("#editQuestionModal").data("kendoMobileModalView").close();
        				getExamMasterDetails(currentExamID);
        			} else {
        				Utils.alert("Could not update question", "Error");
        			}
                    selectedImage = "";
                },function(error){
                    Utils.alert("Error, could not save question");
                    console.log("Error, could not save question");
                });
}
function updatePhoto() {
	if ($("#editQuestionModal").find(".fb_q_grade").val() === "") {
		Utils.alert("Please enter the question's grade", "Exam");
		return;
	}

	if (selectedImage !== "") {
		Utils.showLoading();

		var params = {};
		params.ImageData = selectedImage;
         WebService.POST("upload", {
                    data: JSON.stringify(params)
               }, function(data) {
                       if (data.Error) {
    					console.log("Failed: " + data.Response);
    					selectedImage = "";
    					updateChoicePhotos(function(imgArr) {
    						updateQuestion(imgArr);
    						Utils.hideLoading();
    					});
    				} else {
    					selectedImage = data.Response;
    					console.log("Question Updated Image: " + selectedImage);
    					updateChoicePhotos(function(imgArr) {
    						updateQuestion(imgArr);
    						Utils.hideLoading();
    					});
    				}
               },function(error){
                   console.log("Failed: " + JSON.stringify(error));
    				selectedImage = "";
    				updateChoicePhotos(function(imgArr) {
    					updateQuestion(imgArr);
    					Utils.hideLoading();
    				});
               });
	} else {
		updateChoicePhotos(function(imgArr) {
			updateQuestion(imgArr);
			Utils.hideLoading();
		});
	}
}
function updateChoicePhotos(callback) {
	Utils.showLoading();

	var uploadedImages = [];
	var total = $("#editQuestionModal #questionsContainer .fb_q_container.edited").length;

	var imagesToUpload = [];

	var checkEditLoop = function() {
		if (imagesToUpload.length > 0) {
			updateChoicePhoto(imagesToUpload.pop());
		} else {
			callback(uploadedImages);
		}
	};

	if (total === 0) {
		//No choice photos have been edited
		callback(uploadedImages);
	} else {
		$("#editQuestionModal #questionsContainer .fb_q_container.edited").each(function() {
			var index = $(this).index();
			console.log("CurrentIndex: " + index);
			var item = $(this).find(".inputContainer");
			var source = item.find(".inputImage").attr("imageFile") ? decodeURI(item.find(".inputImage").attr("imageFile")) : "";

			imagesToUpload[index] = {
				index: index,
				source: source
			};
		});

		imagesToUpload.reverse();
		checkEditLoop();
	}

	function updateChoicePhoto(photo) {
		if (photo.source === "") {
			uploadedImages[photo.index] = "";
			checkEditLoop();
		} else {
			var params = {};
			params.ImageData = photo.source;
            WebService.POST("upload", {
                    data: JSON.stringify(params)
               }, function(data) {
                   if (data.Error) {
						console.log("Upload Error: " + data.Response);
						uploadedImages[photo.index] = "";
						checkEditLoop();
					} else {
						uploadedImages[photo.index] = data.Response;
						checkEditLoop();
					}
               },function(error){
                   console.log("Upload Error: " + JSON.stringify(error));
					uploadedImages[photo.index] = "";
					checkEditLoop();
               });
		}
	}
}

function updateMatchingPhoto() {
	if ($("#editMatchingQuestionModal").find(".fb_q_grade").val() === "") {
		Utils.alert("Please enter the question's grade", "Exam");
		return;
	}
	if (selectedImage !== "") {
		Utils.showLoading();

		var params = {};
		params.ImageData = selectedImage;
         WebService.POST("upload", {
                    data: JSON.stringify(params)
               }, function(data) {
                   if (data.Error) {
					console.log("Failed: " + data.Response);
					selectedImage = "";
					updateMatchingQuestion();
					Utils.hideLoading();
				} else {
					selectedImage = data.Response;
					updateMatchingQuestion();
					Utils.hideLoading();
				}
               },function(error){
                   
               });
	} else {
		updateMatchingQuestion();
	}
}
function updateMatchingQuestion(qID) {
	var mainContainer = $("#editMatchingQuestionModal");
	var container = $("#editMatchingQuestionModal #questionsContainer");
	var questionID = mainContainer.find("#qID").html();
	var questionName = mainContainer.find(".fb_q_number").html();
	var question = encodeURIComponent(mainContainer.find("#fb_question").val()); //encodeURIComponent is used to make sure that some characters are sent with the string ex: '+,?'
	var numberOfChoices = container.find(".fb_q_container").length;
	var numberOfCorrectChoices = container.find("div.checked").length;
	var questionGrade = mainContainer.find(".fb_q_grade").val();
	var qType = mainContainer.find("#qType").html();
	var qImage;
	if (selectedImage !== "") {
		qImage = selectedImage.substr(selectedImage.lastIndexOf('/') + 1);
		/*
		if (qImage.indexOf(".png") < 0) {
		qImage += ".png";
		}
		*/
	} else {
		qImage = "";
	}

	var str = "";
	var current = 1;
	var total = $("#editMatchingQuestionModal #questionsContainer .fb_q_container").length;
	$("#editMatchingQuestionModal #questionsContainer .fb_q_container").each(function() {
		var q = $(this);
		var questionName = $("#editMatchingQuestionModal").find(".fb_q_number").html();
		var question = encodeURIComponent($("#editMatchingQuestionModal").find("#fb_question").val()); //encodeURIComponent is used to make sure that some characters are sent with the string ex: '+,?'
		var numberOfChoices = total;
		var numberOfCorrectChoices = total;
		var questionGrade = $("#editMatchingQuestionModal").find(".fb_q_grade").val();
		var qType = $("#editMatchingQuestionModal").find("#qType").html();
		var qImage;
		if (selectedImage !== "") {
			qImage = selectedImage.substr(selectedImage.lastIndexOf('/') + 1);
		} else {
			qImage = "";
		}
		var choiceTitle = q.find(".answerID").text();
		var choiceValue = q.find(".fb_q_answer.match_title").val() + "^" + q.find(".fb_q_answer.match_choice").val();
		var choiceChoice = q.find(".fb_q_answer.match_answer").val();
		str += choiceTitle + "," + choiceValue + "," + choiceChoice + "," + parseFloat(questionGrade / total) + ";";

		if (current === total) {
			//str = str.slice(0,-1);
			console.log(str);
			console.log(apiURL + "wb_UpdateQuestion?questionID=" + questionID + "&question=" + question + "&grade=" + questionGrade + "&questionImage=" + qImage + "&details=" + str);
			 WebService.GET("wb_UpdateQuestion", {
                    questionID: questionID,
                    question:question,
                    grade:questionGrade,
                    questionImage:qImage,
                    questionType:encodeURIComponent(str),
                    details:str
                }, function(data) {
                    if (data === "good") {
						$("#editMatchingQuestionModal #questionsContainer").html("");
						$("#editMatchingQuestionModal #editQuestionImage").attr("src", "images/default.png");
						$("#editMatchingQuestionModal").data("kendoMobileModalView").close();
						getExamMasterDetails(currentExamID);
					} else {
						Utils.alert("Not Saved");
					}
                    selectedImage = "";
                },function(error){
                    console.log("Error, could not save question");
                    Utils.alert("Error, could not save question");
                });
        }
		current++;
	});
}

function editQuestion(qID, qNo) {
	selectedImage = "";
	insertImage("images/default.png", "#editQuestionImageContainer", "#editQuestionImage");
     WebService.GET("wb_GetQuestionDetails", {
                    id: qID
                }, function(data) {
                    var type = data.QuestionType;

            			var mainContainer = $("#editQuestionModal");
            			var container = $("#editQuestionModal #questionsContainer");
            			if (parseInt(data.QuestionType) === 5) {
            				//Matching question
            				mainContainer = $("#editMatchingQuestionModal");
            				container = $("#editMatchingQuestionModal #questionsContainer");
            			}
            			mainContainer.find(".fb_q_number").html("Q" + qNo + ")");
            			mainContainer.find("#fb_question").val(data.QuestionDescription.replace(/&#39;/g, "'")); //encodeURIComponent is used to make sure that some characters are sent with the string ex: '+,?'
            			mainContainer.find(".fb_q_grade").val(data.QuestionMark);
            			if (parseInt(data.QuestionType) === 5) {
            				mainContainer.find(".fb_q_grade").css("margin-top", "5%").css("margin-bottom", "5%").css("margin-right", "2.5%");
            			} else {
            				mainContainer.find(".fb_q_grade").css("margin-top", "5%").css("margin-top", "9%").css("margin-right", "5%");
            			}
            			mainContainer.find("#qID").html(qID);
            			mainContainer.find("#qType").html(data.QuestionType);
            			var image = data.Image;
            			if (image === "") {
            				image = "images/default.png";
            			} else {
            				image = fileURL + data.Image;
            			}
            			image = image.replace("/uploads/uploads/", "/uploads/");
            			//selectedImage = data.Image;

            			var content = "";

            			if (type === 1) { //True-False
            				for (var i = 0; i < data.NumberOfChoices; i++) {
            					if (data._isCorrect[i] === 1) {
            						content += "<div id='choice_" + (i + 1) + "' class='fb_q_container'><span class='fb_q_answer_number'>" + (i + 1) + ")</span><span class='answerID' style='display:none'>" + data._AnswerID[i] + "</span><input type='text' class='fb_q_answer inputWithImage' imgSrc='" + data._ChoiceImage[i] + "' placeholder='True' value='" + data._ChoiceValue[i] + "' /><div class='fb_radio checked' name='radio_" + qNo + "'></div></div>";
            					} else {
            						content += "<div id='choice_" + (i + 1) + "' class='fb_q_container'><span class='fb_q_answer_number'>" + (i + 1) + ")</span><span class='answerID' style='display:none'>" + data._AnswerID[i] + "</span><input type='text' class='fb_q_answer inputWithImage' imgSrc='" + data._ChoiceImage[i] + "' placeholder='False' value='" + data._ChoiceValue[i] + "' /><div class='fb_radio' name='radio_" + qNo + "'></div></div>";
            					}
            				}
            			} else if (type === 2) {
            				for (var i = 0; i < data.NumberOfChoices; i++) {
            					if (data._isCorrect[i] === 1) {
            						content += "<div id='choice_" + (i + 1) + "' class='fb_q_container'><span class='fb_q_answer_number'>" + (i + 1) + ")</span><span class='answerID' style='display:none'>" + data._AnswerID[i] + "</span><input type='text' class='fb_q_answer inputWithImage' imgSrc='" + data._ChoiceImage[i] + "' value='" + data._ChoiceValue[i] + "' /><div class='fb_radio checked' name='radio_" + qNo + "'></div></div>";
            					} else {
            						content += "<div id='choice_" + (i + 1) + "' class='fb_q_container'><span class='fb_q_answer_number'>" + (i + 1) + ")</span><span class='answerID' style='display:none'>" + data._AnswerID[i] + "</span><input type='text' class='fb_q_answer inputWithImage' imgSrc='" + data._ChoiceImage[i] + "' value='" + data._ChoiceValue[i] + "' /><div class='fb_radio' name='radio_" + qNo + "'></div></div>";
            					}
            				}
            			} else if (type === 4) {
            				for (var i = 0; i < data.NumberOfChoices; i++) {
            					if (data._isCorrect[i] === 1) {
            						content += "<div id='choice_" + (i + 1) + "' class='fb_q_container'><span class='fb_q_answer_number'>" + (i + 1) + ")</span><span class='answerID' style='display:none'>" + data._AnswerID[i] + "</span><input type='text' class='fb_q_answer inputWithImage' imgSrc='" + data._ChoiceImage[i] + "' value='" + data._ChoiceValue[i] + "' /><div class='fb_checkbox checked'></div></div>";
            					} else {
            						content += "<div id='choice_" + (i + 1) + "' class='fb_q_container'><span class='fb_q_answer_number'>" + (i + 1) + ")</span><span class='answerID' style='display:none'>" + data._AnswerID[i] + "</span><input type='text' class='fb_q_answer inputWithImage' imgSrc='" + data._ChoiceImage[i] + "' value='" + data._ChoiceValue[i] + "' /><div class='fb_checkbox'></div></div>";
            					}
            				}
            			} else if (type === 5) {
            				for (var i = 0; i < data.NumberOfChoices; i++) {
            					content += "<div id='choice_" + (i + 1) + "' class='fb_q_container'><span class='fb_q_answer_number' style='margin-top:1%;width:3%;margin-left:4%;'>" + (i + 1) + ")</span><span class='answerID' style='display:none'>" + data._AnswerID[i] + "</span><input type='text' class='fb_q_answer match_title' value='" + data._ChoiceValue[i].split("^")[0] + "' /><input type='text' class='fb_q_answer match_answer' value='" + data._correctIndex[i] + "' style='width:5%;margin-left:1%' /><span class='fb_q_answer_number' style='margin-top:1%;width:3%;margin-left:4%;'>" + (i + 1) + ")</span><input type='text' class='fb_q_answer match_choice' value='" + data._ChoiceValue[i].split("^")[1] + "' /></div>";
            				}
            			}

            			container.html(content);

            			console.log("Question Image:" + image);

            			insertImage(image, "#editQuestionImageContainer", "#editQuestionImage");
            			mainContainer.find(".fb_checkbox").kendoTouch({
            				tap: function(e) {
            					var item = e.touch.target.closest(".fb_checkbox");
            					item.toggleClass("checked");
            				},
            				doubletap: function(e) {
            					var item = e.touch.target.closest(".fb_checkbox");
            					item.toggleClass("checked");
            				}
            			});
            			mainContainer.find(".fb_radio").kendoTouch({
            				tap: function(e) {
            					var item = e.touch.target.closest(".fb_radio");
            					var name = item.attr("name");
            					mainContainer.find(".fb_radio[name='" + name + "']").removeClass("checked");
            					item.addClass("checked");
            				},
            				doubletap: function(e) {
            					var item = e.touch.target.closest(".fb_radio");
            					var name = item.attr("name");
            					mainContainer.find(".fb_radio[name='" + name + "']").removeClass("checked");
            					item.addClass("checked");
            				}
            			});

            			$("#editQuestionModal #questionsContainer .inputWithImage").each(function() {
            				$(this).inputWithImage();
            			});

            			$("#editQuestionModal #questionsContainer .fb_q_container").removeClass("edited");

            			mainContainer.data("kendoMobileModalView").open();
                    },function(error){
                        console.log("Error, could not get exam question details");
                });
}

function deleteQuestion(qID) {
	navigator.notification.confirm("Are you sure you want to delete this question?", function(buttonIndex) {
		if (buttonIndex === 2) {
			var id = "#q_" + qID;
             WebService.GET("wb_DeleteQuestion", {
                    id: qID
                }, function(data) {
                    if (data === "good") {
						$("#examDetailsQuestionsList").find(id).remove();
					} else {
						Utils.alert("Could not delete question", "Error");
					}
                },function(error){
                    console.log("Could not delete question.");
                });
		}
	}, "Delete Question", ["No", "Yes"]);
}
//=================EditExam  View================
function editExam() {
	Utils.navigate("#examFillDetails?id=" + currentExamID + "&description=" + currentExamDescription, "slide:left");
}
//=================EditExam  View================

//=================examsDetails  View================
function initExamTabs() {
	$("#examViewTabs").kendoMobileButtonGroup({
		select: function() {
			$(".examsTab").hide()
				.eq(this.selectedIndex)
				.show();
		},
		index: 0
	});
}

function getExamDetails(e) {
	var id = e.view.params.id;
	var desc = e.view.params.desc;
	var examStatus = 0;
	var timeStarted = "00:00:00";
    if(currentExamID ===null){
        currentExamID=0;
    }
	if (id === currentExamID) {
		getExamUpdates(id, true);
		return;
	}

	if (id) { //A new exam ID is received
		console.log("Setting exam id.");
		currentExamID = id;
         WebService.GET("wb_GetExamDetails", {
                    id: currentExamID || 0,
                }, function(data) {
                    if (data.length === 0) {
    					$("#examQuestionsListHeader").html("<li>N/A, Duration: N/A, Mark: N/A</li>");
    					$("#examQuestionsList").html("");
    					$("#examTitle").html("");
    					return;
				    }     
                        
                    var examID = data[0].ID;
    				var examDescription = data[0].Description;
    				var startTime = moment(data[0].startTime);
    				var endTime = moment(data[0].endTime);
    				var duration = data[0].Duration;
    				var examMark = data[0].ExamMark;
    				var numOfQuestions = data[0].NumberOfQuestions;

    				examStatus = data[0].Status;
    				timeStarted = data[0].timeStarted;

    				window.duration = moment(endTime).diff(moment(startTime), "seconds");
    				console.log("Exam Duration : " + window.duration);

    				currentExamDescription = examDescription;

    				$("#examName").html(examDescription);
    				$("#examDuration").html(duration);
    				$("#examMark").html(examMark);

    				$("#examQuestionsListHeader").html("<li>" + examDescription + ", Duration: " + duration + ", Mark: " + examMark + "</li>"); //Question
    				$("#examQuestionsList").html("");
    				$("#examTitle").html(examDescription);
    				$("#examTitleContainer").html(examDescription);
    				$("#examTitle").html(examDescription);
                    
    				$("#examsResultsHeader li").html("<span style='height:40px;line-height:44px;float:left;margin-left:212px;margin-right:15px;padding:0px'>SCORE</span></div></span>");
    				var scrollWidth = $("#examsResultsHeader li").width() - $("#examsResultsHeader li > span").outerWidth(true)-5;
    				 $("#examsResultsHeader li").append("<span class='questionScroller' style='width:" + scrollWidth + "px;float:left;padding:0px;margin-left:0px;'><div>");

    				$("#examsResultsHeader .questionScroller > div").css("width", data.length * 50 + "px");
                    console.log("$('#examsResultsHeader .questionScroller > div') ",$("#examsResultsHeader .questionScroller > div").width())

        				for (var i = 0; i < data.length; i++) {
        					var examQuestionsListContent = "<tr><td class='questionName' style='width:40px;'>Q" + (i + 1) + ")</td>";
        					examQuestionsListContent += "<td class='questionDescription' style='width:-webkit-calc(100% - 270px)'><span style='display:block;padding:20px 10px'>" + data[i].QuestionDescription + "</span></td>";
        					examQuestionsListContent += "<td class='questionMark' style='width:80px;'>Mark: " + data[i].QuestionMark + "</td>";
        					examQuestionsListContent += "<td class='correctScore' style='width:150px;'>Score Count: " + data[i].NumberOfCorrectChoices + "/" + data[i].NumberOfChoices + "</td>";
        					examQuestionsListContent += "<td class='questionAnswers' style='display:none'></td></tr>";
        					$("#examQuestionsList").append(examQuestionsListContent);

        					$("#examsResultsHeader .questionScroller > div").append("<div class='questionBtn' style='float:left;width:50px;height:40px;line-height:44px;text-align:center'>" +
        						"Q<span class='questionID'><span style='display:none'>" + data[i].QuestionID + "</span>" + (i + 1) + "</span>" +
        						"<span class='questionDescription' style='display:none'>" + data[i].QuestionDescription + "</span>" +
        						"<span class='questionMark' style='display:none'>" + data[i].QuestionMark + "</span>" +
        						"<div class='questionAnswers' style='display:none'>" +
        						"</div>" +
        						"</div>");

        					for (var j = 0; j < data[i].NumberOfChoices; j++) {
        						console.log("i: " + i + ", j: " + j);
        						var choiceText = "";
        						if (data[i].QuestionType === 5) {
        							choiceText = "<span style='display:inline-block;width:50%;float:left;text-align:left' class='choiceText'>" + getChoice(data[i]._ChoiceTitle[j]) + ") " + data[i]._ChoiceValue[j].split("^")[0] + "</span><span class='choiceCorrectAnswer'>" + data[i]._correctIndex[j] + "</span><span style='display:inline-block;width:50%;float:right;text-align:left' class='choiceAnswer'>" + (j + 1) + ") " + data[i]._ChoiceValue[j].split("^")[1] + "</span><span class='questionType'>" + data[i].QuestionType + "</span>";
        							console.log(data[i]._ChoiceTitle[j] + "--->" + getChoice(data[i]._ChoiceTitle[j]));
        						} else {
        							choiceText = "<span class='choiceText'>" + getChoice(data[i]._ChoiceTitle[j]) + ") " + data[i]._ChoiceValue[j] + "</span><span class='choiceCorrectAnswer'>" + data[i]._correctIndex[j] + "</span><span class='choiceAnswer'></span><span class='choiceImage'>" + (fileURL + data[i]._ChoiceImage[j]).replace("uploads/uploads/","uploads/") + "</span><span class='questionType'>" + data[i].QuestionType + "</span>";
        						}
        						$("#examQuestionsList tr:eq(" + i + ") .questionAnswers").append("<span class='questionAnswer' style='margin-left:20px;'>" + choiceText + "<span class='isCorrect' style='display:none'>" + data[i]._isCorrect[j] + "</span></span><br/>");
        						$("#examsResultsHeader li .questionBtn:eq(" + j + ") .questionAnswers").append("<span class='questionAnswer' style='display:none'>" + data[i]._ChoiceTitle[j] + " " + choiceText + "</span><br/>");
        					}
        				}

        				$("#examsResultsHeader .questionScroller").addClass("horScroller").kendoMobileScroller({
        					scroll: function(e) {
        						var scroll = e.scrollLeft;
        						$(".horScroller").each(function() {
        							$(this).data("kendoMobileScroller").scrollTo(-scroll, 0);
        						});
        					}
        				});

        				$("#examsResultsHeader li .questionBtn").kendoTouch({
        					tap: function(e) {
        						var questionNumber = "Q" + e.touch.target.closest(".questionBtn").find(".questionID").html() + ") ";
        						var question = e.touch.target.closest(".questionBtn").find(".questionDescription").html();
        						var index = e.touch.target.closest(".questionBtn").index();
        						console.log("Question Number: " + questionNumber);
        						console.log("Question: " + question);
        						console.log("Index: " + index);
        						$("#questionDetailsModal").find(".questionNumber").html(questionNumber);
        						$("#questionDetailsModal").find(".question").html(question);
        						$("#questionDetailsModal").find(".answers").html("");
        						var i = 1;
        						$("#questionAnswers").html("");
        						$("#examQuestionsList tr:eq(" + index + ") .questionAnswers .questionAnswer").each(function() {
            							var content = "";
            							
            							console.log("Question Type: " + $(this).find(".questionType").text().toString());
            							if ($(this).find(".questionType").text().toString() === "5") { //Matching
                								content = "<tr>" +
                									"<td style='width:42.5%'>" + $(this).find(".choiceText").text() + "</td>" +
                									"<td style='width:5%'>" + $(this).find(".choiceCorrectAnswer").text() + "</td>" +
                									"<td style='width:42.5%'>" + $(this).find(".choiceAnswer").text() + "</td>" +
                									"</tr>";
            							} else if ($(this).find(".questionType").text().toString() === "3") { //Essay
            								    content = "";
            							} else {
                								var color = "";
                								if ($(this).find(".isCorrect").html() === "1") {
                									color = "green";
                								} else {
                									color = "red";
                								}

                								content = "<tr>" +
                									"<td style='width:75%;color:" + color + "'>" + $(this).find(".choiceText").text() + "</td>" +
                									"<td style='width:25%;padding:0px;'><center><span class='choiceImage' style='background-image:url(" + $(this).find(".choiceImage").html() + ");'></span></center></td>" +
                									"</tr>";
            							}
            							console.log(content);
            							$("#questionAnswers").append(content);
            							$("#questionAnswers tr:last-child").find(".choiceImage").kendoTouch({
            								tap: function(e) {
            									var img = e.touch.target.closest(".choiceImage").css("background-image");
            									$("#questionImageDetailsPopover .detailedImage").addClass("loading").css("background-image", "url(images/icons/loading.gif)");
            									$("#questionImageDetailsPopover").data("kendoMobilePopOver").open(e.touch.target);
            									$("#questionImageDetailsPopover .detailedImage").removeClass("loading").css("background-image", img);
            								}
            							});
            						});
        						$("#questionDetailsModal").data("kendoMobileModalView").open();
        					}
        				});

        				$("#examDetails").find("#examResultsChart").kendoChart({
        					legend: {
        						visible: true,
                                position: "bottom",
        					},
        					chartArea: {
        						background: ""
        					},
        					series: [{
        						type: "pie",
        						startAngle: 150
        					}],
        					tooltip: {
        						visible: false,
        						format: "{0}%"
        					},
        					transitions: false
        				});

    				    getExamUpdates(id, true);
                        
                        if (examStatus) {
            					var time = timeStarted.split(" ")[0];
            					time = time.split(":");
            					var hrs = parseInt(time[0]);
            					var mnt = parseInt(time[1]);
            					var sec = parseInt(time[2]);

            					var currentTime = new Date();
            					var cHrs = currentTime.getHours() - hrs;
            					var cMnt = currentTime.getMinutes() - mnt;
            					var cSec = currentTime.getSeconds() - sec;

            					var elapsedTime = cHrs + ":" + cMnt + ":" + cSec;
            					clearInterval(examTimerInterval);
            					startTheExam(elapsedTime);
			    	    }
                    
                }, function(error) {
                    Utils.alert(error);
                });
  	}
}
function getChoice(i) {
	var choice = '';
	i = parseInt(i);
	switch (i) {
		case 1:
			choice = 'a';
			break;
		case 2:
			choice = 'b';
			break;
		case 3:
			choice = 'c';
			break;
		case 4:
			choice = 'd';
			break;
		case 5:
			choice = 'e';
			break;
		case 6:
			choice = 'f';
	}
	return choice;
}
function getExamUpdates(id, update) {
	if (app.view().id !== "#examDetails") {
		if (!update) {
			console.log("Not going to udpate!");
			return;
		}
	}

	if (!update) {
		console.log("Not going to udpate!");
		return;
	}

	correct = 0;
	wrong = 0;
	unanswered = 0;

	console.log("Getting exam updates for examID: " + id);
     WebService.GET("wb_GetExamResults", {
                    examID: id || 0,
                    sectionID:currentSectionID ||0,
                     all:0
                }, function(data) {
                    console.log(JSON.stringify(data));

			if ($("#studentResults").kendoMobileScroller()) {
				$("#studentResults").data("kendoMobileScroller").destroy();
			}

			var h = $("body").height();
			var h1 = parseInt($("#examDetails").find(".km-button").height()) + parseInt($("#examDetails").find(".km-button").offset().top);
			var h2 = parseInt($("#examDetails").find("#examViewTabs").height());
			var h3 = parseInt($("#examDetails").find("#examTitle").css("height").split("px")[0]);
			var h4 = parseInt($("#examDetails").find("#examsResultsHeader").parent().css("height").split("px")[0]);

			h = h - (h1 + h2 + h3 + h4 + 44 + 50);

			console.log("height: " + h + "px");

			//$("#studentResults").css("height", data.length * 30 + "px");
			//$("#studentResults").kendoMobileScroller();
                    var view =$("#examDetails");
             var studentResultsScrollerHeight=  view.find(".km-content").height() - view.find("#examViewTabs").outerHeight(true) - view.find("#examResultsView").outerHeight(true)-view.find("#examsResultsHeader").outerHeight(true);
			//var studentResultsScrollerHeight = "200px";
			$("#studentResultsScroller").css("height", studentResultsScrollerHeight);
			$("#studentResultsScroller").css("width", 100 +'%');

			$("#studentResults").css("min-height", studentResultsScrollerHeight);
            var scrollWidth = $("#studentResults").width() - 285;
			$("#studentResults").html("<div class='basicInfo' style='width:280px;float:left;min-height:inherit;overflow-y:hidden'></div><div class='studentResults' style='width:" + scrollWidth + "px;float:left;margin-top:1px;min-height:inherit'></div>");
			for (var i = 0; i < data.length; i++) {
				var ans = data[i].Answers;
				var stat;

				c = parseInt(data[i].Correct);
				w = parseInt(data[i].Wrong);
				u = parseInt(data[i].Unanswered);

				if (data[i].isPresent) {
					stat = "<img style='float:left;margin-left:5px;margin-right:5px;margin-top:5px;width:20px;height:20px' src='images/icons/green.png' />";
				} else {
					stat = "<img style='float:left;margin-left:5px;margin-right:5px;margin-top:5px;width:20px;height:20px' src='images/icons/red.png' />";
				}

				var color = data[i].DidSubmit ? "green" : "black";
                
                var scrollContainerWidth = 50 * ans.length;

				$("#studentResults .basicInfo").append('<div id="std' + data[i].StudentID + '" class="studentDetails" style="display:block;height:30px;line-height:30px;width:' + scrollContainerWidth + 'px">' +
					stat +
					'<span class="studentName" style="display:block;float:left;width:170px;border-right:1px dotted #CCC;margin-left:5px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:' + color + '" onclick="getScreenshot(this.parentNode.id.split(\'std\')[1])">' + data[i].StudentName + '</span>' +
					'<span id="score" style="display:block;float:left;width:70px;border:none;text-align:center;"></span>' +
					'<div style="display:block;float:left;width:98%;margin-left:1%;height:1px;border-bottom:1px dotted #CCC"></div>' +
					'</div>');
				$("#studentResults .studentResults").append('<div id="std' + data[i].StudentID + '" class="studentDetails" style="display:block;height:30px;line-height:30px;width:' + scrollContainerWidth + 'px">' +
					'<span id="marks" style="display:block;float:left;"><div style="border-bottom:1px dotted #CCC"></div></span>' +
					'</div>');

				var totalGrade = 0;

				for (var m = 0; m < data[i].ExamQuestionIDs.length; m++) {
					$("#studentResults #std" + data[i].StudentID).find("#marks > div").append("<span class='mark' id='m_" + data[i].ExamQuestionIDs[m] + "' style='display:block;float:left;width:50px;border:none;text-align:center;color:#1e90ff;font-size:1rem;'>&#8212;</span>");
				}

				for (var j = 0; j < ans.length; j++) {
					console.log(JSON.stringify(ans[j]));
					var answer = ans[j].split(",")[1];
					var type = ans[j].split(",")[2];
					var grade = parseFloat(ans[j].split(",")[3] ? ans[j].split(",")[3] : 0);
					console.log(grade);

					$("#studentResults #std" + data[i].StudentID).find("#marks > div").css("width", (data[i].ExamQuestionIDs.length * 50) + 25 + "px").css("height", "30px");

					if (answer === "1") {
						correct++;
						totalGrade += grade;
						$("#studentResults #std" + data[i].StudentID).find("#marks #m_" + ans[j].split(",")[0]).attr("grade", grade).attr("result", "correct").html('<span style="color:green;font-size:1rem;"><span class="result">&#10004;</span><span class="questionID" style="display:none">' + ans[j].split(",")[0] + '</span><span class="questionType" style="display:none">' + type + '</span><span class="questionGrade" style="display:none">' + grade + '</span></span>');
					} else if (answer === "0") {
						wrong++;
						$("#studentResults #std" + data[i].StudentID).find("#marks #m_" + ans[j].split(",")[0]).attr("grade", grade).attr("result", "wrong").html('<span style="color:red;font-size:1rem;"><span class="result">&#x2717;</span><span class="questionID" style="display:none">' + ans[j].split(",")[0] + '</span><span class="questionType" style="display:none">' + type + '</span><span class="questionGrade" style="display:none">' + grade + '</span></span>');
					} else {
						answer = "2";
						unanswered++;
						$("#studentResults #std" + data[i].StudentID).find("#marks #m_" + ans[j].split(",")[0]).attr("grade", grade).attr("result", "unanswered").html('<span style="color:#1e90ff;font-size:1rem;"><span class="result">&#8212;</span><span class="questionID" style="display:none">' + ans[j].split(",")[0] + '</span><span class="questionType" style="display:none">' + type + '</span><span class="questionGrade" style="display:none">' + grade + '</span></span>');
					}
					console.log("Total Grade: " + totalGrade);

					totalGrade = 0;
					$("#studentResults #std" + data[i].StudentID + " .mark[result=correct]").each(function() {
						totalGrade += parseFloat($(this).attr("grade"));
					});

					c = $("#studentResults #std" + data[i].StudentID + " .mark[result=correct]").length / $("#studentResults #std" + data[i].StudentID + " .mark").length;
					w = $("#studentResults #std" + data[i].StudentID + " .mark[result=wrong]").length / $("#studentResults #std" + data[i].StudentID + " .mark[result=correct]").length;
					u = $("#studentResults #std" + data[i].StudentID + " .mark[result=unanswered]").length / $("#studentResults #std" + data[i].StudentID + " .mark[result=correct]").length;

					$("#studentResults #std" + data[i].StudentID).find("#score").html(totalGrade + "/" + data[i].ExamMark);

					console.log("Correct: " + correct + ", Wrong: " + wrong + ", Unanswered: " + unanswered);
				}

				$("#studentResults #std" + data[i].StudentID).find("#marks").find(".mark").kendoTouch({
					tap: function(e) {
						var qID = e.touch.target.closest("span.mark").find(".questionID").html();
						var qType = e.touch.target.closest("span.mark").find(".questionType").html();
						var stdID = e.touch.target.closest(".studentDetails").attr("id").split("std")[1];
						var qGrade = e.touch.target.closest("span.mark").find(".questionGrade").html();
						var examID = id;

						var targetPopover = "";
                        
                         WebService.GET("wb_GetStudentAnswer", {
                    stdID: stdID ,
                     qID:qID ,
                     examID:examID,
                      qType:qType       
                }, function(data) {
                    //data[i][0] is the answer
								//data[i][1] is the isCorrect
								//data[i][2] is the answerID
								//data[i][3] is the choiceImage
								//data[i][4] is the student's grade
                    console.log(JSON.stringify(data));
								var answer;
								var content = "";
								if (parseInt(qType) === 1 || parseInt(qType) === 2 || parseInt(qType) === 3) {
									console.log(JSON.stringify(data));
									//Essay OR True/False OR Multiple Choice
									data = data[0];

									targetPopover = "#answerImageDetailsPopover";

									var color = "";
									if (data[1] === "1") {
										color = "green";
									} else if (data[1] === "0") {
										color = "red";
									} else {
										color = "black";
									}

									answer = "<span style='font-size:1.6rem;display:block;margin:5px;text-decoration:underline'>Answer:</span>";
									if (qType === "3") {
										answer = "<span class='essayGradeContainer'><a data-role='button' class='gradeEssay' style='float:right;font-size:1.8em;'>Grade</a><span style='display:block;overflow:hidden;float:right;margin-right:20px'><input type='number' value='" + data[4] + "' class='essayGrade' style='float:left' min='0' max='" + qGrade + "' /><span class='questionGrade' style='float:left;line-height:48px;font-size:1.2rem'> / " + qGrade + "</span></span>";
									}
									content = "<tr>" +
										"<td style='width:75%;color:" + color + "'>" + data[0] + "</td>" +
										"<td style='width:25%;padding:0px;'><center><span class='examChoiceImage' style='background-image:url(" + (fileURL + data[3]).replace("uploads/uploads/","uploads/") + ")'></span></center></td>" +
										"</tr>";

									$("#studentAnswerModal").find(".km-content div[data-role=scroller]").html(answer);
									$("#studentAnswerModal").find("#studentAnswerTable").html(content);
									if ($("#studentAnswerModal").find(".gradeEssay").data("kendoMobileButton")) {
										$("#studentAnswerModal").find(".gradeEssay").data("kendoMobileButton").destroy();
									}
									$("#studentAnswerModal").find(".gradeEssay").kendoMobileButton({
										click: function() {
											gradeEssayAnswer(stdID, examID, qID, $("#studentAnswerModal").find(".essayGrade").toEnglish());
										}
									});
									$("#studentAnswerModal").data("kendoMobileModalView").open();

									$("#studentAnswerModal #studentAnswerTable .examChoiceImage").kendoTouch({
										tap: function(e) {
											var img = e.touch.target.closest(".examChoiceImage").css("background-image");
											$("#answerImageDetailsPopover .detailedImage").addClass("loading").css("background-image", "url(images/icons/loading.gif)");
											$("#answerImageDetailsPopover").data("kendoMobilePopOver").open(e.touch.target);
											$("#answerImageDetailsPopover .detailedImage").removeClass("loading").css("background-image", img);
										}
									});
								} else {
									//Multivalue OR Matching
									var choiceValue;
									var choiceMatchNumber;

									targetPopover = "#multiAnswerImageDetailsPopover";

									//if(parseInt(qType) === 5){
									//Matching
									answer = "<span style='font-size:1.6rem;display:block;margin:5px;text-decoration:underline'>Answer:</span>";
									content = "";

									if (parseInt(qType) === 5) {
										for (var i = 0; i < data.length; i++) {
											choiceValue = data[i][0].split("^");
											choiceMatchNumber = data[i][2].split(",");
											var color;
											if (data[i][1] === "1") {
												color = "green";
											} else if (data[i][1] === "0") {
												color = "red";
											} else {
												color = "black";
											}
											//choiceValue[0] is the question
											//choiceValue[1] is the answer
											//ex: the dog^flies
											//	the bird^barks
											//answer += "<span style='color:" + color + ";font-size:2rem;display:block;width:90%;margin:0 auto;'><span class='matchingChoice' style='display:inline-block;width:40%;float:left'>" + choiceValue[0] + "</span><span class='matchingAnswer' style='display:inline-block;width:8%;float:left'>" + (choiceMatchNumber[i].toString() === "-1" ? "?" : choiceMatchNumber[i])+ "</span><span class='matchingChoice' style='display:inline-block;width:40%;float:left'>" + (i + 1) + ") " + choiceValue[1] + "</span></span><span style='display:block;width:100%;height:20px;clear:both'></span>";

											content += "<tr>" +
												"<td>" + choiceValue[0] + "</td>" +
												"<td>" + (choiceMatchNumber[i].toString() === "-1" ? "?" : choiceMatchNumber[i]) + "</td>" +
												"<td>" + (i + 1) + ") " + choiceValue[1] + "</td>" +
												"</tr>";
										}
									} else {
										for (var i = 0; i < data.length; i++) {
											choiceValue = data[i][0];
											choiceMatchNumber = data[i][2].split(",");
											var color;
											if (data[i][1] === "1") {
												color = "green";
											} else if (data[i][1] === "0") {
												color = "red";
											} else {
												color = "black";
											}
											//choiceValue[0] is the question
											//choiceValue[1] is the answer
											//ex: the dog^flies
											//	the bird^barks
											//answer += "<span style='color:" + color + ";font-size:2rem;display:block;width:90%;margin:0 auto;'><span class='matchingChoice' style='display:inline-block;width:40%;float:left'>" + choiceValue[0] + "</span><span class='matchingAnswer' style='display:inline-block;width:8%;float:left'>" + (choiceMatchNumber[i].toString() === "-1" ? "?" : choiceMatchNumber[i])+ "</span><span class='matchingChoice' style='display:inline-block;width:40%;float:left'>" + (i + 1) + ") " + choiceValue[1] + "</span></span><span style='display:block;width:100%;height:20px;clear:both'></span>";

											content += "<tr>" +
												"<td style='width:75%;color:" + color + "'>" + choiceValue + "</td>" +
												"<td style='width:25%;padding:0px;'><center><span class='examChoiceImage' style='background-image:url(" + (fileURL + data[i][3]).replace("uploads/uploads/","uploads/") + ")'></span></center></td>" +
												"</tr>";
										}
									}

									$("#studentAnswerModalMulti").find(".km-content div[data-role=scroller]").html(answer);
									$("#studentAnswerModalMulti").find("#studentMultiAnswerTable").html(content);
									if ($("#studentAnswerModalMulti").find(".gradeEssay").data("kendoMobileButton")) {
										$("#studentAnswerModalMulti").find(".gradeEssay").data("kendoMobileButton").destroy();
									}
									/*
									$("#studentAnswerModalMulti").find(".gradeEssay").kendoMobileButton({
									click: function() {
									gradeEssayAnswer(stdID, examID, qID, $("#studentAnswerModalMulti").find(".essayGrade").val());
									}
									});
									*/
									$("#studentAnswerModalMulti").data("kendoMobileModalView").open();

									$("#studentAnswerModalMulti #studentMultiAnswerTable .examChoiceImage").kendoTouch({
										tap: function(e) {
											var img = e.touch.target.closest(".examChoiceImage").css("background-image");
											$("#multiAnswerImageDetailsPopover .detailedImage").addClass("loading").css("background-image", "url(images/icons/loading.gif)");
											$("#multiAnswerImageDetailsPopover").data("kendoMobilePopOver").open(e.touch.target);
											$("#multiAnswerImageDetailsPopover .detailedImage").removeClass("loading").css("background-image", img);
										}
									});
									//}
								}
                        },function(error){
                            
                        });
						
					}
				});
			}

			$("#studentResults .studentResults").addClass("horScroller").kendoMobileScroller({
				scroll: function(e) {
					var scroll = e.scrollLeft;
					$(".horScroller").each(function() {
						$(this).data("kendoMobileScroller").scrollTo(-scroll, 0);
					});
				}
			});
            
			//===========================LATER=====================
			//$("#questionDetailsModal").find(".questionNumber").html(questionNumber);
			//$("#questionDetailsModal").find(".question").html(question);
			//$("#questionDetailsModal").find(".answers").html("");

			correct = data.length > 0 ? parseFloat((correct / data.length)) : 0;
			wrong = data.length > 0 ? parseFloat((wrong / data.length)) : 0;
			unanswered = data.length > 0 ? parseFloat((unanswered / data.length)) : 0;

			console.log("Percent:\nCorrect: " + correct + "%\nWrong: " + wrong + "%\nUnanswered: " + unanswered + "%");

			var chart = $("#examResultsChart").data("kendoChart");

			chart.options.series[0].data = [{
				category: "Correct",
				value: correct,
				color: "#32CD32" //9de219
			}, {
				category: "Incorrect",
				value: wrong,
				color: "#B22222" //068c35
			}, {
				category: "No Answer",
				value: unanswered,
				color: "#1E90FF" //90cc38
			}];

			chart.refresh();
        }
            ,function(error){
           Utils.alert('could not get updates'); 
        });
}
function checkUncheckAllStudents(e) {
	var btn = e.target.closest("a");
	if (btn.attr("status") === "uncheck") {
		$("#examStudentsList li .checkbox").removeClass("checked");
		btn.text("Check All");
		btn.attr("status", "check");
	} else {
		$("#examStudentsList li .checkbox").addClass("checked");
		btn.text("Uncheck All");
		btn.attr("status", "uncheck");
	}
}

function switchStudentsListTabs() {
	$("#studentsListPopover .popoverStudentsList").hide()
		.eq(this.selectedIndex)
		.show();
}

function selectUnselectStudents(e) {
	var li = e.target.closest("li");
	console.log(li.index());
	li.find(".checkbox").toggleClass("checked");
}
function startExam(e) {
	if ($("#examStudentsList li .checkbox.checked").length === 0) {
		Utils.alert("No students have been selected.\nPlease select at least one student to start the exam", "Error");
		return;
	}

	var examStudents = [];
	$("#examStudentsList li .checkbox.checked").each(function() {
		examStudents.push(parseInt($(this).closest(".studentListItem").attr("id")));
	});

	var date = new Date();
	var hrs = date.getHours();
	var mnt = date.getMinutes();
	var sec = date.getSeconds();

	var time;

	if (hrs < 12) {
		time = hrs + ":" + mnt + ":" + sec + " AM";
	} else {
		time = hrs + ":" + mnt + ":" + sec + " PM";
	}

	var exam = {};
	exam.ExamID = parseInt(currentExamID);
	exam.TimeStarted = time;
	exam.Description = currentExamDescription;
	exam.Students = examStudents;

	navigator.notification.confirm("The exam is going to start for " + exam.Students.length + " student(s). Do you wish to proceed?", function(buttonIndex) {
		if (buttonIndex === 2) {
			socket.emit('startExam', exam);
			$("#currentScreen").html("Exam");
			$("#startExamOptionsPopover").data("kendoMobilePopOver").close();
		}
	}, "Exam", ["No", "Yes"]);
}
function startTheExam(examTime) {
	$("#shareExamResultsButton").addClass("disabled");
	$("#editExamButton").addClass("disabled");

	examIsActive = true;

	var time, hrs, mnt, sec;

	if ($("#startExamBtn").html() !== "Add Students") {
		time = examTime.split(":");
		hrs = parseInt(time[0]);
		mnt = parseInt(time[1]);
		sec = parseInt(time[2]);

		//time = moment().hours(hrs).minutes(mnt).seconds(sec).milliseconds(0);

		time = moment().hours(0).minutes(0).seconds(window.duration);

		$("#examTimer").css("color", "black");

		examTimerInterval = setInterval(function() {
			time.subtract(1000, "milliseconds");

			$("#examTimer").html(time.format("HH:mm:ss"));
			console.log("Remaining: " + moment(time).hours() + ":" + moment(time).minutes() + ":" + moment(time).seconds());
			var h = parseInt(moment(time).hours() * 60 * 60);
			var m = parseInt(moment(time).minutes() * 60);
			var s = parseInt(moment(time).seconds());
			var remaining = h + m + s;
			console.log("Remaining: " + remaining);
			if (remaining === 0) {
				if (SystemParameters.StopExamOnTimer && SystemParameters.StopExamOnTimer.toString().toLowerCase() !== "warn") {
					Utils.alert("The exam has ended!", "Exam");
					endTheExam();
				} else if (SystemParameters.StopExamOnTimer.toString().toLowerCase() === "warn") {
					clearInterval(examTimerInterval);
					navigator.notification.confirm("The exam time is over. Would you like to stop the exam?", function(buttonIndex) {
						if (buttonIndex === 2) {
							endTheExam();
						}
					}, "Exam Ended!", ["No", "Yes"]);
				} else {
					console.log("Exam Ended Warning!!!");
				}

				$("#examTimer").css("color", "red");
			}
			console.log(remaining + " seconds remaining");
		}, 1000);
	} else {
		time = $("#examTimer").html().split(":");
		hrs = parseInt(time[0]);
		mnt = parseInt(time[1]);
		sec = parseInt(time[2]);

		//time = moment().hours(hrs).minutes(mnt).seconds(sec).milliseconds(0);

		var currentTime = moment($("#examTimer").html());
		time = moment().hours(currentTime.hours()).minutes(currentTime.minutes()).seconds(currentTime.seconds());
		time.subtract(1000, "milliseconds");
	}
    socket.emit("examTimer", time.format("HH:mm:ss"));

	//$("#startExamBtn").addClass("disabled");
	$("#startExamBtn").html("Add Students");
	$("#endExamBtn").removeClass("disabled");
}
function endTheExam() {
	$("#shareExamResultsButton").removeClass("disabled");
	$("#editExamButton").removeClass("disabled");
	clearInterval(examTimerInterval);
	socket.emit('stopExam', parseInt(currentExamID));
	$("#currentScreen").html("Home");
}
function endExam() {
	var onConfirm = function(buttonIndex) {
		if (buttonIndex === 2) {
			endTheExam();

			examIsActive = false;
		}
	};
	navigator.notification.confirm("Are you sure you want to end the exam?", onConfirm, "End Exam", ["No", "Yes"]);
}
function getScreenshot(id) {
	try {
		id = parseInt(id);
		var onConfirm = function(buttonIndex) {
			if (buttonIndex === 2) {
				Utils.showLoading();
				socket.emit('getScreenshot', id);
			}
		}
		navigator.notification.confirm("Get screenshot?", onConfirm, "Screenshot", ["No", "Yes"]);
	} catch (ex) {
		Utils.alert("Could not get screenshot", "Error");
	}
}
function shareResults(e) {
	console.log("Sharing Exam Results!");
	var btn = e.target.closest("a");
	if (btn.attr("active") !== "true") {
		var options = $("#examDetails").find("#examResultsChart").data("kendoChart").options;
		var chartClone = $("#examDetails").find("#examResultsChart").clone();

		socket.emit('shareExamResults', {
			examID: currentExamID,
			options: options,
			details: {
				name: $("#examName").text(),
				duration: $("#examDuration").text(),
				mark: $("#examMark").text()
			}
		});
		console.log(options);
		$("#sharedExamResultsModal #resultsChart").css("display", "block").css("width", "100%").css("height", "556px");
		$("#sharedExamResultsModal").data("kendoMobileModalView").open();
		$("#sharedExamResultsModal #resultsChart").kendoChart(options);
		btn.attr("active", "true")
	} else {
		socket.emit('unshareExamResults');
		btn.attr("active", "false");
	}
}
function unshareExamResults(e) {
	socket.emit('unshareExamResults');
	$("#shareExamResultsButton").find(".km-text").html("Share");
	Utils.closeModal(e);
}
function gradeEssayAnswer(studentID, examID, questionID, grade) {
	var isCorrect = 0;
	if (parseInt(grade) > 0) {
		isCorrect = 1;
	}
     WebService.GET("wb_MarkEssayAnswer", {
                    studentID:  studentID,
                    examID:  examID ,
                    questionID: questionID,
                     isCorrect:isCorrect,
                     grade:grade
                }, function(data) {
                         if (data === "good") {
            				$("#studentAnswerModal").find(".essayGrade").val('0');
            				
                            getExamUpdates(currentExamID,true);
                            
            				$("#studentAnswerModal").data("kendoMobileModalView").close();
            			} else {
            				Utils.alert("Could not save grade", "Error");
            			}
                },function(error){
                    Utils.alert("Could not save grade", "Error");
                });
}


//=================examsdetails  View================

//=================Documents  View================
function getDocuments() {
    WebService.GET("wb_GetAllDocuments", {
                    subjectID:  currentSubjectID,
                    sectionID:  currentSectionID ,
                    all: "yes"
                }, function(data) {
                         $("#documents-list").html("");
            			var lineCounter = 1;
            			for (var i = 0; i < data.length; i++) {
            				var img;
            				var imgDL;
            				if (data[i].isShared === 1) {
            					img = "<img class='shareDocBtn' src='images/icons/green.png'/>";
            				} else {
            					img = "<img class='shareDocBtn' src='images/icons/red.png'/>";
            				}
            				if (data[i].Downloadable === 1) {
            					imgDL = "<img class='shareDocDownloadBtn' src='images/icons/greenDL.png'/>";
            				} else {
            					imgDL = "<img class='shareDocDownloadBtn' src='images/icons/redDL.png'/>";
            				}
            				/*
            				$("#documents-list").append("<li><a>" +
            				"<span style='display:none' id='docID'>" + data[i].ID + "</span>" +
            				"<span style='display:block;float:left;' id='docTitle'>Title: " + data[i].Title + "<br/>Description: " + data[i].Description + "</span>" +
            				"<span style='display:none' id='docPath'>" + getFullPath(data[i].Path) + "</span>" +
            				"</a>" +
            				"<span style='display:block;height:40px;float:right;'>" + imgDL + img + "</span>" +
            				"<a class='km-button dark' style='display:block;float:right;margin-right:20px;'>View</a>" +
            				"</li>");
            				*/

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
            					"<span style='display:none' id='docPath'>" + getFullPath(data[i].Path) + "</span>" +
            					"<div class='progressBarContainer'>" +
            					"<div class='progressBar'></div>" +
            					"<span class='progressLabel'></span>" +
            					"</div>" +
            					"<div class='iconContainer' style='background-image:url(" + thumbnail + ")'>" +
            					"<div class='loader'></div>" +
            					"<div class='btnContainer'>" +
            					img + imgDL +
            					"</div>" +
            					"<a class='km-button dark docViewButton' style='position:absolute;bottom:0px;left:36%;font-size:1.2em;'>View</a>" +
            					"<a class='km-button docDeleteButton' style='position:absolute;bottom:0px;left:34%;background:red;display:none !important;font-size:1.2em;color:white;'>Delete</a>" +
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
            			}
            			if (data.length > 0 && data.length < 4) {
            				$("#documents-list").append("<div style='display:block;width:100%;height:1px;box-shadow:0px 0px 5px #000;background:#000;clear:both;'></div>");
            			}

            			$("#documents-list li .docViewButton").kendoTouch({
            				tap: function(e) {
            					//window.plugins.childBrowser.showWebPage(encodeURI(e.touch.target.closest("li").find("#docPath").html()));
            					//inappbrowser = window.open(encodeURI(e.touch.target.closest("li").find("#docPath").html()), '_blank', 'location=yes,EnableViewPortScale=yes');
            					var docPath = e.touch.target.closest("li").find("#docPath").html();
            					console.log("Getting PDF");
                                console.log("Getting PDF path ",docPath);
                                inappbrowser = window.open(encodeURI(decodeURIComponent(docPath)), '_blank', 'location=no,EnableViewPortScale=yes');
            						inappbrowser.addEventListener('exit', function() {
            							inappbrowser = "";
            						});
            					//fbPDF.getPDF(docPath, '', 'downloads', true);
            				}
            			});
            			$(".shareDocBtn").kendoTouch({
            				tap: function(e) {
            					var btn = e.touch.target.closest(".shareDocBtn");
            					var docID = btn.closest("li").find("#docID").html();
            					if (btn.attr("src") === "images/icons/red.png") {
            						btn.attr("src", "images/icons/green.png");
            						shareUnshareDocument(docID, 1);
            					} else {
            						btn.attr("src", "images/icons/red.png");
            						shareUnshareDocument(docID, 0);
            					}
            				}
            			});
            			$(".shareDocDownloadBtn").kendoTouch({
            				tap: function(e) {
            					var btn = e.touch.target.closest("li").find(".shareDocBtn");
            					var btnDL = e.touch.target.closest(".shareDocDownloadBtn");
            					var docID = btn.closest("li").find("#docID").html();
            					var isDownloadable = 0;
            					if (btnDL.attr("src") === "images/icons/redDL.png") {
            						btnDL.attr("src", "images/icons/greenDL.png");
            						isDownloadable = 1;
            					} else {
            						btnDL.attr("src", "images/icons/redDL.png");
            						isDownloadable = 0;
            					}
            					setFileDownloadable(docID, isDownloadable);
            					/*
            					if(btn.attr("src") === "images/icons/red.png"){
            					shareUnshareDocument(docID, 0);
            					}
            					else{
            					shareUnshareDocument(docID, 1);
            					}
            					*/
            				}
            			});
            			$(".docDeleteButton").kendoTouch({
            				tap: function(e) {
            					e.preventDefault();
            					var btn = e.touch.target.closest("li").find(".docDeleteButton");
            					var docID = btn.closest("li").find("#docID").html();
            					var docTitle = btn.closest("li").find("#documentTitle").html();
            					navigator.notification.confirm("Are you sure you want to delete \"" + docTitle + "\"?", function(buttonIndex) {
            						if (buttonIndex === 2) {
                                        WebService.POST("wb_DeleteDocument", {
                                                DocumentID: docID
                                            }, function(resp) {
                                              if (resp === "success") {
            										btn.closest("li").remove();
            									} else {
            										Utils.alert("A server error has occured: " + JSON.stringify(error), "Error");
            									}                   
                                            }, function(error) {
                                                Utils.alert(error);
                                            });
            							}
            					}, "Delete Document", ["No", "Yes"]);
			        	}
			        });              
                }, function(error) {
                    Utils.alert(error);
                });
    
	
}
function setFileDownloadable(file, downloadable) {
	var theFile = {
		fileID: file,
		isDownloadable: downloadable
	};
	socket.emit("setFileDownloadable", theFile);
}
function shareUnshareDocument(id, action) {
    if (examIsActive) {
    	return;
    }
    var document = {};
    document.ID = id;
    document.Action = action;
    socket.emit("shareUnshareDocument", document);
    $("#currentScreen").html("Documents");
}
function getFullPath(path) {
	var fullPath = mainURL + "/" + path;
	return fullPath;
}
function editDocuments(e) {
	var btn = e.target.closest("a");
	if (btn.attr("isEdit") === "true") {
		//Show the edit buttons and turn this button into a "Done" button
        console.log("Done")
		btn.attr("isEdit", "false").html("Done");
		$(".docViewButton").hide();
		$(".docDeleteButton").show();
	} else {
		//Hide the edit buttons and turn this button back to "Edit"
        console.log("Edit")
		btn.attr("isEdit", "true").html("Edit");
		$(".docDeleteButton").hide();
		$(".docViewButton").show();
	}
}
//=================Documents  View================
$.prototype.toEnglish = function() {
	var arabicNumbers = [1632, 1633, 1634, 1635, 1636, 1637, 1638, 1639, 1640, 1641];
	var englishNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

	var num = "";

	for (var i = 0; i < $(this).val().length; i++) {
		if (arabicNumbers.indexOf($(this).val().charCodeAt(i)) > -1) {
			var index = arabicNumbers.indexOf($(this).val().charCodeAt(i));
			var engNum = englishNumbers[index];

			num += engNum.toString();
		} else {
			num += $(this).val().charAt(i);
		}
	}

	return num;
}
$.prototype.inputWithImage = function() {
	var input = $(this);
	var image = input.attr("imgSrc") === "" ? "images/icons/menu/camera.png" : (fileURL + input.attr("imgSrc")).replace("uploads/uploads/","uploads/");
	image = image.replace("/uploads/uploads/", "/uploads/");
	console.log("Image Source: " + image);
	input.wrap("<div class='inputContainer'></div>");
	var parent = input.closest(".inputContainer");
	parent.append("<div class='inputImage'></div>");
	parent.find(".inputImage").css("background-image", "url(" + image + ")").kendoTouch({
		tap: function(e) {
			var modal = e.touch.target.closest("div[data-role='modalview']").attr("id");
			var popoverName = "#" + modal.split("QuestionModal")[0] + "InputMethodPopover"; //ex: editQuestionModal --> editInputMethodPopopver
			console.log(popoverName);
			$(popoverName).data("kendoMobilePopOver").open(e.touch.target);
			choiceImageTarget = e.touch.target.closest(".inputImage");
		}
	});
};
/*=================================================*/
//=================Notes View================
function initNoteUnitsView(e) {
    
    var view = e.view.element;
    
    setTimeout(function() {
        view.find(".content").css("height", view.find(".km-content").height() - view.find(".topActions").outerHeight(true) + "px");
        view.find(".content").kendoMobileScroller();
        $(".studentsTotal").html(onlineStudents + "/" + totalStudents);
        $(".currentScreen").html(currentScreen);
    }, 0);
}
function showNoteUnitsView(e) {
    unitsDS.read({
        teacherID: currentUserID,
        subjectID: currentSubjectID,
        sectionID: currentSectionID,
        getAll: false
    });
}
function initNotesView(e) {
    
    var view = e.view.element;
    
    setTimeout(function() {
        view.find(".content").css("height", view.find(".km-content").height() - view.find(".topActions").outerHeight(true) + "px");
        view.find(".content").kendoMobileScroller();
        $(".studentsTotal").html(onlineStudents + "/" + totalStudents);
        $(".currentScreen").html(currentScreen);
    }, 0);
}
function showNotesView(e) {
    
    var view = e.view.element;
    
    var unitID = e.view.params.unitID || "0";
    var unit = e.view.params.unit || "";
    console.log("unitID " ,unitID)
    console.log("unit " ,unit)
    currentUnitID = unitID;
    
    view.find(".currentUnit").text(unit);
    
    /*notesDS.read({
        teacherID: currentUserID,
        subjectID: currentSubjectID,
        sectionID: currentSectionID,
        unitID: currentUnitID
    });
    */
    
}
function notesListBound(e) {
    var list = e.sender.element;
    
    list.find("li").each(function() {
        var li = $(this);
        
        li.find(".detailsContainer").css("height", li.find(".detailsContainer").width() - 50 + "px");
        li.find(".image").loadBackgroundImage(li.find(".image").attr("background-image"), "");
    });
}
function onclickStartNote(e, id) {
    Utils.handleClick(e);
    
  /*  var _note = notesDS.get(id);
    if(!_note) {
        return;
    }
    */
    Utils.navigate("#noteDetailsView?id=" + id);
}
//=================Presentations View================
/*=================================================*/
