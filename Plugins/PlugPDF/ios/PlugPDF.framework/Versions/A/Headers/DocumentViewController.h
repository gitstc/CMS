/****************************************************************************
 **
 ** Copyright (C) 2013 ePapyrus, Inc.
 ** All rights reserved.
 **
 ** This file is part of the PlugPDF SDK for iOS.
 **
 ****************************************************************************/

#import "DocumentView.h"
#import "DocumentViewControllerDelegate.h"
#import "AnnotEventDelegate.h"
#import "TextSelectionEventDelegate.h"

/**
 * PlugPDFDocumentNavigationBarMode
 *
 */
typedef NS_OPTIONS(NSUInteger, PlugPDFDocumentNavigationBarMode) {
    PlugPDFDocumentNavigationBarModeView         = 0,    // The navigation bar displays the title view and the bar button items for the view controller.
    // PlugPDFDocumentNavigationBarModeTitleView
    PlugPDFDocumentNavigationBarModeSearch       = 1,    // The navigation bar displays the search bar and the bar button items for the view controller.
    // PlugPDFDocumentNavigationBarModeSearchBar
    PlugPDFDocumentNavigationBarModeEdit         = 2     // The navigation bar displays the bar button items for the edit controller.
};

/**
 * PlugPDFDocumentSearchDirection
 *
 */
typedef NS_OPTIONS(NSUInteger, PlugPDFDocumentSearchDirection) {
    PlugPDFDocumentSearchDirectionPageOnly       = 0,    // Search in the current page only.
    // PlugPDFDocumentSearchDirectionCurrentPageOnly
    PlugPDFDocumentSearchDirectionAllPage        = 1,    // Search in all the pages.
    PlugPDFDocumentSearchDirectionForwardOnly    = 2,    // Search in the following pages.
    // PlugPDFDocumentSearchDirectionForward
    PlugPDFDocumentSearchDirectionBackwardOnly   = 3     // Search in the previous pages.
    // PlugPDFDocumentSearchDirectionBackword
};

/**
 * PlugPDFDocumentMenuItem
 *
 */
typedef NS_OPTIONS(NSUInteger, PlugPDFDocumentMenuItem) {
    // PlugPDFDocumentNavigationBarModeView
    PlugPDFDocumentMenuItemClose                    = 100,    // Close
    PlugPDFDocumentMenuItemRotateView               = 101,    // Rotate or lock view
    PlugPDFDocumentMenuItemDisplayMode              = 102,    // Display mode
    PlugPDFDocumentMenuItemBrightness               = 103,    // Brightness
    PlugPDFDocumentMenuItemOutline                  = 104,    // Show outline table
    PlugPDFDocumentMenuItemSearch                   = 105,    // Search keyword
    PlugPDFDocumentMenuItemEdit                     = 106,    // Edit
    PlugPDFDocumentMenuItemSelectText               = 107,    // Select text
    PlugPDFDocumentMenuItemOK                       = 108,    // Check
    
    // PlugPDFDocumentNavigationBarModeSearch
    PlugPDFDocumentMenuItemBack                     = 200,    // Back to normal
    PlugPDFDocumentMenuItemSearchBackward           = 201,    // Search backward
    PlugPDFDocumentMenuItemSearchForward            = 202,    // Search forward
    
    // PlugPDFDocumentNavigationBarModeEdit
    PlugPDFDocumentMenuItemNote                     = 301,    // Note annotaion
    PlugPDFDocumentMenuItemInk                      = 302,    // Ink annotation
    PlugPDFDocumentMenuItemEraser                   = 303,    // Eraser tool
    PlugPDFDocumentMenuItemTextHighlight            = 304,    // Text highlight
    PlugPDFDocumentMenuItemTextUnderline            = 305,    // Text underline
    PlugPDFDocumentMenuItemTextStrikeOut            = 306,    // Text strikeout
    
    // PlugPDFDocumentOutlineBarModeEdit
    PlugPDFDocumentMenuitemAdd                      = 401,    // Add
    PlugPDFDocumentMenuItemDelete                   = 402,    // Delete
    PlugPDFDocumentMenuItemDone                     = 403     // Done
};

@class PlugPDFDocument;
@class NoteAnnot;
@class PlugPDFOutlineItem;

/**
 * PlugPDFDocumentViewController
 *
 * @file PlugPDF/DocumentViewController.h
 *
 * The PlugPDFDocumentViewController class provides the basic PDF viewer model for the iOS platform.
 * Custom PDF viewers can be created by using the PlugPDFDocument class directly, without using the PlugPDFDocumentViewController at all.
 *
 */
