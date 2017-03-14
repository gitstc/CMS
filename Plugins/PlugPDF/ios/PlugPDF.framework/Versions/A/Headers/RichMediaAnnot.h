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
 * RichMediaAnnot
 *
 * @file PlugPDF/RichMediaAnnot.h
 *
 * A RichMediaAnnot object represents a PDF file's rich media annotation.
 *
 */
@interface RichMediaAnnot : BaseAnnot

/**
 * The annotation's source name.
 *
 */
@property (nonatomic, strong) NSString* source;

/**
 * Initializes a RichMediaAnnot object.
 *
 * @param rect
 *          The annotation's rect on the page.
 * @param image
 *          The annotation's icon image.
 * @param source
 *          The annotation's source name.
 * @param data
 *          The annotation's rich media data is stored in a temporary path in m4u format.
 * @param pageIdx
 *          The (zero-based) page index that this annotation belongs to.
 *
 * @return
 *          A RichMediaAnnot instance, otherwise nil if the object can't be initialized.
 *
 */
- (id)initWithRect: (CGRect)rect
             image: (UIImage*)image
            source: (NSString*)source
              data: (NSData*)data
           pageIdx: (NSInteger)pageIdx;

@end
