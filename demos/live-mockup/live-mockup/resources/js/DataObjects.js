var Db = {
}

Db.init = function(callback) {
    // We expect two calls to return before we continue on.
    var numExpected = 2;
    function onInit() {
        if (!--numExpected) {
            Shares.init();
            Moments.init();

            callback();
        }
    }
    
    Users.init(onInit);
    PictureWidgets.init(onInit);
}

/*******************************************
 *
 * Users class simulates a user data store
 *
 *******************************************/
var Users = {
    userDB: [],      //private data store
    currentId : 1,
    currentUser: null
};

Users.init = function (callback) {
    Users.ajaxGetCurrentUser(callback);

    // Leave these in for now so the app can continue to function, but delete
    // once everything is coming from the server.
    Users.userDB.push(
        new User({
            id: 1,
            name: 'Amine Zejli',
            thumbnailSrc: Images.getPath('users/') + 'amine.jpg'
        }));
    Users.userDB.push(
        new User({
            id: 2,
            name: 'Veronica Marian',
            thumbnailSrc: Images.getPath('users/') + 'veronica.jpg'
        }));
    Users.userDB.push(
        new User({
            id: 3,
            name: 'Marcello Chermak',
            thumbnailSrc: Images.getPath('users/') + 'marcello.jpg'
        }));
    Users.userDB.push(
        new User({
            id: 4,
            name: 'Andreas Binnewies',
            thumbnailSrc: Images.getPath('users/') + 'andreas.jpg'
        }));
}

Users.getCurrentUser = function() {
    return Users.currentUser;
};

Users.getUserById = function (userId) {
    for (var i = 0, user; user = Users.userDB[i]; i++)
        if (user.id == userId)
            return user;

    return null;
};

Users.getAllUsers = function () {
    return Users.userDB;
}

Users.getFriends = function () {
  var currentUser = Users.getCurrentUser();
  var friends = Users.userDB.filter(function (user) {
    return user.id !=  currentUser.id;
  });
  return friends;
}

Users.getUsers = function (userIds) {
    var users = Users.userDB.filter(function (user) {
            return ($.inArray(user.id, userIds) != -1);
    });
    return users;
};

Users.ajaxGetCurrentUser = function(callback) {
    Util.makeRequest('api/user/get/', {
        uid: Util.GET['uid']
    }, function (data) {
        if (data) {
            Users.currentUser = new User(data);
        }
        callback();
    });
};

Users.ajaxCreateUser = function(name, email, password, callback) {
  Util.makeRequest('api/user/add/', {
      uid: Util.GET['uid'],
      name: name,
      email: email
  }, function(data){
      if (data) {
          Users.currentUser = new User(data);
      }
      if (callback)
        callback();
  });
};

/*******************************************
 *
 * Picture Widget class simulates a picture data store
 *
 *******************************************/

var PictureWidgets = {
    pictureWidgetDB: [],      //private data store
    pictures: [],
    picturesByAssetId: {}
};

PictureWidgets.init = function (callback) {
    PictureWidgets.loadFromPictureProps(
            JSON.parse(localStorage.getItem('pictures') || '[]'));

    var assets = CameraRoll.getCameraRoll();
    for (var i = 0, asset; asset = assets[i]; i++)
        PictureWidgets.pictureWidgetDB.push(
            new PictureWidget({
                id: asset.id,
                pictureSrc: asset.url,
                thumbnailPictureSrc: asset.url,
                comments: null,
                createdBy: (asset.num == 101)? 1: ((asset.num % 2 == 0)? 3: 4),
                createdOn: Util.getPastDate(6),
                momentIds: [0]
            }));
    PictureWidgets.ajaxGetAll(callback);
}

PictureWidgets.getAll = function() {
    return PictureWidgets.pictureWidgetDB;
};

PictureWidgets.getPictureWidgetsByMomentId= function (momentId) {
//    return PictureWidgets.pictureWidgetDB.filter(function (picture) {
//        return ($.inArray(momentId, picture.momentIds) != -1);
    return PictureWidgets.pictureWidgetDB.filter(function (picture) {
      return true;
//        return ($.inArray(momentId, picture.momentIds) != -1);        
    });
};

PictureWidgets.getPictureWidgets = function (sharedWidgetsIds) {
    return PictureWidgets.pictureWidgetDB.filter(function (picture) {
        return ($.inArray(picture.id, sharedWidgetsIds) != -1); 
    });
}

PictureWidgets.getPictureByAssetId = function(id) {
    return PictureWidgets.picturesByAssetId[id] || null;
};

PictureWidgets.getPictures = function() {
    return PictureWidgets.pictures;
};

