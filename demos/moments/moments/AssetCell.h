//
//  AssetCell.h
//  moments
//
//  Created by Andreas Binnewies on 1/22/14.
//  Copyright (c) 2014 baliproject. All rights reserved.
//

#import <UIKit/UIKit.h>

#import <AssetsLibrary/AssetsLibrary.h>
#import "AssetInfo.h"

@interface AssetCell : UICollectionViewCell {
  UIImageView *_imageView;
}

@property (nonatomic, strong) AssetInfo *assetInfo;

@end