@interface PlugPDFDocumentViewController : UIViewController

/**
 * A PlugPDFDocumentView
 *
 */
@property (nonatomic, strong) PlugPDFDocumentView *documentView;

/**
 * A PlugPDFDocument
 *
 */
@property (nonatomic, strong) PlugPDFDocument *document;

/**
 * A PlugPDFDocumentViewControllerDelegate
 *
 */
@property (nonatomic, weak) id <PlugPDFDocumentViewControllerDelegate> documentViewControllerDelegate;

/**
 * A PlugPDFAnnotEventDelegate
 *
 */
@property (nonatomic, weak) id <PlugPDFAnnotEventDelegate> annotEventDelegate;

/**
 * A PlugPDFTextSelectionEventDelegate.
 *
 */
@property (nonatomic, strong) id<PlugPDFTextSelectionEventDelegate> textSelectionEventDelegate;

/**
 * A PlugPDFDocumentViewEventDelegate.
 *
 */
@property (nonatomic, weak) id <PlugPDFDocumentViewEventDelegate> documentViewEventDelegate;

/**
 * Enables/Disables the annotation menu from the navigation bar.
 * YES: show the annotation menu (this is the default value); NO: hide the annotation menu.
 *
 */
@property (nonatomic) BOOL enableAnnotationMenu;

/**
 * Enables/Disables the search menu from the navigation bar.
 * YES: show the search menu (this is the default value); NO: hide the search menu.
 *
 */
@property (nonatomic) BOOL enableSearchMenu;

/**
 * Enables/Disables the note annotation.
 * The default value is YES.
 *
 */
@property (nonatomic) BOOL enableAnnotNote;

/**
 * Enables/Disables the note annotation popup controller.
 * The default value is YES.
 *
 */
@property (nonatomic) BOOL enableAnnotNotePopup;

/**
 * Enables/Disables the ink annotation.
 * The default value is YES.
 *
 */
@property (nonatomic) BOOL enableAnnotInk;

/**
 * Enables/Disables the tool bar (bottom bar).
 * The default value is YES.
 *
 */
@property (nonatomic) BOOL enableBottomBar;

/**
 * Enables/Disables the tool bar (top bar).
 * The degault value is YES.
 *
 */
@property (nonatomic) BOOL enableTopBar;

/**
 * Enables/Disables the use of the default back button in the navigation bar.
 * YES: shows the default back button using the previous view controller's text title. 
 * NO: the back button uses the PlugPDF SDK's image.
 * The default value is NO.
 *
 */
@property (nonatomic) BOOL enableDefaultBackButton;

/**
 * Enables/Disables the thumbnailPageNumber indicator.
 *
 */
@property (nonatomic) BOOL enableThumbnailPageNumberIndicator;

/**
 * Enables/Disables the thumbnail image indicator.
 *
 */
@property (nonatomic) BOOL enableThumbnailPagePreview;

/**
 * Enables/Disables the page index indicator.
 *
 */
@property (nonatomic) BOOL enablePageIndicator;

/**
 * The type that determines how the page is fitted on the screen.
 *
 */
@property (nonatomic) PlugPDFPageFitType fitType;

/**
 * Enables/Disables the navigation tool bar.
 * The default value is NO.
 *
 */
@property (nonatomic) BOOL enableAlwaysVisible;

#pragma mark - navigation & tool bar

/**
 * Enables/Disables the status bar.
 * The default value is NO.
 *
 */
@property (nonatomic) BOOL enableStatusBar;

/**
 * Returns true when calling the document view's dealloc.
 *
 */
@property (nonatomic) BOOL deallocIsCalled;

/**
 * Enables/Disables the zoom reset after the search is finished.
 *
 */
@property (nonatomic) BOOL enableResetZoomAfterSearching;

/**
 * The title label of PlugPDFDocumentViewController.
 * 
 *      e.g., the title of navigationController can be changed with the following code.
 * 
 *      viewController.menuItemTitle = [[UILabel alloc] initWithFrame: CGRectMake(0, 0, 100, 15)];
 *      [viewController.menuItemTitle setBackgroundColor: [UIColor greenColor]];
 *      [viewController.menuItemTitle setTextColor: [UIColor whiteColor]];
 *      [viewController.menuItemTitle setFont: [UIFont systemFontOfSize: 14.0]];
 *      [viewController.menuItemTitle setUserInteractionEnabled: NO];
 */
