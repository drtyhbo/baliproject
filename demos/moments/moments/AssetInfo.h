//
//  AssetInfo.h
//  moments
//
//  Created by Andreas Binnewies on 2/4/14.
//  Copyright (c) 2014 baliproject. All rights reserved.
//

#import <AssetsLibrary/AssetsLibrary.h>
#import <Foundation/Foundation.h>

#include "FinishedUploadingView.h"

@interface AssetInfo : NSObject

@property (nonatomic, strong) UIImage *image;
@property (nonatomic, strong) ALAsset *asset;
@property (nonatomic, strong) UIProgressView *progressView;
@property (nonatomic, strong) FinishedUploadingView *finishedView;

@end
