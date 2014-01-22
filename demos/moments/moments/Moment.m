//
//  Moment.m
//  moments
//
//  Created by Andreas Binnewies on 1/22/14.
//  Copyright (c) 2014 baliproject. All rights reserved.
//

#import "Moment.h"

@implementation Moment

@synthesize assets;

- (id)initWithAssets:(NSArray*)momentAssets {
  self = [super init];
  if (self) {
    assets = [NSArray arrayWithArray:momentAssets];
  }
  return self;
}

@end
