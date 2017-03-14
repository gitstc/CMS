/****************************************************************************
 **
 ** Copyright (C) 2013 ePapyrus, Inc.
 ** All rights reserved.
 **
 ** This file is part of the PlugPDF SDK for iOS.
 **
 ****************************************************************************/

/**
 * PlugPDFTool
 * 
 */
typedef NS_OPTIONS(NSUInteger, PlugPDFTool) {
    PlugPDFToolNone                 = 0,
    
    PlugPDFInkTool                  = 1,
    PlugPDFNoteTool                 = 2,
    PlugPDFEraserTool               = 3,
    PlugPDFSelectTool               = 4,
    PlugPDFTextHighlightTool        = 5,
    PlugPDFTextStrikeoutTool        = 6,
    PlugPDFTextUnderlineTool        = 7,
    PlugPDFLineTool                 = 8,
    PlugPDFRectangleTool            = 9,
    PlugPDFPolyTool                 = 10,
    PlugPDFSquareTool               = 11,
    PlugPDFCircleTool               = 12,
    
    PlugPDFToolEnd
};

#import "BaseAnnot.h"

@interface BaseTool : BaseAnnot

@property (nonatomic) PlugPDFTool tool;

@end