@property (nonatomic) UILabel *menuItemTitle;

/**
 * Enables/Disables the outline is editable using Outline tool.
 *
 *
 */
@property (nonatomic) BOOL enableOutlineEditable;


/**
 * Sets the navigation bar mode and the navigation bar items.
 *
 * @param mode
 *          The value is available in the PlugPDFDocumentNavigationBarMode enumeration.
 *
 */
- (void)setNavigationBar: (PlugPDFDocumentNavigationBarMode)mode;

/**
 * Sets whether the navigation bar is hidden.
 *
 * @param  hidden
 *          YES: hide the navigation bar; NO: show the navigation bar.
 *
 */
- (void)setNavigationToolBarHidden: (BOOL)hidden;

/**
 * Returns a boolean value indicating whether the navigation bar is hidden or not.
 *
 */
- (BOOL)isNavigationBarHidden;

/**
 * Returns a boolean value indicating whether the navigation bar button items are set for editing.
 *
 */
- (BOOL)isNavigationBarModeEdit;

/**
 * Sets the navigation bar button items.
 *
 * @param items
 *          An NSArray object of NSIntegers whose possible values are available in the PlugPDFDocumentNavigationBarMode enumeration.
 */
- (void)setMenuItems: (NSArray*)items;

/**
 * Sets the navigation bar button items.
 *
 *
 * @param items
 *          An NSArray object of NSIntegers whose possible values are available in the PlugPDFDocumentNavigationBarMode enumeration.
 */
- (void)setEditMenuItems: (NSArray*)items;

/**
 * Adds a UIBarButtonItem to the right side of the default LeftBarButtonItems.
 *
 * @param item
 *          The UIBarButtonItem object to be added.
 *
 */
- (void)addLeftBarButtonItem: (UIBarButtonItem*)item;

/**
 * Adds a UIBarButtonItem to the left side of the default RightBarButtonItems.
 *
 * @param item
 *          The UIBarButtonItem object to be added.
 *
 */
- (void)addRightBarButtonItem: (UIBarButtonItem*)item;

/**
 * Sets the navigation bar image.
 *
 * @param path
 *          The image file's path.
 *
 */
- (void)setNavigationBarImage: (NSString*)path;

/**
 * Sets the background image of the bar button items on the navigation bar.
 *
 * @param path
 *          The image file's path.
 *
 */
- (void)setBarButtonItemBackgroundImage: (NSString*)path;

/**
 * Sets the image to the normal state, and highlights the state of the bar button items on the navigation bar.
 *
 * @param item
 *          The item value is available in the PlugPDFDocumentMenuItem enumeration.
 *          All values are available with the exception of PlugPDFDocumentMenuItemRotateView and PlugPDFDocumentMenuItemDisplayMode.
 * @param normal
 *          The image file's path for the normal state.
 * @param highlight
 *          The image file's path for the highlighted state.
 *
 */
- (void)setBarButtonItemImage: (PlugPDFDocumentMenuItem) item
                       normal: (NSString*)normal
                    highlight: (NSString*)highlight;

/**
 * Sets the images of the bar button items on the navigation bar.
 *
 * @param item
 *          The item value is available in the PlugPDFDocumentMenuItem enumeration.
 *          Only the PlugPDFDocumentMenuItemRotateView and the PlugPDFDocumentMenuItemDisplayMode items are available in this method.
 * @param normals
 *          An NSArray object containing the image file's path of the normal state.
 *          The PlugPDFDocumentMenuItemRotateView item requires 2 images: rotate and rotate lock.
 *          The PlugPDFDocumentMenuItemDisplayMode item requires 3 images: horizontal, vertical and thumbnail.
 * @param highlights
 *          An NSArray object containing the image file's path of the highlighted state.
 *          The PlugPDFDocumentMenuItemRotateView item requires 2 images: rotate and rotate lock.
 *          The PlugPDFDocumentMenuItemDisplayMode item requires 3 images: horizontal, vertical and thumbnail.
 * @param items
 *          An NSArray object containing the image file's path of the popover list images.
 *          The PlugPDFDocumentMenuItemRotateView item doesn't require any image (nil).
 *          The PlugPDFDocumentMenuItemDisplayMode item requires 3 images: horizontal, vertical and thumbnail.
 *
 */
- (void)setBarButtonItemImages: (PlugPDFDocumentMenuItem) item
                       normals: (NSArray*)normals
                    highlights: (NSArray*)highlights
                         items: (NSArray*)items;

