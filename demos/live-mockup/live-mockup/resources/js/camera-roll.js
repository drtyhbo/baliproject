var Images = {};

Images.getPath = function(subpath) {
//  return '../img/' + (subpath || '');
  return '';
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
	}, {
		num: 155,
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