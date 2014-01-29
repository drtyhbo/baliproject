var Picture = Class.extend({
    init: function (path) {
        this.path = path || null;
    }
});

var Widget = Class.extend({
    init: function () {
        this.createdBy = null;    //created by user: User
        this.createdOn = null;    //created on date: date
    }
});

var CommentWidget = Widget.extend({
    init: function (commentText) {
        this._super();
        commentText = commentText || null;          //comment text: string
    }
});

var PictureWidget = Widget.extend({
    init: function () {
        this._super();
        this.picture = null;                //main picture: Picture
        this.thumbnailPicture = null;       //thumbnail picture: Picture
        this.comments = null;               //picture comments: CommentWidget[]
    }
});

//moment class: top level class used to represent a moment
var Moment = Class.extend({

    init: function () {
        this.location = null;             //location of the moment: string
        this.timeStamp = null;            //when the moment occured: date
        this.widgets = null;              //all widgets in a moment (pictures, videos, checkins...): Widget[]
        this.momentComments = null        //comments associated with the shares of pictures associated with the moment: CommentWidget[]
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
        this.moments = null;      //all moments= Moment[]
    },

    getUserProfileThumbnailPath: function () {
        if (!this.userProfile ||
            !this.userProfile.profilePicture ||
            !this.userProfile.profilePicture.thumbnailPicture)
            return null;

        return this.userProfile.profilePicture.thumbnailPicture.path;
    }

});


var LifeStreamLoadView = {
    headerEl:null,
    profilePicEl: null,
    footerEl: null,
    ui: null,
};

LifeStreamLoadView.show = function (animate) {
    $.mobile.pageContainer.on('pagecontainerbeforetransition',
                            LifeStreamLoadView.beforeTransition);
    $.mobile.pageContainer.pagecontainer('change', '#life-stream-load-view', {
        changeHash: false,
        showLoadMsg: false,
        transition: animate ? 'slide' : 'none'
    });
};

LifeStreamLoadView.beforeTransition = function (event, ui) {
    if (ui.absUrl.indexOf('#life-stream-load-view') == -1) {
        $.mobile.pageContainer.off('pagecontainerbeforetransition',
                    arguments.callee);
        return;
    }

    LifeStreamLoadView.ui = ui;
    LifeStreamLoadView.headerEl = ui.toPage.find('#load-view-header');
    LifeStreamLoadView.footerEl = ui.toPage.find('#load-view-footer');
    LifeStreamLoadView.profilePicEl = ui.toPage.find('#profile-pic');

    //display sharing check
    ui.toPage.find('#share-moment-icon')
        .css('background-image', 'url(' + Images.getPath() + 'check32.png)')

    //get sample asset
    var assets = CameraRoll.getCameraRoll();

    //load life stream
    var lifeStream = LifeStreamLoadView.ReadLifeStream(
        'amine zejli',
        'zejli.amine@gmail.com',
        CameraRoll.getSrc(assets[0]),
        CameraRoll.getThumb(assets[0]));
    LifeStreamLoadView.DisplayLifeStream(lifeStream);



};

LifeStreamLoadView.DisplayLifeStream = function(lifeStream){
    if (!lifeStream)
        throw "lifeStream not initalized";

    //display user profile thumbnail
    var thumbnailPath = lifeStream.getUserProfileThumbnailPath();
    if (!lifeStream)
        throw "user profile thumbnail picture is not initalized";

    this.ui.toPage.find('#profile-thumbnail')
        .css('background-image', 'url(' + thumbnailPath + ')')
}


LifeStreamLoadView.ReadLifeStream = function (name, email, profilePicturePath, thumbnailPicturePath)
{
    //init user profile
    var userProfile = new UserProfile(name, email);
    if (profilePicturePath) {
        userProfile.profilePicture = new PictureWidget();
        userProfile.profilePicture.picture = new Picture(profilePicturePath);
        userProfile.profilePicture.thumbnailPicture = new Picture(thumbnailPicturePath);
    }

    //init life stream
    var lifeStream = new LifeStream();
    lifeStream.userProfile = userProfile;

    return lifeStream;

}
