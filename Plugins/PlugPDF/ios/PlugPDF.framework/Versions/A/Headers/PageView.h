/****************************************************************************
 **
 ** Copyright (C) 2013 ePapyrus, Inc.
 ** All rights reserved.
 **
 ** This file is part of the PlugPDF SDK for iOS.
 **
 ****************************************************************************/

#import "BaseTool.h"

/**
 * PlugPDFPageFitType
 *
 */
typedef NS_OPTIONS(NSUInteger, PlugPDFPageFitType) {
    PlugPDFPageFitMinimum       = 0,    // Fits to minimum scale, the maximum value is 1.0.
    PlugPDFPageFitWidth         = 1,    // Fits to width.
    PlugPDFPageFitHeight        = 2     // Fits to height.
};

@protocol PlugPDFAnnotEventDelegate;
@class PlugPDFPageViewDelegate;
@class PlugPDFDocumentView;
@class BaseAnnot;

/**
 * PlugPDFPageView
 *
 * @file PlugPDF/PageView.h
 *
 * The PlugPDFPageView class provides the basic PDF view for the iOS platform.
 *
 */
@interface PlugPDFPageView : UIScrollView

/**
 * A PlugPDFAnnotEventDelegate.
 *
 */
@property (nonatomic, weak) id <PlugPDFAnnotEventDelegate> annotEventDelegate;

/**
 * A PlugPDFPageViewDelegate.
 *
 */
@property (nonatomic, strong) PlugPDFPageViewDelegate *pageViewDelegate;

/**
 * A PlugPDFDocumentView.
 *
 */
@property (nonatomic, weak) PlugPDFDocumentView *documentView;

/**
 * The (zero-based) page index.
 *
 */
@property (nonatomic) NSInteger pageIdx;

/**
 * The fit type determining how to fit the page on the screen.
 *
 */
@property (nonatomic) PlugPDFPageFitType fitType;

/**
 * The page's image view.
 *
 */
@property (nonatomic, strong) UIImageView *imageView;

/**
 * The part page's image view.
 *
 */
@property (nonatomic, strong) UIImageView *tileView;

/**
 *
 * The minimum scale of the page.
 *
 */
@property (nonatomic) CGFloat minScale;

/**
 * The tap gesture of the page.
 *
 */
@property (nonatomic, strong) UITapGestureRecognizer *doubleTap;
@property (nonatomic, strong) UITapGestureRecognizer *singleTap;

/**
 * The press gesture of the page.
 *
 */
@property (nonatomic, strong) UILongPressGestureRecognizer *longPress;

/**
 * The swipe gesture of the page.
 *
 */
@property (nonatomic, strong) UISwipeGestureRecognizer *swipeLeft;
@property (nonatomic, strong) UISwipeGestureRecognizer *swipeRight;
@property (nonatomic, strong) UISwipeGestureRecognizer *swipeUp;
@property (nonatomic, strong) UISwipeGestureRecognizer *swipeDown;

/**
 * Initializes a PlugPDFDocumentView object with the passed-in data.
 *
 * @param frame
 *          The view's frame rectangle.
 * @param documentView
 *          A PlugPDFDocumentView instance.
 * @param pageIdx
 *          The (zero-based) page index.
 * @param fitType
 *          The fit type determining how to fit the page on the screen.
 *
 * @return
 *          A PlugPDFPageView instance initialized with the passed-in data, otherwise nil if the object can't be initialized.
 *
 */
- (id)initWithFrame: (CGRect)frame
       documentView: (PlugPDFDocumentView*)documentView
            pageIdx: (NSInteger)pageIdx
            fitType: (PlugPDFPageFitType)fitType
              scale: (CGFloat)scale
           zoomFlag:(BOOL)zoomFlag;


#pragma mark - view

/**
 * Shows the image/tile view.
 *
 */
- (void)showView;

/**
 * Hides the tile view.
 *
 */
- (void)setTileViewHidden;

/**
 * Indicates whether the page image is loaded or not.
 *
 */
- (BOOL)imageViewDidLoad;

- (void)setMImageView: (BOOL)imageView;

/**
 * Indicates whether the page image is loaded or not.
 *
 */
- (BOOL)tileImageViewDidLoad;

#pragma mark - zoom

/**
 * Sets the current page view to a scale fitting the screen.
 *
 * @param animated
 *          YES: the scrolling is animated; NO: the scrolling is not animated.
 *
 */
