var Images = {};

Images.getPath = function(subpath) {
  return isIOS ? '' : ('img/' + (subpath || ''));
};

// The list of camera roll photos.
//  - num: Can be turned into the image file name using the formula:
//    IMG_0num.jpg
//  - moment: Used to differentiate which photos belong with which moments.
var cameraRoll = [
// Kuala Lumpur
	{
		num: 151,
		moment: 100
	}, {
		num: 155,
		moment: 100
	}, {
		num: 161,
		moment: 100
	}, {
		num: 163,
		moment: 100
	}, {
		num: 166,
		moment: 100
	}, {
		num: 168,
		moment: 100
	}, {
		num: 178,
		moment: 100
	}, {
		num: 180,
		moment: 100
	},
	// Speed boat
	{
		num: 183,
		moment: 101
	}, {
		num: 184,
		moment: 101
	}, {
		num: 186,
		moment: 101
	}, {
		num: 187,
		moment: 101
	}, {
		num: 223,
		moment: 101
	// Koh lanta
	}, {
		num: 225,
		moment: 102
	}, {
		num: 226,
		moment: 102
	}, {
		num: 229,
		moment: 102
	}, {
		num: 230,
		moment: 102
	}, {
		num: 237,
		moment: 102
	}, {
		num: 239,
		moment: 102
	// Patong day 1
	}, {
		num: 267,
		moment: 103
	}, {
		num: 268,
		moment: 103
	}, {
		num: 269,
		moment: 103
	}, {
		num: 271,
		moment: 103
	}, {
		num: 272,
		moment: 103
	}, {
		num: 275,
		moment: 103
	}, {
		num: 277,
		moment: 103
	}, {
		num: 281,
		moment: 103
	}, {
		num: 291,
		moment: 103
	}, {
		num: 301,
		moment: 103
	}, {
		num: 314,
		moment: 103
	}, {
		num: 330,
		moment: 103
	}, {
		num: 333,
		moment: 103
	}, {
		num: 334,
		moment: 103
	}, {
		num: 338,
		moment: 103
	}, {
		num: 339,
		moment: 103
	// New Years
	}, {
		num: 342,
		moment: 104
	}, {
		num: 344,
		moment: 104
	}
];

var CameraRoll = {};

CameraRoll.getCameraRoll = function() {
  return cameraRoll;
};

CameraRoll.getBasePath = function() {
	return Images.getPath('camera/');
}

CameraRoll.getThumb = function(asset) {
  return CameraRoll.getBasePath() + 'IMG_0' + asset.num + '_thumb.jpg';
};

CameraRoll.getSrc = function(asset) {
  return CameraRoll.getBasePath() + 'IMG_0' + asset.num + '.jpg';
};