//
//  ViewController.m
//  moments
//
//  Created by Andreas Binnewies on 1/22/14.
//  Copyright (c) 2014 baliproject. All rights reserved.
//

#import "ViewController.h"

#import "AssetCell.h"

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
  
  [self loadAssets];
}

- (void)loadAssets {
  NSMutableArray *mutableAssets = [[NSMutableArray alloc] init];
  
  _assetsLibrary = [[ALAssetsLibrary alloc] init];
  [_assetsLibrary enumerateGroupsWithTypes:ALAssetsGroupAll
                                usingBlock:^(ALAssetsGroup *group, BOOL *stop) {
                                  if (group == nil) {
                                    _assets = mutableAssets;
                                    [_collectionView reloadData];
                                  }
                                  [group enumerateAssetsUsingBlock:^(ALAsset *asset, NSUInteger index, BOOL *stop) {
                                    if (!asset) {
                                      return;
                                    }
                                    UIImage *image = [UIImage imageWithCGImage:[asset thumbnail] scale:1 orientation:UIImageOrientationUp];
                                    [mutableAssets addObject:image];
                                  }];
                                } failureBlock:^(NSError *error) {
                                }];
}

- (void)didReceiveMemoryWarning {
  [super didReceiveMemoryWarning];
  // Dispose of any resources that can be recreated.
}

- (UIImage*)getImageForIndexPath:(NSIndexPath *)indexPath {
  return (UIImage*)[_assets objectAtIndex:indexPath.row];
}

#pragma mark - UICollectionView Datasource

- (NSInteger)collectionView:(UICollectionView *)view numberOfItemsInSection:(NSInteger)section {
  return [_assets count];
}

- (NSInteger)numberOfSectionsInCollectionView:(UICollectionView *)collectionView {
  return 1;
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
  double viewWidth = self.view.bounds.size.width;
  return CGSizeMake(viewWidth / 3 - 10, viewWidth / 3 - 10);
}

- (UIEdgeInsets)collectionView:(UICollectionView *)collectionView layout:(UICollectionViewLayout*)collectionViewLayout insetForSectionAtIndex:(NSInteger)section {
  return UIEdgeInsetsMake(0, 0, 0, 0);
}

@end
