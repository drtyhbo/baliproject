var User = Class.extend({
    init: function (props) {
        this.id = props.id || '';
        this.name = props.name || '';
        this.thumbnailSrc = props.thumbnailSrc || '';
        this.firstName = this.name.split(' ')[0];
        this.lastName = this.name.split(' ')[1];
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
    },

    getElapsedTime: function () {
        Util.getElapsedTime(this.sharedOn);
    },

    /*
     * Return all widgets that belong to this share
     */ 
    getWidgets: function () {
        return PictureWidgets.getPictureWidgets(this.sharedWidgetsIds);
    },

    /*
     * Return all users that received this share
     */ 
    getSharedWithUsers: function () {
        return Users.getUsers(this.sharedWith);
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
        this.pictureSrc = pictureSrc || null;
        this.thumbnailPictureSrc = thumbnailPictureSrc || null;
        this.comments = comments || [];
    },
    
    getSrc: function() {
        return this.pictureSrc;
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
        return this.getMomentShares().length;
    },

    getCommentCount: function () {
        var commentCount = 0;
        var shares = this.getMomentShares();
        for (var j = 0, share; share = shares[j]; j++)
            commentCount += share.comments.length;
        
        return commentCount;
    },

    /*
     * Returns all shares associated with this moment (shares that contain pictures that are part of this moment)
     */
    getMomentShares: function () {
        var shareDict = {};
        for (var i = 0, picture; picture = this.widgets[i]; i++) {
            var shares = Shares.getWidgetShares(picture.id);

            //use dictionary to keep only uniques
            for (var j = 0, share; share = shares[j]; j++)
                shareDict[share.id] = share;
        }
        var uniqueShares = [];
        for (var shareid in shareDict)
            uniqueShares.push(shareDict[shareid]);
        return uniqueShares;
    },

    /*
     * Returns all users that created the widgets contained in this moment
     */
    getWidgetOwners: function () {
        if (!this.widgets)
            return null;

        var usersDic = {};
        for (var idx = 0, widget; widget = this.widgets[idx]; idx++) {
            user = Users.getUserById(widget.createdBy)
            if (user && !(user.id in usersDic))
                usersDic[user.id] = user;
        }
        var uniqueUsers = [];
        for (var userid in usersDic)
            uniqueUsers.push(usersDic[userid]);
        return uniqueUsers;
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
