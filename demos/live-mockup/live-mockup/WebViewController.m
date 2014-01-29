//
//  WebViewController.m
//  live-mockup
//
//  Created by Andreas Binnewies on 1/25/14.
//  Copyright (c) 2014 Andreas Binnewies. All rights reserved.
//

#import "WebViewController.h"

@interface WebViewController ()

@end

@implementation WebViewController

- (void)viewDidLoad {
  self.view.backgroundColor = [UIColor colorWithRed:0.91 green:0.91 blue:0.91 alpha:1.0];

  CGRect bounds = [[UIScreen mainScreen] bounds];
  double statusHeight = [UIApplication sharedApplication].statusBarFrame.size.height;
  
  _webView = [[UIWebView alloc] initWithFrame:CGRectMake(0, statusHeight, bounds.size.width, bounds.size.height - statusHeight)];
  [self.view addSubview:_webView];
  
  NSURL *htmlURL = [NSURL fileURLWithPath:[[NSBundle mainBundle] pathForResource:@"iphone-main" ofType:@"html"]];
  NSURLRequest *htmlRequest = [NSURLRequest requestWithURL:htmlURL];
  [_webView loadRequest:htmlRequest];
}

@end
