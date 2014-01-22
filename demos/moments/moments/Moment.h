#import <Foundation/Foundation.h>

@interface Moment : NSObject

@property (nonatomic, readonly) NSArray *assets;

- (id)initWithAssets:(NSArray*)momentAssets;

@end
