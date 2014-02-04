//
//  ViewController.h
//  moments
//
//  Created by Andreas Binnewies on 1/22/14.
//  Copyright (c) 2014 baliproject. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <AssetsLibrary/AssetsLibrary.h>

@interface ViewController : UIViewController <UICollectionViewDataSource, UICollectionViewDelegateFlowLayout> {
  ALAssetsLibrary *_assetsLibrary;
  UICollectionView *_collectionView;
  NSArray *_assets;
}

@end
