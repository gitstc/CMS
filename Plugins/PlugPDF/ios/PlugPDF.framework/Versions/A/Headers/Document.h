/****************************************************************************
 **
 ** Copyright (C) 2013 ePapyrus, Inc.
 ** All rights reserved.
 **
 ** This file is part of the PlugPDF SDK for iOS.
 **
 ****************************************************************************/

#import <UIKit/UIKit.h>

#import "FieldDefine.h"
#import "CheckBoxFieldDrawDelegate.h"

@class BaseAnnot;
@class SignatureField;
@class PlugPDFOutlineItem;
@class PlugPDFDocumentView;

/**
 * PlugPDFDocument
 *
 * @file PlugPDF/Document.h
 * 
 * A PlugPDFDocument object can represent either some PDF data or a PDF file, implementing methods for drawing, searching and getting data.
 *
 * PlugPDFDocument objects can be initialized both with some PDF data or with a string path representing a PDF file.
 *
 */
@interface PlugPDFDocument : NSObject

/**
 * Indicates whether the current document is modified or not.
 *
 */
@property (nonatomic) BOOL modified;

/**
 * Indicates whether the current document is on stream mode or not.
 *
 */
@property (nonatomic) BOOL onStream;

/**
 * A PlugPDFDocumentView.
 *
 */
@property (nonatomic, strong) PlugPDFDocumentView* documentView;

/**
 * Initializes a PlugPDFDocument object with the passed-in data.
 *
 * @param data
 *          The PDF data encapsulated in an NSData object.
 * @param password
 *          The password to unlock the PDF document, if encrypted.
 *
 * @return 
 *          A PlugPDFDocument object initialized with the passed-in data; otherwise nil if it can't be initialized.
 *
 * @throw CorruptedPDF
 *          Thrown when the passed-in data is not a PDF document or it is corrupted.
 * @throw PasswordMismatch
 *          Thrown when the passed-in password doesn't match the PDF document's password.
 *
 */
- (id)initWithData: (NSData*)data password: (NSString*)password;


/**
 * Initializes a PlugPDFDocument object with the given url.
 *
 * @param url
 *          The PDF document's public url.
 * @param password
 *          The password to unlock the PDF document, if encrypted.
 *
 * @throw Failed to download
 *          Thrown if the download fails.
 * @return
 *          A PlugPDFDocument object initialized with the passed-in data; otherwise nil if it can't be initialized.
 *
 */
- (id)initWithUrl: (NSURL*)url password:(NSString*)password;

/**
 * Initializes a PlugPDFDocument object with the given input stream.
 *
 * @param data
 *          The PDF data encapsulated in an NSInputStream object.
 * @param length
 *          The input stream's length.
 * @param password
 *          The password to unlock the PDF document, if encrypted.
 *
 * @return
 *          A PlugPDFDocument object initialized with the passed-in input stream, otherwise nil if it can't be initialized.
 *
 * @throw CorruptedPDF
 *          Thrown when the passed-in input stream is not a PDF document or it is corrupted.
 * @throw PasswordMismatch
 *          Thrown when the passed-in password doesn't match the PDF document's password.
 *
 */
- (id)initWithInputStream: (NSInputStream*)inputStream length: (NSUInteger)length password:(NSString*)password;

/**
 * Initializes a PlugPDFDocument object with the passed-in data.
 *
 * @param path
 *          The PDF file's full path.
 * @param password
 *          The password to unlock the PDF document, if encrypted.
 *
 * @return
 *          A PlugPDFDocument object initialized with the passed-in data; otherwise nil if it can't be initialized.
 *
 * @throw CorruptedPDF
 *          Thrown when the passed-in data is not a PDF document or it is corrupted.
 * @throw PasswordMismatch
 *          Thrown when the passed-in password doesn't match the PDF document's password.
 *
 */
- (id)initWithPath: (NSString*)path password: (NSString*)password;

/**
 * Initializes a PlugPDFDocument object with the data from a JetStream connection.
 *
 * @param url
 *          The JetStream server's url encapsulated into an NSURL object.
 * @param port
 *          The JetStream server's port number.
 * @param filename
 *          The PDF file name to be opened on the JetStream server.
 * @param password
 *          The password to unlock the PDF document, if encrypted.
 *
 * @return
 *          A PlugPDFDocument object initialized with the passed-in data; otherwise nil if it can't be initialized.
 *
 * @throw ConnectionFailed
 *          Thrown when a connection failure occurs.
 * @throw CorruptedPDF
 *          Thrown when the passed-in data is not a PDF document or it is corrupted.
 * @throw PasswordMismatch
 *          Thrown when the passed-in password doesn't match the PDF document's password.
 *
 */
- (id)initWithJetStreamUrl: (NSURL*)url
                      port: (NSInteger)port
                  filename: (NSString*)filename
                  password: (NSString*)password;

