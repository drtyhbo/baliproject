//
//  AssetCell.m
//  moments
//
//  Created by Andreas Binnewies on 1/22/14.
//  Copyright (c) 2014 baliproject. All rights reserved.
//

#import "AssetCell.h"

@implementation AssetCell

- (id)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self) {
      CGRect bounds = self.bounds;

      _imageView = [[UIImageView alloc] initWithFrame:bounds];
      _imageView.clipsToBounds = YES;
      _imageView.contentMode = UIViewContentModeScaleAspectFill;
      [self addSubview:_imageView];
    }
    return self;
}

- (void)prepareForReuse {
  [self->_assetInfo.progressView removeFromSuperview];
  [self->_assetInfo.finishedView removeFromSuperview];
}

- (void)setAssetInfo:(AssetInfo *)assetInfo {
  self->_assetInfo = assetInfo;
  
  _imageView.image = assetInfo.image;

  CGRect bounds = self.bounds;
  assetInfo.progressView.frame = CGRectMake(10, bounds.size.height - 12, bounds.size.width - 20, 2);
  [self addSubview:assetInfo.progressView];
  
  assetInfo.finishedView.frame = CGRectMake(0, bounds.size.height - 40, bounds.size.width, 40);
  [self addSubview:assetInfo.finishedView];
}

@end
