//
//  Moments.h
//  moments
//
//  Created by Andreas Binnewies on 1/22/14.
//  Copyright (c) 2014 baliproject. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <AssetsLibrary/AssetsLibrary.h>

@interface Moments : NSObject {
  ALAssetsLibrary *_assetsLibrary;
}

- (void)loadMoments:(void (^)(Moments *moments))finished;

@property (nonatomic, readonly) NSArray *moments;

@end
