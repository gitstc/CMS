/****************************************************************************
 **
 ** Copyright (C) 2014 ePapyrus, Inc.
 ** All rights reserved.
 **
 ** This file is part of the PlugPDF SDK for iOS.
 **
 ****************************************************************************/

#import "BaseAnnot.h"

/**
 * StampAnnot
 *
 * @file PlugPDF/StampAnnot.h
 *
 * A StampAnnot object represents a PDF file's stamp annotation.
 *
 */
@interface StampAnnot : BaseAnnot

/**
 * Initializes a StampAnnot object.
 *
 * @param rect
 *          The annotation's rect on the page.
 * @param image
 *          The stamp image to be drawn.
 * @param pageIdx
 *          The (zero-based) page index that this annotation belongs to.
 *
 * @return
 *          A StampAnnot instance, otherwise nil if the object can't be initialized.
 *
 */
- (id)initWithRect: (CGRect)rect
             image: (UIImage*)image
           pageIdx: (NSInteger)pageIdx;

/**
 * Returns the current annotation's stamp image.
 *
 */
- (UIImage*)image;

@end
