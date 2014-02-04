//
//  AssetCell.m
//  moments
//
//  Created by Andreas Binnewies on 1/22/14.
//  Copyright (c) 2014 baliproject. All rights reserved.
//

#import "AssetCell.h"

@implementation AssetCell

@synthesize image;

- (id)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self) {
      _imageView = [[UIImageView alloc] initWithFrame:[self bounds]];
      _imageView.clipsToBounds = YES;
      _imageView.contentMode = UIViewContentModeScaleAspectFill;
      [self addSubview:_imageView];
    }
    return self;
}

- (void)setImage:(UIImage *)newImage {
  self->image = newImage;
  _imageView.image = newImage;
}

@end
