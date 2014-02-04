

var Db = {
}

Db.init = function () {
    Users.init();
    PictureWidgets.init();
    Shares.init();
    Moments.init();
}

/*******************************************
 *
 * Users class simulates a user data store
 *
 *******************************************/
var Users = {
    userDB: [],      //private data store
    currentId : 1
};

Users.init = function () {

    Users.userDB.push(new User(Users.currentId++, 'Amine Zejli', 'amine',
            Images.getPath('users/') + 'amine.jpg'));
    Users.userDB.push(new User(Users.currentId++, 'Marcello Chermak', 'marcello',
            Images.getPath('users/') + 'marcello.jpg'));
    Users.userDB.push(new User(Users.currentId++, 'Veronica Marian', 'veronica',
            Images.getPath('users/') + 'veronica.jpg'));
    Users.userDB.push(new User(Users.currentId++, 'Andreas Binnewies', 'andreas',
            Images.getPath('users/') + 'andreas.jpg'));
}

Users.getUser = function (username) {
    for (var i = 0, user; user = Users.userDB[i]; i++)
        if (user.username == username)
            return user;

    return null;
};

Users.getUserByID = function (userId) {
    for (var i = 0, user; user = Users.userDB[i]; i++)
        if (user.id == userId)
            return user;

    return null;
};


/*******************************************
 *
 * Picture Widget class simulates a picture data store
 *
 *******************************************/

var PictureWidgets = {
    pictureWidgetDB: [],      //private data store
    currentId: 0
};

PictureWidgets.init = function () {
    var assets = CameraRoll.getCameraRoll();
    for (var i = 0, asset; asset = assets[i]; i++)
        PictureWidgets.pictureWidgetDB.push(new PictureWidget(
                asset.num,      //use asset number as Id so it would be easy to reference
                asset.getSrc(),
                asset.getThumbSrc(),
                null,
                (asset.num == 101)? 1: ((i % 2 == 0)? 3: 4), //createdBy (moment 101 is shared by only one user)
                new Util.getPastDate(6),
                [asset.moment]));
}

PictureWidgets.getPictureWidgetsByMomentId= function (momentId) {
    return PictureWidgets.pictureWidgetDB.filter(function (picture) {
        return $.inArray(momentId, picture.momentIds);
        
    });
};

PictureWidgets.getPictureWidgets = function (sharedWidgetsIds) {
    PictureWidgets.pictureWidgetDB.filter(function (picture) {
        return (picture.id in sharedWidgetsIds);
    });
}

/*******************************************
 *
 * Shares class simulates a share data store
 *
 *******************************************/

var Shares = {
    shareDB: [],
    currentId: 0
}

Shares.init = function () {
    
    var comments1 = [];
    comments1.push(new CommentWidget(1, 'Awesome Picture Nigga', 2, new Util.getPastDate(3)));
    comments1.push(new CommentWidget(2, 'Good Picture Nigga', 4, new Util.getPastDate(2)));

    var comments2 = [];
    comments2.push(new CommentWidget(3,'Holy shit it\'s the nasty gurang', 4, new Util.getPastDate(110)));
    comments2.push(new CommentWidget(4,'NASTY!', 2, new Util.getPastDate(105)));

    Shares.shareDB.push(new Share(Shares.currentId++, 1, [2, 3], Util.getPastDate(2), [151, 155, 161], comments1));
    Shares.shareDB.push(new Share(Shares.currentId++, 1, [3, 4], Util.getPastDate(2), [151, 155, 183, 184], comments2));
    Shares.shareDB.push(new Share(Shares.currentId++, 1, [1, 2, 3], Util.getPastDate(2), [267, 268, 269, 271, 272, 275, 277, 281]));
}

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



/*******************************************
 *
 * Moments class simulates a moments data store
 *
 *******************************************/
var Moments = {
    momentDB: [],
    currentId: 0
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

    var moment = new Moment(100, 'Phuket, Thailand', new Util.getPastDate(6), 1);
    moment.widgets = PictureWidgets.getPictureWidgetsByMomentId(moment.id);
    Moments.momentDB.push(moment);

    var moment = new Moment(101, 'Koh Lanta, Thailand', new Util.getPastDate(60), 1);
    moment.widgets = PictureWidgets.getPictureWidgetsByMomentId(moment.id);
    Moments.momentDB.push(moment);

    var moment = new Moment(102, 'Jakarta, Indonesia', new Util.getPastDate(120), 1);
    moment.widgets = PictureWidgets.getPictureWidgetsByMomentId(moment.id);
    Moments.momentDB.push(moment);
}