PictureWidgets.ajaxAdd = function (assets, callback) {
    var assetIds = [];
    for (var i = 0, asset; asset = assets[i]; i++) {
        assetIds.push(asset.id);
    }
    Util.makeRequest('api/picture/add/', {
        uid: Util.GET['uid'],
        id: assetIds
    }, PictureWidgets.ajaxAddCallback.bind(this, callback));
};

PictureWidgets.ajaxGetAll = function(callback) {
    Util.makeRequest('api/picture/get/all/', {
        uid: Util.GET['uid'],
        ts: localStorage.getItem('pictures-timestamp') || 0
    }, PictureWidgets.ajaxGetCallback.bind(this, callback));
};

/**
 * This callback function handles the return data from ajaxAdd. DOES NOT CACHE
 * THE PICTURE DATA. We should probably combine this function with
 * ajaxGetCallback.
 */
PictureWidgets.ajaxAddCallback = function(callback, data) {
    if (data) {
      PictureWidgets.loadFromPictureProps(data);
    }
    if (callback) {
      callback();
    }
};

/**
 * This callback function handles the return data from ajaxGetAll. Caches
 * the picture data into local storage.
 */
PictureWidgets.ajaxGetCallback = function(callback, data) {
    if (data) {
        PictureWidgets.loadFromPictureProps(data.pictures);

        localStorage.setItem('pictures-timestamp', data.ts);
        // Concatenate the new picture properties with the picture properties
        // stored in local storage.
        var storedPictureProps =
                JSON.parse(localStorage.getItem('pictures') || "[]");
        localStorage.setItem('pictures',
                JSON.stringify(data.pictures.concat(storedPictureProps)));

    }
    if (callback) {
        callback();
    }
};

PictureWidgets.loadFromPictureProps = function(pictureProps) {
    for (var i = 0, props; props = pictureProps[i]; i++) {
        var widget = new PictureWidget(props);
        PictureWidgets.pictures.push(widget);
        PictureWidgets.picturesByAssetId[props.assetId] = widget;
    }    
};

/*******************************************
 *
 * Shares class simulates a share data store
 *
 *******************************************/

var Shares = {
    shareDB: [],
    currentId: 1
}

Shares.init = function () {
}

Shares.ajaxCreateShare = function (assetIds, friendIds, callback) {
    Util.makeRequest('api/share/add/', {
        sharedBy: Util.GET['uid'],
        sharedWith: friendIds,
        sharedAssets: assetIds
    }, function (data) {
        callback(data ? data.id : false);
    });
};

Shares.ajaxAddComment = function (shareId, comment, user, callback){
    Util.makeRequest('api/share/add/comment/', {
        userId : user.id,
        shareId: shareId,
        comment: comment
    }, function (data) {
        if (callback)
            callback(data ? data.id : false);
    });
}

Shares.ajaxGetAll = function (callback) {
    Util.makeRequest('api/share/get/all/', {
        uid: Util.GET['uid'],
    }, function (data) {
        var shares = [];
        if (data) {
            for (var i = 0, shareProp; shareProp = data[i]; i++) {
                var share = new Share(shareProp)
                shares.push(share)
            }
        }
        callback(shares);
    });
};

Shares.getWidgetShares = function (widgetId) {
    var shares = [];

    for (var j = 0, share; share = Shares.shareDB[j]; j++)
        for (var i = 0, currentWidgetId; currentWidgetId = share.sharedWidgetsIds[i]; i++)
            if (currentWidgetId == widgetId){
                shares.push(share);
                continue;
            }
    return shares;
}

Shares.getIds = function (shares) {
    return $.map(shares, function (share) {
        return share.id;
    });
}

Shares.getShares = function (shareIds) {
    return Shares.shareDB.filter(function (share) {
        return ($.inArray(share.id, shareIds) != -1);
    });
}



/*******************************************
 *
 * Moments class simulates a moments data store
 *
 *******************************************/
var Moments = {
    momentDB: []
}

Moments.getAllMoments = function () {
    return momentDB;
}

Moments.getMomentsByOwnderId = function (userId) {
    return Moments.momentDB.filter(function (moment) {
        return (moment.ownedBy == userId);
    });
}

Moments.init = function () {
}

Moments.ajaxGetAll = function(callback) {
    Util.makeRequest('api/moment/get/all/', {
        uid: Util.GET['uid'],
    }, function(data) {
        var moments = [];
        if (data) {
            for (var i = 0, momentProps; momentProps = data[i]; i++) {
                var moment = new Moment(momentProps)
                moments.push(moment)
            }
        }
        callback(moments);
    });
};