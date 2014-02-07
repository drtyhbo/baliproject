//
//  ViewController.m
//  moments
//
//  Created by Andreas Binnewies on 1/22/14.
//  Copyright (c) 2014 baliproject. All rights reserved.
//

#import "ViewController.h"

#import <AdSupport/ASIdentifierManager.h>
#import <CoreLocation/CoreLocation.h>

#import "AssetCell.h"
#import "AssetInfo.h"
#import "CoreData.h"
#import "FinishedUploadingView.h"
#import "MomentFlowLayout.h"
#import "UploadedAsset.h"

@interface ViewController ()

@end

@implementation ViewController

#pragma mark Custom messages

// Loads assets from the camera roll. Reloads the collection view, and begins the first upload when
// complete.
- (void)loadAssets {
  NSMutableArray *mutableAssets = [[NSMutableArray alloc] init];
  
  _assetsLibrary = [[ALAssetsLibrary alloc] init];
  // ALAssetsGroupSavedPhotos = Camera Roll
  [_assetsLibrary enumerateGroupsWithTypes:ALAssetsGroupSavedPhotos | ALAssetsGroupAlbum
                                usingBlock:^(ALAssetsGroup *group, BOOL *stop) {
                                  if (group == nil) {
                                    _assets = [mutableAssets sortedArrayUsingComparator:^NSComparisonResult(AssetInfo *first, AssetInfo *second) {
                                      return first.hasBeenUploaded ?
                                          NSOrderedDescending :
                                          (second.hasBeenUploaded ? NSOrderedAscending : NSOrderedSame);
                                    }];
                                    [_collectionView reloadData];
                                    [self startNextUpload];
                                  }
                                  [group enumerateAssetsUsingBlock:^(ALAsset *asset, NSUInteger index, BOOL *stop) {
                                    if (!asset ||
                                        [[asset valueForProperty:ALAssetPropertyType] isEqualToString:ALAssetTypeVideo]) {
                                      return;
                                    }
                                    [mutableAssets addObject:[self createAssetInfoForAsset:asset]];
                                  }];
                                } failureBlock:^(NSError *error) {
                                }];
}

- (BOOL)hasAssetBeenUploaded:(ALAsset *)asset {
  NSString *filename = [asset defaultRepresentation].filename;

  NSManagedObjectContext *context = [CoreData context];
  NSEntityDescription *entity = [NSEntityDescription entityForName:@"UploadedAsset" inManagedObjectContext:context];
  
  NSFetchRequest *fetchRequest = [[NSFetchRequest alloc] init];
  [fetchRequest setEntity:entity];
  [fetchRequest setPredicate:[NSPredicate predicateWithFormat:@"(filename == %@)", filename]];
  
  return [[context executeFetchRequest:fetchRequest error:nil] lastObject];
}

// Creates an AssetInfo object given an ALAsset object.
- (AssetInfo *)createAssetInfoForAsset:(ALAsset *)asset {
  AssetInfo *assetInfo = [[AssetInfo alloc] init];
  assetInfo.asset = asset;

  assetInfo.hasBeenUploaded = [self hasAssetBeenUploaded:asset];
  
  ALAssetRepresentation *rep = [asset defaultRepresentation];
  assetInfo.image = [UIImage imageWithCGImage:[asset thumbnail] scale:1 orientation:UIImageOrientationUp];
  
  UIProgressView *progressView = [[UIProgressView alloc] init];
  progressView.hidden = YES;
  assetInfo.progressView = progressView;
  
  UIView *finishedView = [[FinishedUploadingView alloc] init];
  finishedView.hidden = !assetInfo.hasBeenUploaded;
  assetInfo.finishedView = finishedView;
  
  return assetInfo;
}

// Finishes the upload off by hiding the progress bar and displaying the finished view.
- (void)finishUploadWithSuccess:(BOOL)isSuccess {
  AssetInfo *currentUpload = [_assets objectAtIndex:_currentUploadIdx];
  
  // Store in CoreData so we don't show this asset anymore.
  if (isSuccess) {
    currentUpload.hasBeenUploaded = YES;
     UploadedAsset *uploadedAsset = [NSEntityDescription insertNewObjectForEntityForName:@"UploadedAsset"inManagedObjectContext:[CoreData context]];
    uploadedAsset.filename = [currentUpload.asset defaultRepresentation].filename;
    [CoreData save];
  }

  currentUpload.finishedView.hidden = NO;
  currentUpload.finishedView.alpha = 0;
  currentUpload.finishedView.isSuccess = isSuccess;
  
  [UIView animateWithDuration:0.5
                        delay:0.0
                      options:0
                   animations:^{
                     currentUpload.finishedView.alpha = 1.0;
                     currentUpload.progressView.alpha = 0.0;
                   }
                   completion:^(BOOL finished){
                     currentUpload.progressView.hidden = YES;
                   }];
}

