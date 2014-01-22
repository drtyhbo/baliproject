//
//  ViewController.m
//  moments
//
//  Created by Andreas Binnewies on 1/22/14.
//  Copyright (c) 2014 baliproject. All rights reserved.
//

#import "ViewController.h"

#import <AssetsLibrary/AssetsLibrary.h>
#import "AssetCell.h"
#import "Moment.h"

@interface ViewController ()

@end

@implementation ViewController

- (void)viewDidLoad {
  [super viewDidLoad];

  UICollectionViewFlowLayout *flowLayout = [[UICollectionViewFlowLayout alloc] init];
  _collectionView = [[UICollectionView alloc] initWithFrame:[UIScreen mainScreen].applicationFrame collectionViewLayout:flowLayout];
  _collectionView.delegate = self;
  _collectionView.dataSource = self;
  [_collectionView registerClass:[AssetCell class] forCellWithReuseIdentifier:@"Asset"];
  [self.view addSubview:_collectionView];
  
  _moments = [[Moments alloc] init];
  [_moments loadMoments:^void (Moments *moments) {
    [_collectionView reloadData];
  }];
}

- (void)didReceiveMemoryWarning {
  [super didReceiveMemoryWarning];
  // Dispose of any resources that can be recreated.
}

- (UIImage*)getImageForIndexPath:(NSIndexPath *)indexPath {
  Moment *moment = (Moment*)[_moments.moments objectAtIndex:indexPath.section];
  return (UIImage*)[moment.assets objectAtIndex:indexPath.row];
}

#pragma mark - UICollectionView Datasource

- (NSInteger)collectionView:(UICollectionView *)view numberOfItemsInSection:(NSInteger)section {
  Moment *moment = (Moment*)[_moments.moments objectAtIndex:section];
  return [moment.assets count];
}

- (NSInteger)numberOfSectionsInCollectionView:(UICollectionView *)collectionView {
  return [_moments.moments count];
}

- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView cellForItemAtIndexPath:(NSIndexPath *)indexPath {
  AssetCell *cell = (AssetCell*)[collectionView dequeueReusableCellWithReuseIdentifier:@"Asset" forIndexPath:indexPath];
  cell.image = [self getImageForIndexPath:indexPath];
  cell.backgroundColor = [UIColor whiteColor];
  return cell;
}

#pragma mark - UICollectionViewDelegate

- (void)collectionView:(UICollectionView *)collectionView didSelectItemAtIndexPath:(NSIndexPath *)indexPath {
}

- (void)collectionView:(UICollectionView *)collectionView didDeselectItemAtIndexPath:(NSIndexPath *)indexPath {
}

#pragma mark – UICollectionViewDelegateFlowLayout

- (CGSize)collectionView:(UICollectionView *)collectionView layout:(UICollectionViewLayout*)collectionViewLayout sizeForItemAtIndexPath:(NSIndexPath *)indexPath {
  UIImage *image = [self getImageForIndexPath:indexPath];
  return image.size;
}

- (UIEdgeInsets)collectionView:(UICollectionView *)collectionView layout:(UICollectionViewLayout*)collectionViewLayout insetForSectionAtIndex:(NSInteger)section {
  return UIEdgeInsetsMake(50, 20, 50, 20);
}

@end
