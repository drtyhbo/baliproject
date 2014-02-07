var Asset = Class.extend({
	init: function(props) {
        this.id = props.id;
        // The date from the server is in seconds.
        this.dateTaken = new Date(props.dateTaken * 1000);
        this.url = props.url;
        this.latitude = props.latitude;
        this.longitude = props.longitude;
	},
	
	getThumbSrc: function() {
	  return this.url;
	},

	getSrc: function() {
	  return this.url;
	}
});

var CameraRoll = {
	cameraRoll: [] // array of assets
};

/*
 * Pulls the camera roll assets from drtyhbo.net. Calls the callback
 * once they've been loaded.
 */
CameraRoll.init = function(callback) {
    Util.makeRequest('api/asset/get/', {
        uid: Util.GET['uid']
    }, CameraRoll.load.bind(CameraRoll, callback));
};

/*
 * Called by the backend once the assets have been loaded.
 */
CameraRoll.load = function(callback, assets) {
    for (var i = 0, assetProps; assetProps = assets[i]; i++) {
        CameraRoll.cameraRoll.push(new Asset(assetProps));
    }
    if (callback) {
        callback();
    }
};

/*
 * Returns the list of camera roll assets. Will not be ready until the callback
 * from CameraRoll.init() has been called.
 */
CameraRoll.getCameraRoll = function() {
  return CameraRoll.cameraRoll;
};