#pragma mark - rotation

/**
 * Sets whether the view controller's content must be rotated or not.
 *
 * @param lock
 *          YES: the content is rotated (default value); NO: the content is not rotated.
 *
 */
- (void)setRotationLock: (BOOL)lock;

#pragma mark - brightness

/**
 * Sets the brightness level of the document's page view.
 *
 * @param brightness
 *          The value is between 0 and 100.
 *
 */
- (void)setDisplayBrightness: (NSInteger)brightness;

#pragma mark - zoom

/**
 * Returns the current scale factor being applied to the scroll view's content.
 * The minimum value is 1.0 and the maximum is 6.0.
 *
 */
- (CGFloat)zoomScale;

/**
 * Returns the scroll view's minimum zoom scale factor.
 *
 */
- (CGFloat)minZoomScale;

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

/**
 *
 * Disables the zoom.
 *
 * @param enableZoom
 *          YES: the zoom is disabled; NO: the zoom is enabled.
 *
 */
- (void)setDisableZoom: (BOOL)disableZoom;

#pragma mark - page

/**
 * Sets the page to the given index and displays it with a scale fitting the screen.
 *
 * @param pageIdx
 *          The zero-based page index.
 * @param fitToScreen
 *          YES: animates the page transition; NO: doesn't animate the page transition.
 *
 */
- (void)gotoPage: (NSInteger)pageIdx fitToScreen: (BOOL)fitToScreen;

/**
 * Sets the text label of the page number indicator to "page index / page count" format.
 * 
 * @param pageIdx
 *          The zero-based page index.
 *
 */
- (void)setPageIndicatorText: (NSInteger)pageIdx;

/**
 * Sets the thumbnail view's visibility on the page slider.
 * This method shouldn't be called directly since it is intended to be a private function.
 *
 * @param hidden
 *          YES: hides the thumbnail; NO: displays the thumbnail
 *
 */
- (void)setThumbnailHiddenPrivate: (BOOL)hidden;

/**
 * Sets the thumbnail view's image on the page slider.
 *
 * @param pageIdx
 *          The zero-based page index.
 *
 */
- (void)setThumbnailPage: (NSInteger)pageIdx;

/**
 * Sets the page preview's Size.
 *
 * @param size
 *          The size of page preview.
 */
- (void)setPagePreviewSize: (CGSize)size;

/**
 * Sets the page preview's rect.
 *
 * @param size
 *          The rect of page preview.
 */
- (void)setPagePreviewRect: (CGRect)rect;

/**
 * Sets the pageindicator point.
 *
 * @param size
 *          The point of pageindicator.
 */
- (void)setPageIndicatorPoint: (CGPoint)point;

/**
 * @retruns Indicates whether the thumbnail image is loaded or not.
 *
 */
- (BOOL)thumbnailImageViewDidLoad;

/**
 * Moves the slider to the pageIdx position.
 *
 * @param pageIdx
 *          The zero-based page index.
 *
 */
- (void)setPageSliderValue: (NSInteger)pageIdx;

/**
 * Returns the number of pages in the document.
 *
 */
- (NSInteger)pageCount;

/**
 * Returns the current zero-based page index.
 *
 */
- (NSInteger)pageIdx;
/**
 * Returns the current zero-based page index.
 *
 */
- (NSInteger)sliderPageIdx;

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

/**
 * Sets the eraser type .
 *
 * @param mode
 *          The possible values are available in the PlugPDFDocumentEraserType/ enumeration.
 *
 */
- (void)setEraserType:(PlugPDFDocumentEraserType)eraserType;

#pragma mark - search

/**
 * Searches the passed-in string, displaying the hit on the page if there is a matching element.
 *
 * @param keyword
 *          The string to be found.
 * @param pageIdx
 *          The zero-based page index.
 * @param direction
 *          The possible values are available in the PlugPDFDocumentSearchDirection enumeration.
 *
 */
- (void)search: (NSString*)keyword
       pageIdx: (NSInteger)pageIdx
     direction: (PlugPDFDocumentSearchDirection)direction;

/**
 * Stops the current searching, deleting the hits from all the pages.
 *
 */
- (void)stopSearch;

/**
 * Returns UISearchBar's current text search.
 *
 */
- (NSString*)searchBarText;

#pragma mark - tool & edit

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
 * Note icon image.
 *
 */
@property (nonatomic) UIImage* noteIcon;

