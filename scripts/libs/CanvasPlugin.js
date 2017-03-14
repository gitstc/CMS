/*========

CanvasPlugin
---------------------
Firas Barakat - STC

$("#canvas").canvas({
    color: "#FF0000", //Defaults to "black"
    lineWidth: 4, //Defaults to 4
    shadowBlur: 5, //Defaults to 5
    onchange: function(data) {
        console.log(data.newPoint); //Indicates whether the canvas should start a new line or continue with the current one
        console.log(data.shouldErase); //If set to true, the canvas will erase its contents
        console.log(data.shouldClear); //If set to true, the canvas will clear all of its contents
        console.log(data.x); //The original x coordinate
        console.log(data.y); //The original y coordinate
        console.log(data.xPercent); //The % of the original x coordinate (used to maintain the same ratio)
        console.log(data.yPercent); //The % of the original y coordinate (used to maintain the same ratio)
        console.log(data.color); //The color used to draw the current line
        console.log(data.lineWidth); //The lineWidth of the current line
        console.log(data.canvasWidth); //The original canvas width (used for ratio calculations)
        console.log(data.canvasHeight); //The original canvas height (used for ratio calculations)

        //We can replicate this canvas be sending its data to a new canvas using the "draw" method
        $("#canvas2").data("canvas").draw(data);
    },
    enabled: true/false //Indicates whether draing on the canvas is allowed or not //Defaults to true
});

//Additional Functions
======================================================
draw:
Used to draw on the canvas by supplying a drawing object
------------------------------------------------------
$("#canvas").data("canvas").draw({
    newPoint: true,
    shouldErase: false,
    shouldClear: false,
    x: 12,
    y: 23,
    xPercent: 4.5,
    yPercent: 11.7,
    color: "black",
    lineWidth: 4,
    canvasWidth: 120,
    canvasHeight: 90
});

setColor:
Used to set the drawing color
NOTE: if you set the color to "eraser", the canvas will start erasing its contents and the "shouldErase" flag will be
      set to true
------------------------------------------------------
$("#canvas").data("canvas").setColor(color); //Sets the drawing color

clear:
Used to clear the entire canvas
------------------------------------------------------
$("#canvas").data("canvas").clear();

export:
Used to export the entire canvas as a BASE64 image string
------------------------------------------------------
$("#canvas").data("canvas").export(function(canvasImage) {});

enable:
Used to enable drawing on the canvas
------------------------------------------------------
$("#canvas").data("canvas").enable();

disabled:
Used to disable drawing on the canvas
------------------------------------------------------
$("#canvas").data("canvas").disable();

destroy:
Used to destroy the entire canvas and remove all the attached events
------------------------------------------------------
$("#canvas").data("canvas").destroy();

========*/

