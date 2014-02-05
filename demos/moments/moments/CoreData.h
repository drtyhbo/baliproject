#import <Foundation/Foundation.h>

@interface CoreData : NSObject

+ (NSManagedObjectContext*)context;
+ (bool)save;

@end
