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
            id: Users.currentId++,
            name: 'Amine Zejli',
            thumbnailSrc: Images.getPath('users/') + 'amine.jpg'
        }));
    Users.userDB.push(
        new User({
            id: Users.currentId++,
            name: 'Marcello Chermak',
            thumbnailSrc: Images.getPath('users/') + 'marcello.jpg'
        }));
    Users.userDB.push(
        new User({
            id: Users.currentId++,
            name: 'Veronica Marian',
            thumbnailSrc: Images.getPath('users/') + 'veronica.jpg'
        }));
    Users.userDB.push(
        new User({
            id: Users.currentId++,
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

Users.getUsers = function (userIds) {
    var users = Users.userDB.filter(function (user) {
            return ($.inArray(user.id, userIds) != -1);
    });
    return users;
};

/**
 * Returns the current user.
 */
Users.ajaxGetCurrentUser = function(callback) {
  Util.makeRequest('api/user/get/', {
      uid: Util.GET['uid'],
  }, Users.ajaxCallback.bind(this, callback));
};

/**
 * Makes a request to the server to create a user. Returns the response to
 * callback. Password is ignored.
 */
Users.ajaxCreateUser = function(name, email, password, callback) {
  Util.makeRequest('api/user/add/', {
      uid: Util.GET['uid'],
      name: name,
      email: email
  }, Users.ajaxCallback.bind(this, callback));
};

/**
 * This callback function handles the return data from a user related ajax
 * call.
 */
Users.ajaxCallback = function(callback, data) {
    if (data) {
        // For now hardcode this. Take this out once all users have
        // thumbnails.
        data.thumbnailSrc = Images.getPath('users/') + 'amine.jpg';
        Users.currentUser = new User(data);
    }
    callback();
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

/*
 * Returns all picture widgets.
 */
PictureWidgets.getAll = function() {
    return PictureWidgets.pictureWidgetDB;
};

/*
 * Returns all widgets belonging to moment identified by momentId
 */
PictureWidgets.getPictureWidgetsByMomentId= function (momentId) {
//    return PictureWidgets.pictureWidgetDB.filter(function (picture) {
//        return ($.inArray(momentId, picture.momentIds) != -1);
    return PictureWidgets.pictureWidgetDB.filter(function (picture) {
      return true;
//        return ($.inArray(momentId, picture.momentIds) != -1);        
    });
};

/*
 * Returns all widgets identified by the array of ids sharedWidgetsIds
 */
PictureWidgets.getPictureWidgets = function (sharedWidgetsIds) {
    return PictureWidgets.pictureWidgetDB.filter(function (picture) {
        return ($.inArray(picture.id, sharedWidgetsIds) != -1); 
    });
}

/**
 * Returns the picture widget with the specified asset id or null.
 */
PictureWidgets.getPictureByAssetId = function(id) {
    return PictureWidgets.picturesByAssetId[id] || null;
};

/**
 * Returns the list of pictures.
 */
PictureWidgets.getPictures = function() {
    return PictureWidgets.pictures;
};

/**
 * Grabs all uploaded pictures from the server.
 */
PictureWidgets.ajaxAdd = function(assets, callback) {
    var assetIds = [];
    for (var i = 0, asset; asset = assets[i]; i++) {
        assetIds.push(asset.id);
    }
    Util.makeRequest('api/picture/add/', {
        uid: Util.GET['uid'],
        id: assetIds
    }, PictureWidgets.ajaxCallback.bind(this, callback));
};

/**
 * Grabs all uploaded pictures from the server.
 */
PictureWidgets.ajaxGetAll = function(callback) {
    Util.makeRequest('api/picture/get/all/', {
        uid: Util.GET['uid'],
    }, PictureWidgets.ajaxCallback.bind(this, callback));
};

/**
 * This callback function handles the return data from a picture related ajax
 * call.
 */
PictureWidgets.ajaxCallback = function(callback, data) {
    if (data) {
        for (var i = 0, props; props = data[i]; i++) {
            var widget = new PictureWidget(props);
            PictureWidgets.pictures.push(widget);
            PictureWidgets.picturesByAssetId[props.assetId] = widget;
        }
    }
    if (callback) {
        callback();
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
    
    var comments1 = [];
    comments1.push(new CommentWidget(1, 'Awesome Picture Nigga', 2, Util.getPastDate(3)));
    comments1.push(new CommentWidget(2, 'Good Picture Nigga', 4, Util.getPastDate(2)));

    var comments2 = [];
    comments2.push(new CommentWidget(3,'Holy shit it\'s the nasty gurang', 4, Util.getPastDate(110)));
    comments2.push(new CommentWidget(4,'NASTY!', 2, Util.getPastDate(105)));

    Shares.shareDB.push(new Share(Shares.currentId++, 1, [2, 3], Util.getPastDate(2), [151, 155, 161], comments1));
    Shares.shareDB.push(new Share(Shares.currentId++, 1, [3, 4], Util.getPastDate(2), [151, 155, 183, 184], comments2));
    Shares.shareDB.push(new Share(Shares.currentId++, 1, [1, 2, 3], Util.getPastDate(2), [267, 268, 269, 271, 272, 275, 277, 281]));
}

Share.getShares = function (shareIds) {
    return Shares.shareDB.filter(function (share) {
        return ($.inArray(share.id, shareIds) != -1);
    });
}

/*
 * Returns all shares that contain the widget identified by widgetId
 */
Shares.getWidgetShares = function(widgetId){
    var shares = [];

    for (var j = 0, share; share = Shares.shareDB[j]; j++)
        for (var i = 0, currentWidgetId; currentWidgetId = share.sharedWidgetsIds[i]; i++)
            if (currentWidgetId == widgetId){
                shares.push(share);
                continue;
            }
    return shares;
}

/*
 * Returns all share ids of shares
 */
Shares.getIds = function (shares) {
    return $.map(shares, function (share) {
        return share.id;
    });
}






/*******************************************
 *
 * Moments class simulates a moments data store
 *
 *******************************************/
var Moments = {
    momentDB: [],
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
    var moment = new Moment(100, 'Kuala, Lumpur', Util.getPastDate(6), 1);
    moment.widgets = PictureWidgets.getPictureWidgetsByMomentId(moment.id);
    Moments.momentDB.push(moment);

    var moment = new Moment(101, 'Koh Lanta, Thailand', Util.getPastDate(60), 1);
    moment.widgets = PictureWidgets.getPictureWidgetsByMomentId(moment.id);
    Moments.momentDB.push(moment);

    var moment = new Moment(103, 'Phucket, Thailand', Util.getPastDate(120), 1);
    moment.widgets = PictureWidgets.getPictureWidgetsByMomentId(moment.id);
    Moments.momentDB.push(moment);
}

/**
 * Grabs all moments.
 */
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