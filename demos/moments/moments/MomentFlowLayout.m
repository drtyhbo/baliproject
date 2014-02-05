//
//  MomentFlowLayout.m
//  moments
//
//  Created by Andreas Binnewies on 2/4/14.
//  Copyright (c) 2014 baliproject. All rights reserved.
//

#import "MomentFlowLayout.h"

@implementation MomentFlowLayout

const int COLUMN_SPACING = 5;

- (NSArray *)layoutAttributesForElementsInRect:(CGRect)rect {
  NSArray *layouts = [[super layoutAttributesForElementsInRect:rect] mutableCopy];
  
  for(int i = 1; i < [layouts count]; ++i) {
    UICollectionViewLayoutAttributes *currentLayout = layouts[i];
    UICollectionViewLayoutAttributes *prevLayout = layouts[i - 1];

    NSInteger origin = CGRectGetMaxX(prevLayout.frame);
    if(origin + COLUMN_SPACING + currentLayout.frame.size.width < self.collectionViewContentSize.width) {
      CGRect frame = currentLayout.frame;
      frame.origin.x = origin + COLUMN_SPACING;
      currentLayout.frame = frame;
    }
  }
  return layouts;
}

@end