$.prototype.canvas = function(opts) {
    function Canvas(cnv, options) {
        options = options || {};

        this.options = options;

        var _this = this;

        _this.cnv = cnv;
        _this.cnv.width = $(cnv).width();
        _this.cnv.height = $(cnv).height();
        _this.ctx = _this.cnv.getContext("2d");
        _this.ctx.width = $(cnv).width();
        _this.ctx.height = $(cnv).height();
        _this.ctx.lineWidth = _this.options.lineWidth || 4;
        _this.ctx.lineJoin = 'round';
        _this.ctx.lineCap = 'round';
        _this.ctx.shadowBlur = _this.options.shadowBlur || 5;
        
        _this.enabled = _this.options.hasOwnProperty("enabled") ? _this.options.enabled : true;

        var pX, pY;
        var cX, cY;

        $(cnv).on("touchstart", function(startEvent) {
            if(!_this.enabled) {
                return;
            }
            
            try {
                startEvent.stopPropagation();
            } catch (ex) {
            }
            
            if(startEvent.offsetX) {
                cX = pX = startEvent.offsetX;
                cY = pY = startEvent.offsetY;
            }
            else {
                cX = pX = startEvent.originalEvent.touches[0].pageX - $(cnv).offset().left;
                cY = pY = startEvent.originalEvent.touches[0].pageY - $(cnv).offset().top;
            }

            _this.ctx.beginPath();
            _this.ctx.strokeStyle = _this.options.color || "black";

            if (!_this.shouldErase) {
                _this.ctx.quadraticCurveTo(pX, pY, (pX + cX) / 2, (pY + cY) / 2);
                _this.ctx.stroke();
            } else {
                _this.ctx.clearRect(cX, cY, _this.ctx.lineWidth * 5, _this.ctx.lineWidth * 5);
            }

            _this.options.onchange ? _this.options.onchange({
                                                                newPoint: true,
                                                                shouldErase: _this.shouldErase,
                                                                shouldClear: false,
                                                                x: cX,
                                                                y: cY,
                                                                xPercent: (cX / $(cnv).width()),
                                                                yPercent: (cY / $(cnv).height()),
                                                                color: _this.ctx.strokeStyle,
                                                                lineWidth: _this.ctx.lineWidth,
                                                                canvasWidth: $(cnv).width(),
                                                                canvasHeight: $(cnv).height()
                                                            }) : false;

            $(cnv).on("touchmove", function(moveEvent) {
                try {
                    moveEvent.stopPropagation();
                } catch (ex) {
                }
                
                if(!_this.enabled) {
                    return;
                }
                
                if(moveEvent.offsetX) {
                    cX = moveEvent.offsetX;
                    cY = moveEvent.offsetY;
                }
                else {
                    cX = moveEvent.originalEvent.touches[0].pageX - $(cnv).offset().left;
                    cY = moveEvent.originalEvent.touches[0].pageY - $(cnv).offset().top;
                }

                if (!_this.shouldErase) {
                    _this.ctx.quadraticCurveTo(pX, pY, (pX + cX) / 2, (pY + cY) / 2);
                    _this.ctx.stroke();
                } else {
                    _this.ctx.clearRect(cX, cY, _this.ctx.lineWidth * 5, _this.ctx.lineWidth * 5);
                }

                _this.options.onchange ? _this.options.onchange({
                                                                    newPoint: false,
                                                                    shouldErase: _this.shouldErase,
                                                                    shouldClear: false,
                                                                    x: cX,
                                                                    y: cY,
                                                                    xPercent: (cX / $(cnv).width()),
                                                                    yPercent: (cY / $(cnv).height()),
                                                                    color: _this.ctx.strokeStyle,
                                                                    lineWidth: _this.ctx.lineWidth,
                                                                    canvasWidth: $(cnv).width(),
                                                                    canvasHeight: $(cnv).height()
                                                                }) : false;

                pX = cX;
                pY = cY;
            });
        }).on("touchend mouseup", function() {
            $(cnv).off("touchmove mousemove");
        });
    }

    Canvas.prototype.setColor = function(color) {
        var _this = this;

        if (color === "eraser") {
            _this.shouldErase = true;
        } else {
            _this.shouldErase = false;
            _this.options.color = color;
            _this.ctx.strokeStyle = color;
        }
    }

    Canvas.prototype.draw = function(data) {
        var _this = this;
        
        if($.type(data) === "string") {
            try {
                data = JSON.parse(data);
            }
            catch(ex) {
                return;
            }
        }

        if (data.shouldClear) {
            _this.ctx.clearRect(0, 0, $(_this.cnv).width(), $(_this.cnv).height());
            return;
        }
        
        var ratio = $(_this.cnv).height() / data.canvasHeight;

        data.lineWidth = data.lineWidth * ratio;
        
        /*var calcWidth = Math.abs(($(_this.cnv).width() - data.canvasWidth) / 2);
        var calcHeight = Math.abs(($(_this.cnv).height() - data.canvasHeight) / 2);

        var computedX = data.xPercent * ($(_this.cnv).width() + calcWidth / 2 - calcWidth + ($(_this.cnv).offset().left / 2));
        var computedY = data.yPercent * ($(_this.cnv).height() - calcHeight + calcHeight / 2 + ($(_this.cnv).offset().top / 2));*/
        
        var computedX = data.xPercent * $(_this.cnv).width();// - $(_this.cnv).offset().left;
        var computedY = data.yPercent * $(_this.cnv).height();// - $(_this.cnv).offset().top;

        if (data.newPoint) {
            _this.ctx.beginPath();
            _this.ctx.strokeStyle = data.color || "black";
            _this.ctx.lineWidth = data.lineWidth;
        }

        if (!data.shouldErase) {
            _this.ctx.quadraticCurveTo(computedX, computedY, computedX, computedY);
            _this.ctx.stroke();
        } else {
            _this.ctx.clearRect(computedX, computedY, data.lineWidth * 5, data.lineWidth * 5);
        }
    }

    Canvas.prototype.clear = function() {
        var _this = this;

        _this.ctx.clearRect(0, 0, $(_this.cnv).width(), $(_this.cnv).height());

        _this.options.onchange ? _this.options.onchange({
                                                            newPoint: false,
                                                            shouldErase: false,
                                                            shouldClear: true,
                                                            x: 0,
                                                            y: 0,
                                                            xPercent: 0,
                                                            yPercent: 0,
                                                            color: "",
                                                            lineWidth: 0,
                                                            canvasWidth: 0,
                                                            canvasHeight: 0,
                                                        }) : false;
    }
    
    Canvas.prototype.export = function(callback) {
        var _this = this;
        
        var canvas = _this.cnv;
        
        var clone = $(document.createElement("canvas"));
        clone.attr("width", $(canvas).width());
        clone.attr("height", $(canvas).height());
        clone.css("width", $(canvas).width() + "px");
        clone.css("height", $(canvas).height() + "px");
        
        var cloneCtx = clone[0].getContext("2d");
        
        //Images that need to be loaded and redrawn on the clone canvas
        var images = [];
        
        var bgImage = $(canvas).css("background-image");
        if(bgImage && bgImage !== "" && bgImage !== "none") {
            try {
                bgImage = bgImage.match(/(?:\(['"]?)(.*?)(?:['"]?\))/)[1];
                images.push(bgImage);
            }
            catch(ex) {
                
            }
        }
        
        var mainImage = canvas.toDataURL("image/png");
        if(mainImage && mainImage !== "") {
            images.push(mainImage);
        }
        
        loadImages(images, function(_images) {
            for(var i=0; i<_images.length; i++) {
                var _image = _images[i];
                var _width = _image.width;
                var _height = _image.height;

                if(_image.width > _image.height) {
                    _width = _image.width * (clone.height() / _image.height);
                    _height = clone.height();
                }
                else {
                    _height = _image.height * (clone.width() / _image.width);
                    _width = clone.width();
                }
                
                cloneCtx.drawImage(_image, (clone.width() - _width) / 2, (clone.height() - _height) / 2, _width, _height);
            }
            
            callback ? callback(clone[0].toDataURL("image/png")) : false;
        });
        
        function loadImages(_images, _callback) {
            _images = _images.reverse();
            var _loadedImages = [];
            
            function checkLoad() {
                if(_images.length > 0) {
                    loadImage(images.pop());
                }
                else {
                    _callback ? _callback(_loadedImages) : false;
                }
            }
            
            function loadImage(_image) {
                var _img = new Image();
                _img.onload = function() {
                    _loadedImages.push(_img);
                    checkLoad();
                };
                _img.onerror = function(error) {
                    checkLoad();
                };
                _img.src = _image;
            }
            
            checkLoad();
        }
    }
    
    Canvas.prototype.enable = function() {
        var _this = this;
        _this.enabled = true;
    }
    
    Canvas.prototype.disable = function() {
        var _this = this;
        _this.enabled = false;
    }
    
    Canvas.prototype.destroy = function() {
        var _this = this;
        
        $(_this.cnv).off("touchstart touchmove mousemove touchend");
        _this.cnv = null;
        _this.clear();
    }
    
    console.log("CanvasPlugin - ", $(this).width() + " x " + $(this).height());

    var canvas = new Canvas($(this)[0], opts);
    $(this).data("canvas", canvas);
    return canvas;
}