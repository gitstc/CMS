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
 * TextMarkupAnnotType
 *
 */
typedef NS_OPTIONS(NSUInteger, TextMarkupAnnotType) {
    TextMarkupAnnotHighlight,
    TextMarkupAnnotUnderline,
    TextMarkupAnnotSquigglyUnderline,
    TextMarkupAnnotStrikeout
};

/**
 * TextMarkupAnnot
 *
 * @file PlugPDF/TextMarkupAnnot.h
 *
 * A TextMarkupAnnot object represents a PDF file's text markup annotation.
 *
 */
@interface TextMarkupAnnot : BaseAnnot

/**
 * TextMarkupAnnotType
 *
 */
@property (nonatomic) TextMarkupAnnotType type;

/**
 * The stroke/rectangle color.
 *
 */
@property (nonatomic, strong) UIColor *color;

/**
 * Initializes a TextMarkupAnnot object.
 *
 * @param type
 *          The current annotation's type.
 * @param color
 *          The current annotation's color.
 * @param rect
 *          The current field's rect on the page.
 * @param pageIdx
 *          The (zero-based) index of the current annotation's page.
 *
 * @return
 *          A TextMarkupAnnot instance, otherwise nil if the object can't be initialized.
 *
 */
- (id)initWithType: (TextMarkupAnnotType)type
             color: (UIColor*)color
              rect: (CGRect)rect
           pageIdx: (NSInteger)pageIdx;

@end
