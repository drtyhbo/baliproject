var User = Class.extend({
    init: function (id, name, username, thumbnailSrc) {
        this.id = id || null;
        this.name = name || null;
        this.username = username || null;
        this.thumbnailSrc = thumbnailSrc || null;
        this.firstName = name.split(' ')[0];
        this.lastName = name.split(' ')[1];
    }
});


var Widget = Class.extend({
    init: function (createdBy, createdOn) {
        this.createdBy = createdBy || null;    //created by user: User ID
        this.createdOn = createdOn || null;    //created on date: date
        this.shared = [];                       //array of all shares (IDs)
    }
});

var CommentWidget = Widget.extend({
    init: function (commentText, createdBy, createdOn) {
        this._super(createdBy, createdOn);
        commentText = commentText || null;          //comment text: string
    }
});

var PictureWidget = Widget.extend({
    init: function (pictureSrc, thumbnailPictureSrc, comments, createdBy, createdOn) {
        this._super(createdBy, createdOn);
        this.pictureSrc = pictureSrc || null;                           //main picture: string
        this.thumbnailPictureSrc = thumbnailPictureSrc|| null;          //thumbnail picture: string
        this.comments = comments || [];                                 //picture comments: CommentWidget[]
    }
});

//moment class: top level class used to represent a moment
var Moment = Class.extend({

    init: function (location, timeStamp) {
        this.location = location || null;               //location of the moment: string
        this.timeStamp = timeStamp || null;             //when the moment occured: date
        this.widgets = [];                              //all widgets in a moment (pictures, videos, checkins...): Widget[]
        this.momentComments = []                        //comments associated with the shares of pictures associated with the moment: CommentWidget[]
    },

    addPictureWidget: function(pictureSrc, thumbnailPictureSrc, comments, createdBy, createdOn){
        this.widgets.push(new PictureWidget(pictureSrc, thumbnailPictureSrc, comments, createdBy, createdOn));
    },

    addMomentComment: function (comment, createdBy, createdOn) {
        this.momentComments.push(new CommentWidget(comment, createdBy, createdOn));
    },

    getElapsedTime: function () {
        var elapsedMs = new Date().getTime() - this.timeStamp;

        // seconds...
        if (elapsedMs < 60 * 1000) {
            return Math.floor(elapsedMs / 1000) + 's';
            // minutes...
        } else if (elapsedMs < 60 * 60 * 1000) {
            return Math.floor(elapsedMs / 60 / 1000) + 'm';
            // hours...
        } else if (elapsedMs < 24 * 60 * 60 * 1000) {
            return Math.floor(elapsedMs / (60 * 60) / 1000) + 'h';
        }
    },

    getWidgetOwners: function() {
        if (!this.widgets)
            return null;

        var users = {};
        for (var idx = 0, widget; widget = this.widgets[idx]; idx++){
            user = Users.getUserByID(widget.createdBy)
            if (user && !(user.username in users))
                users[user.username] = user;
        }
        return users;
    }
});


//life stream class: top level class used to represent the life stream
var LifeStream = Class.extend({
    init: function () {
        this.userProfile = null;       //logged in user profile: User
        this.moments = [];      //all moments= Moment[]
    },

    getUserProfileThumbnailPath: function () {
        if (!this.userProfile)
            return null;

        return this.userProfile.thumbnailSrc;
    },

    loadSampleData: function(username) {
        
        //create user profile
        this.userProfile = Users.getUser(username);

        //add moments
        var moment = new Moment('Phuket, Thailand', new Date().getTime() - 6 * 60 * 1000);
        var assets = CameraRoll.getAssets(100);
        for(var i = 0; i < assets.length; i++)
            moment.addPictureWidget(
                assets[i].getSrc(),
                assets[i].getThumbSrc(),
                null,
                i % 2 == 0? 1: 4, //user ID
                 new Date().getTime() - 6 * 60 * 1000);
        moment.addMomentComment('Awesome Picture Nigga', 2, new Date().getTime() - 3 * 60 * 1000);
        moment.addMomentComment('Good Picture Nigga', 4, new Date().getTime() - 2 * 60 * 1000);
        this.moments.push(moment);

        var moment = new Moment('Koh Lanta, Thailand', new Date().getTime() - 60 * 60 * 1000);
        var assets = CameraRoll.getAssets(102);
        for (var i = 0; i < assets.length; i++)
            moment.addPictureWidget(
                assets[i].getSrc(),
                assets[i].getThumbSrc(),
                null,
                i % 4 == 0? 1 : ((i % 5) == 0? 3: 2),
                 new Date().getTime() - 60 * 60 * 1000);
        moment.addMomentComment('Koh Lanta is tits', 3, new Date().getTime() - 53 * 60 * 1000);
        moment.addMomentComment('I know at least one idiot that ate shit there', 2, new Date().getTime() - 51 * 60 * 1000);
        this.moments.push(moment);

        var moment = new Moment('Jakarta, Indonesia', new Date().getTime() - 120 * 60 * 1000);
        var assets = CameraRoll.getAssets(102);
        for (var i = 0; i < assets.length; i++)
            moment.addPictureWidget(
                assets[i].getSrc(),
                assets[i].getThumbSrc(),
                null,
                1,
                 new Date().getTime() - 121 * 60 * 1000);
        moment.addMomentComment('Holy shit it\'s the nasty gurang', 4, new Date().getTime() - 112 * 60 * 1000);
        moment.addMomentComment('NASTY!', 2, new Date().getTime() - 113 * 1000 + 10);
        this.moments.push(moment);


    }

});


var Users = {
    users: {}
};

Users.users['amine'] = new User(1, 'Amine Zejli', 'amine',
		Images.getPath('users/') + 'amine.jpg');
Users.users['marcello'] = new User(2, 'Marcello Chermak', 'marcello',
 		Images.getPath('users/') + 'marcello.jpg');
Users.users['veronica'] = new User(3, 'Veronica Marian', 'veronica',
		Images.getPath('users/') + 'veronica.jpg');
Users.users['andreas'] = new User(4, 'Andreas Binnewies', 'andreas',
 		Images.getPath('users/') + 'andreas.jpg');

Users.getUser = function (username) {
    return Users.users[username];
};

Users.getUserByID = function (userId) {
    for (username in Users.users)
        if (Users.users[username].id == userId)
            return Users.users[username];

    return null;
};
