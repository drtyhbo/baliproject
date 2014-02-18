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



var Asset = Widget.extend({
  init: function (props) {
    this._super(props.id, props.createdBy, props.timestamp, props.momentIds);
    this.url = props.url;
  },

  getSrc: function() {
    return this.url;
  }
});


var Share = Class.extend({

  init: function (props) {
    this.id = props.id || null;
    this.dateShared = props.dateShared || null;
    this.sharedBy = (props.sharedBy) ? (new User(props.sharedBy)) : null
    this.sharedAssets = [];


    this.sharedWith = []
    for (var i = 0, sharedWithProps; sharedWithProps = props.sharedWith[i]; i++)
      this.sharedWith.push(new User(sharedWithProps));

    for (var j = 0, assetProps ; assetProps = props.sharedAssets[j]; j++)
      this.sharedAssets.push(new Asset(assetProps));

    this.comments = props.comments || [];
  },

  getElapsedTime: function () {
    return Util.getElapsedTime(this.dateShared * 1000);
  },

});

var Moment = Class.extend({

    init: function (props) {
        this.id = props.id || null;                           //moment ID
        this.location = props.location || null;               //location of the moment: string
        this.timestamp = props.timestamp * 1000 || null;      //when the moment occured: date
        this.assets = [];                                     //all widgets in a moment (pictures, videos, checkins...): Widget[]
        this.ownedBy = props.ownedBy || null;
        
        if (props.assets) {
          for (var j = 0, assetProps ; assetProps = props.assets[j]; j++) 
            this.assets.push(new Asset(assetProps));
        }
    },

    getElapsedTime: function () {
        return Util.getElapsedTime(this.timestamp);
    }

});


var LifeStream = Class.extend({
  init: function () {
    this.userProfile = null;
    this.moments = [];
    this.shares = [];
  },

  getUserProfileThumbnailPath: function () {
    if (!this.userProfile)
      return null;

    return this.userProfile.thumbnailSrc;
  }
});
