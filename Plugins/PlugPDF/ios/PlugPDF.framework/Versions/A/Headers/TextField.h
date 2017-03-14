/****************************************************************************
 **
 ** Copyright (C) 2013 ePapyrus, Inc.
 ** All rights reserved.
 **
 ** This file is part of the PlugPDF SDK for iOS.
 **
 ****************************************************************************/

#import "BaseField.h"

/**
 * PlugPDFTextField
 *
 * @file PlugPDF/TextField.h
 *
 * A TextField object represents a PDF file's text field.
 *
 */
@interface PlugPDFTextField : PlugPDFBaseField <UITextFieldDelegate, UITextViewDelegate>

/**
 * The field's font.
 *
 */
@property (nonatomic, strong) UIFont *font;

/**
 * The text color.
 *
 */
@property (nonatomic, strong) UIColor *color;

/**
 * The field's keyboard type.
 *
 */
@property (nonatomic) UIKeyboardType keyboardType;

/**
 * The field's padding value.
 *
 */
@property (nonatomic) CGFloat padding;

/**
 * The text edit control for a single line.
 *
 */
@property (nonatomic, strong) UITextField *textField;

/**
 * The text edit control for multiple lines.
 *
 */
@property (nonatomic, strong) UITextView *textView;

/**
 * The next text field in the object list.
 *
 */
@property (nonatomic, weak) PlugPDFTextField *nextOrder;

/**
 * Initializes a TextField object.
 *
 * @param title
 *          The field's title.
 * @param rect
 *          The field's rect on the page.
 * @param value
 *          The field's string value.
 * @param font
 *          The field's font.
 * @param color
 *          Text color.
 * @param align
 *          NSTextAlignment value.
 * @param multiLine
 *          NO: default value; YES: enables the text object's multi-line capability.
 * @param secureText
 *          NO: default value; YES: creates a password-style text object, hiding the text being typed.
 * @param keyboardType
 *          The field's keyboard type.
 * @param pageIdx
 *          The (zero-based) page index that the annotation belongs to.
 *
 * @return
 *          A TextField instance, otherwise nil if the object can't be initialized.
 *
 */
- (id)initWithTitle: (NSString*)title
               rect: (CGRect)rect
              value: (NSString*)value
               font: (UIFont*)font
              color: (UIColor*)color
          alignment: (NSTextAlignment)align
          multiLine: (BOOL)multiLine
         secureText: (BOOL)secureText
       keyboardType: (UIKeyboardType)keyboardType
            pageIdx: (NSInteger)pageIdx;

/**
 * Sets the text field's value.
 *
 */
- (void)setTextFieldValue: (NSString*)value;

@end
