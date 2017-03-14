/****************************************************************************
 **
 ** Copyright (C) 2016 ePapyrus, Inc.
 ** All rights reserved.
 **
 ** This file is part of the PlugPDF SDK for iOS.
 **
 ****************************************************************************/

#import "TextField.h"

/**
 * PlugPDFComboBoxField
 *
 * @file PlugPDF/ComboBoxField.h
 *
 * A ComboBoxField object represents a PDF file's combobox field annotation.
 *
 */
@interface PlugPDFComboBoxField : PlugPDFTextField <UIPickerViewDataSource, UIPickerViewDelegate>

@property (nonatomic, strong) NSArray* list;

/**
 * Initializes a TextField object.
 *
 * @param title
 *          The field's title.
 * @apram list
 *          The list of combobox.
 * @param rect
 *          The field's rect on the page.
 * @param value
 *          The field's string value.
 * @param font
 *          The field's font.
 * @param color
 *          Text color.
 *
 * @param pageIdx
 *          The (zero-based) page index that the annotation belongs to.
 *
 * @return
 *          A TextField instance, otherwise nil if the object can't be initialized.
 *
 */
- (id)initWithTitle: (NSString*)title
               rect: (CGRect)rect
               list: (NSArray*)list
              value: (NSString*)value
               font: (UIFont*)font
              color: (UIColor*)color
            pageIdx: (NSInteger)pageIdx;

@end