/**
 *
 *
 */
@property (nonatomic) UIColor* thumbnailbackground;

/**
 * Shows the edit view's highlight text tool.
 *
 */
- (void)showTextHighlightToolEditView;

/**
 * Sets the color of the highlight text tool.
 *
 * @param color
 *          The UIColor object of the line to be drawn.
 *
 */
- (void)setTextHighlightToolColor: (UIColor*)color;

/**
 * Shows the edit view's underline text tool.
 *
 */
- (void)showTextUnderlineToolEditView;

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
 * Shows the edit view's strikeout text tool.
 *
 */
- (void)showTextStrikeoutToolEditView;

/**
 * Sets the color of the strikeout text tool.
 *
 * @param color
 *          The UIColor object of the line to be drawn.
 *
 */
- (void)setTextStrikeoutToolColor: (UIColor*)color;



/**
 * Shows the edit view's text note tool.
 * Both the title and the content can be set.
 *
 * @param annot
 *          The note annotation instance to be edited.
 *
 */
- (void)showNoteAnnotEditView: (NoteAnnot*)annot;

/**
 *
 * Shows the bright slider view.
 *
 */
- (void)showBrightSldierView: (id)sender;

/**
 *
 * Shows the display select view.
 *
 */
- (void)showDisplaySelectView:(id)sender;

/**
 * Shows the ink tool's settings view.
 * These properties can be set: color, clarity, width and shape.
 *
 */
- (void)showInkToolSettingsView;

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
 * Shows the eraser tool's settings view.
 * The width and the partial deletion can be set.
 *
 */
- (void)showEraserToolSettingsView;

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

#pragma mark - outline

/**
 * Displays the outline table view with an animation.
 *
 */
- (void)showOutlinesView;

/**
 * Sets the outline table view as hidden, the transition is optionally animated.
 *
 */
- (void)hideOutlinesView;

/**
 * Removes the passed-in outline item from the table view and the PDF document.
 *
 * @param item
 *          The outline item you want to remome.
 *
 */
- (void)removeOutlineItem: (PlugPDFOutlineItem*)item;

/**
 * Edits both the title and the pageIdx of the passed-in outline item.
 *
 * @param item
 *          The outline item to be edited.
 * @param title
 *          The new title.
 * @param pageIdx
 *          The new zero-based, destination page index.
 *
 */
- (void)editOutlineItem: (PlugPDFOutlineItem*)item
                  title: (NSString*)title
                pageIdx: (NSInteger)pageIdx;

/**
 * Adds a new PlugPDFOutlineItem object with the passed-in parameters.
 *
 * @param title
 *          The new title.
 * @param pageIdx
 *          The new zero-based, destination page index.
 * @param parent
 *          The PlugPDFOutlineItem object's parent.
 * @param after
 *          The object before the new PlugPDFOutlineItem.
 *
 */
- (void)addOutlineItemWithTitle: (NSString*)title
                        pageIdx: (NSInteger)pageIdx
                         parent: (PlugPDFOutlineItem*)parent
                          after: (PlugPDFOutlineItem*)after;


#pragma mark - annotation

- (void)removePageAnnot;
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
 * Sets the link annotation's border color.
 *
 * @param color
 *          The link annotation's border color (clear is the default value).
 *
 */
- (void)setAnnotLinkBorderColor: (UIColor*)color;

/**
 * Sets the link annotation's background color.
 *
 * @param color
 *          The link annotation's background color (clear is the default value).
 * 
 * @param opacity
 *          The background color's opacity.
 */
- (void)setAnnotLinkBackgroundColor: (UIColor*)color opacity:(CGFloat)opacity;

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

#pragma mark - annotation customize

/**
 * Circle annotation's color.
 */
@property (nonatomic) UIColor* circleAnnotColor;

 /**
 * Circle annotation's border color.
 *
 */
@property (nonatomic) UIColor* circleAnnotBorderColor;

/**
 * Circle annotation's width.
 */
@property (nonatomic) CGFloat circleAnnotwidth;

/**
* Circle annotation's transparent.
*/
@property (nonatomic) Boolean circleAnnotTransparent;

/**
 * Circle annotation's Opacity.
 */
@property (nonatomic) CGFloat circleAnnotOpacity;

/**
 * Square annotation's color.
 *
 */
@property (nonatomic) UIColor* squareAnnotColor;

/**
 * Square annotation's border color.
 *
 */
@property (nonatomic) UIColor* squareAnnotBorderColor;

