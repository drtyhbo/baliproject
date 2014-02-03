var Images = {};
Images.getPath = function(subpath) {
  return isIOS ? '' : ('img/' + (subpath || ''));
};

var Asset = Class.extend({
	init: function(num, moment) {
		this.num = num;
		this.moment = moment;
	},
	
	getBasePath: function() {
		return Images.getPath('camera/');
	},

	getThumbSrc: function() {
	  return this.getBasePath() + 'IMG_0' + this.num + '_thumb.jpg';
	},

	getSrc: function() {
	  return this.getBasePath() + 'IMG_0' + this.num + '.jpg';
	}
});

var CameraRoll = {
	cameraRoll: [] // array of assets
};

CameraRoll.getCameraRoll = function() {
  return CameraRoll.cameraRoll;
};

CameraRoll.getAssetByMomentId = function (momentId) {
    var momentPictures = [];
    for (var i = 0; i < CameraRoll.cameraRoll.length; i++)
        if (CameraRoll.cameraRoll[i].moment == momentId)
            momentPictures.push(CameraRoll.cameraRoll[i]);

    return momentPictures;
}


CameraRoll.getPictureWidgets = function () {
    var pictureWidgets = [];
    for (var i = 0, asset; asset = CameraRoll.cameraRoll[i]; i++) {
        pictureWidgets.push(new PictureWidget(asset.getSrc(), asset.getThumbSrc()));
    }
    return pictureWidgets;
}

CameraRoll.addAssetsToCameraRoll = function(moment, assetNumbers) {
	for (var i = 0; i < assetNumbers.length; i++) {
		CameraRoll.cameraRoll.push(new Asset(assetNumbers[i], moment));
	}
}

// Kuala Lumpur
CameraRoll.addAssetsToCameraRoll(100, [151, 155, 161, 166, 168, 178, 180]);
// Speed boat
CameraRoll.addAssetsToCameraRoll(101, [183, 184, 186, 187, 223]);
// Koh lanta
CameraRoll.addAssetsToCameraRoll(102, [225, 226, 229, 230, 237, 239]);
// Patong day 1
CameraRoll.addAssetsToCameraRoll(103, [267, 268, 269, 271, 272, 275, 277, 281,
																			 291, 301, 314, 330, 333, 334, 338, 339]);
// New Years
CameraRoll.addAssetsToCameraRoll(104, [342, 344]);
