/****************************************************************************
 **
 ** Copyright (C) 2013 ePapyrus, Inc.
 ** All rights reserved.
 **
 ** This file is part of the PlugPDF SDK for iOS.
 **
 ****************************************************************************/

#import "PageView.h"
#import "BaseField.h"
#import "AnnotEventDelegate.h"
#import "TextSelectionEventDelegate.h"
#import "DocumentViewEventDelegate.h"
#import "DocumentViewDelegate.h"
#import "CheckBoxFieldDrawDelegate.h"
#import "NoteAnnot.h"
/**
 * PlugPDFDocumentDisplayMode
 *
 */
typedef NS_OPTIONS(NSUInteger, PlugPDFDocumentDisplayMode) {
    PlugPDFDocumentDisplayModeHorizontal     = 0,    // Displays one page per screen on the horizontal scroll view, at the center of the screen.
    PlugPDFDocumentDisplayModeVertical       = 1,    // Displays pages continuously on the non-paging vertical scroll view.
    PlugPDFDocumentDisplayModeThumbnail      = 2,    // Displays a thumbnail image on the table view.
    PlugPDFDocumentDisplayModeEBook          = 3,    // Displays two pages per screen horizontally.
    PlugPDFDocumentDisplayModeEBookVertical  = 4,    // Displays two pages per screen vertically.
    PlugPDFDocumentDisplayModeEBookCover     = 5     // Displays two pages per screen, the first one (cover) is displayed as one single page.
};


@class PlugPDFDocumentViewController;
@class PlugPDFDocument;
@class PlugPDFPageView;

/**
 * PlugPDFDocumentView
 *
 * @file PlugPDF/DocumentView.h
 *
 * The PlugPDFDocumentView class provides the basic PDF view.
 *
 */
@interface PlugPDFDocumentView : UIScrollView <UITableViewDataSource, UIPageViewControllerDelegate, UIPageViewControllerDataSource>

/**
 * A PlugPDFAnnotEventDelegate.
 *
 */
@property (nonatomic, weak) id <PlugPDFAnnotEventDelegate> annotEventDelegate;

/**
 * A PlugPDFTextSelectionEventDelegate.
 *
 */
@property (nonatomic, weak) id<PlugPDFTextSelectionEventDelegate> textSelectionEventDelegate;

/**
 * A PlugPDFDocumentViewEventDelegate.
 *
 */
@property (nonatomic, weak) id <PlugPDFDocumentViewEventDelegate> documentViewEventDelegate;

/**
 * A PlugPDFDocumentViewController.
 *
 */
@property (nonatomic, weak) PlugPDFDocumentViewController *documentViewController;

/**
 * A PlugPDFDocument.
 *
 */
@property (nonatomic, weak) PlugPDFDocument *document;

/**
 * The page index to be displayed.
 *
 */
@property (nonatomic) NSInteger pageIdx;

/**
 * The type that determines how the page is fitted on the screen.
 *
 */
@property (nonatomic) PlugPDFPageFitType fitType;

/**
 * This flag indicates whether the page is zoomed or not.
 *
 */
@property (nonatomic) BOOL zoomFlag;

/**
 *
 * The array of pages of documentView.
 *
 */
@property (nonatomic) NSMutableArray* pages;

/**
 *
 * This flag indicates whether releasePage is called or not.
 *
 */
@property (nonatomic) BOOL releasePageisCalled;

/**
 *
 * The Width of Thubmnail cell.
 *
 */
@property (nonatomic) CGFloat cellWidth;

/**
 * Initializes a PlugPDFDocumentView object with the passed-in data.
 *
 * @param frame
 *          The view's frame rectangle.
 * @param document
 *          A PlugPDFDocument instance.
 * @param delegate
 *          A PlufPDFDocumentViewDelegate.
 *
 * @return
 *          A PlugPDFDocumentView object initialized with the passed-in data; otherwise nil if the object can't be initialized.
 *
 */
- (id)initWithFrame: (CGRect)frame
           document: (PlugPDFDocument*)document
           delegate: (PlugPDFDocumentViewDelegateBase*) delegate;

/**
 * Sets a PlugPDFDocumentViewDelegate instance.
 *
 * @param delegate
 *          A PlugPDFDocumentViewDelegateBase instance.
 *
 */
- (void)setDocumentViewDelegate: (PlugPDFDocumentViewDelegateBase*)delegate;

#pragma mark - content

/**
 * Sets the UIScrollview's content inset, size and offset.
 *
 * @param frame
 *          The view's frame rectangle.
 *
 */
- (void)setContentWithFrame: (CGRect)frame;

/**
 * Returns the page index on PlugPDFDocumentDisplayModeHorizontal or PlugPDFDocumentDisplayModeVertical mode.
 *
 */
- (NSInteger)pageIdxWithContentOffset;

#pragma mark - zoom

/**
 *
 * @param scale
 *          The view's scale.
 */
