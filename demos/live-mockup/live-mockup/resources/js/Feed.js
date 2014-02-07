var Feed = {
    feed: null
}

Feed.init = function(){
    Feed.feed = [{
        user: Users.getUserById(1),
		location: 'Kuala Lumpur, Malaysia',
		description: 'me in kuala lumpur <3',
		pictures: [
			CameraRoll.getCameraRoll()[0],
			CameraRoll.getCameraRoll()[1],
			CameraRoll.getCameraRoll()[2],
			CameraRoll.getCameraRoll()[3],
		],
		comments: [{
				comment: 'are you grabbing the shaft?',
				user: Users.getUserById(4)
			}, {
				comment: 'it looked cooler in my mind...',
				user: Users.getUserById(1)
			}, {
				comment: 'dont forget to play with the... mall?',
				user: Users.getUserById(2)
			}
		],
		// 6 minutes ago
		timestampMs: new Date().getTime() - 6 * 60 * 1000,
		visibleTo: [
			Users.getUserById(4),
			Users.getUserById(1),
			Users.getUserById(2),
			Users.getUserById(3)
		]
	}, {
        user: Users.getUserById(4),
		location: 'Kuala Lumpur, Malaysia',
		description: 'Kuala lumpur, standing in front of a big ass building.',
		pictures: [
			CameraRoll.getCameraRoll()[4],
			CameraRoll.getCameraRoll()[5],
			CameraRoll.getCameraRoll()[6],
			CameraRoll.getCameraRoll()[7],
		],
		comments: [],
		// 2 hours ago
		timestampMs: new Date().getTime() - 120 * 60 * 1000,
		visibleTo: [
			Users.getUserById(1)
		]
	}, {
		user: Users.getUserById(4),
		location: 'Phuket, Thailand',
		description: 'Beach, bay, babes and bikes :)',
		pictures: [
			CameraRoll.getCameraRoll()[8],
			CameraRoll.getCameraRoll()[9],
			CameraRoll.getCameraRoll()[10],
			CameraRoll.getCameraRoll()[11],
			CameraRoll.getCameraRoll()[12],
			CameraRoll.getCameraRoll()[13],
			CameraRoll.getCameraRoll()[14],
			CameraRoll.getCameraRoll()[15],
		],
		comments: [{
				comment: 'Be safe on those things!',
                user: Users.getUserById(1),
            }, {
				comment: 'Lol, what a fruity pink bike ;)',
                user: Users.getUserById(2),
            }, {
				comment: 'At least it stays upright...',
                user: Users.getUserById(3),
			} 
		],
		// 5 hours ago
		timestampMs: new Date().getTime() - 300 * 60 * 1000,
		visibleTo: [
    		Users.getUserById(4),
    		Users.getUserById(1),
    		Users.getUserById(2),
    		Users.getUserById(3)
		]
	}]
};

Feed.getFeed = function() {
  return Feed.feed;
};