#pragma mark - document

/**
 * Returns the number of pages in the document.
 *
 */
- (NSInteger)pageCount;

/**
 * Returns the page size at the given page index.
 *
 * @param pageIdx
 *          The zero-based index of the page from which to get the size.
 *
 * @return
 *          The size of the page; otherwise 72 x 72 if the page index is not valid.
 *
 */
- (CGSize)pageSize: (NSInteger)pageIdx;

/**
 * Given a page index, creates and returns a new UIImage object initialized with the content fitting the given size.
 *
 * @param pageIdx
 *          The zero-based index of the page to be drawn.
 * @param size
 *          The page size.
 *
 * @return 
 *          A new UIImage object, otherwise nil if the page index is not valid.
 *
 */
- (UIImage *)drawPage: (NSInteger)pageIdx size: (CGSize)size;

/**
 * Given a thumbnail page's index, creates and returns a new UIImage object initialized with the thumbnail page's content fitting the given size.
 *
 * @param pageIdx
 *          The zero-based index of the thumbnail page to be drawn.
 * @param size
 *          The thumbnail page's size.
 *
 * @return
 *          A new UIImage object, otherwise nil if the thumbnail page's index is not valid.
 *
 */
- (UIImage *)drawPage2: (NSInteger)pageIdx size: (CGSize)size;

/**
 * Creates and returns a new UIImage object initialized with the page content in the specified rectangle, fitting the screen size.
 *
 * @param pageIdx
 *          The zero-based index of the page to be drawn.
 * @param size
 *          The page's size.
 * @param tileRect
 *          The rectangle in which to draw the page content.
 * @param zoom
 *          The scale factor applied when interpreting the image data.
 *
 * @return 
 *          A new UIImage object, otherwise nil if the page index is not valid.
 *
 */
- (UIImage *)drawTile: (NSInteger)pageIdx
                 size: (CGSize)size
             tileRect: (CGRect)tileRect
                 zoom: (CGFloat)zoom;

/**
 * Releases the content of the given page index.
 *
 * @param pageIdx
 *          The zero-based index of the page whose content is to be released.
 *
 */
- (void)releasePage: (NSInteger)pageIdx;

#pragma mark - watermark


/**
 * Inserts a text watermark into a PDF file.
 *
 * @param pages
 *          The array of pages containing the page numbers.
 * @param pageLen
 *          The number of pages to be drawn.
 * @param point
 *          The starting point where you want to draw.
 * @param zoom
 *          The text to be written.
 * @param size
 *          The text size.
 * @param rotate
 *          The rotation angle.
 * @param opacity
 *          The text opacity (an opacity equal to 0 means a transparent text).
 */
- (void)insertTextWaterMark: (NSInteger)pages
                    pageLen:(NSInteger)pageLen
                      point:(CGPoint)point
                       text:(NSString *)text
                       size:(NSInteger)size
                     rotate:(double)rotate
                    opacity:(double)opacity;

#pragma mark - richmedia

- (void)insertVideo: (NSInteger)page
            imgPath: (NSURL*)imgPath
            imgRect: (CGRect)imgRect
          mediaPath: (NSURL*)mediaPath
          mediaSize: (CGSize)mediaSize
    videoPlayerPath: (NSURL*)videoPlayerPath;

#pragma mark - text

/**
 * Finds all the instances of the specified string in the given page index.
 *
 * @param string
 *          The string to be found.
 * @param pageIdx
 *          The zero-based index of the page in which the specified string is to be found.
 *
 * @return 
 *          A new NSArray object. Every hit is added to the NSArray instance as a CGRect object. If there are no hits, an empty array is returned.
 *
 */
- (NSArray*)findString: (NSString*)string page: (NSInteger)pageIdx;

/**
 * Removes all the accents from the PDF file.
 *
 *
 * @param int
 *         ASCII number.
 *
 * @return
 *         ASCII number of the accent removed.
 */
- (int)removeAccent: (int)asciiNum;

#pragma mark - outline

/**
 * Returns a boolean value indicating whether or not the PlugPDFDocument object contains any outline data.
 *
 * @return 
 *          YES if the PlugPDFDocument object contains outline data; otherwise NO.
 *
 */
- (BOOL)containsOutline;

/**
 * Returns a new NSArray object containing a set of PlugPDFOutlineItem instances. The order applied is ascending, according to the page indexes of outline data.
 *
 * @return 
 *          A new NSArray object. Every outline element is added to the NSArray instance as a PlugPDFOutlineItem object. If there are no elements, an empty array is returned.
 *
 */
- (NSArray*)outlines;

/**
 * Removes the passed-in outline item from the table view and the PDF document.
 *
 * @param item
 *          The outline item to be removed.
 *
 */
- (void)removeOutlineItem: (PlugPDFOutlineItem*)item;

