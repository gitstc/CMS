/****************************************************************************
 **
 ** Copyright (C) 2014 ePapyrus, Inc.
 ** All rights reserved.
 **
 ** This file is part of the PlugPDF SDK for iOS.
 **
 ****************************************************************************/

#import <UIKit/UIKit.h>

@class BaseAnnot;
@class PlugPDFTextField;

/**
 * PlugPDFAnnotEventDelegate
 *
 * @file PlugPDF/AnnotEventDelegate.h
 *
 */
@protocol PlugPDFAnnotEventDelegate <NSObject>
@optional

/**
 * Called when the given annotation is tapped up.
 *
 * @param viewController
 *          A UIViewController instance.
 * @param annot
 *          The annotation being tapped up.
 *
 * @return
 *          YES: custom action; NO: default tap action.
 *
 */
- (BOOL)viewController: (UIViewController*)viewController
               onTapUp: (BaseAnnot*)annot;

/**
 * Called when the given annotation is long-pressed.
 *
 * @param viewController
 *          A UIViewController instance.
 * @param annot
 *          The annotation being long-pressed.
 *
 * @return
 *          YES: custom action; NO: default long-pressed action.
 *
 */
- (BOOL)viewController: (UIViewController*)viewController
           onLongPress: (BaseAnnot*)annot;

/**
 * Called when the given textfield loses the focus.
 *
 * @param textfield
 *          The textfield losing the focus.
 *
 * @return
 *          YES: custom action; NO: default action.
 *
 */
- (BOOL)textFieldShouldEndEditing: (PlugPDFTextField*)textField;

/**
 * Called when the given textfield's text value is changed.
 *
 * @param textfield
 *          The textfield containing some text.
 * @param range
 *          The range of characters to be replaced.
 * @param string
 *          The replacement string.
 *
 * @return
 *          YES: custom action; NO: default action.
 *
 */
- (BOOL)textField: (PlugPDFTextField*)textField shouldChangeCharactersInRange:(NSRange)range replacementString:(NSString *)string;

/**
 * Called just before displaying the keyboard.
 * 
 * @param textfield
 *          The textfield becoming the first responder.
 * @param offset
 *          The height offset from PlugPDFDocumentView to textfield.
 * @param notification
 *          The NSNotification object from UIKeyboardWillShowNotification.
 *
 */
- (void)keyboardWillShow: (PlugPDFTextField*)textField fieldOffset: (CGFloat)offset Notification: (NSNotification*)notification;

/**
 * Called just before hiding the keyboard.
 *
 * @param textfield
 *          The textfield stops being the first responder.
 * @param offset
 *          The height offset from PlugPDFDocumentView to textfield.
 * @param notification
 *          The NSNotification object from UIKeyboardWillHideNotification
 *
 */
- (void)keyboardWillHide: (PlugPDFTextField*)textField fieldOffset: (CGFloat)offset Notification: (NSNotification*)notification;

/**
 * Called after the annotation pops up.
 */
- (BOOL) showContextMenu:(UIViewController *)controller annot: (UIControl *)annot;

@end
