/****************************************************************************
 **
 ** Copyright (C) 2013 ePapyrus, Inc.
 ** All rights reserved.
 **
 ** This file is part of the PlugPDF SDK for iOS.
 **
 ****************************************************************************/

#import "BaseField.h"

#import "CheckBoxFieldDrawDelegate.h"

/**
 * PlugPDFCheckBoxField
 *
 * @file PlugPDF/CheckBoxField.h
 *
 * A CheckBoxField object represents a PDF file's checkbox field.
 * 
 */
@interface PlugPDFCheckBoxField : PlugPDFBaseField

/**
 * The checkbox's draw delegate.
 * 
 */
@property (nonatomic, weak) id <PlugPDFCheckBoxFieldDrawDelegate> drawDelegate;

/**
 * Initializes a CheckBoxField object.
 *
 * @param title
 *          The current field's title.
 * @param rect
 *          The rect of this field on the page.
 * @param checked
 *          Indicates whether the current field is checked.
 * @param pageIdx
 *          The (zero-based) page index that the current annotation belongs to.
 *
 * @return
 *          A CheckBoxField instance; otherwise nil if the object cannot be initialized.
 * 
 */
- (id)initWithTitle: (NSString*)title
               rect: (CGRect)rect
            checked: (BOOL)checked
            pageIdx: (NSInteger)pageIdx;

/**
 * Sets CheckBoxField value.
 *
 * @param checked
 *          Sets the boolean value indicating whether the current field is checked.
 * 
 */
- (void)setChecked: (BOOL)checked;

/**
 * Returns the boolean value indicating whether the current field is checked.
 * 
 */
- (BOOL)checked;

@end