/**
 * Edits both the title and the pageIdx of the passed-in outline item.
 *
 * @param item
 *          The outline item to be edited.
 * @param title
 *          The new title.
 * @param pageIdx
 *          The new zero-based, destination page index.
 *
 */
- (void)editOutlineItem: (PlugPDFOutlineItem*)item
                  title: (NSString*)title
                pageIdx: (NSInteger)pageIdx;

/**
 * Adds a new PlugPDFOutlineItem object with the passed-in parameters.
 *
 * @param title
 *          The new title.
 * @param pageIdx
 *          The new zero-based, destination page index.
 * @param parent
 *          The PlugPDFOutlineItem object's parent.
 * @param after
 *          The object before the new PlugPDFOutlineItem.
 *
 */
- (void)addOutlineItemWithTitle: (NSString*)title
                        pageIdx: (NSInteger)pageIdx
                         parent: (PlugPDFOutlineItem*)parent
                          after: (PlugPDFOutlineItem*)after;

/**
 * Adds a PlugPDFOutlineItem tree using a PlugPDFOutlineItem array.
 * 
 *   @param itemArray
 *             The PlugPDFOutlineItem array.
 *
 */
- (void)updatePdfOutlineTree: (NSArray*)itemArray;

#pragma mark - search

/**
 *
 * Excludes accents when searching.
 *
 */
@property (nonatomic) bool enableExcludeAccentWhenSearch;

#pragma mark - annotation

/**
 * Loads an annotation on the page index.
 * This method must be called before calling 'annots:'
 *
 * @param pageIdx
 *          The zero-based index of the page to be loaded.
 *
 */
- (void)loadAnnots: (NSInteger)pageIdx;

/**
 * Removes the given annotation.
 *
 * @param annot
 *          The annotation id to be removed.
 *
 */
- (void)removeAnnot: (BaseAnnot*)annot;

/**
 * Saves the given annotation.
 *
 * @param annot
 *          The annotation id to be saved.
 *
 */
- (void)saveAnnot: (BaseAnnot*)annot;

/**
 * Returns an NSArray object of BaseAnnot instances.
 *
 * @param pageIdx
 *          The zero-based page in which to add the annotations.
 *
 * @return
 *          An NSArray object. Every annotation element is added to the NSArray object as a BaseAnnot instance. If there are no elements, an empty array is returned.
 *
 */
- (NSArray*)annots: (NSInteger)pageIdx;

/**
 * Imports annotations from the given XFDF file, and merges them into a PDF file.
 *
 * @param xfdf
 *          An NSURL object representing the source file's path.
 *
 */
- (void)importAnnotFromXFDF: (NSURL*)xfdf;

/**
 * Imports annotations from the passed-in XFDF file, merging them into the source PDF file. Then the result is saved in the destination PDF file.
 *
 * @param xfdf
 *          The NSURL object representing the XFDF file.
 * @param src
 *          The NSURL object representing a PDF file for merging.
 * @param password
 *          The source PDF file's password.
 * @param dest
 *          An NSURL object representing the PDF file path to be saved.
 *
 */
+ (void)importAnnotFromXFDF: (NSURL*)xfdf
                    srcPath: (NSURL*)src
                   password: (NSString*)password
                   destPath: (NSURL*)dest;

/**
 * Exports annotations to the given XFDF file.
 *
 * @param xfdf
 *          An NSURL object representing the output file's path.
 *
 */
- (void)exportAnnotToXFDF: (NSURL*)xfdf;

/**
 * Exports annotations from a PDF file to an XFDF file.
 *
 * @param xfdf
 *          An NSURL object representing the destination XFDF file.
 * @param src
 *          An NSURL object representing a source PDF file.
 * @param password
 *          The source PDF file's password.
 *
 */
+ (void)exportAnnotToXFDF: (NSURL*)xfdf
                  srcPath: (NSURL*)src
                 password: (NSString*)password;

#pragma mark - form field

/**
 * Returns a new NSArray object containing BaseField objects.
 *
 * @param pageIdx
 *          The zero-based page index from which to take the BaseField objects.
 *
 * @return
 *          A new NSArray object. Every annotation is added to the NSArray as a BaseField object. If there are no elements, this method returns an empty array.
 *
 */
- (NSArray*)fields: (NSInteger)pageIdx;

/**
 * Returns a new NSArray object containing BaseField objects.
 *
 * @param pageIdx
 *          The zero-based page index from which to take the BaseField objects.
 * @param title
 *          The field's title.
 *
 * @return
 *          A new NSArray object. Every annotation is added to the NSArray as a BaseField object. If there are no elements, this method returns an empty array.
 *
 */
- (NSArray*)fields: (NSInteger)pageIdx title: (NSString*)title;

/**
 * Clears the values of all the fields.
 *
 * @param pageIdx
 *          The zero-based page index from which to clear all the values.
 *
 */
- (void)clearAllField: (NSInteger)pageIdx;

