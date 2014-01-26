//
//  WebViewController.h
//  live-mockup
//
//  Created by Andreas Binnewies on 1/25/14.
//  Copyright (c) 2014 Andreas Binnewies. All rights reserved.
//

#import <UIKit/UIKit.h>

#import <AssetsLibrary/AssetsLibrary.h>
#import <JavaScriptCore/JavaScriptCore.h>

@interface WebViewController : UIViewController <UIWebViewDelegate> {
  UIWebView *_webView;
  ALAssetsLibrary *_assetsLibrary;
  JSContext *_ctx;
}

@end
