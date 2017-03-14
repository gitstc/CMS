/****************************************************************************
 **
 ** Copyright (C) 2013 ePapyrus, Inc.
 ** All rights reserved.
 **
 ** This file is part of the PlugPDF SDK for iOS.
 **
 ****************************************************************************/

#import <UIKit/UIKit.h>

@class PlugPDFDocumentViewController;
@class PlugPDFDocumentView;

/**
 * Represents the tap action.
 * UIScrollViewDelegate is for gotoPage: mathod.
 * UITableViewDelegate is for PlugPDFDocumentDisplayModeThumbnail.
 *
 */
@protocol PlugPDFDocumentViewDelegate <UIScrollViewDelegate, UITableViewDelegate>
@optional

/**
 * Called when an document view is single tapped up.
 *
 * @param singleTap
 *      A UITapGestureRecognizer instance.
 *
 */
- (void)onSingleTap: (UITapGestureRecognizer*)singleTap __attribute__((deprecated));

/**
 * Called when an document view is double tapped up.
 *
 * @param doubleTap
 *      A UITapGestureRecognizer instance.
 *
 */
- (void)onDoubleTap: (UITapGestureRecognizer*)doubleTap __attribute__((deprecated));

@end

/**
 * PlugPDFDocumentViewDelegateBase
 *
 * @file PlugPDF/DocumentViewDelegate.h
 *
 * Base implementation of the PlugPDFDocumentViewDelegate.
 *
 */
@interface PlugPDFDocumentViewDelegateBase : NSObject<PlugPDFDocumentViewDelegate>

/**
 * A PlugPDFDocumentViewController.
 *
 */
@property (nonatomic, weak) PlugPDFDocumentViewController *documentViewController;

/**
 * A PlugPDFDocumentView.
 *
 */
@property (nonatomic, weak) PlugPDFDocumentView *documentView;

@end