/**
 * Clears the field value according to the given title.
 *
 * @param pageIdx
 *          The zero-based page index from which to clear the value.
 * @param title
 *          The title of the field to be cleared.
 *
 */
- (void)clearFieldWithPage: (NSInteger)pageIdx
                     title: (NSString*)title;

/**
 * Returns the field's state as a PlugPDFFieldState value.
 *
 * @param pageIdx
 *          The zero-based index of the page.
 * @param title
 *          The field's title.
 *
 * @return
 *          The possible values are available in the PlugPDFFieldState enumeration.
 *
 */
- (PlugPDFFieldState)fieldStateWithPage: (NSInteger)pageIdx title: (NSString*)title;

/**
 * Returns the field's state as a PlugPDFFieldState value.
 *
 * @param pageIdx
 *          The zero-based index of the page.
 * @param title
 *          The field's title.
 * @param name
 *          The field's name.
 *
 * @return
 *          The possible state values are available in the PlugPDFFieldState enumeration.
 *
 */
- (PlugPDFFieldState)fieldStateWithPage: (NSInteger)pageIdx title: (NSString*)title name: (NSString*)name;

/**
 * Sets the PlugPDFFieldState value with the passed-in parameters.
 *
 * @param pageIdx
 *          The zero-based index of the page.
 * @param title
 *          The field's title.
 * @param state
 *          The possible state values are available in the PlugPDFFieldState enumeration.
 *
 */
- (void)setFieldStateWithPage: (NSInteger)pageIdx title: (NSString*)title state: (PlugPDFFieldState)state;

/**
 * Sets the PlugPDFFieldState value with the passed-in parameters.
 *
 * @param pageIdx
 *          The zero-based index of the page.
 * @param title
 *          The field's title.
 * @param name
 *          The field's name.
 * @param state
 *          The possible state values are available in the PlugPDFFieldState enumeration.
 *
 */
- (void)setFieldStateWithPage: (NSInteger)pageIdx title: (NSString*)title name: (NSString*)name state: (PlugPDFFieldState)state;

/**
 * Sets the state of all the fields.
 *
 * @param state
 *          The possible state values are available in the PlugPDFFieldState enumeration.
 *
 */
- (void)setFieldGlobalState: (PlugPDFFieldState)state;

/**
 * Sets the background color of all the text fields.
 *
 * @param color
 *          The UIColor instance to be set as the background color.
 *
 */
- (void)setTextFieldBackgroundColor: (UIColor*)color;

/**
 * Sets the background color of the field with the passed-in parameters.
 *
 * @param pageIdx
 *          The zero-based index of the page.
 * @param title
 *          The field's title.
 * @param color
 *          The UIColor instance to be set as the background color.
 *
 */
- (void)setFieldBackgroundColorWithPage: (NSInteger)pageIdx
                                  title: (NSString*)title
                                  color: (UIColor*)color;
/**
 * Sets the mask color.
 *
 * @param color
 *          The UIColor instance to be set as the mask color.
 *
 */
- (void)setFieldMaskColor: (UIColor*)color;

/**
 * Sets field border color.
 *
 * @param color
 *          The UIColor instance what you want to set as border color.
 *
 */
- (void)setFieldBorderColor: (UIColor*)color;

/**
 * Sets whether the field border line is hidden or not.
 *
 * @param pageIdx
 *          The zero-based index of the page.
 * @param title
 *          The field's title.
 * @param  hidden
 *          YES: hides the field border; NO: dispays the field border.
 *
 */
- (void)setFieldBorderWithPage: (NSInteger)pageIdx
                         title: (NSString*)title
                        hidden: (BOOL)hidden;

/**
 * Returns an NSArray object containing the TextField value.
 *
 * @param pageIdx
 *          The zero-based index of the page.
 * @param title
 *          The field's title.
 *
 * @return
 *          A new NSArray object. Every annotation is added to an NSString object. If there are no elements, an empty array is returned.
 *
 */
- (NSString*)textFieldValueWithPage: (NSInteger)pageIdx title: (NSString*)title;

/**
 * Sets the TextField value with the passed-in parameters.
 *
 * @param pageIdx
 *          The zero-based index of the page.
 * @param title
 *          The field's title.
 * @param text
 *          The TextField value.
 *
 */
- (void)setTextFieldWithPage: (NSInteger)pageIdx title: (NSString*)title text: (NSString*)text;

/**
 * Sets CheckBoxFieldDrawDelegate for custom drawing.
 *
 * @param delegate
 *          A PlugPDFCheckBoxFieldDrawDelegate object.
 *
 */
- (void)setCheckBoxFieldDrawDelegate: (id <PlugPDFCheckBoxFieldDrawDelegate>) delegate;