// Starts the next upload. Doesn't do anything if the uploads have all been completed.
- (void)startNextUpload {
  int i;
  AssetInfo *currentUpload;
  for (i = ++_currentUploadIdx; i < [_assets count]; i++) {
    currentUpload = [_assets objectAtIndex:_currentUploadIdx];
    if (!currentUpload.hasBeenUploaded) {
      break;
    }
  }
  if (i == [_assets count]) {
    return;
  }
  
  currentUpload.progressView.hidden = NO;
  
  // Note that this only uploads thumbnails.
  ALAssetRepresentation *rep = [currentUpload.asset defaultRepresentation];
  UIImage *resizedImage = [UIImage imageWithCGImage:[rep fullResolutionImage] scale:128 orientation:UIImageOrientationUp];

  UIImage *fullSizeImage = [UIImage imageWithCGImage:[rep fullResolutionImage]];

  CGSize newImageSize = CGSizeMake(fullSizeImage.size.width / 8, fullSizeImage.size.height / 8);
  UIGraphicsBeginImageContext(newImageSize);
  [fullSizeImage drawInRect:CGRectMake(0, 0, newImageSize.width, newImageSize.height)];
  NSData *fileData = UIImageJPEGRepresentation(UIGraphicsGetImageFromCurrentImageContext(), 0.5);
  UIGraphicsEndImageContext();
  
  
  NSDate *date = [currentUpload.asset valueForProperty:ALAssetPropertyDate];
  CLLocation *location = [currentUpload.asset valueForProperty:ALAssetPropertyLocation];
  
  // This is ghetto. The request should be able to take in any type of object and convert it into
  // a string.
  NSDictionary *postData = @{
    @"uid": [[[ASIdentifierManager sharedManager] advertisingIdentifier] UUIDString],
    @"date_taken": date ? [NSString stringWithFormat:@"%0.0f", [date timeIntervalSince1970]] : @"0",
    @"latitude": location ? [NSString stringWithFormat:@"%f", location.coordinate.latitude] : @"0",
    @"longitude": location ? [NSString stringWithFormat:@"%f", location.coordinate.longitude] : @"0",
  };
  _currentRequest = [Request sendRequest:@"api/asset/add/" postData:postData filename:[rep filename] fileData:fileData delegate:self];
}

#pragma mark UIViewController overrides

- (void)viewDidLoad {
  [super viewDidLoad];

  _currentUploadIdx = -1;
  
  UICollectionViewFlowLayout *flowLayout = [[UICollectionViewFlowLayout alloc] init];
  flowLayout.minimumInteritemSpacing = 0.0f;
  flowLayout.minimumLineSpacing = 5.0f;

  _collectionView = [[UICollectionView alloc] initWithFrame:[UIScreen mainScreen].bounds collectionViewLayout:flowLayout];
  _collectionView.delegate = self;
  _collectionView.dataSource = self;
  [_collectionView registerClass:[AssetCell class] forCellWithReuseIdentifier:@"Asset"];
  [self.view addSubview:_collectionView];
  
  [self loadAssets];
}

// Hide the status bar please!
- (BOOL)prefersStatusBarHidden {
  return YES;
}

#pragma mark - UICollectionView Datasource

// Returns the number of assets. There's only one section.
- (NSInteger)collectionView:(UICollectionView *)view numberOfItemsInSection:(NSInteger)section {
  return [_assets count];
}

// There's only one section.
- (NSInteger)numberOfSectionsInCollectionView:(UICollectionView *)collectionView {
  return 1;
}

// Returns the AssetCell. Since AssetCells are reused we must repopulate the data.
- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView cellForItemAtIndexPath:(NSIndexPath *)indexPath {
  AssetCell *cell = (AssetCell*)[collectionView dequeueReusableCellWithReuseIdentifier:@"Asset" forIndexPath:indexPath];

  cell.assetInfo = [_assets objectAtIndex:indexPath.row];
  cell.backgroundColor = [UIColor whiteColor];
  
  return cell;
}

#pragma mark – UICollectionViewDelegateFlowLayoutDelegate

// Returns the size of a UICollectionViewCell. ATM, this code has some magic numbers which need
// to be figured out at some point.
- (CGSize)collectionView:(UICollectionView *)collectionView layout:(UICollectionViewLayout*)collectionViewLayout sizeForItemAtIndexPath:(NSIndexPath *)indexPath {
  double viewWidth = self.view.bounds.size.width;
  // Not sure why the 10 works...
  return CGSizeMake(viewWidth / 3 - 10 / 3.0f, viewWidth / 3 - 10 / 3.0f);
}

- (UIEdgeInsets)collectionView:(UICollectionView *)collectionView layout:(UICollectionViewLayout*)collectionViewLayout insetForSectionAtIndex:(NSInteger)section {
  return UIEdgeInsetsMake(0, 0, 0, 0);
}

#pragma mark - RequestDelegate

- (void)requestSuccess:(NSData*)data {
  NSString *responseString = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
  [self finishUploadWithSuccess:[responseString isEqualToString:@"success"]];
  [self startNextUpload];
}

- (void)requestError:(NSError*)error {
  // TODO: handle errors.
  [self finishUploadWithSuccess:NO];
  [self startNextUpload];
}

- (void)requestBytesWritten:(int)bytesWritten totalBytes:(int)totalBytes {
  AssetInfo *currentUpload = [_assets objectAtIndex:_currentUploadIdx];
  currentUpload.progressView.progress = bytesWritten / (float)totalBytes;
}

@end
