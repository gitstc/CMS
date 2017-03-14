/****************************************************************************
 **
 ** Copyright (C) 2013 ePapyrus, Inc.
 ** All rights reserved.
 **
 ** This file is part of the PlugPDF SDK for iOS.
 **
 ****************************************************************************/

#import <Foundation/Foundation.h>

/**
 * PlugPDFOutlineItem
 *
 * @file PlugPDF/OutlineItem.h
 *
 * A PlugPDFOutlineItem object represents the structure of a PDF document in the form of a tree-structured hierarchy.
 *
 */
@interface PlugPDFOutlineItem : NSObject

@property (nonatomic, strong) PlugPDFOutlineItem *parent;

@property (nonatomic, strong) NSMutableArray *children;

@property (nonatomic) NSInteger idx;

/**
 * The outline's title string.
 *
 */
@property (nonatomic, strong) NSString *title;

/**
 * The (zero-based) index of the destination page.
 *
 */
@property (nonatomic) NSInteger pageIdx;

/**
 * The depth level of the element in the outline tree structure.
 *
 */
@property (nonatomic) NSInteger depth;

/**
 * Initializes an outline with the passed-in values.
 *
 * @param title 
 *          The outline element's title.
 * @param pageIdx
 *          The (zero-based) index of the destination page.
 * @param depth
 *          The depth level of the element in the outline tree structure.
 *
 */
- (id)initWithParent: (PlugPDFOutlineItem*)parent
                 idx: (NSInteger)idx
               title: (NSString*)title
             pageIdx: (NSInteger)pageIdx
               depth: (NSInteger)depth;

- (NSArray*)outlines;

- (BOOL)removeItem: (PlugPDFOutlineItem*)item;

- (void)addItem: (PlugPDFOutlineItem*)item
          after: (PlugPDFOutlineItem*)after;

@end

@interface PlugPDFOutlineTree : NSObject

@property (nonatomic) BOOL modified;

@property (nonatomic, strong) PlugPDFOutlineItem *root;

- (NSArray*)outlines;

- (void)removeItem: (PlugPDFOutlineItem*)item;

- (void)addItem: (PlugPDFOutlineItem*)item
         parent: (PlugPDFOutlineItem*)parent
          after: (PlugPDFOutlineItem*)after;

@end