/**
 * Returns a new NSArray object containing the CheckBoxField checked value.
 *
 * @param pageIdx
 *          The zero-based index of the page.
 * @param title
 *          The field's title.
 *
 * @return
 *          A new NSArray object. Every annotation is added to an NSNumber object with BOOL. If there are no elements, an empty array is returned.
 *
 */
- (BOOL)checkBoxFieldValueWithPage: (NSInteger)pageIdx title: (NSString*)title;

/**
 * Sets the CheckBoxField value with the passed-in parameters.
 *
 * @param pageIdx
 *          The zero-based index of the page.
 * @param title
 *          The field's title.
 * @param checked
 *          The CheckBoxField value.
 *
 */
- (void)setCheckBoxFieldWithPage: (NSInteger)pageIdx title: (NSString*)title checked: (BOOL)checked;

/**
 * Returns a new NSArray object containing the RadioButtonField's checked value.
 *
 * @param pageIdx
 *          The zero-based index of the page.
 * @param title
 *          The field's title.
 * @param name
 *          The field's name.
 *
 * @return
 *
 */
- (BOOL)radioButtonFieldValueWithPage: (NSInteger)pageIdx title: (NSString*)title name: (NSString*)name;

/**
 * Sets the RadioButtonField with the passed-in parameters.
 *
 * @param pageIdx
 *          The zero-based index of the page.
 * @param title
 *          The field's title.
 * @param name
 *          The field's name.
 * @param checked
 *          The CheckBoxField value.
 *
 */
- (void)setRadioButtonFieldWithPage: (NSInteger)pageIdx title: (NSString*)title name: (NSString*)name checked: (BOOL)checked;

/**
 * Returns a new NSArray object containing the ButtonField's image value.
 *
 * @param pageIdx
 *          The zero-based index of the page.
 * @param title
 *          The field's title.
 *
 * @return
 *          A new NSArray object. Every annotation element is added to an UIImage object. If there are no elements, an empty array is returned.
 *
 */
- (UIImage*)buttonFieldValueWithPage: (NSInteger)pageIdx title: (NSString*)title;

/**
 * Sets the ButtonField's image value with the passed-in params.
 *
 * @param pageIdx
 *          The zero-based index of the page.
 * @param title
 *          The field's title.
 * @param image
 *          The ButtonField's image value.
 *
 */
- (void)setButtonFieldWithPage: (NSInteger)pageIdx title: (NSString*)title image: (UIImage*)image;

/**
 * Returns an NSArray object containing the comboBox value.
 *
 * @param pageIdx
 *          The zero-based index of the page.
 * @param title
 *          The comboBox title.
 *
 * @return
 *          A new NSArray object. Every annotation is added to an NSString object. If there are no elements, an empty array is returned.
 *
 */
- (NSString*)comboBoxFieldValueWithPage: (NSInteger)pageIdx title: (NSString*)title;

/**
 * Sets the comboBox value with the passed-in parameters.
 *
 * @param pageIdx
 *          The zero-based index of the page.
 * @param title
 *          The field's title.
 * @param text
 *          The comboBox value.
 *
 */
- (void)setcomboBoxFieldWithPage: (NSInteger)pageIdx title: (NSString*)title text: (NSString*)text;

#pragma mark - flatten

/**
 * Flatten annotations.
 *
 */
- (void)flattenAnnotations;

/**
 * Flattens the form fields.
 *
 * @param includeButtonField
 *          YES: flatten the button field; NO: don't flatten the button field
 * @parma useCustomAppearance
 *          YES: flatten with the custom appearance; otherwise NO.
 *
 */
- (void)flattenFormFields: (BOOL)includeButtonField : (BOOL)useCustomAppearance;

#pragma mark - encrypt

/**
 * Returns the user's access permissions.
 *
 * @param print
 *          Print the document.
 * @param modifyContent
 *          Modify the document's content.
 * @param copyContent
 *          Copy; otherwise extract content form the document.
 * @param modifyAnnot
 *          Add/Modify text annotations, fill in interactive form fields.
 * @param fillFiled
 *          Fill in existing interactive form fields.
 * @param extract
 *          Extract content.
 * @param documentAssembly
 *          Assemble the document.
 *
 * @return
 *          The user's access permissions.
 *
 */
+ (NSInteger)getUserAccessPermissionsWithPrint: (BOOL)print
                                 modifyContent: (BOOL)modifyContent
                                   copyContent: (BOOL)copyContent
                                   modifyAnnot: (BOOL)modifyAnnot
                                     fillFiled: (BOOL)fillFiled
                                       extract: (BOOL)extract
                              documentAssembly: (BOOL)documentAssembly;

/**
 * Encrypts the document.
 *
 * @param userPass
 *          The user password.
 * @param ownerPass
 *          The owner password.
 * @param perm
 *          The user's access permissions. This value can be obtained with the getUserAccessPermissionsWithPrint method.
 *
 * @return 
 *          YES: success; otherwise NO.
 *
 */
