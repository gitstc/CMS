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
 * SoundAnnot
 *
 * @file PlugPDF/SoundAnnot.h
 *
 * A SoundAnnot object represents a PDF file's sound annotation.
 *
 */
@interface SoundAnnot : BaseAnnot

/**
 * The annotation's title.
 *
 */
@property (nonatomic, strong) NSString* title;

/**
 * The annotation's sound data (stored in AIFF format).
 *
 */
@property (nonatomic, strong) NSData* data;

/**
 * Initializes a SoundAnnot object.
 *
 * @param rect
 *          The annotation's rect on the page.
 * @param title
 *          The annotation's title.
 * @param image
 *          The annotation's icon image.
 * @param data
 *          The annotation's sound data (stored in AIFF format).
 * @param pageIdx
 *          The (zero-based) page index that this annotation belongs to.
 *
 * @return
 *          A SoundAnnot instance, otherwise nil if the object can't be initialized.
 *
 */
- (id)initWithRect: (CGRect)rect
             title: (NSString*)title
             image: (UIImage*)image
              data: (NSData*)data
           pageIdx: (NSInteger)pageIdx;

@end
