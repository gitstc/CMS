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
 * LinkAnnot
 *
 * @file PlugPDF/LinkAnnot.h
 *
 * A BaseAnnot object represents a PDF file's annotation.
 *
 */
@interface LinkAnnot : BaseAnnot

/**
 * The Destination string is defined as <ACTION>:[PATH]:[PAGE_NUMBER]. The supported ACTION types are URI, GoTo, Launch and GoToR.
 * [PATH] is not used in GoTo action. In the case of GoTo and GoToR, PAGE_NUMBER is specified.
 * URI: Resolve a uniform resource identifier at PATH. GoTo: Go to PAGE_NUMBER in the current document. 
 * Launch: Launch an application, usually to open a file at PATH. GoToR: ("Go-to remote") Go to PAGE_NUMBER in another document at PATH. Named: Named actions(PDF 1.2).
 * For detailed information, please refer the PDF Reference documentation.
 *
 */
@property (nonatomic, copy) NSString *destination;

/**
 * Initializes a LinkAnnot object.
 *
 * @param destination
 *          The destination string.
 * @param rect
 *          The link annotation's rect on the page.
 * @param pageIdx
 *          The (zero-based) page index that the annotation belongs to.
 *
 * @return
 *          A LinkAnnot instance, otherwise nil if the object can't be initialized.
 *
 */
- (id)initWithDest: (NSString*)destination
              rect: (CGRect)rect
           pageIdx: (NSInteger)pageIdx;

@end
