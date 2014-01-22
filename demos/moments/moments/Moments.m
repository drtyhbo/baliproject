//
//  Moments.m
//  moments
//
//  Created by Andreas Binnewies on 1/22/14.
//  Copyright (c) 2014 baliproject. All rights reserved.
//

#import "Moments.h"

#import <CoreLocation/CoreLocation.h>
#import "Moment.h"

const int SMALL_TIME_INTERVAL_BETWEEN_MOMENTS_SEC = 1 * 60 * 60;
const int LARGE_TIME_INTERVAL_BETWEEN_MOMENTS_SEC = 8 * 60 * 60;
const double DISTANCE_BETWEEN_MOMENTS_METERS = 500;

@implementation Moments

@synthesize moments;

- (void)loadMoments:(void (^)(Moments *moments))finished {
  NSMutableArray *mutableAssets = [[NSMutableArray alloc] init];
  
  _assetsLibrary = [[ALAssetsLibrary alloc] init];
  [_assetsLibrary enumerateGroupsWithTypes:ALAssetsGroupAll
                                usingBlock:^(ALAssetsGroup *group, BOOL *stop) {
                                  if (group == nil) {
                                    [self generateMomentsFromAssets:mutableAssets finished:finished];
                                    finished(self);
                                  }
                                  [group enumerateAssetsUsingBlock:^(ALAsset *asset, NSUInteger index, BOOL *stop) {
                                    if (!asset) {
                                      return;
                                    }
                                    [mutableAssets addObject:asset];
                                  }];
                                } failureBlock:^(NSError *error) {
                                }];
}

- (void)generateMomentsFromAssets:(NSMutableArray*)mutableAssets finished:(void (^)(Moments *moments))finished {
  NSArray *sortedAssets;
  sortedAssets = [mutableAssets sortedArrayUsingComparator:^NSComparisonResult(id a, id b) {
    NSDate *first = [(ALAsset*)a valueForProperty:ALAssetPropertyDate];
    NSDate *second = [(ALAsset*)b valueForProperty:ALAssetPropertyDate];
    return [first compare:second];
  }];
  
  NSMutableArray *mutableMoments = [[NSMutableArray alloc] init];

  NSDate *lastDate = nil;
  CLLocation *lastLocation = nil;
  NSMutableArray *assetsInMoment = [[NSMutableArray alloc] init];
  for (ALAsset *asset in sortedAssets) {
    NSDate *currentDate = [asset valueForProperty:ALAssetPropertyDate];
    CLLocation *currentLocation = [asset valueForProperty:ALAssetPropertyLocation];
    BOOL hasSmallTimeElapsed = lastDate && [currentDate timeIntervalSinceDate:lastDate] >= SMALL_TIME_INTERVAL_BETWEEN_MOMENTS_SEC;
    BOOL hasLargeTimeElapsed = lastDate && [currentDate timeIntervalSinceDate:lastDate] >= LARGE_TIME_INTERVAL_BETWEEN_MOMENTS_SEC;
    BOOL hasTraveledDistance = lastLocation && currentLocation && [currentLocation distanceFromLocation:lastLocation] >= DISTANCE_BETWEEN_MOMENTS_METERS;
    if ((hasSmallTimeElapsed && hasTraveledDistance) || hasLargeTimeElapsed) {
      [mutableMoments addObject:[[Moment alloc] initWithAssets:assetsInMoment]];
      [assetsInMoment removeAllObjects];
    }
    UIImage *image = [UIImage imageWithCGImage:[asset thumbnail] scale:2 orientation:UIImageOrientationUp];
    [assetsInMoment addObject:image];
    lastDate = currentDate;
    lastLocation = currentLocation;
  }
  [mutableMoments addObject:[[Moment alloc] initWithAssets:assetsInMoment]];
  moments = mutableMoments;
  
  // do something with the sorted assets
  if (finished) {
    finished(self);
  }
}

@end
