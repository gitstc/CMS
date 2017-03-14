//
//  applicationPreferences.m
//  
//
//  Created by Tue Topholm on 31/01/11.
//  Copyright 2011 Sugee. All rights reserved.
//
// THIS HAVEN'T BEEN TESTED WITH CHILD PANELS YET.

#import "applicationPreferences.h"
#import <Cordova/CDV.h>

@implementation applicationPreferences

@synthesize callbackId;

-(void) initSettings
{
    @try{
        NSArray *settingsArr = [self getAllSettingsFromBundle];
        for(NSDictionary *setting in settingsArr){
            if([[setting allKeys] containsObject:@"Key"]){
                [[NSUserDefaults standardUserDefaults] setValue:[setting objectForKey:@"DefaultValue"] forKey:[setting objectForKey:@"Key"]];
            }
        }
        self.isInitialized = YES;
    }
    @catch(NSException *e){

    }
}

-(void) getSetting:(CDVInvokedUrlCommand*)command
{
    self.callbackId = command.callbackId;
    NSArray *arguments = command.arguments;
    
    NSString *settingsName = [arguments objectAtIndex:0];

    NSLog([NSString stringWithFormat:@"Getting Value For Key: %@",settingsName]);

    @try
    {
        if(![self initialized]){
            [self initSettings];
        }
        NSString *returnVar = [[NSUserDefaults standardUserDefaults] stringForKey:settingsName];
		NSLog([NSString stringWithFormat:@"Value For Key '%@' = '%@'",settingsName,returnVar]);
        if(returnVar == nil)
        {
            CDVPluginResult* result = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString:[NSString stringWithFormat:@"Key not found"]];
    		[self.webView stringByEvaluatingJavaScriptFromString:[result toErrorCallbackString: self.callbackId]];
        }
        else
        {
            CDVPluginResult* result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsString:[NSString stringWithFormat:@"%@",returnVar]];
    		[self.webView stringByEvaluatingJavaScriptFromString:[result toSuccessCallbackString: self.callbackId]];
        }
    }
    @catch(NSException* e)
    {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString:[NSString stringWithFormat:@"%@",[e reason]]];
    	[self.webView stringByEvaluatingJavaScriptFromString:[result toErrorCallbackString: self.callbackId]];
    }
}


-(void) setSetting:(CDVInvokedUrlCommand*)command
{
    self.callbackId = command.callbackId;
    NSArray *arguments = command.arguments;

    NSString *settingsName = [arguments objectAtIndex:0];
    NSString *settingsValue = [arguments objectAtIndex:1];

    @try 
    {
        if(![self initialized]){
            [self initSettings];
        }
        [[NSUserDefaults standardUserDefaults] setValue:settingsValue forKey:settingsName];
        CDVPluginResult* result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK];
    	[self.webView stringByEvaluatingJavaScriptFromString:[result toSuccessCallbackString: self.callbackId]];
    }
    @catch (NSException * e) 
    {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString:[NSString stringWithFormat:@"%@",[e reason]]];
    	[self.webView stringByEvaluatingJavaScriptFromString:[result toErrorCallbackString: self.callbackId]];
    }
}
/*
Parsing the Root.plist for the key, because there is a bug/feature in Settings.bundle
So if the user haven't entered the Settings for the app, the default values aren't accessible through NSUserDefaults.
*/


- (NSString*)getSettingFromBundle:(NSString*)settingsName
{
    NSString *pathStr = [[NSBundle mainBundle] bundlePath];
    NSString *settingsBundlePath = [pathStr stringByAppendingPathComponent:@"Settings.bundle"];
    NSString *finalPath = [settingsBundlePath stringByAppendingPathComponent:@"Root.plist"];

    NSDictionary *settingsDict = [NSDictionary dictionaryWithContentsOfFile:finalPath];
    NSArray *prefSpecifierArray = [settingsDict objectForKey:@"PreferenceSpecifiers"];
    NSDictionary *prefItem;
    for (prefItem in prefSpecifierArray)
    {
        if ([[prefItem objectForKey:@"Key"] isEqualToString:settingsName]) 
            return [prefItem objectForKey:@"DefaultValue"];                
    }
    return nil;
}
- (NSArray *)getAllSettingsFromBundle
{
    NSString *pathStr = [[NSBundle mainBundle] bundlePath];
    NSString *settingsBundlePath = [pathStr stringByAppendingPathComponent:@"Settings.bundle"];
    NSString *finalPath = [settingsBundlePath stringByAppendingPathComponent:@"Root.plist"];

    NSDictionary *settingsDict = [NSDictionary dictionaryWithContentsOfFile:finalPath];
    NSArray *prefSpecifierArray = [settingsDict objectForKey:@"PreferenceSpecifiers"];
    return prefSpecifierArray;
}
- (BOOL)initialized{
    @try{
        if(![[NSUserDefaults standardUserDefaults] boolForKey:@"udExists"]){
            [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"udExists"];
            return NO;
        }
        return YES;
    }
    @catch(NSException *ex){
        NSLog(@"Preferences Initialized Error: %@", ex.description);
    }
    return NO;
}
@end