/**
 * Square annotation's width.
 *
 */
@property (nonatomic) CGFloat squareAnnotwidth;

/**
 * Square annotation's transparent.
 *
 */
@property (nonatomic) Boolean squareAnnotTransparent;

/**
 * Square annotation's Opacity.
 *
 */
@property (nonatomic) CGFloat squareAnnotOpacity;

/**
 * The size of navigation's item.
 *
 */
@property (nonatomic) CGSize navigationItemSize;

#pragma mark - bookmark title

/**
 * The bookmark's title.
 *
 */
@property(nonatomic) NSString* bookmarkTitle;

#pragma mark - path
/**
 * Returns a PDF path, If you used a below method.
 *(+ (PlugPDFDocumentViewController*)initWithPath: (NSString*)path
 *                                       password: (NSString*)password
 *                                          title: (NSString*)title;)
 */
- (NSString*)path;

#pragma mark - option
/**
 * Sets the recently opened page as the initial page in the PlugPDFDocumentViewController view.
 *
 * @param enable
 *          YES: the initial page is that one recently opened; NO: it is the first page.
 *
 */
- (void)setEnableUseRecentPage: (BOOL)enable;

#pragma mark - title

/**
 * Returns the navigation item's title being displayed on the center of the navigation bar.
 *
 */
- (NSString*)title;

#pragma mark - flatten

/**
 * Flatten annotations.
 *
 */
- (void)flattenAnnotations;

/**
 * Flattens the form fields.
 *
 * @param includeButtonField
 *          YES: flatten the button field; NO: don't flatten the button field
 * @parma useCustomAppearance
 *          YES: flatten with the custom appearance; otherwise NO.
 *
 */
- (void)flattenFormFields: (BOOL)includeButtonField useCustomAppearance: (BOOL)useCustomAppearance;

#pragma mark - encrypt

/**
 * Encrypts the document.
 *
 * @param userPass
 *          The user password.
 * @param ownerPass
 *          The owner password.
 * @param perm
 *          The user's access permissions. This value can be obtained with the getUserAccessPermissionsWithPrint method.
 *
 * @return 
 *          YES: success; otherwise NO.
 *
 */
- (BOOL)encryptUserPassword: (NSString*)userPass
              OwnerPassword: (NSString*)ownerPass
                 permission: (NSInteger)perm;

/**
 * Returns a Boolean value indicating whether the PlugPDFDocument object is opened with the owner password.
 *
 */
- (BOOL)openWithOwnerPassword;

/**
 * Returns a Boolean value indicating whether the PlugPDFDocument object has the print permission set.
 * (Revision 2) Print the document.
 * (Revision 3) Print the document (possibly not with the highest quality level, depending on whether or not the bit 12 is set).
 *
 */
- (BOOL)printPermission;

/**
 * Returns a Boolean value indicating whether the PlugPDFDocument object has the modify content permission set.
 * Modify the document's content with operations other than modify annot, fill field, and document assembly permissions.
 *
 */
- (BOOL)modifyContentPermission;

/**
 * Returns a Boolean value indicating whether the PlugPDFDocument object has the modify content permission set.
 * (Revision 2) Copy; otherwise extract content from the document, including text and graphics, and supporting accessibility for disabled users (or for other purposes).
 * (Revision 3) Copy; otherwise extract text and graphics from the document with operations other than the extract permission.
 *
 */
- (BOOL)copyContentPermission;

/**
 * Returns a Boolean value indicating whether the PlugPDFDocument object has the modify annotation permission set.
 * Add or modify text annotations and fill in interactive form fields. If the bit 4 is set, create or modify interactive form fields (including signature fields).
 *
 */
- (BOOL)modifyAnnotPermission;

/**
 * Returns a Boolean value indicating whether the PlugPDFDocument object has the fill interactive form field permission set.
 * (Revision 3 only) Fill in existing interactive form fields (including signature fields).
 *
 */
- (BOOL)fillFiledPermission;

/**
 * Returns a Boolean value indicating whether the PlugPDFDocument object has the extract permission set.
 * (Revision 3 only) Extract text and graphics, supporting accessibility for disabled users (or for other purposes).
 *
 */
- (BOOL)extractPermission;

/**
 * Returns a Boolean value indicating whether the PlugPDFDocument object has the assembly permission set.
 * (Revision 3 only) Assemble the document (insert, rotate or delete pages, and create bookmarks or thumbnail images).
 *
 */
