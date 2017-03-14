/****************************************************************************
 **
 ** Copyright (C) 2014 ePapyrus, Inc.
 ** All rights reserved.
 **
 ** This file is part of the PlugPDF SDK for iOS.
 **
 ****************************************************************************/

#import <Foundation/Foundation.h>

@class PlugPDFCheckBoxField;

/**
 * PlugPDFCheckBoxFieldDrawDelegate
 *
 * @file PlugPDF/CheckBoxFieldDrawDelegate.h
 *
 */
@protocol PlugPDFCheckBoxFieldDrawDelegate <NSObject>
@optional

/**
 * Called when an annotation is tapped up.
 *
 * @param rect
 *
 * @param field
 *          The CheckBoxField object to be drawn.
 * 
 */
- (void)drawRect: (CGRect)rect field: (PlugPDFCheckBoxField*)field;

@end
