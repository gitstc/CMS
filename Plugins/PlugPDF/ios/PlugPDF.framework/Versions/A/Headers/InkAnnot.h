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
 * InkAnnot
 *
 * @file PlugPDF/InkAnnot.h
 *
 * An InkAnnot object represents a PDF file's ink annotation.
 *
 */
@interface InkAnnot : BaseAnnot

/**
 * The stroke color.
 *
 */
@property (nonatomic, strong) UIColor *color;

/**
 * The line width.
 *
 */
@property (nonatomic) CGFloat width;

/**
 * An NSArray of CGPoint elements.
 *
 */
@property (nonatomic, strong) NSArray *lines;

/**
 * Initializes an InkAnnot object.
 *
 * @param color
 *          The stroke color (red, green, blue, alpha).
 * @param width
 *          The line width.
 * @param lines
 *          An NSArray of CGPoint elements.
 * @param pageIdx
 *          The (zero-based) page index that the annotation belongs to.
 *
 * @return
 *          An InkAnnot instance, otherwise nil if the object can't be initialized.
 *
 */
- (id)initWithColor: (UIColor*)color
              width: (CGFloat)width
              lines: (NSArray*)lines
            pageIdx: (NSInteger)pageIdx;


- (void)refresh;

@end
