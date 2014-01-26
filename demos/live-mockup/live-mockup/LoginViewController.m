//
//  LoginViewController.m
//  live mockup
//
//  Created by Andreas Binnewies on 1/25/14.
//  Copyright (c) 2014 Andreas Binnewies. All rights reserved.
//

#import "LoginViewController.h"

#import "WebViewController.h"

@interface LoginViewController ()

@end

@implementation LoginViewController

- (void)viewDidLoad {
  [super viewDidLoad];

  FBLoginView *loginView = [[FBLoginView alloc] init];
  loginView.frame = CGRectOffset(loginView.frame, 5, 5);
  loginView.delegate = self;

  [self.view addSubview:loginView];
  
  [loginView sizeToFit];
}

#pragma mark FBLoginViewDelegate

- (void)loginViewFetchedUserInfo:(FBLoginView *)loginView user:(id<FBGraphUser>)user {
  [self.navigationController pushViewController:[[WebViewController alloc] init] animated:YES];
}

@end
