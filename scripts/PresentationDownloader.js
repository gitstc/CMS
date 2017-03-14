function DownloadManager(batch) {
    this.slides = batch;
}
DownloadManager.prototype.download = function(callback) {
    
    var downloadedSlides = [];
    
    var slides = this.slides;
    
    for(i in slides) {
        var downloadTask = new DownloadTask(slides[i]);
        downloadTask.download(function(downloadedSlide){
            downloadTask = null;
            downloadedSlides.push(downloadedSlide);
            checkDownloadProgress();
        });
    }
    
    function checkDownloadProgress() {
        if(downloadedSlides.length === slides.length) {
            callback ? callback(downloadedSlides) : false;
        }
    }
}

function DownloadTask(slide) {
    this.slide = slide;
}
DownloadTask.prototype.download = function(callback) {
    
    //update to get all of the downloads for the current slide
    
    var slide = this.slide;
    
    console.log("***slide*** ", slide);
    
    var slidesDownloadPath = "Presentations";
    var downloadPath = cordova.file.dataDirectory + "/" + slidesDownloadPath;
    
    var slideType = parseInt(slide.SlideType || 1);
    var isLocal = Boolean(slide.isLocal);
    
    var slideContent = [];
    
    if(isLocal) {
        switch(slideType) {
            case 1: //image
                slideContent.push({
                    originalURL: slide.SlideContent,
                    localURL: ""
                });
                break;
            case 6: //custom content
                var innerURLs = getURLs(slide.SlideContent);
                $.each(innerURLs, function(i, innerURL) {
                    slideContent.push({
                        originalURL: innerURL,
                        localURL: ""
                    });
                });
                break;
        }
    }
    
    var downloadedContent = [];
    
    function checkDownloadSlideContent() {
        if(slideContent.length > 0) {
            downloadSlideContent(slideContent.pop());
        }
        else {
            //update slide content with localURL
            $.each(downloadedContent, function(i, content) {
                console.log("Replace " + content.originalURL + " with " + content.localURL);
                slide.SlideContent = slide.SlideContent.replace(content.originalURL, content.localURL);
            });
            callback ? callback(slide) : false;
        }
    }
    
    function downloadSlideContent(currentSlideContent) {
        console.log("downloadSlideContent ", currentSlideContent);
        var ft = new FileTransfer();
        ft.download(
            encodeURI(mainURL + "/" + currentSlideContent.originalURL),
            downloadPath + "/" + slide.PresentationID + "-" + slide.ID + slide.SlideContent.substring(slide.SlideContent.lastIndexOf(".")),
            function(localPath) {
                console.log("Downloaded ", localPath.toURL());
                currentSlideContent.localURL = localPath.toURL();
                downloadedContent.push(currentSlideContent);
                checkDownloadSlideContent();
            },
            function(error) {
                console.log("Download Error ", error);
                currentSlideContent.localURL = currentSlideContent.originalURL;
                downloadedContent.push(currentSlideContent);
                checkDownloadSlideContent();
            }
        );
    }
    
    checkDownloadSlideContent();
}

var PresentationDownloader = {
    downloadedContent: [],
    downloadPresentation: function(content, callback) {
        //download all of the content
        //downlad all of the subcontent (type == 6)
        //callback an array of all of the slides with the local path
        
        var self = this;
        
        var slides = $.merge(content, []);
        
        function checkDownloadContent() {
            if(slides.length > 0) {
                self.downloadContent(slides.splice(0, 5), function() {
                    checkDownloadContent();
                });
            }
            else {
                //all of the slides have been downloaded
                callback ? callback(self.downloadedContent) : false;
            }
        }
        
        checkDownloadContent();
    },
    downloadContent: function(slides, callback) {
        
        var self = this;
        
        var downloadManager = new DownloadManager(slides);
        downloadManager.download(function(downloadedSlides) {
            //self.downloadedContent.push(downloadedSlides);
            downloadManager = null;
            self.downloadedContent = $.merge(self.downloadedContent, downloadedSlides);
            callback ? callback() : false;
        });
    }
}