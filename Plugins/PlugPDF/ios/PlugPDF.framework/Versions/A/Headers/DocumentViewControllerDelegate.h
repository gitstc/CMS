/****************************************************************************
 **
 ** Copyright (C) 2013 ePapyrus, Inc.
 ** All rights reserved.
 **
 ** This file is part of the PlugPDF SDK for iOS.
 **
 ****************************************************************************/

#import <Foundation/Foundation.h>
/**
 * PlugPDFDocumentViewControllerDelegate
 *
 * @file PlugPDF/DocumentViewControllerDelegate.h
 *
 */
@protocol PlugPDFDocumentViewControllerDelegate <NSObject>
@optional

/**
 * Called after the view has been loaded.
 *
 */
- (void)viewDidLoad:(UIViewController*)viewController;

/**
 * Called when the view is about to be visible.
 *
 */
- (void)viewWillAppear:(UIViewController*)viewController animated:(BOOL)animated;

/**
 * Called when the view has been fully transitioned onto the screen.
 *
 */
- (void)viewDidAppear:(UIViewController*)viewController animated:(BOOL)animated;

/**
 * Called when the view is dismissed, covered or otherwise hidden.
 *
 */
- (void)viewWillDisappear:(UIViewController*)viewController animated:(BOOL)animated;

/**
 * Called after the view was dismissed, covered or otherwise hidden.
 *
 */
- (void)viewDidDisappear:(UIViewController*)viewController animated:(BOOL)animated;

/**
 * Called after the navigation bar items were changed.
 *
 */
- (void)navigationBarItemsDidChanged:(UIViewController*)viewController;

/**
 * Called after the text annotation edit box pops up.
 */
- (BOOL) showNoteAnnotEditView:(UIViewController *)controller annot: (UIControl *)annot;

/**
 * Called after touching the note annotation.
 */
- (BOOL) showNoteContents:(UIViewController *)controller annot: (UIControl *)annot;

/**
 * Called after the Outline box pops up.
 */
- (BOOL) showOutlinesView:(UIViewController *)controller;

/**
 * Called when you click a back button.
 */
- (void) onDocumentClose:(UIViewController*)controller;

/**
 * Called when the page slider valuer is changed.
 */
- (void) pageSliderValueChanged:(UIViewController*)controller;


@end