- (void)resetZoom: (BOOL)animated;

/**
 * Sets the current scale factor being applied to the scroll view's content, and scrolls to a specific area so that the content is visible.
 *
 * @param point
 *          Defines the content view's area. Must be set in the scroll view's coordinate space.
 * @param scale
 *          Determines how much the content is scaled.
 * @param animated
 *          YES if the scrolling is animated; otherwise NO.
 *
 */
- (void)zoomToPoint: (CGPoint)point scale: (CGFloat)scale animated: (BOOL)animated;

- (CGFloat)pageScale;

#pragma mark - search

/**
 * Displays the hit view.
 *
 * @param hits
 *          An NSArray object. Every hit is added to the NSArray object as a CGRect object.
 */
- (void)showHitView: (NSArray*)hits;

/**
 * Deletes the hit view.
 *
 */
- (void)deleteHitView;

/**
 * Sets whether the hit view is hidden or not.
 *
 * @param hidden
 *          YES: hide the hit view; NO: show the hit view.
 *
 */
- (void)setHitViewHidden: (BOOL)hidden;

#pragma mark - edit

/**
 * Releases the annotation tool.
 *
 * @param tool
 *          The annotation tool to be released from the view. This value is defined by the PlugPDFTool enumeration.
 *
 */
- (void)releaseTool: (PlugPDFTool)tool;

/**
 * Sets the annotation tool.
 *
 * @param tool
 *          The annotation tool to be set on the view, whose value is available in the PlugPDFTool enumeration.
 *
 */
- (void)setTool: (PlugPDFTool)tool;

/**
 * Sets the annotation tool with an extra value.
 *
 * @param tool
 *          The annotation tool to be set on the view, whose value is available in the PlugPDFTool enumeration.
 * @param value
 *          The value to initialize the annotation tool with.
 *
 */
- (void)setTool: (PlugPDFTool)tool withExtraValue: (NSValue*)value;

#pragma mark - annotation

/**
 * Loads the annotation and adds a subview to the passed-in page index.
 * Call this method before calling 'annots:'
 *
 * @param pageIdx
 *          The zero-based page index to be loaded.
 *
 */
- (void)loadAnnots;

/**
 * Given an annotation id and a page index, removes the corresponding annotation.
 *
 * @param annot
 *          The annotation id to be removed.
 *
 */
- (void)removeAnnot: (BaseAnnot*)annot;

/**
 * Adds an annotation to a page.
 *
 * @param annot
 *          The annotation id to be added.
 *
 */
- (void)addAnnot: (BaseAnnot*)annot;

/**
 * Sets whether or not the annotation is hidden.
 *
 * @param  hidden
 *          YES: hide the annotation; NO: show the annotation.
 *
 */
- (void)setAnnotHidden: (BOOL)hidden;

#pragma mark - extract text

/**
 * Returns an NSDictionary object containing the results of the text extraction.
 *
 * @param rect
 *          The rect from which to extract text; CGRectZero means to extract all the text from the page.
 * @param offset
 *          The PlugPDFDocumentView's offset point; CGPointZero when using the PlugPDFDocumentViewController class.
 *
 * @return
 *          An NSDictionary object containing the extraction results; otherwise the nil value.
 *          @"Text"; the key for getting an NSString object.
 *          @"Rects"; the key for getting an NSArray object containing a CGRectValue for every character.
 *
 * @throw NoCopyContentsPermission
 *          Thrown when there aren't enough permissions (copy/extract) to perform this operation.
 *
 */
- (NSDictionary*)extractTextAndRectsInRect: (CGRect)rect withOffset: (CGPoint)offset;

/**
 * Returns an NSString object with the result of the text extraction.
 *
 * @param rect
 *          The rect from which to extract some text; CGRectZero means to extract all the text from the page.
 * @param offset
 *          The PlugPDFDocumentView's offset point; CGPointZero when using the PlugPDFDocumentViewController class.
 *
 * @return
 *          An NSString object containing the extraction results; otherwise the nil value.
 *
 * @throw NoCopyContentsPermission
 *          Thrown when there aren't enough permissions (copy/extract) to perform this operation.
 *
 */
- (NSString*)extractTextInRect: (CGRect)rect withOffset: (CGPoint)offset;

@end
