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
 * SignatureField
 *
 * @file PlugPDF/SignatureField.h
 *
 * A SignatureField object represents a PDF file's signature annotation.
 *
 */
@interface SignatureField : NSObject

/**
 * The annotation's title.
 *
 */
@property (nonatomic, strong) NSString *title;

/**
 * The (zero-based) page index that this annotation belongs to.
 *
 */
@property (nonatomic) NSInteger pageIdx;

/**
 * The file offset where the digest data starts in the file.
 *
 */
@property (nonatomic, strong) NSNumber* offset;

/**
 * Initializes a SignatureField object.
 *
 * @param title
 *          The annotation's title.
 * @param pageIdx
 *          The (zero-based) page index that the annotation belongs to.
 * @param offset
 *          The file offset where the digest data starts in the file.
 *
 * @return
 *          A SignatureField instance, otherwise nil if the object can't be initialized.
 *
 */
- (id)initWithTitle: (NSString*)title
            pageIdx: (NSInteger)pageIdx
             offset: (NSNumber*)offset;

@end
