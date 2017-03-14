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
 * FreeTextAnnot
 *
 * @file PlugPDF/FreeTextAnnot.h
 *
 * A FreeTextAnnot object represents a PDF file's free text annotation.
 *
 */
@interface FreeTextAnnot : BaseAnnot

/**
 * The annotation's title.
 *
 */
@property (nonatomic, strong) NSString *title;

/**
 * The annotation's content.
 *
 */
@property (nonatomic, strong) NSString *contents;

/**
 * Initializes a FreeTextAnnot object for read only.
 *
 * @param rect
 *          The annotation's rect on the page.
 * @param title
 *          The annotation's title.
 * @param image
 *          The image to be drawn.
 * @param pageIdx
 *          The (zero-based) page index that the annotation belongs to.
 *
 * @return
 *          A FreeTextAnnot instance, otherwise nil if the object can't be initialized.
 *
 */
- (id)initWithRect: (CGRect)rect
             title: (NSString*)title
             image: (UIImage*)image
           pageIdx: (NSInteger)pageIdx;

@end