- (void) setZoom: (CGFloat)scale;

/**
 * Returns the current scale factor being applied to the scroll view's content.
 *
 */
- (CGFloat)zoomScale;

/**
 * Returns the scale factor being applied to the scroll view's content on the given point.
 *
 */
- (CGFloat)zoomScale: (CGPoint)point;

/**
 * Returns the scroll view's minimun zoom scale factor.
 *
 */
- (CGFloat)minZoomScale;

/**
 * Returns the scroll view's minimun zoom scale factor on the given point.
 *
 */
- (CGFloat)minZoomScale: (CGPoint)point;

/**
 * Returns the scroll view's maximum zoom scale factor.
 *
 */
- (CGFloat)maxZoomScale;

/**
 * Sets the current page view to that scale fitting the screen.
 *
 * @param animated
 *          YES: the scrolling is animated; NO: the scrolling is not animated.
 *
 */
- (void)resetZoom: (BOOL)animated;

/**
 * Sets a value that specifies the current scale factor being applied to the scroll view's content, and scrolls to a specific area so that the content is visible.
 *
 * @param point
 *          A point value defining the content view's area. This value must be set in the scroll view's coordinate space.
 * @param scale
 *          Determines how much the content is scaled.
 * @param animated
 *          YES: the scrolling is animated; NO: the scrolling is not animated.
 *
 */
- (void)zoomToPoint: (CGPoint)point scale: (CGFloat)scale animated: (BOOL)animated;

#pragma mark - page

/**
 * Returns the number of pages in the document.
 *
 */
- (NSInteger)pageCount;

/**
 * Sets the page to the given index and displays it with a scale fitting the screen.
 *
 * @param pageIdx
 *          The zero-based page index to be displayed.
 * @param fitToScreen
 *          YES: the page transition is animated; NO: the page transition is not animated.
 *
 */
- (void)gotoPage: (NSInteger)pageIdx fitToScreen: (BOOL)fitToScreen;

/**
 * Returns the passed-in page index's page view.
 *
 * @param pageIdx
 *          The zero-based page index.
 *
 * @return
 *          A PlugPDFPageView instance if successful; otherwise nil.
 *
 */
- (PlugPDFPageView*)pageView: (NSInteger)pageIdx;

/**
 * Releases all the pages in the subview array.
 *
 */
- (void)releasePages;

- (void)releaseInvisiblePage: (NSInteger)pIdx;

/**
 *
 * Displays the image inverted.
 *
 * @param enableNightMdoe
 *          YES: the image is inverted; NO: display a regular image.
 *
 */
- (void)setEnableNightMode: (BOOL)enableNightMode;

#pragma mark - mode

/**
 * Sets the document view's mode.
 *
 * @param mode
 *          The possible values are available in the PlugPDFDocumentDisplayMode enumeration.
 *
 */
- (void)setDisplayMode: (PlugPDFDocumentDisplayMode)mode;

/**
 * Returns the current page's display mode.
 *
 * @return
 *          The possible values are available in the PlugPDFDocumentDisplayMode enumeration.
 *
 */
- (PlugPDFDocumentDisplayMode)displayMode;

/**
 * Returns the last page's display mode, whose value is available in the PlugPDFDocumentDisplayMode enumeration.
 *
 */
- (PlugPDFDocumentDisplayMode)lastDisplayMode;

/**
 * Enables the flip page effect on the PlugPDFDocumentDisplayModeHorizontal mode.
 *
 * @param enable
 *          YES: enable the flip page effect; NO: disable the flip page effect.
 *
 */
- (void)setEnablePageFlipEffect: (BOOL)enable;

#pragma mark - search

/**
 * Displays the hit view.
 *
 * @param hits
 *          An NSArray object. Every hit is added to the NSArray object as a CGRect object.
 */
- (void)showHitView: (NSArray*)hits;

/**
 * Deletes the hit view from the page view.
 *
 */
- (void)deleteHitView;

#pragma mark - edit

- (PlugPDFTool)tool;

/**
 * Saves the Editing data.
 *
 */
- (void)saveNote: (NoteAnnot*) note;

/**
 * Releases all the annotation tools.
 *
 */
- (void)releaseTools;

/**
 * Releases the given annotation tool.
 *
 * @param tool
 *          The annotation tool to be released from the view, whose value is available in the PlugPDFTool enumeration.
 *
 */
- (void)releaseTool: (PlugPDFTool)tool;

/**
 * Sets the given annotation tool.
 *
 * @param tool
 *          The annotation tool to be set on the view, whose value is available in the PlugPDFTool enumeration.
 *
 */
- (void)setTool: (PlugPDFTool)tool;

/**
 * Sets the given annotation tool with an extra value.
 *
 * @param tool
 *          The annotation tool to be set on the view, whose value is available in the PlugPDFTool enumeration.
 * @param value
 *          The value to initialze the annotation tool with.
 *
 */