- (BOOL)documentAssemblyPermission;

#pragma mark - save

/**
 * Saves the document in the specified location in the application sandbox.
 * The URL path in which to write the document is obtained from the initWithPath method.
 * If the PlugPDFDocument is initialized with the initWithData method, save the PDF file with the saveAsFile method.
 *
 * @return
 *          YES if the save operation succeeds, otherwise NO.
 *
 * @throw IncorrectPath
 *          Thrown when the file path is not available and cannot be used.
 * @throw NoContentsModificationPermission
 *          Thrown when the PDF document's modified content is saved without proper permission.
 * @throw NoAnnotationsModificationPermission
 *          Thrown when the PDF document's modified annotations are saved without proper permission.
 * @throw NoFillFieldPermission
 *          Thrown when the PDF document's modified fields are saved without proper permission.
 * @throw NoDocumentAssemblyPermission
 *          Thrown when the assembled PDF document is saved without proper permission.
 *
 */
- (BOOL)saveFile:(BOOL) reload;

/**
 * Encrypts and saves the document in the specified location in the application sandbox.
 * The URL path in which to write the document is obtained from the initWithPath method.
 *
 * @param userPass
 *          User password to be set.
 * @parma ownerPass
 *          Owner password to be set.
 * @param perm
 *          User access permissions. This value can be obtained with the getUserAccessPermissionsWithPrint method in the PlugPDFDocument class.
 *
 * @return
 *          YES if the operation succeeds, otherwise NO.
 *
 * @throw IncorrectPath
 *          Thrown when the file path is not available and cannot be used.
 * @throw NoContentsModificationPermission
 *          Thrown when the PDF document's modified content is saved without proper permission.
 * @throw NoAnnotationsModificationPermission
 *          Thrown when the PDF document's modified annotations are saved without proper permission.
 * @throw NoFillFieldPermission
 *          Thrown when the PDF document's modified fields are saved without proper permission.
 * @throw NoDocumentAssemblyPermission
 *          Thrown when the assembled PDF document is saved without proper permission.
 *
 */
- (BOOL)saveEncryptedFileWithUserPassword: (NSString*)userPass
                            OwnerPassword: (NSString*)ownerPass
                               permission: (NSInteger)perm;

/**
 * Saves the document in the specified location in the application sandbox.
 *
 * @param url
 *          The file URL in which to write the document.
 *
 * @return 
 *          YES if the save operation succeeds, otherwise NO.
 *
 * @throw IncorrectPath
 *          Thrown when the file path is not available and cannot be used.
 * @throw NoContentsModificationPermission
 *          Thrown when the PDF document's modified content is saved without proper permission.
 * @throw NoAnnotationsModificationPermission
 *          Thrown when the PDF document's modified annotations are saved without proper permission.
 * @throw NoFillFieldPermission
 *          Thrown when the PDF document's modified fields are saved without proper permission.
 * @throw NoDocumentAssemblyPermission
 *          Thrown when the assembled PDF document is saved without proper permission.
 *
 */
- (BOOL)saveAsFile: (NSURL*)url;

/**
 * Encrypts and saves the document in the specified location in the application sandbox.
 *
 * @param url
 *          The file URL in which to write the document.
 * @param userPass
 *          User password to be set.
 * @parma ownerPass
 *          Owner password to be set.
 * @param perm
 *          User access permissions. This value can be obtained with the getUserAccessPermissionsWithPrint method in the PlugPDFDocument class.
 *
 * @return
 *          YES if the operation succeeds, otherwise NO.
 *
 * @throw IncorrectPath
 *          Thrown when the file path is not available and cannot be used.
 * @throw NoContentsModificationPermission
 *          Thrown when the PDF document's modified content is saved without proper permission.
 * @throw NoAnnotationsModificationPermission
 *          Thrown when the PDF document's modified annotations are saved without proper permission.
 * @throw NoFillFieldPermission
 *          Thrown when the PDF document's modified fields are saved without proper permission.
 * @throw NoDocumentAssemblyPermission
 *          Thrown when the assembled PDF document is saved without proper permission.
 *
 */
- (BOOL)saveAsEncryptedFile: (NSURL*)url
               UserPassword: (NSString*)userPass
              OwnerPassword: (NSString*)ownerPass
                 permission: (NSInteger)perm;

/**
 * Returns the specified location in the application sandbox.
 *
 */
- (NSURL*)saveFileURL;

#pragma mark - PlugPDFDocumentViewController

