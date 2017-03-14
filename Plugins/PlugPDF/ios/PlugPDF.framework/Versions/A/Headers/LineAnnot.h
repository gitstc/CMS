/****************************************************************************
 **
 ** Copyright (C) 2013 ePapyrus, Inc.
 ** All rights reserved.
 **
 ** This file is part of the PlugPDF SDK for iOS.
 **
 ****************************************************************************/

#import "BaseAnnot.h"

typedef NS_OPTIONS(NSUInteger, BorderStyle) {
    Solid,
    Dashed,
    Beveled,
    Inset,
    Underline
};

typedef NS_OPTIONS(NSUInteger, LineEndingStyle) {
    Square,
    //Circle,
    Diamond,
    OpenArrow,
    ClosedArrow,
    None,
    Butt,
    ROpenArrow,
    RCloseArrow,
    Slash
};

@interface LineAnnot : BaseAnnot

@property (nonatomic, strong) UIColor *lineColor;

@property (nonatomic, strong) UIColor *fillColor;

@property (nonatomic) CGFloat width;

@property (nonatomic) BorderStyle borderStyle;

@property (nonatomic) LineEndingStyle leftLineEndingStyle;

@property (nonatomic) LineEndingStyle rightLineEndingStyle;

@property (nonatomic) CGPoint sp;

@property (nonatomic) CGPoint ep;

- (id)initWithLineColor: (UIColor*)lineColor
              fillColor: (UIColor*)fillColor
                  width: (CGFloat)width
              lineStyle: (NSInteger)lineStyle
            borderStyle: (BorderStyle)borderStyle
    leftLineEndingStyle: (LineEndingStyle)leftLineEndingStyle
   rightLineEndingStyle: (LineEndingStyle)rightLineEndingStyle
                     sp: (CGPoint)sp
                     ep: (CGPoint)ep
                pageIdx: (NSInteger)pageIdx;

- (id)initWithRect: (CGRect)rect
             image: (UIImage*)image
           pageIdx: (NSInteger)pageIdx;

@end
