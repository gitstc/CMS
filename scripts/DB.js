var DB = {
    db: null,
    initDB: function(isTeacher, callback) {
        if(navigator.simulator || !window["sqlitePlugin"]) {
            DB.db = window.openDatabase("CMSDB", "1.0", "CMSDB", 2000000);
            initSQLite(isTeacher);
        }
        else {
            DB.db = window.sqlitePlugin.openDatabase({
                name: "CMSDB"
            }, function(){
                initSQLite(isTeacher);
            });
        }
        
        function initSQLite(_isTeacher) {
            DB.db.transaction(function(tx) {
                //Preferences Table
                tx.executeSql("CREATE TABLE IF NOT EXISTS Preferences(Key TEXT, Value TEXT)");
                
                if(_isTeacher !== null) {
                    //Student Tables
                    if(!_isTeacher) {
                        //Presentations Table
                        //Documents Table
                        //ExamCache Table
                        //StudentsNotes Table
                        tx.executeSql('drop table Documents');
                        tx.executeSql('drop table Presentations');
                        tx.executeSql("CREATE TABLE IF NOT EXISTS Presentations(ID Integer, PresentationID Integer, SubjectID Integer, SubjectA, SubjectE, SectionID Integer, Section, LevelID Integer, Level, YearID Integer, Year, SemesterID Integer, Semester, StudentID Integer, Student, Title, Date, SlideContent Text, SlideType Integer, SlideIndex Integer, isLocal Integer, Thumbnail, Note Text)");
                        tx.executeSql('CREATE TABLE IF NOT EXISTS Documents(ID INTEGER PRIMARY KEY, SubjectID Integer, SubjectA, SubjectE, SectionID Integer, Section, LevelID Integer, Level, YearID Integer, Year, SemesterID Integer, Semester, StudentID Integer, Student, Name,Description,Path)');
                        tx.executeSql('CREATE TABLE IF NOT EXISTS ExamCache(ExamID INT, ExamData TEXT)');
                    }
                    
                    //Teacher Tables
                    if(_isTeacher) {
                        //Link Table
                        tx.executeSql('drop table Documents');
                        tx.executeSql('drop table Presentations');
        		        tx.executeSql('CREATE TABLE IF NOT EXISTS Links(ID INTEGER PRIMARY KEY, Link, Title)');
                        tx.executeSql('CREATE TABLE IF NOT EXISTS Notes(ID INTEGER PRIMARY KEY, Date, Title, Note)');
                        tx.executeSql('CREATE TABLE IF NOT EXISTS StudentsNotes(ID INTEGER, StudentID INTEGER, Student TEXT, SubjectID INTEGER, Subject TEXT, SectionID INTEGER, Section TEXT, Date TEXT, Title TEXT, Note TEXT)');
                        tx.executeSql("CREATE TABLE IF NOT EXISTS Presentations(ID Integer, PresentationID Integer, SubjectID Integer, SubjectA, SubjectE, SectionID Integer, Section, LevelID Integer, Level, YearID Integer, Year, SemesterID Integer, Semester, StudentID Integer, Student, Title, Date, SlideContent Text, SlideType Integer, SlideIndex Integer, isLocal Integer, Thumbnail, Note Text)");
                        tx.executeSql('CREATE TABLE IF NOT EXISTS Documents(ID INTEGER PRIMARY KEY, SubjectID Integer, SubjectA, SubjectE, SectionID Integer, Section, LevelID Integer, Level, YearID Integer, Year, SemesterID Integer, Semester, StudentID Integer, Student, Name,Description,Path)');
                        tx.executeSql('CREATE TABLE IF NOT EXISTS ExamCache(ExamID INT, ExamData TEXT)');
                    }
                }
                
            }, function(error) {
                console.log("initSQLite Error: " + JSON.strinigfy(error));
            }, function() {
                callback ? callback() : false;
            });
        }
        
    },
    getCurrentUser: function(callback) {
        DB.getPreference("Username", function(username) {
            if(username === "") {
                callback ? callback(null) : false;
                return;
            }
            
            DB.getPreference("Password", function(password) {
                
                if(password === "") {
                    callback ? callback(null) : false;
                    return;
                }
                
                callback ? callback({
                    Username: username,
                    Password: password
                }) : false;
                
            });
        });
    },
    setCurrentUser: function(user, callback) {
        DB.setPreference("Username", user.Username, function(didSave) {
            if(!didSave) {
                return;
            }
            
            DB.setPreference("Password", user.Password, function(didSave) {
                if(didSave) {
                    console.log("User saved!");
                }
            });
        });
    },
    getPreference: function(preference, callback) {
        DB.db.transaction(function(tx) {
            tx.executeSql("SELECT Value FROM Preferences WHERE KEY = ?", [preference], function(tx, results) {
               
                var _preference = "";
                if(results.rows.length > 0){
                    _preference = results.rows.item(0).Value;
                }
                
                callback ? callback(_preference) : false;
                
            }, function(error) {
                callback ? callback("") : false;
            });
        });
    },
    setPreference: function(preferenceName, preferenceValue, callback) {
        DB.db.transaction(function(tx) {
            tx.executeSql("SELECT Value FROM Preferences WHERE Key = ?", [preferenceName], function(tx, results) {
               
                if(results.rows.length > 0) {
                    //UPDATE
                    tx.executeSql("UPDATE Preferences SET Value = ? WHERE Key = ?", [preferenceValue, preferenceName], function() {
                        callback ? callback(true) : false;
                    }, function(error) {
                        callback ? callback(false) : false;
                    });
                }
                else {
                    //INSERT
                    tx.executeSql("INSERT INTO Preferences (Key, Value) VALUES (?, ?)", [preferenceName, preferenceValue], function() {
                        callback ? callback(true) : false;
                    }, function(error) {
                        console.log("COULD NOT INSERT INTO PREFERENCES!", error);
                        callback ? callback(false) : false;
                    });
                }
                
            }, function(error) {
                callback ? callback(false) : false;
            });
        });
    },
    getLinks: function(callback) {
        DB.db.transaction(function(tx) {
            tx.executeSql("SELECT * FROM Links ORDER BY ID", [], function(tx, results) {
                
                var _links = [];
                for(var i=0; i<results.rows.length; i++) {
                    _links.push({
                        ID: parseInt(results.rows.item(i).ID || "0"),
                        Link: results.rows.item(i).Link,
                        Title: results.rows.item(i).Title
                    });
                }
                callback ? callback(_links) : false;
                
            }, function() {
                callback ? callback([]) : false;
            });
        });
    },
    saveLink: function(link, callback) {
        DB.db.transaction(function(tx) {
            tx.executeSql("INSERT INTO Links(Link, Title) VALUES(?,?)", [link.Link, link.Title], function(tx, results) {
                var _link = link;
                _link["ID"] = results.insertId;
                callback ? callback(_link) : false;
            }, function(error) {
                callback ? callback(false) : false;
            });
        });
    },
    deleteLink: function(linkID, callback) {
        DB.db.transaction(function(tx) {
            tx.executeSql("DELETE FROM Links WHERE ID = ?", [linkID], function(tx, results) {
                callback ? callback(true) : false;
            }, function(error) {
                callback ? callback(false) : false;
            });
        });
    },
    updateLink: function(link, callback) {
        DB.db.transaction(function(tx) {
            tx.executeSql("UPDATE Links SET Title = ?, Link = ? WHERE ID = ?", [link.Title, link.Link, link.ID], function(tx, results) {
                callback ? callback(true) : false;
            }, function(error) {
                callback ? callback(false) : false;
            });
        });
    },
    getPresentation: function(presentationID, callback) {
        DB.db.transaction(function(tx) {
            tx.executeSql("SELECT * FROM Presentations WHERE PresentationID = ? AND SubjectID IS NOT NULL AND SectionID IS NOT NULL AND SlideContent <> '' ORDER BY SlideIndex ASC", [presentationID], function(tx, results) {
                 var _slides = [];
                if(results.rows.length === 0){
                   callback ? callback(_slides) : false;
               }
              else{
                for(var i=0; i<results.rows.length; i++) {
                    var _slide = results.rows.item(i);
                    
                    _slides.push({
                        ID: _slide.ID,
                        Title: _slide.Title,
                        Date: _slide.Date,
                        SlideContent: _slide.SlideContent,
                        SlideType: _slide.SlideType,
                        SlideIndex: _slide.SlideIndex,
                        isLocal: _slide.isLocal,
                        Thumbnail: _slide.Thumbnail,
                        Note: _slide.Note
                    });
                }
                  callback ? callback(_slides) : false;
               }
                
                
            }, function(error) {
                callback ? callback(false) : false;
            });
        });
    },
    savePresentation: function(presentationData, callback) {
    
    }
}