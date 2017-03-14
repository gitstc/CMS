/****************************************************************************
 **
 ** Copyright (C) 2013 ePapyrus, Inc.
 ** All rights reserved.
 **
 ** This file is part of the PlugPDF SDK for iOS.
 **
 ****************************************************************************/

#import "BaseField.h"

/**
 * PlugPDFButtonField
 *
 * @file PlugPDF/ButtonField.h
 *
 * A ButtonField object represents a PDF file's button field.
 * 
 */
@interface PlugPDFButtonField : PlugPDFBaseField

/**
 * Initializes a ButtonField object.
 *
 * @param title
 *          The current field's title.
 * @param rect
 *          The current field's rect on the page.
 * @param image
 *          The image to be drawn.
 * @param pageIdx
 *          The (zero-based) page index that the current annotation belongs to.
 *
 * @return
 *          A ButtonField instance; otherwise nil if the object cannot be initialized.
 * 
 */
- (id)initWithTitle: (NSString*)title
               rect: (CGRect)rect
              image: (UIImage*)image
            pageIdx: (NSInteger)pageIdx;

/**
 * The default is UIViewContentModeScaleToFill.
 * 
 */
- (void)setContentMode: (UIViewContentMode)contentMode;

/**
 * Sets the button's image.
 *
 * @param image
 *          UIImage value.
 * 
 */
- (void)setImage:(UIImage *)image;

/**
 * Returns the image's value.
 * 
 */
- (UIImage*)image;

@end
