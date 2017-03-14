/****************************************************************************
 **
 ** Copyright (C) 2013 ePapyrus, Inc.
 ** All rights reserved.
 **
 ** This file is part of the PlugPDF SDK for iOS.
 **
 ****************************************************************************/

#import "BaseAnnot.h"
#import "FieldDefine.h"

/**
 * PlugPDFBaseField
 *
 * @file PlugPDF/BaseField.h
 * 
 * A BaseField object represents a PDF file's form field.
 * 
 */
@interface PlugPDFBaseField : BaseAnnot

/**
 * The current field's title.
 * 
 */
@property (nonatomic, strong) NSString *title;

/**
 * The current field's string value.
 * 
 */
@property (nonatomic, strong) NSString *value;

/**
 * Shows/Hides the border.
 * 
 */
@property (nonatomic) BOOL borderHidden;

/**
 * The color of the field's border.
 * 
 */
@property (nonatomic, strong) UIColor *borderColor;

/**
 * The color of the field's mask.
 * 
 */
@property (nonatomic, strong) UIColor *maskColor;

/**
 * Initializes a BaseField object.
 *
 * @param title
 *          The current field's title.
 * @param rect
 *          The current field's rect on the page.
 * @param value
 *          The current field's string value.
 * @param pageIdx
 *          The (zero-based) page index that the current annotation belongs to.
 *
 * @return
 *          A BaseField instance; otherwise nil if the object cannot be initialized.
 * 
 */
- (id)initWithTitle: (NSString*)title
               rect: (CGRect)rect
              value: (NSString*)value
            pageIdx: (NSInteger)pageIdx;

/**
 * Draws the mask and the border with the field's state.
 *
 * @param rect
 *          CGRect to be drawn.
 * @param state
 *          The field's state.
 * 
 */
- (void)drawRect: (CGRect)rect fieldState: (PlugPDFFieldState)state;

/**
 * Clears the field's value.
 * 
 */
- (void)clearValue;

/**
 * Returns the field's state.
 * 
 */
- (PlugPDFFieldState)fieldState;

/**
 * Sets the field's state.
 *
 */
- (void)setFieldState: (PlugPDFFieldState)state;

@end
