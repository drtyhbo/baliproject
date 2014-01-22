//
//  ViewController.h
//  moments
//
//  Created by Andreas Binnewies on 1/22/14.
//  Copyright (c) 2014 baliproject. All rights reserved.
//

#import <UIKit/UIKit.h>

#import "Moments.h"

@interface ViewController : UIViewController <UICollectionViewDataSource, UICollectionViewDelegateFlowLayout> {
  Moments *_moments;
  UICollectionView *_collectionView;
}

@end
