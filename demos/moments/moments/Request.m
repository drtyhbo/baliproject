#import "Request.h"

@implementation Request

const NSString *URL = @"http://drtyhbo.net/";
const int REQUEST_TIMEOUT_SEC = 60;

+ (Request*)sendRequest:(NSString*)path postData:(NSDictionary*)postData filename:(NSString*)filename fileData:(NSData*)fileData delegate:(id)delegate {
  Request *request = [[Request alloc] init];
  request->_delegate = delegate;
  
  NSString *url = [NSString stringWithFormat:@"%@%@", URL, path];
  NSMutableURLRequest *urlRequest = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:url] cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:REQUEST_TIMEOUT_SEC];
  
  NSMutableData *requestData = [[NSMutableData alloc] init];
  
  NSString *boundary = @"--";
  for (id key in postData) {
      [requestData appendData:[[NSString stringWithFormat:@"\r\n--%@\r\n",boundary] dataUsingEncoding:NSUTF8StringEncoding]];
      [requestData appendData:[[NSString stringWithFormat:@"Content-Disposition: form-data; name=\"%@\"\r\n\r\n", key] dataUsingEncoding:NSUTF8StringEncoding]];
      [requestData appendData:[[request encodeUriComponent:[postData objectForKey:key]] dataUsingEncoding:NSUTF8StringEncoding]];
  }
  
  [requestData appendData:[[NSString stringWithFormat:@"\r\n--%@\r\n",boundary] dataUsingEncoding:NSUTF8StringEncoding]];
  [requestData appendData:[[NSString stringWithFormat:@"Content-Disposition: form-data; name=\"asset\"; filename=\"%@\"\r\n", filename] dataUsingEncoding:NSUTF8StringEncoding]];
  [requestData appendData:[@"Content-Type: application/octet-stream\r\n\r\n" dataUsingEncoding:NSUTF8StringEncoding]];
  [requestData appendData:fileData];
  [requestData appendData:[[NSString stringWithFormat:@"\r\n--%@--\r\n",boundary] dataUsingEncoding:NSUTF8StringEncoding]];
  
  [urlRequest setCachePolicy:NSURLRequestReloadIgnoringLocalCacheData];
  [urlRequest addValue:[NSString stringWithFormat:@"multipart/form-data; boundary=%@", boundary] forHTTPHeaderField: @"Content-Type"];
  [urlRequest setHTTPMethod: @"POST"];
  [urlRequest setHTTPBody: requestData];
  
  NSURLConnection *connection = [[NSURLConnection alloc] initWithRequest:urlRequest delegate:request];
  if (!connection) {
      return nil;
  }
  
  return request;
}

- (NSString*)encodeUriComponent:(NSString*)component {
    return (__bridge NSString*)CFURLCreateStringByAddingPercentEscapes(NULL, (CFStringRef)component, NULL, (CFStringRef)@"!*'();:@&=+$,/?%#[]", kCFStringEncodingUTF8);
}

#pragma mark - NSURLConnectionDelegate

- (void)connection:(NSURLConnection *)connection didReceiveResponse:(NSURLResponse *)response {
    _responseData = [[NSMutableData alloc] init];
    _expectedLength += response.expectedContentLength;
}

- (void)connection:(NSURLConnection *)connection didReceiveData:(NSData *)data {
    [_responseData appendData:data];
    _bytesReceieved += [data length];
    if ([_delegate respondsToSelector:@selector(requestBytesReceived:totalBytes:)]) {
        [_delegate requestBytesReceived:_bytesReceieved totalBytes:_expectedLength];
    }
}

- (void)connectionDidFinishLoading:(NSURLConnection *)connection {
    if ([_delegate respondsToSelector:@selector(requestSuccess:)]) {
        [_delegate requestSuccess:_responseData];
    }
}

- (void)connection:(NSURLConnection *)connection didFailWithError:(NSError *)error {
    if ([_delegate respondsToSelector:@selector(requestError:)]) {
        [_delegate requestError:error];
    }
}

- (void)connection:(NSURLConnection *)connection didSendBodyData:(NSInteger)bytesWritten totalBytesWritten:(NSInteger)totalBytesWritten totalBytesExpectedToWrite:(NSInteger)totalBytesExpectedToWrite {
    if ([_delegate respondsToSelector:@selector(requestBytesWritten:totalBytes:)]) {
        [_delegate requestBytesWritten:totalBytesWritten totalBytes:totalBytesExpectedToWrite];
    }
}

@end