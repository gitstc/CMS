/****************************************************************************
 **
 ** Copyright (C) 2013 ePapyrus, Inc.
 ** All rights reserved.
 **
 ** This file is part of the PlugPDF SDK for iOS.
 **
 ****************************************************************************/

/**
 * @mainpage PlugPDF SDK
 *
 * @section Introduction
 * - The PlugPDF SDK brings a high quality PDF engine into your mobile applications with just a few lines of code.
 * @section Creation information
 * - author : The PlugPDF Team
 * - homepage : http://www.plugpdf.com
 *
 * @file PlugPDF/PlugPDF.h
 *
 */

#ifndef __PLUG_PDF_H__
#define __PLUG_PDF_H__

#ifdef __cplusplus
extern "C" {
#endif

/**
 * Initializes the PlugPDF framework.
 * 
 * This is the initialization method to be called just before calling any PDF processing function.
 * A valid license is required for building mobile PDF applications with PlugPDF, there are currently three different options available:
 * - Free Trial : https://plugpdf.com/download/
 * - Indie license : https://plugpdf.com/indie-license-req/
 * - Purchase: https://plugpdf.com/order/
 *
 * @param key
 *          A valid product license key.
 * 
 * @throw LicenseInvalid
 *          Thrown when the product license key is not valid.
 * @throw LicenseWrongProductVersion
 *          Thrown when there is an attempt to use a non-supported product license key.
 * @throw LicenseTrialTimeOut
 *          Thrown when the trial license key is expired.
 * @throw LicenseUnusableSDKVersion
 *          Thrown when there is an attempt to initialize a non-supported PlugPDF SDK version.
 * @throw LicenseUnusableOS
 *          Thrown when there is an attempt to initialize a non-supported OS.
 * @throw LicenseMismatchAppID
 *          Thrown when the product license key doesn't contain any application ID.
 *
 */
void PlugPDFInit(char *key);

/**
 * Enables a handler interface to be invoked when the app abruptly terminates because of an uncaught exception.
 * When an uncaught exception occurs, the PlugPDF SDK creates a log file in the application sandbox.
 */
void enableUncaughtExceptionHandler();

/**
 * Checks for updates.
 * 
 * If the newest PlugPDF version is not detected, a pop-up message is displayed when loading the view.
 *
 * @param enabled
 *          YES to check for updates, NO to skip the update checking.
 *
 */
//void setUpdateCheckEnabled(BOOL enabled);
    
/**
 * Font mapping.
 * 
 * Sets a font file from the passed-in url.
 *
 * @param url
 *          An NSURL object containing a valid TrueType font's path.
 */
void setFontMappingPath(NSURL *url);
    
/**
 * Releases from memory all resources allocated by PlugPDF.
 */
void PlugPDFUninit();

#ifdef __cplusplus
}
#endif

#import <Foundation/Foundation.h>

/**
 * PlugPDF
 *
 * @file PlugPDF/PlugPDF.h
 *
 */
@interface PlugPDF : NSObject

/**
 * Initializes the PlugPDF framework.
 * 
 * This is the initialization method to be called just before calling any PDF processing function.
 *
 * @param key
 *          A valid product license key.
 *
 * @throw LicenseInvalid
 *          Thrown when the product license key is not valid.
 * @throw LicenseWrongProductVersion
 *          Thrown when there is an attempt to use a non-supported product license key.
 * @throw LicenseTrialTimeOut
 *          Thrown when the trial license key is expired.
 * @throw LicenseUnusableSDKVersion
 *          Thrown when there is an attempt to initialize a non-supported PlugPDF SDK version.
 * @throw LicenseUnusableOS
 *          Thrown when there is an attempt to initialize a non-supported OS.
 * @throw LicenseMismatchAppID
 *          Thrown when the product license key doesn't contain any application ID.
 *
 */
+ (void)init: (NSString*)key;

/**
 * Enables a handler interface to be invoked when the app abruptly terminates because of an uncaught exception.
 * When an uncaught exception occurs, the PlugPDF SDK creates a log file in the application sandbox.
 */
+ (void)setEnableUncaughtExceptionHandler;

/**
 * Checks for updates.
 * 
 * If the newest PlugPDF version is not detected, a pop-up message is displayed when loading the view.
 *
 * @param enabled
 *          YES to check for updates, NO to skip the update checking.
 *
 */
//+ (void)setUpdateCheckEnabled: (BOOL)enabled;

/**
 * Font mapping.
 * 
 * Sets a font file from the passed-in url.
 *
 * @param url
 *          An NSURL object containing a valid TrueType font's path.
 */
+ (void)setFontMappingPath: (NSURL*)url;

/**
 * Releases from memory all resources allocated by PlugPDF.
 */
+ (void)uninit;

@end

#endif //__PLUG_PDF_H__
