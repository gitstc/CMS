/****************************************************************************
 **
 ** Copyright (C) 2013 ePapyrus, Inc.
 ** All rights reserved.
 **
 ** This file is part of the PlugPDF SDK for iOS.
 **
 ****************************************************************************/

#import <UIKit/UIKit.h>

#import "AnnotEventDelegate.h"

@class PlugPDFDocumentView;
@class PlugPDFDocument;

typedef NS_OPTIONS(NSUInteger, ANNOT_BORDER_SYTLE) {
    ANNOT_BORDER_SYTLE_SOLID = 0,
    ANNOT_BORDER_SYTLE_DASHED,
    ANNOT_BORDER_SYTLE_BEVELED,
    ANNOT_BORDER_SYTLE_INSET,
    ANNOT_BORDER_SYTLE_UNDERLINE
};

/**
 * PlugPDFDocumentEraserType
 *
 */
typedef NS_OPTIONS(NSUInteger, PlugPDFDocumentEraserType) {
    PlugPDFDocumentEraserTypeBasic                 = 0,    // Eraser tool with Drag,singletap and selected area event.
    PlugPDFDocumentEraserTypeSelectedArea          = 1,    // Eraser tool with selected area event.
    PlugPDFDocumentEraserTypeClickWithDrag         = 2    // Eraser tool with Drag and singletap event.
};

/**
 * BaseAnnot
 *
 * @file PlugPDF/BaseAnnot.h
 *
 * A BaseAnnot object represents a PDF file's annotation.
 * 
 */
@interface BaseAnnot : UIControl

/**
 *  The BaseAnnot event's delegate.
 * 
 */
@property (nonatomic, weak) id <PlugPDFAnnotEventDelegate> delegate;

/**
 *  A PlugPDFDocumentView object.
 * 
 */
@property (nonatomic, weak) PlugPDFDocumentView *documentView;

/**
 *  A PlugPDFDocument object.
 * 
 */
@property (nonatomic, weak) PlugPDFDocument *document;

/**
 * The annotation's object id.
 * 
 */
@property (nonatomic) NSInteger objID;

/**
 * The annotation's rect.
 * 
 */
@property (nonatomic) CGRect rect;

/**
 * The page index that the current annotation belongs to.
 * 
 */
@property (nonatomic, readwrite) NSInteger pageIdx;

/**
 * The drawing annotation's scale.
 * 
 */
@property (nonatomic) CGFloat scale;

/**
 * Initializes a BaseAnnot object setting the delete context menu.
 *
 * @param rect
 *          The annotation's rect.
 * @param pageIdx
 *          The zero-based page index that the current annotation belongs to.
 *
 * @return
 *          A BaseAnnot instance; otherwise nil if the object cannot be initialized.
 * 
 */
- (id)initWithRect: (CGRect)rect pageIdx: (NSInteger)pageIdx;

/**
 * Returns the drawing annotation's scale.
 *
 * @param frame
 *          The superview frame's CGRect vaue.
 *
 * @return 
 *          A CGFloat value; otherwise 0.0 if the documentView is not set.
 * 
 */
- (CGFloat)getScale: (CGRect)frame;

/**
 * Called when the annotation is tapped up.
 *
 * @param sender
 *          A UITapGestureRecognizer instance.
 *
 * @return 
 *          YES: custom action; NO: default tap action.
 * 
 */
- (BOOL)onTapUp: (id)sender;

/**
 * Called when the annotation is long-pressed.
 *
 * @param sender
 *          A UILongPressGestureRecognizer instance.
 *
 * @return
 *          YES: custom action; NO: default action.
 * 
 */
- (BOOL)onLongPress: (id)sender;

/**
 * Shows the delete context menu.
 * 
 */
- (BOOL)showContextMenu;

/**
 * Closes the context menu.
 * 
 */
- (void)onCloseContextMenu: (id)sender;

/**
 * Deletes the current annotation.
 * 
 */
- (void)onContextMenuDelete: (id)sender;

/**
 * Removes the annotation from the PDF document and the page view.
 * 
 */
- (void)removeAnnot;

/**
 * Saves the annotation.
 * 
 */
- (void)saveAnnot;

- (CGRect) annotFrameRect: (CGRect) superViewFrame;


/**
 * Redraws the annotation.
 * 
 */
- (void)refresh;

@end