- (void)setTool: (PlugPDFTool)tool withExtraValue: (NSValue*)value;

/**
 * Sets the color of the highlight text tool.
 *
 * @param color
 *          The UIColor object of the line to be drawn.
 *
 */
- (void)setTextHighlightToolColor: (UIColor*)color;

/**
 * Sets the color of the underline text tool.
 *
 * @param color
 *          The UIColor object of the line to be drawn.
 *
 */
- (void)setTextUnderlineToolColor: (UIColor*)color;

/**
 * Sets the line shape of the underline text tool.
 *
 * @param squiggly
 *          YES: squiggly line; NO: straight line.
 *
 */
- (void)setTextUnderlineToolSquiggly: (BOOL)squiggly;

/**
 * Sets the color of the strikeout text tool.
 *
 * @param color
 *          The UIColor object of the line to be drawn.
 *
 */
- (void)setTextStrikeoutToolColor: (UIColor*)color;

/**
 * Sets the line color of the ink tool.
 *
 * @param color
 *          The UIColor object of the line to be drawn.
 *
 */
- (void)setInkToolLineColor: (UIColor*)color;

/**
 * Sets the line width of the ink tool.
 *
 * @param width
 *          The line width to be drawn, whose value is a number between 1 and 50.
 *
 */
- (void)setInkToolLineWidth: (CGFloat)width;

/**
 * Sets the line shape of the ink tool.
 *
 * @param straight
 *          YES: straight line; NO: scribble line.
 *
 */
- (void)setInkToolLineStraight: (BOOL)straight;

/**
 * Sets the size of the eraser annotation tool.
 *
 * @param size
 *          The size of the area to be erased, whose value is a number between 10 and 100.
 *
 */
- (void)setEraserToolSize: (CGFloat)size;

/**
 * Sets the color of the ink tool.
 *
 * @param Inks
 *          The array of colors (maximum size 6).
 *
 *          e.g., NSArray* inks = [[NSArray alloc] initWithObjects:[UIColor blackColor], [UIColor whiteColor] [UIColor redColor], nil]; // if only 2 colors are used.
 *
 */
- (void)setInkOptionToolColors: (NSArray*)inks;

/**
 * Sets the color image of the ink tool.
 *
 *  @param images
 *          The array of colors (maximum size is 6).
 */
- (void)setInkOptionToolColorImages: (NSArray*)images;

- (void)setThumbnailBackGroundColor: (UIColor*)color;

#pragma mark - annotation

/**
 * Removes the given annotation.
 *
 * @param annot
 *          The annotation id to be removed.
 *
 */
- (void)removeAnnot: (BaseAnnot*)annot;

/**
 * Saves the given annotation.
 *
 * @param annot
 *          The annotation id to be saved.
 *
 */
- (void)saveAnnot: (BaseAnnot*)annot;

/**
 * Returns an NSArray object of BaseAnnot instances.
 *
 * @param pageIdx
 *          The zero-based page in which to add the annotations.
 *
 * @return
 *          An NSArray object. Every annotation element is added to the NSArray object as a BaseAnnot instance. If there are no elements, an empty array is returned.
 *
 */
- (NSArray*)annots: (NSInteger)pageIdx;

/**
 * Imports annotations from the given XFDF file, and merges them into a PDF file.
 *
 * @param xfdf
 *          An NSURL object representing the source file's path.
 *
 */
- (void)importAnnotFromXFDF: (NSURL*)xfdf;

/**
 * Exports annotations to the given XFDF file.
 *
 * @param xfdf
 *          An NSURL object representing the output file's path.
 *
 */
- (void)exportAnnotToXFDF: (NSURL*)xfdf;

#pragma mark - option

/**
 * Sets the recently opened page as the initial page in the PlugPDFDocumentViewController view.
 *
 * @param enable
 *          YES: the initial page is that one recently opened; NO: it is the first page.
 *
 */
- (void)SetEnableUseRecentPage: (BOOL)enable;

#pragma mark - PlugPDFDocumentView

/**
 * Initializes the PlugPDFDocument object with the passed-in data.
 *
 * @param frame
 *
 * @param path
 *          The PDF file's path and name.
 * @param password
 *          The pasword to unlock the document, if encrypted.
 *
 * @return
 *          A PlugPDFDocument object initialized with the passed-in data; otherwise nil if the object can't be initialized.
 *
 * @throw CorruptedPDF
 *          Thrown when the passed-in data is not a PDF document or it is corrupted.
 * @throw PasswordMismatch
 *          Thrown when the passed-in password doesn't match the PDF document's password.
 *
 */
+ (PlugPDFDocumentView*)initWithFrame: (CGRect)frame
                                 path: (NSString*)path
                             password: (NSString*)password;


- (void)showLoadingView: (NSInteger)pageIdx;
- (void)hideLoadingView;

@end
