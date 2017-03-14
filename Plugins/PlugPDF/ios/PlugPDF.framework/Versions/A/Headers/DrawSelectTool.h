/****************************************************************************
 **
 ** Copyright (C) 2015 ePapyrus, Inc.
 ** All rights reserved.
 **
 ** This file is part of PlugPDF for iOS project.
 **
 ****************************************************************************/

#import <UIKit/UIKit.h>

@interface DrawSelectTool : CALayer

-(id)initWithLayer:(id)layer
             scale:(CGFloat)scale
             frame:(CGRect)frame
        beginPoint:(CGPoint)beginPoint
          endPoint:(CGPoint)endPoint
        drawHandle:(BOOL)drawHandle
             draws:(NSMutableArray*)draws
    leftHandleRect:(CGRect)leftHandleRect
   rightHandleRect:(CGRect)rightHandleRect
    leftHandleDrag:(BOOL)leftHandleDrag
   rightHandleDrag:(BOOL)rightHandleDrag
   leftHandlePoint:(CGPoint)leftHandlePoint
  rightHandlePoint:(CGPoint)rightHandlePoint
        lineHeight:(CGFloat)lineHeight;



@property (nonatomic) CGFloat scale;
@property (nonatomic) CGPoint beginPoint;
@property (nonatomic) CGPoint endPoint;
@property (nonatomic, strong) NSMutableArray *draws;
@property (nonatomic) BOOL drawHandle;
@property (nonatomic) CGRect leftHandleRect;
@property (nonatomic) CGRect rightHandleRect;
@property (nonatomic) BOOL leftHandleDrag;
@property (nonatomic) BOOL rightHandleDrag;
@property (nonatomic) CGPoint leftHandlePoint;
@property (nonatomic) CGPoint rightHandlePoint;
@property (nonatomic) CGFloat lineHeight;

@end
