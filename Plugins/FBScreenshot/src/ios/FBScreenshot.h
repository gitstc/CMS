#import <Cordova/CDVPlugin.h>
#import <ImageIO/ImageIO.h>


@interface FBScreenshot : CDVPlugin {
    NSString* callbackId;
}

@property (nonatomic, copy) NSString* callbackId;

- (void) takeScreenshot:(CDVInvokedUrlCommand*)command;

@end