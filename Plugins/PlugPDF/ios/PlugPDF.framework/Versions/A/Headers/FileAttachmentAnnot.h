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
 * FileAttachmentAnnot
 *
 * @file PlugPDF/FileAttachmentAnnot.h
 *
 * A FileAttachmentAnnot object represents a PDF document's file attachment annotation.
 *
 */
@interface FileAttachmentAnnot : BaseAnnot <UIDocumentInteractionControllerDelegate>

/**
 * Initializes a FileAttachmentAnnot object.
 *
 * @param rect
 *          The annotation's rect on the page.
 * @param image
 *          The icon image to be drawn.
 * @param fileName
 *          The name of the attached file.
 * @param fileData
 *          The attached file's NSData object.
 * @param pageIdx
 *          The (zero-based) page index that the annotation belongs to.
 *
 * @return
 *          A FileAttachmentAnnot instance, otherwise nil if the object can't be initialized.
 *
 */
- (id)initWithRect: (CGRect)rect
             image: (UIImage*)image
          fileName: (NSString*)fileName
          fileData: (NSData*)fileData
           pageIdx: (NSInteger)pageIdx;

@end
