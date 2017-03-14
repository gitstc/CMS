/****************************************************************************
 **
 ** Copyright (C) 2014 ePapyrus, Inc.
 ** All rights reserved.
 **
 ** This file is part of the PlugPDF SDK for iOS.
 **
 ****************************************************************************/

#import <Foundation/Foundation.h>

@class PlugPDFDocumentView;

/**
 * PlugPDFDocumentViewEventDelegate
 *
 * @file PlugPDF/DocumentViewEventDelegate.h
 *
 */
@protocol PlugPDFDocumentViewEventDelegate <NSObject>
@optional

/**
 * Called when the page is about to be visible.
 *
 * @param documentView
 *          The PlugPDFDocumentView currently being displayed.
 * @param pageIdx
 *          The (zero-based) page index that will be changed.
 *
 * @return
 *          YES: custom action; NO: default tap action.
 *
 */
- (BOOL)pageWillChange: (PlugPDFDocumentView*)documentView pageIdx: (NSInteger)pageIdx;

/**
 * Called when the page has been changed.
 *
 * @param documentView
 *          The PlugPDFDocumentView currently being displayed.
 * @param pageIdx
 *          The (zero-based) page index that has changed.
 *
 */
- (void)pageDidChange: (PlugPDFDocumentView*)documentView pageIdx: (NSInteger)pageIdx;

/**
 * Called when the page has been drawn.
 *
 * @param documentView
 *          The PlugPDFDocumentView currently being drawn.
 * @param pageIdx
 *          The (zero-based) page index that has changed.
 *
 */
- (void)pageDidLoad: (PlugPDFDocumentView*)documentView pageIdx: (NSInteger)pageIdx;


/**
 * Called when the thumbnail view's table cell has been in the specified index path.
 *
 */
- (void)thumbnailViewDidScroll: (PlugPDFDocumentView*)documentView tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath;

/**
 * Called when the document view is tapped up.
 *
 * @param singleTap
 *      A UITapGestureRecognizer instance.
 *
 * NO: the default action is activated; YES: the default action is ignored.
 *
 */
- (BOOL)onSingleTap: (UITapGestureRecognizer*)singleTap view:(UIView*)view;

/**
 * Called when the document view is double tapped up.
 *
 * @param doubleTap
 *      A UITapGestureRecognizer instance.
 *
 * NO: the default action is activated; YES: the default action is ignored.
 *
 */
- (BOOL)onDoubleTap: (UITapGestureRecognizer*)doubleTap view:(UIView*)view;

/**
 * Called when the document view is long pressed.
 *
 * @param longPress
 *      A UILongPressGestureRecognizer instance.
 *
 * NO: the default action is activated; YES: the default action is ignored.
 *
 */
- (BOOL)onLongPress: (UILongPressGestureRecognizer*)longPress view:(UIView*)view;

/**
 * Called when the document view is swiped.
 *
 * @param swipe
 *      A UISwipeGestureRecognizer instance.
 *
 * NO: the default action is activated; YES: the default action is ignored.
 *
 */
- (BOOL)onSwipe: (UISwipeGestureRecognizer*)swipe;

/**
 *
 * Called when an annotation is added.
 *
 * @param annot
 *      A BaseAnnot instance.
 */

- (void)AnnotisAdded: (UIControl*)annot;

/**
 *
 * Called when an annotation is removed.
 *
 * @param annot
 *      A BaseAnnot instance.
 */

- (void)AnnotisRemoved: (UIControl*)annot;

@end
