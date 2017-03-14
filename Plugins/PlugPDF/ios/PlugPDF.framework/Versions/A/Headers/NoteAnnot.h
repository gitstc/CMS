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
 * NoteAnnot
 *
 * @file PlugPDF/NoteAnnot.h
 *
 * A NoteAnnot object represents a PDF file's note annotation.
 *
 */
@interface NoteAnnot : BaseAnnot

/**
 * The annotation's title.
 *
 */
@property (nonatomic, copy) NSString *title;

/**
 * The annotation's content.
 *
 */
@property (nonatomic, copy) NSString *contents;

/**
 * The date of the last modification.
 *
 */
@property (nonatomic, copy) NSString *date;

/**
 * The icon image.
 *
 */
@property (nonatomic, copy) UIImage *icon;

/**
 * Initializes a NoteAnnot object.
 *
 * @param title
 *          The annotation's title.
 * @param contents
 *          The annotation's content.
 * @param date
 *          The date of the last modification.
 * @param icon
 *          The icon image.
 * @param rect
 *          The note annotation's rect on the page.
 * @param pageIdx
 *          The (zero-based) page index that the annotation belongs to.
 *
 * @return
 *          A NoteAnnot instance, otherwise nil if the object can't be initialized.
 *
 */
- (id)initWithTitle: (NSString*)title
           contents: (NSString*)contents
               date: (NSString*)date
               icon: (UIImage*)icon
               rect: (CGRect)rect
            pageIdx: (NSInteger)pageIdx;

@end
