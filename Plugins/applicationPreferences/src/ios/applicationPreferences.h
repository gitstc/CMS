//
//  applicationPreferences.h
//  
//
//  Created by Tue Topholm on 31/01/11.
//  Copyright 2011 Sugee. All rights reserved.
//

#import <Foundation/Foundation.h>

#import <Cordova/CDVPlugin.h>

@interface applicationPreferences : CDVPlugin 
{

}
/*
-(void) getSetting:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
-(void) setSetting:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
-(NSString*) getSettingFromBundle:(NSString*)settingName;
*/

@property (nonatomic) BOOL isInitialized;
@property (nonatomic, copy) NSString* callbackId;

-(void) getSetting:(CDVInvokedUrlCommand*)command;
-(void) setSetting:(CDVInvokedUrlCommand*)command;
-(NSString*) getSettingFromBundle:(NSString*)settingName;

@end