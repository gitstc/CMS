/****************************************************************************
 **
 ** Copyright (C) 2013 ePapyrus, Inc.
 ** All rights reserved.
 **
 ** This file is part of the PlugPDF SDK for iOS.
 **
 ****************************************************************************/

#import "BaseAnnot.h"

/**
 * SquareAnnot
 *
 * @file PlugPDF/SquareAnnot.h
 *
 * A StampAnnot object represents a PDF file's square annotation.
 *
 */
@interface SquareAnnot : BaseAnnot

/**
 * The color used to fill the square.
 *
 */
@property (nonatomic, strong) UIColor *fillColor;

/**
 * The square border color.
 *
 */
@property (nonatomic, strong) UIColor *borderColor;

/**
 * The square border width.
 *
 */
@property (nonatomic) CGFloat borderWidth;

/**
 * The square border style.
 *
 */
@property (nonatomic) ANNOT_BORDER_SYTLE borderStyle;

/**
 * The square border's dash pattern.
 *
 */
@property (nonatomic, strong) NSArray *dashPattern;

/**
 * Initializes an InkAnnot object.
 *
 * @param rect
 *          The square's rect on the page.
 * @param fillColor
 *          The color used to fill the square.
 * @param borderColor
 *          The square border color.
 * @param borderWidth
 *          The square border width.
 * @param borderStyle
 *          The square border style.
 * @param dashPattern
 *          The square border's dash pattern.
 * @param pageIdx
 *          The (zero-based) page index that this annotation belongs to.
 *
 * @return
 *          A SquareAnnot instance, otherwise nil if the object can't be initialized.
 *
 */
- (id)initWithRect: (CGRect)rect
         fillColor: (UIColor*)fillColor
       borderColor: (UIColor*)borderColor
       borderWidth: (CGFloat)borderWidth
       borderStyle: (ANNOT_BORDER_SYTLE)borderStyle
       dashPattern: (NSArray*)dashPattern
           pageIdx: (NSInteger)pageIdx;

@end
