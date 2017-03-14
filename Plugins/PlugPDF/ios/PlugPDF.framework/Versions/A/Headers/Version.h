/****************************************************************************
 **
 ** Copyright (C) 2013-2016 ePapyrus, Inc.
 ** All rights reserved.
 **
 ** This file is part of PlugPDF for iOS project.
 **
 ****************************************************************************/

#import <Foundation/Foundation.h>

/**
 * Version
 *
 * @file PlugPDF/Version.h
 *
 */
@interface PlugPDFVersion : NSObject

/**
 * Returns the full version number, e.g., 2.5.1.51 (92213b0)
 *
 */
+ (NSString *)getVersionName;

/**
 * Returns the major version number, e.g., 2.
 *
 */
+ (NSInteger)getMajorVersion;

@end
