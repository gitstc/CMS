/****************************************************************************
 **
 ** Copyright (C) 2014 ePapyrus, Inc.
 ** All rights reserved.
 **
 ** This file is part of the PlugPDF SDK for iOS.
 **
 ****************************************************************************/

#import <UIKit/UIKit.h>

/**
 * PlugPDFTextSelectionEventDelegate
 *
 * @file PlugPDF/TextSelectionEventDelegate.h
 *
 */
@protocol PlugPDFTextSelectionEventDelegate <NSObject>
@optional

/**
 * Called when the 'copy' item on the context menu is tapped.
 *
 * @param id
 *          The UIMenuController instance.
 * @param text
 *          The selected text.
 *
 * @return
 *          YES: custom action; NO: default tap action.
 *
 */
- (BOOL)onContextMenuCopy: (id)sender withText: (NSString*)text;

/**
 * Called when the 'search' item on the context menu is tapped.
 *
 * @param id
 *          The UIMenuController instance.
 * @param text
 *          The selected text.
 *
 * @return
 *          YES: custom action; NO: default tap action.
 *
 */
- (BOOL)onContextMenuSearch: (id)sender withText: (NSString*)text;


/**
 *
 * Called when the select context is showed.
 *
 * @param view
 *            The select context instance.
 *
 * @param rect
 *            The select context's rect.
 *
 */
- (void)showContextMenu: (UIView *)view rect: (CGRect)rect search: (NSString*)search;

@end