- (BOOL)encryptUserPassword: (NSString*)userPass
              OwnerPassword: (NSString*)ownerPass
                 permission: (NSInteger)perm;

/**
 * Returns a Boolean value indicating whether the PlugPDFDocument object is opened with the owner password.
 *
 */
- (BOOL)openWithOwnerPassword;

/**
 * Returns a Boolean value indicating whether the PlugPDFDocument object has the print permission set.
 * (Revision 2) Print the document.
 * (Revision 3) Print the document (possibly not with the highest quality level, depending on whether or not the bit 12 is set).
 *
 */
- (BOOL)printPermission;

/**
 * Returns a Boolean value indicating whether the PlugPDFDocument object has the modify content permission set.
 * Modify the document's content with operations other than modify annot, fill field, and document assembly permissions.
 *
 */
- (BOOL)modifyContentPermission;

/**
 * Returns a Boolean value indicating whether the PlugPDFDocument object has the modify content permission set.
 * (Revision 2) Copy; otherwise extract content from the document, including text and graphics, and supporting accessibility for disabled users (or for other purposes).
 * (Revision 3) Copy; otherwise extract text and graphics from the document with operations other than the extract permission.
 *
 */
- (BOOL)copyContentPermission;

/**
 * Returns a Boolean value indicating whether the PlugPDFDocument object has the modify annotation permission set.
 * Add or modify text annotations and fill in interactive form fields. If the bit 4 is set, create or modify interactive form fields (including signature fields).
 *
 */
- (BOOL)modifyAnnotPermission;

/**
 * Returns a Boolean value indicating whether the PlugPDFDocument object has the fill interactive form field permission set.
 * (Revision 3 only) Fill in existing interactive form fields (including signature fields).
 *
 */
- (BOOL)fillFiledPermission;

/**
 * Returns a Boolean value indicating whether the PlugPDFDocument object has the extract permission set.
 * (Revision 3 only) Extract text and graphics, supporting accessibility for disabled users (or for other purposes).
 *
 */
- (BOOL)extractPermission;

/**
 * Returns a Boolean value indicating whether the PlugPDFDocument object has the assembly permission set.
 * (Revision 3 only) Assemble the document (insert, rotate or delete pages, and create bookmarks or thumbnail images).
 *
 */
- (BOOL)documentAssemblyPermission;

/**
 * Indicates whether the document at the specified path has a user password.
 *
 * @param path
 *          The PDF document's full path and filename.
 *
 * @returns 
 *          YES if the document has a password, otherwise NO.
 */
+ (BOOL)hasUserPasswordAtPath: (NSString*)path;

#pragma mark - save

/**
 * Saves the document in the specified location in the application sandbox.
 * The URL path in which to write the document is obtained from the initWithPath method.
 * If the PlugPDFDocument is initialized with the initWithData method, save the PDF file with the saveAsFile method.
 *
 * @return
 *          YES if the save operation succeeds, otherwise NO.
 *
 * @throw IncorrectPath
 *          Thrown when the file path is not available and cannot be used.
 * @throw NoContentsModificationPermission
 *          Thrown when the PDF document's modified content is saved without proper permission.
 * @throw NoAnnotationsModificationPermission
 *          Thrown when the PDF document's modified annotations are saved without proper permission.
 * @throw NoFillFieldPermission
 *          Thrown when the PDF document's modified fields are saved without proper permission.
 * @throw NoDocumentAssemblyPermission
 *          Thrown when the assembled PDF document is saved without proper permission.
 *
 */
- (BOOL)saveFile:(BOOL) reload;

/**
 * Encrypts and saves the document in the specified location in the application sandbox.
 * The URL path in which to write the document is obtained from the initWithPath method.
 *
 * @param userPass
 *          User password to be set.
 * @parma ownerPass
 *          Owner password to be set.
 * @param perm
 *          User access permissions. This value can be obtained with the getUserAccessPermissionsWithPrint method in the PlugPDFDocument class.
 *
 * @return
 *          YES if the operation succeeds, otherwise NO.
 *
 * @throw IncorrectPath
 *          Thrown when the file path is not available and cannot be used.
 * @throw NoContentsModificationPermission
 *          Thrown when the PDF document's modified content is saved without proper permission.
 * @throw NoAnnotationsModificationPermission
 *          Thrown when the PDF document's modified annotations are saved without proper permission.
 * @throw NoFillFieldPermission
 *          Thrown when the PDF document's modified fields are saved without proper permission.
 * @throw NoDocumentAssemblyPermission
 *          Thrown when the assembled PDF document is saved without proper permission.
 *
 */
- (BOOL)saveEncryptedFileWithUserPassword: (NSString*)userPass
                            OwnerPassword: (NSString*)ownerPass
                               permission: (NSInteger)perm;

