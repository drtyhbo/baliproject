//
//  FinishedUploadingView.h
//  moments
//
//  Created by Andreas Binnewies on 2/5/14.
//  Copyright (c) 2014 baliproject. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface FinishedUploadingView : UIView {
  CAGradientLayer *_blackGradientLayer;
  UIImageView *_checkImageView;
}

@property (nonatomic) BOOL isSuccess;

@end
