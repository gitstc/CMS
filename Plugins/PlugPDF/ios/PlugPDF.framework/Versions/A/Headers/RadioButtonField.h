/****************************************************************************
 **
 ** Copyright (C) 2013 ePapyrus, Inc.
 ** All rights reserved.
 **
 ** This file is part of the PlugPDF SDK for iOS.
 **
 ****************************************************************************/

#import "CheckBoxField.h"

/**
 * PlugPDFRadioButtonField
 *
 * @file PlugPDF/RadioButtonField.h
 *
 * A RadioButtonField object represents a PDF file's button field annotation.
 *
 */
@interface PlugPDFRadioButtonField : PlugPDFCheckBoxField

/**
 * The annotation's name.
 *
 */
@property (nonatomic, strong) NSString *name;

/**
 * Initializes a RadioButtonField object.
 *
 * @param title
 *          The annotation's title.
 * @param name
 *          The annotation's name.
 * @param rect
 *          The field's rect on the page.
 * @param checked
 *          A boolean value indicating whether the current field is checked or not.
 * @param pageIdx
 *          The (zero-based) page index that this annotation belongs to.
 *
 * @return
 *          A RadioButtonField instance, otherwise nil if the object can't be initialized.
 *
 */
- (id)initWithTitle: (NSString*)title
               name: (NSString*)name
               rect: (CGRect)rect
            checked: (BOOL)checked
            pageIdx: (NSInteger)pageIdx;

/**
 * Adds a sibling RadioButtonField.
 *
 * @param sibling
 *          A RadioButtonField instance.
 *
 */
- (void)addSibling: (PlugPDFRadioButtonField*)sibling;

/**
 * Returns an NSArray object containing the annotation's sibling RadioButtonField objects.
 *
 */
- (NSArray*)siblings;

@end