/**
 * Saves the document in the specified location in the application sandbox.
 *
 * @param url
 *          The file URL in which to write the document.
 *
 * @return 
 *          YES if the save operation succeeds, otherwise NO.
 *
 * @throw IncorrectPath
 *          Thrown when the file path is not available and cannot be used.
 * @throw NoContentsModificationPermission
 *          Thrown when the PDF document's modified content is saved without proper permission.
 * @throw NoAnnotationsModificationPermission
 *          Thrown when the PDF document's modified annotations are saved without proper permission.
 * @throw NoFillFieldPermission
 *          Thrown when the PDF document's modified fields are saved without proper permission.
 * @throw NoDocumentAssemblyPermission
 *          Thrown when the assembled PDF document is saved without proper permission.
 *
 */
- (BOOL)saveAsFile: (NSURL*)url;

/**
 * Encrypts and saves the document in the specified location in the application sandbox.
 *
 * @param url
 *          The file URL in which to write the document.
 * @param userPass
 *          User password to be set.
 * @parma ownerPass
 *          Owner password to be set.
 * @param perm
 *          User access permissions. This value can be obtained with the getUserAccessPermissionsWithPrint method in the PlugPDFDocument class.
 *
 * @return
 *          YES if the operation succeeds, otherwise NO.
 *
 * @throw IncorrectPath
 *          Thrown when the file path is not available and cannot be used.
 * @throw NoContentsModificationPermission
 *          Thrown when the PDF document's modified content is saved without proper permission.
 * @throw NoAnnotationsModificationPermission
 *          Thrown when the PDF document's modified annotations are saved without proper permission.
 * @throw NoFillFieldPermission
 *          Thrown when the PDF document's modified fields are saved without proper permission.
 * @throw NoDocumentAssemblyPermission
 *          Thrown when the assembled PDF document is saved without proper permission.
 *
 */
- (BOOL)saveAsEncryptedFile: (NSURL*)url
               UserPassword: (NSString*)userPass
              OwnerPassword: (NSString*)ownerPass
                 permission: (NSInteger)perm;

/**
 * Returns the specified location in the application sandbox.
 *
 */
- (NSURL*)saveFileURL;

#pragma mark - create

/**
 * Creates an empty PDF document with the passed-in parameters.
 *
 * @param dest
 *          The file's path.
 * @param size
 *          The file's size.
 *
 */
+ (void)createEmptyDocument: (NSURL*)path size: (CGSize)size;

#pragma mark - merger

/**
 * Merges the given PDF documents.
 *
 * @param srcfiles
 *          An NSArray containing an NSURL object with the PDF files to be merged.
 * @param outUrl
 *          The output file URL identifying the location in the application sandbox.
 *
 * @return
 *          0 if the merge operation succeeds; otherwise a non-zero value.
 *          MERGE_CORRUPTED_PDF		-1
 *          MERGE_PASSWORD              -2
 *          MERGE_FAIL_TO_BUILD		-3
 *
 */
+ (NSInteger)mergeFiles: (NSArray*)srcfiles
               password: (NSString*)password
                outFile: (NSURL*)outUrl;

- (void)transplantPage: (PlugPDFDocument*)srcDocument pageIdx:(NSInteger)pageIdx;

#pragma mark - signer

/**
 * Inserts an image into the given PDF file.
 *
 * @param srcPath
 *          The source PDF file path.
 * @param destPath
 *          The destination PDF file path.
 * @param imagePath
 *          The image file path.
 * @param password
 *          The source PDF file's password.
 * @param point
 *          The position of the image.
 * @param height
 *          The image height. The width will be scaled automatically keeping the aspact ratio.
 * @param pageIdx
 *          The zero-based page index where the image is placed on.
 *
 * @return
 *          0 if the merge operation succeeds; otherwise a non-zero value.
 *          ERROR_NOT_OPEN			-1001
 *          ERROR_NOT_ADD_IMAGESTAMP		-1005
 *          ERROR_NOT_SAVE_INCREMENTAL		-1010
 *          ERROR_LOAD_IMAGE			-1100
 *          ERROR_NULL_PAGE                     -1101
 *
 */
+ (NSInteger) insertImage: (NSURL*)srcPath
                 destPath: (NSURL*)destPath
                imagePath: (NSURL*)imagePath
                 password: (NSString*)password
                    point: (CGPoint)point
                   height: (CGFloat)height
                  pageIdx: (NSInteger)pageIdx;

/**
 * Creates a signature field as a place holder.
 *
 * @param srcPath
 *          The source PDF file's path.
 * @param destPath
 *          The destination PDF file's path.
 * @param contentPath
 *          The content file path. This is the source data for computing the digest.
 * @param password
 *          The source PDF file's password.
 * @param pageIdx
 *          The zero-based page index where the signature field will be placed on.
 * @param name
 *          The signature field's name.
 * @param reason
 *          The reason for signing.
 * @param location
 *          The location where the document is signed.
 *
 * @return
 *          A SignatureField object with a signature field title, and the file offset where the digest data starts in the file if the operation succeeds; nil otherwise.
 *
 */
