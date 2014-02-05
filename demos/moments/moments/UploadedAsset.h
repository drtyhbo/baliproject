//
//  UploadedAsset.h
//  moments
//
//  Created by Andreas Binnewies on 2/5/14.
//  Copyright (c) 2014 baliproject. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CoreData/CoreData.h>


@interface UploadedAsset : NSManagedObject

@property (nonatomic, retain) NSString * filename;

@end
