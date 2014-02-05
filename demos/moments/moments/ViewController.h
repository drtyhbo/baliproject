//
//  ViewController.h
//  moments
//
//  Created by Andreas Binnewies on 1/22/14.
//  Copyright (c) 2014 baliproject. All rights reserved.
//

#import <AssetsLibrary/AssetsLibrary.h>
#import <UIKit/UIKit.h>

#import "AssetInfo.h"
#import "Request.h"

@interface ViewController : UIViewController <UICollectionViewDataSource, UICollectionViewDelegateFlowLayout, RequestDelegate> {
  ALAssetsLibrary *_assetsLibrary;
  UICollectionView *_collectionView;
  NSMutableArray *_assets;
  int _currentUploadIdx;
  Request *_currentRequest;
}

@end
