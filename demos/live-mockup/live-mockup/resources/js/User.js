var User = Class.extend({
    init: function (name, username, thumbnailSrc) {
        this.name = name || null;
        this.username = username || null;
        this.thumbnailSrc = thumbnailSrc || null;
        this.firstName = name.split(' ')[0];
        this.lastName = name.split(' ')[1];
    }
});


var Widget = Class.extend({
    init: function (createdBy, createdOn) {
        this.createdBy = createdBy || null;    //created by user: User
        this.createdOn = createdOn || null;    //created on date: date
        this.shared = 0;                       //how many times this widget has been shared
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

    addMomentComments: function (comments, createdBy, createdOn) {
        for (var idx = 0; idx< comments.length; idx++)
            this.momentComments.push(new CommentWidget(comments[idx], createdBy, createdOn));
    },

    getElapsedTime: function () {
        return '7m';
    }


});

//user profile class
var UserProfile = Class.extend({
    init: function (name, email) {
        this.user = new User(name, email);              //user info: User
        this.profilePicture = null;                     //user profile picture: PictureWidget
    }
});

//life stream class: top level class used to represent the life stream
var LifeStream = Class.extend({
    init: function () {
        this.userProfile = null;  //logged in user profile: UserProfile
        this.moments = [];      //all moments= Moment[]
    },

    getUserProfileThumbnailPath: function () {
        if (!this.userProfile ||
            !this.userProfile.profilePicture)
            return null;

        return this.userProfile.profilePicture.thumbnailPictureSrc;
    },

    loadSampleData: function(name, email, profilePicturePath, thumbnailPicturePath) {
        
        //create user profile
        var userProfile = new UserProfile(name, email);
        if (profilePicturePath) {
            userProfile.profilePicture = new PictureWidget(profilePicturePath, thumbnailPicturePath);
        }
        this.userProfile = userProfile;

        //add moments
        var moment = new Moment('Phuket, Thailand', '12/12/2013');
        var assets = CameraRoll.getAssets(100);
        for(var i = 0; i < assets.length; i++)
            moment.addPictureWidget(
                assets[i].getSrc(),
                assets[i].getThumbSrc(),
                null,
                'amine zejli',
                '12/12/2013 1:00pm');
        moment.addMomentComments(['Awesome Picture Nigga'], 'John Vaghn', '12/12/2013 1:10pm');
        moment.addMomentComments(['Good Picture Nigga'], 'Andreas B', '12/12/2013 1:12pm');
        this.moments.push(moment);
    }

});


var Users = {
    users: {}
};

Users.users['amine'] = new User('Amine Zejli', 'amine',
		Images.getPath('users/') + 'amine.jpg');
Users.users['marcello'] = new User('Marcello Chermak', 'marcello',
 		Images.getPath('users/') + 'marcello.jpg');
Users.users['veronica'] = new User('Veronica Marian', 'veronica',
		Images.getPath('users/') + 'veronica.jpg');
Users.users['andreas'] = new User('Andreas Binnewies', 'andreas',
 		Images.getPath('users/') + 'andreas.jpg');

Users.getUser = function (username) {
    return Users.users[username];
};