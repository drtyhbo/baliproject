//
//  WebViewController.m
//  live-mockup
//
//  Created by Andreas Binnewies on 1/25/14.
//  Copyright (c) 2014 Andreas Binnewies. All rights reserved.
//

#import "WebViewController.h"

#import <CoreLocation/CoreLocation.h>

@interface WebViewController ()

@end

@implementation WebViewController

- (void)loadView {
  _webView = [[UIWebView alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
  _webView.delegate = self;
  self.view = _webView;

  _ctx = [_webView valueForKeyPath:@"documentView.webView.mainFrame.javaScriptContext"];
  
  NSURL *htmlURL = [NSURL fileURLWithPath:[[NSBundle mainBundle] pathForResource:@"main" ofType:@"html"]];
  NSURLRequest *htmlRequest = [NSURLRequest requestWithURL:htmlURL];
  [_webView loadRequest:htmlRequest];
}

- (void)loadAssets {
  NSMutableArray *mutableAssets = [[NSMutableArray alloc] init];
  
  _assetsLibrary = [[ALAssetsLibrary alloc] init];
  [_assetsLibrary enumerateGroupsWithTypes:ALAssetsGroupAll
                                usingBlock:^(ALAssetsGroup *group, BOOL *stop) {
                                  if (group == nil) {
                                    [self jsStart:mutableAssets];
                                  }
                                  [group enumerateAssetsUsingBlock:^(ALAsset *asset, NSUInteger index, BOOL *stop) {
                                    if (!asset) {
                                      return;
                                    }
                                    [mutableAssets addObject:asset];
                                  }];
                                } failureBlock:^(NSError *error) {
                                }];
}

#pragma mark UIWebViewDelegate

- (void)webViewDidFinishLoad:(UIWebView *)webView {
  [self loadAssets];
}

#pragma mark ios -> javascript

- (void)jsStart:(NSArray *)assets {
  NSMutableArray *jsAssets = [[NSMutableArray alloc] init];
  for (ALAsset *asset in assets) {
    NSDate *date = [asset valueForProperty:ALAssetPropertyDate];
    CLLocation *location = [asset valueForProperty:ALAssetPropertyLocation];
    NSURL *url = [asset valueForProperty:ALAssetPropertyAssetURL];

    UIImage *image = [UIImage imageWithCGImage:[asset thumbnail] scale:2 orientation:UIImageOrientationUp];
    NSString *base64image = [UIImageJPEGRepresentation(image, 1.0) base64EncodedStringWithOptions:0];
    
    NSDictionary *jsAsset = @{
      @"date": date,
      @"location": location == nil ?
        [JSValue valueWithNullInContext:_ctx] :
        @{
          @"latitude": [JSValue valueWithDouble:location.coordinate.latitude inContext:_ctx],
          @"longitude": [JSValue valueWithDouble:location.coordinate.longitude inContext:_ctx]
        },
      @"path": [url query],
      @"thumbnail": base64image
    };
    [jsAssets addObject:jsAsset];
  }

  _ctx[@"console"][@"log"] = ^(JSValue *message) {
    NSLog(@"%@", [message toString]);
  };
  
  JSValue *jsStart = _ctx[@"start"];
  [jsStart callWithArguments:@[jsAssets]];
}

@end
