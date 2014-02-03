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

var Share = Class.extend({
    init: function (id, sharedBy, sharedWith, sharedOn, sharedWidgetIds, comments) {
        this.id = id || null;
        this.sharedBy = sharedBy || null;
        this.sharedWith = sharedWith || [];
        this.sharedOn = sharedOn || null;
        this.sharedWidgetsIds = sharedWidgetIds || [];
        this.comments = comments || [];
    }
});

var Widget = Class.extend({
    init: function (id, createdBy, createdOn, momentIds) {
        this.id = id || null;
        this.createdBy = createdBy || null;    //created by user: User ID
        this.createdOn = createdOn || null;    //created on date: date
        this.momentIds = momentIds || [];      //list of all moment IDs that this widget belons to: int[]
    }
});

var CommentWidget = Widget.extend({
    init: function (id, commentText, createdBy, createdOn) {
        this._super(id, createdBy, createdOn, null);
        commentText = commentText || null;          //comment text: string
    }
});

var PictureWidget = Widget.extend({
    init: function (id, pictureSrc, thumbnailPictureSrc, comments, createdBy, createdOn, momentIds) {
        this._super(id, createdBy, createdOn, momentIds);
        this.pictureSrc = pictureSrc || null;                           //main picture: string
        this.thumbnailPictureSrc = thumbnailPictureSrc || null;          //thumbnail picture: string
        this.comments = comments || [];                                 //picture comments: CommentWidget[]
    }
});

//moment class: top level class used to represent a moment
var Moment = Class.extend({

    init: function (id, location, timeStamp, ownedBy) {
        this.id = id || null;                           //moment ID
        this.location = location || null;               //location of the moment: string
        this.timeStamp = timeStamp || null;             //when the moment occured: date
        this.widgets = [];                              //all widgets in a moment (pictures, videos, checkins...): Widget[]
        this.ownedBy = ownedBy || ownedBy               //owner of the moment
    },

    addPictureWidget: function (pictureSrc, thumbnailPictureSrc, comments, createdBy, createdOn) {
        this.widgets.push(new PictureWidget(pictureSrc, thumbnailPictureSrc, comments, createdBy, createdOn));
    },

    getElapsedTime: function () {
        return Util.getElapsedTime(this.timeStamp);
    },

    getShareCount: function () {
        var shareCount = 0;
        for (var i = 0, picture; picture = this.widgets[i]; i++) {
            var shares = Shares.getWidgetShares(picture.id);
            shareCount += shares ? shares.length : 0;
        }
        return shareCount;
    },

    getCommentCount: function () {
        var commentCount = 0;
        for (var i = 0, picture; picture = this.widgets[i]; i++) {
            var shares = Shares.getWidgetShares(picture.id);
            for (var j = 0, share; share = shares[j]; j++)
                commentCount += share.comments.length;
        }
        return commentCount;
    },

    getWidgetOwners: function () {
        if (!this.widgets)
            return null;

        var users = {};
        for (var idx = 0, widget; widget = this.widgets[idx]; idx++) {
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
        this.shares = [];
    },

    getUserProfileThumbnailPath: function () {
        if (!this.userProfile)
            return null;

        return this.userProfile.thumbnailSrc;
    },

    loadSampleData: function (username) {

        //create user profile
        this.userProfile = Users.getUser(username);
        this.moments = Moments.getMomentsByOwnderId(this.userProfile.id);
    }

});
