var User = Class.extend({

    init: function (props) {
        this.id = props.id || '';
        this.name = props.name || '';
        this.email = props.email || '';
        this.thumbnailSrc = props.thumbnailSrc || '';
        this.firstName = this.name.split(' ')[0];
        this.lastName = this.name.split(' ')[1];
        
        //TODO: remove once all thumbnail are in the server
        if (!this.thumbnailSrc) {
            if (this.id == 1)
                this.thumbnailSrc = Images.getPath('users/') + 'amine.jpg';
            else if (this.id == 2)
                this.thumbnailSrc = Images.getPath('users/') + 'vernoica.jpg';
            else if (this.id == 3)
                this.thumbnailSrc = Images.getPath('users/') + 'marcello.jpg';
            else if (this.id == 4)
                this.thumbnailSrc = Images.getPath('users/') + 'andreas.jpg';
        }

    }

});

var Share = Class.extend({

    init: function (props) {
        this.id = props.id || null;
        this.dateShared = props.dateShared || null;
        this.sharedBy = (props.sharedBy)? (new User(props.sharedBy)) : null
        this.sharedAssets = props.sharedAssets || [];

        this.sharedWith = []
        for (var i = 0, sharedWithProps; sharedWithProps = props.sharedWith[i]; i++)
            this.sharedWith.push(new User(sharedWithProps));

        this.comments = props.comments || [];
    },

    getElapsedTime: function () {
        Util.getElapsedTime(this.dateShared * 1000);
    },

});

var Widget = Class.extend({

    init: function (id, createdBy, timestamp, momentIds) {
        this.id = id || null;
        this.createdBy = createdBy || null;    //created by user: User ID
        this.timestamp = timestamp || null;    //created on date: date
        this.momentIds = momentIds || [];      //list of all moment IDs that this widget belons to: int[]
    }

});

var CommentWidget = Widget.extend({

    init: function (id, commentText, createdBy, timestamp) {
        this._super(id, createdBy, timestamp, null);
        commentText = commentText || null;          //comment text: string
    }

});

var PictureWidget = Widget.extend({

    init: function (props) {
        this._super(props.id, props.createdBy, props.timestamp, props.momentIds);
        this.pictureSrc = props.pictureSrc || null;
        this.thumbnailPictureSrc = props.thumbnailPictureSrc || null;
        this.comments = props.comments || [];
    },
    
    getSrc: function() {
        return this.pictureSrc;
    }
});

var Moment = Class.extend({

    init: function (props) {
        this.id = props.id || null;                           //moment ID
        this.location = props.location || null;               //location of the moment: string
        this.timestamp = props.timestamp * 1000 || null;             //when the moment occured: date
        this.widgets = [];                              //all widgets in a moment (pictures, videos, checkins...): Widget[]
        this.ownedBy = props.ownedBy || null;
        
        if (props.pictures) {
            for (var j = 0, pictureProps; pictureProps = props.pictures[j]; j++) {
                this.widgets.push(new PictureWidget(pictureProps));
            }
        }
    },

    addPictureWidget: function (pictureSrc, thumbnailPictureSrc, comments, createdBy, createdOn) {
        this.widgets.push(new PictureWidget(pictureSrc, thumbnailPictureSrc, comments, createdBy, createdOn));
    },

    getElapsedTime: function () {
        return Util.getElapsedTime(this.timestamp);
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

    loadData: function (callback) {
        this.userProfile = Users.getCurrentUser();
        Moments.ajaxGetAll(function(moments) {
            this.moments = moments;
            callback(moments);
        }.bind(this));
    }
});
