$(function() {
    
    document.addEventListener("deviceready", function() {
        var isAndroid = device.platform.toLowerCase() === "android";
        
        function repositionKeyboard(kbEvent) {
            try {
                var input = $(":focus");
                
                if(input.length === 0) {
                    console.log("No focused element found!");
                    return;
                }
                
                var inputHeight = input.outerHeight(true);
                var inputTop = input[0].getBoundingClientRect().top;
                var inputOffset = inputHeight + inputTop;
                var kbOffset = $(window).height();
                
                //iOS ONLY
                if (!isAndroid) {
                    kbOffset -= kbEvent.keyboardHeight;
                }
                
                if (inputOffset > kbOffset) {
                    var offset = kbOffset - inputOffset;
                    
                    var parentView = input.closest(".km-view");
                    if(parentView.hasClass("km-modalview")) {
                        parentView = parentView.data("kendoMobileModalView");
                    }
                    else {
                        parentView = parentView.data("kendoMobileView");
                    }
                    
                    var scroller = input.closest(".km-scroller").data("kendoMobileScroller") || parentView.scroller;
                    if (scroller) {
                        scroller.animatedScrollTo(0, offset);
                        scroller.scrollElement.parent().attr("kbInput", true);
                    }
                }
                
                input.attr("kbInput", true);
            }
            catch(ex) {
                console.log("Reposition Exception: " + JSON.stringify(ex));
            }
        }
        
        try {
            cordova.plugins.Keyboard.disableScroll(true);
            window.addEventListener("native.keyboardshow", function(kbEvent) {
                
                $("input").bind("focus", function() {
                    onFocus($(this));
                });
                $("textarea").bind("focus", function() {
                    onFocus($(this));
                });
                
                function onFocus() {
                    var view = app.view().element;
                    
                    setTimeout(function() {
                        
                        repositionKeyboard(kbEvent);
                        view.find(".km-footer").hide();
                        
                    }, 50);
                }
                
                setTimeout(function() {
                    repositionKeyboard(kbEvent);
                }, 50);
            });
            window.addEventListener("native.keyboardhide", function(kbEvent) {
                var view = app.view().element;
                
                setTimeout(function() {
                    view.find(".km-footer").show();
                
                    var input = $("[kbInput]");
                    var scroller = $(".km-scroll-wrapper[kbInput]");
                
                    input.removeAttr("kbInput");
                    scroller.fixScroll();
                    
                    $("input").unbind("focus");
                    $("textarea").unbind("focus");
                }, 0);
            });
        } catch (ex) {
            console.log("Could not add keyboard fix!");
        }
    }, false);
    
    $.prototype.fixScroll = function() {
        try {
            var scroll = $(this);
            var scroller = scroll.data("kendoMobileScroller");
            
            if (!scroller) {
                return;
            }
            
            var scrollTop = scroller.scrollTop;
            var maxScrollTop = scroller.scrollHeight() - scroll.height();
            if (maxScrollTop < 0) {
                maxScrollTop = 0;
            }
            
            if (scrollTop > maxScrollTop) {
                scroller.animatedScrollTo(0, -maxScrollTop);
            } else if (scrollTop < 0) {
                scroller.animatedScrollTo(0, 0);
            }
        }
        catch(ex) {}
    };
});