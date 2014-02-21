var Asset = Class.extend({
  init: function (props) {
    this.id = props.id;
    this.timestamp = props.timestamp * 1000;
    this.url = props.url;
    this.isUploaded = false;
    this.location = '';
  },

  getThumbSrc: function () {
    return this.url;
  },

  getSrc: function () {
    return this.url;
  }
});

var CameraRoll = {
  cameraRoll: [],
  assetsById: {}
};

/*
 * Pulls the camera roll assets from drtyhbo.net. Calls the callback
 * once they've been loaded.
 */
CameraRoll.load = function (callback) {
  CameraRoll.loadFromAssetProps(
          JSON.parse(localStorage.getItem('assets') || "[]"));

  Util.makeRequest('api/asset/get/', {
    uid: Util.GET['uid'],
    ts: localStorage.getItem('assets-timestamp') || 0
  }, CameraRoll.handleAjaxResponse.bind(CameraRoll, callback));
};

/*
 * Called by the backend once the assets have been loaded.
 */
CameraRoll.handleAjaxResponse = function (callback, data) {
  CameraRoll.loadFromAssetProps(data.assets);

  localStorage.setItem('assets-timestamp', data.ts);
  //localStorage.setItem('assets', []);
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
CameraRoll.loadFromAssetProps = function (assetProps) {

  //TODO: why are we even storing this in cache?
  var found = false;
  for (var i = 0, props; props = assetProps[i]; i++) {
    found = false;
    for (var j = 0, asset; asset = CameraRoll.assetsById[j]; j++) {
      if (props.id == asset.id) {
        found = true;
        break;
      }
    }

    if (!found) {
      var asset = new Asset(props);
      CameraRoll.cameraRoll.push(asset);
      CameraRoll.assetsById[asset.id] = asset;
    }
  }
};

/*
 * Returns the list of camera roll assets. Will not be ready until the callback
 * from CameraRoll.init() has been called.
 */
CameraRoll.getCameraRoll = function () {
  return CameraRoll.cameraRoll;
};

/*
 * Returns the list of camera roll assets. Will not be ready until the callback
 * from CameraRoll.init() has been called.
 */
CameraRoll.getAssetById = function (id) {
  return CameraRoll.assetsById[id];
};