/****************************************************************************
 **
 ** Copyright (C) 2015 ePapyrus, Inc.
 ** All rights reserved.
 **
 ** This file is part of PlugPDF for iOS project.
 **
 ****************************************************************************/

#import <UIKit/UIKit.h>

@interface DrawInkTool : CALayer

-(id)initWithLayer:(id)layer list:(NSMutableArray *)list scale:(CGFloat)scale frame:(CGRect)frame;

@property (nonatomic) NSMutableArray *m_list;
@property (nonatomic) CGFloat scale;

@end
