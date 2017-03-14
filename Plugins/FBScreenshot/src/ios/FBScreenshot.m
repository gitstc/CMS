#import "FBScreenshot.h"
#import <Cordova/CDV.h>
#import <ImageIO/ImageIO.h>
#import <QuartzCore/QuartzCore.h>

@implementation FBScreenshot
@synthesize callbackId;

- (void)takeScreenshot:(CDVInvokedUrlCommand*)command
{
	double quality = 1.00 / [[command.arguments objectAtIndex:0] doubleValue];

    UIWindow *window = [[[UIApplication sharedApplication] windows] objectAtIndex:0];
	UIGraphicsBeginImageContextWithOptions(window.bounds.size, NO, quality);
    
    CGContextRef context = UIGraphicsGetCurrentContext();
    
    [window.layer renderInContext:context];
    UIImage *image = UIGraphicsGetImageFromCurrentImageContext();
    //UIImage *image = [UIImage imageWithCIImage:imageOrg.CIImage scale:1.0 orientation:UIImageOrientationUp];
    image = [self rotateUIImage:image clockwise:NO];
    UIGraphicsEndImageContext();
    NSData * data = UIImagePNGRepresentation(image);
    
    CDVPluginResult *res = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:[NSString stringWithFormat:@"data:image/png;base64,%@",[data base64Encoding]]];
    [self.webView stringByEvaluatingJavaScriptFromString:[res toSuccessCallbackString:command.callbackId]];
}

- (UIImage*)rotateUIImage:(UIImage*)sourceImage clockwise:(BOOL)clockwise
{
    CGSize size = sourceImage.size;
    UIGraphicsBeginImageContext(CGSizeMake(size.height, size.width));
    [[UIImage imageWithCGImage:[sourceImage CGImage] scale:1.0 orientation:clockwise ? UIImageOrientationRight : UIImageOrientationLeft] drawInRect:CGRectMake(0,0,size.height ,size.width)];
    UIImage* newImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    
    return newImage;
}

@end