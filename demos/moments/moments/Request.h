#import <Foundation/Foundation.h>

@protocol RequestDelegate <NSObject>
- (void)requestSuccess:(NSData*)data;
- (void)requestError:(NSError*)error;
- (void)requestBytesWritten:(int)bytesWritten totalBytes:(int)totalBytes;
- (void)requestBytesReceived:(int)bytesReceived totalBytes:(int)totalBytes;
@end

@interface Request : NSObject<NSURLConnectionDelegate> {
    NSMutableData *_responseData;
    int _expectedLength;
    int _bytesReceieved;
    id _delegate;
}

+ (Request*)sendRequest:(NSString*)path postData:(NSDictionary*)postData filename:(NSString*)filename fileData:(NSData*)fileData delegate:(id)delegate;

@end