+ (SignatureField*) createSignatureField: (NSURL*)srcPath
                                destPath: (NSURL*)destPath
                             contentPath: (NSURL*)contentPath
                                password: (NSString*)password
                                 pageIdx: (NSInteger)pageIdx
                                    name: (NSString*)name
                                  reason: (NSString*)reason
                                location: (NSString*)location;

/**
 * Injects the computed byte range digest data into the PDF file.
 *
 * @param srcPath
 *          The source PDF file's path.
 * @param token
 *          The token data to be injected.
 * @param offset
 *          The file offset where the digest data starts in the file.
 *
 * @return
 *          0 if the inject operation succeeds; otherwise a non-zero value.
 *          ERROR_WRITE_SIGNTOKEN			-2021
 *
 */
+ (NSInteger) injectDigestToken: (NSURL*)srcPath
                          token: (NSData*)token
                         offset: (NSNumber*)offset;

/**
 * Returns an NSArray object of SignatureField instances.
 *
 * @param srcPath
 *          The source PDF file's path.
 * @param password
 *          The source PDF file's password.
 *
 * @return
 *          An NSArray object of SignatureField instances if the operation succeeds; otherwise an empty NSArray.
 *
 */
+ (NSArray*) signatureFields: (NSURL*)srcPath
                    password: (NSString*)password;

/**
 * Returns the computed byte range digest data in the signature field according to the given parameters.
 *
 * @param srcPath
 *          The source PDF file's path.
 * @param contentPath
 *          The content file's path.
 * @param password
 *          The source PDF file's password.
 * @param pageIdx
 *          The zero-based page index where the signature field will be placed on.
 * @param fieldTitle
 *          The signature field title.
 *
 * @return
 *          The computed byte range digest data in the signature field, if the operation succeeds; otherwise a nil value.
 *
 */
+ (NSData*) readDigestToken: (NSURL*)srcPath
                contentPath: (NSURL*)contentPath
                   password: (NSString*)password
                    pageIdx: (NSInteger)pageIdx
                 fieldTitle: (NSString*)fieldTitle;

#pragma mark - extract text

/**
 * Returns an NSDictionary object containing the text extraction results.
 *
 * @param pageIdx
 *          The zero-based page index.
 * @param rect
 *          The rect of the page from which to extract text; CGRectZero means to extract all the text from the page.
 *
 * @return
 *          An NSDictionary object containing the extraction results; otherwise the nil value.
 *          @"Text"; the key for getting an NSString object.
 *          @"Rects"; the key for getting an NSArray object containing a CGRectValue for every character.
 *
 * @throw NoCopyContentsPermission
 *          Thrown when there aren't enough permissions (copy/extract) to perform this operation.
 *
 */
- (NSDictionary*)extractTextAndRects: (NSInteger)pageIdx inRect: (CGRect)rect;

/**
 * Returns an NSString object containing the text extraction result.
 *
 * @param pageIdx
 *          The zero-based page index.
 * @param rect
 *          The rect of the page from which to extract text; CGRectZero means to extract all the text from the page.
 *
 * @return
 *          An NSString object containing the extraction results; otherwise the nil value.
 *
 * @throw NoCopyContentsPermission
 *          Thrown when there aren't enough permissions (copy/extract) to perform this operation.
 *
 */
- (NSString*)extractText: (NSInteger)pageIdx inRect: (CGRect)rect;

/**
 * Returns an NSDictionary object containing the text extraction results.
 *
 * @param src
 *          The source file's url.
 * @param password
 *          The password to unlock the document, if encrypted.
 *
 * @return
 *          An NSDictionary object containing the extraction results; otherwise the nil value.
 *
 * @throw NoCopyContentsPermission
 *          Thrown when there aren't enough permissions (copy/extract) to perform this operation.
 *
 */
+ (NSDictionary*)extractTextSrc: (NSURL*)src password: (NSString*)password;

/**
 * Returns an NSString object containing the text extraction result.
 *
 * @param src
 *          The source file's url.
 * @param password
 *          The password to unlock the document, if encrypted.
 * @param pageIdx
 *          The (zero-based) page index from which to extract text.
 * @param rect
 *          The rect of the page from which to extract text; CGRectZero means to extract all the text from the page.
 *
 * @return
 *          An NSString object containing the extraction results; otherwise the nil value.
 *
 * @throw NoCopyContentsPermission
 *          Thrown when there aren't enough permissions (copy/extract) to perform this operation.
 *
 */
+ (NSString*)extractTextSrc: (NSURL*)src password: (NSString*)password pageIdx: (NSInteger)pageIdx rect: (CGRect)rect;

- (void) closeDoc;

- (BOOL) isOpen;
@end
