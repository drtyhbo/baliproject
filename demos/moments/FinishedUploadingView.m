//
//  FinishedUploadingView.m
//  moments
//
//  Created by Andreas Binnewies on 2/5/14.
//  Copyright (c) 2014 baliproject. All rights reserved.
//

#import "FinishedUploadingView.h"

@implementation FinishedUploadingView

- (id)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self) {
      _blackGradientLayer = [CAGradientLayer layer];
      _blackGradientLayer.colors = @[
        (id)[UIColor colorWithRed:0 green:0 blue:0 alpha:0].CGColor,
        (id)[UIColor blackColor].CGColor
      ];
      _blackGradientLayer.startPoint = CGPointMake(1.0f, 0.0f);
      _blackGradientLayer.endPoint = CGPointMake(1.0f, 1.0f);
      [self.layer insertSublayer:_blackGradientLayer atIndex:0];
      
      _checkImageView = [[UIImageView alloc] init];
      [self addSubview:_checkImageView];

      self.isSuccess = YES;
    }
    return self;
}

- (void)setFrame:(CGRect)frame {
  [super setFrame:frame];

  CGRect bounds = self.bounds;
  _blackGradientLayer.frame = bounds;
  _checkImageView.frame = CGRectMake(bounds.size.width - 30, bounds.size.height - 30, 24, 24);
}

- (void)setIsSuccess:(BOOL)isSuccess {
  self->_isSuccess = isSuccess;
  _checkImageView.image = [UIImage imageNamed:isSuccess ? @"check-grey-128.png" : @"error-red-128.png"];
}

@end
