#import "CoreData.h"
#import "AppDelegate.h"

@implementation CoreData

+ (NSManagedObjectContext*)context {
    return ((AppDelegate*)[[UIApplication sharedApplication] delegate]).managedObjectContext;
}

+ (bool)save {
    return [[self context] save:nil];
}

@end
