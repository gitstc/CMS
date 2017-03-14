/****************************************************************************
 **
 ** Copyright (C) 2014 ePapyrus, Inc.
 ** All rights reserved.
 **
 ** This file is part of the PlugPDF SDK for iOS.
 **
 ****************************************************************************/

/**
 * PlugPDFFieldState
 *
 */
typedef NS_OPTIONS(NSUInteger, PlugPDFFieldState) {
    PlugPDFFieldReadWrite   = 0,    //Default.
    PlugPDFFieldReadOnly    = 1,    //
    PlugPDFFieldDisable     = 2     //
};
