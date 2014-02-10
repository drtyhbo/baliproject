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
	cameraRoll: []
};

/*
 * Pulls the camera roll assets from drtyhbo.net. Calls the callback
 * once they've been loaded.
 */
CameraRoll.init = function(callback) {
    CameraRoll.loadFromAssetProps(
            JSON.parse(localStorage.getItem('assets') || "[]"));

    Util.makeRequest('api/asset/get/', {
        uid: Util.GET['uid'],
        ts: localStorage.getItem('assets-timestamp') || 0
    }, CameraRoll.load.bind(CameraRoll, callback));
};

/*
 * Called by the backend once the assets have been loaded.
 */
CameraRoll.load = function(callback, data) {
    CameraRoll.loadFromAssetProps(data.assets);

    localStorage.setItem('assets-timestamp', data.ts);
    // Concatenate the new asset properties with the asset properties stored
    // in local storage.
    var storedAssetProps = JSON.parse(localStorage.getItem('assets') || "[]");
    localStorage.setItem('assets',
            JSON.stringify(data.assets.concat(storedAssetProps)));

    if (callback) {
        callback();
    }
};

/*
 * Loads an array of asset properties.
 */
CameraRoll.loadFromAssetProps = function(assetProps) {
    for (var i = 0, props; props = assetProps[i]; i++) {
        CameraRoll.cameraRoll.push(new Asset(props));
    }
};

/*
 * Returns the list of camera roll assets. Will not be ready until the callback
 * from CameraRoll.init() has been called.
 */
CameraRoll.getCameraRoll = function() {
  return CameraRoll.cameraRoll;
};