/**
 * Returns a PlugPDFDocumentViewController object initialized with the passed-in data.
 * Displays a UIAlertView with a UIAlertViewStyleSecureTextInput if the PDF document is locked with a password.
 *
 * @param data
 *          The PDF data as an NSData object.
 * @param password
 *          The password to unlock the document, if encrypted.
 * @param title
 *          The title of the navigation item displayed in the center of the navigation bar.
 *
 * @return
 *          A PlugPDFDocumentViewController object initialized with the passed-in data, otherwise nil if the object can't be initialized.
 *
 * @throw CorruptedPDF
 *          Thrown when the passed-in data is not a PDF document or it is corrupted.
 * @throw PasswordMismatch
 *          Thrown when the passed-in password doesn't match the PDF document's password.
 *
 */
+ (PlugPDFDocumentViewController*)initWithData: (NSData*)data
                                      password: (NSString*)password
                                         title: (NSString*)title;
/**
 * Returns a PlugPDFDocumentViewController object initialized with the passed-in data.
 *
 * @param url
 *          The PDF url in internet.
 * @param password
 *          The password to unlock the document, if encrypted.
 * @param viewController
 *          The view controller to be used.
 *
 * @param documentViewControllerDelegate
 *          Set this value as nill when not using a documentViewControllerDelegate.
 *
 * @param annotEventDelegate
 *          Set this value as nill when not using an annotEventDelegate.
 *
 * @param textSelectionEventDelegate
 *          Set this value as nill when not using a textSelectionEventDelegate.
 *
 * @parm documentViewDelegate
 *          Set this value as nill when not using a documentViewDelegate.
 *
 * @throw Failed to download
 *          Thrown when the download fails.
 *
 */
+ (void)initWithUrl: (NSURL*)url
           password: (NSString*)password
     viewController: (UIViewController*)viewController
documentViewControllerDelegate: (id<PlugPDFDocumentViewControllerDelegate>) documentViewControllerDelegate
annotEventDelegate: (id <PlugPDFAnnotEventDelegate>) annotEventDelegate
textSelectionEventDelegate:(id<PlugPDFTextSelectionEventDelegate>) textSelectionEventDelegate
documentViewDelegate: (id <PlugPDFDocumentViewEventDelegate>) documentViewEventDelegate;

/**
 * Initializes a PlugPDFDocumentViewController object with the passed-in data.
 * Displays a UIAlertView with a UIAlertViewStyleSecureTextInput if the PDF document is locked with a password.
 *
 * @param path
 *          The PDF file's path and name.
 * @param password
 *          The password to unlock the document, if encrypted.
 * @param title
 *          The title of the navigation item displayed in the center of the navigation bar.
 *
 * @return
 *          A PlugPDFDocumentViewController object initialized with the passed-in data, otherwise nil if the object can't be initialized.
 *
 * @throw CorruptedPDF
 *          Thrown when the passed-in data is not a PDF document or it is corrupted.
 * @throw PasswordMismatch
 *          Thrown when the passed-in password doesn't match the PDF document's password.
 *
 */
+ (PlugPDFDocumentViewController*)initWithPath: (NSString*)path
                                      password: (NSString*)password
                                         title: (NSString*)title;

/**
 * Initializes a PlugPDFDocumentViewController object with the data from a JetStream connection.
 *
 * @param url
 *          The JetStream server's url encapsulated into an NSURL object.
 * @param port
 *          The JetStream server's port number.
 * @param filename
 *          The PDF file name to be opened on the JetStream server.
 * @param password
 *          The password to unlock the PDF document, if encrypted.
 * @param title
 *          The navigation item's title displayed in the center of the navigation bar.
 *
 * @return
 *          A PlugPDFDocumentViewController object initialized with the passed-in data; otherwise nil if it can't be initialized.
 *
 * @throw ConnectionFailed
 *          Thrown when a connection failure occurs.
 * @throw CorruptedPDF
 *          Thrown when the passed-in data is not a PDF document or it is corrupted.
 * @throw PasswordMismatch
 *          Thrown when the passed-in password doesn't match the PDF document's password.
 *
 */
+ (PlugPDFDocumentViewController*)initWithJetStreamUrl: (NSURL*)url
                                                  port: (int)port
                                              filename: (NSString*)filename
                                              password: (NSString*)password
                                                 title: (NSString*)title;

- (void) closeDoc;

- (void) clear;


/*
 * Refreshes the documentViewController.
 *
 *
 */

- (void) refreshView;


@end
