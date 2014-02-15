var LifeStreamItem = Class.extend({
    init: function (moment, pageWidth) {
        this.moment = moment;
        this.pageWidth = pageWidth;
    },

    /**
    * Returns this feed item as a jQuery object that can be inserted into the
    * dom.
    */
    getEl: function (isEven) {
        //top level element
        this.el = $('<div></div>')
                .css({
                    clear: 'both',
                    paddingBottom: '5px'
                });

        var headerEl = $('<div></div>')
                .css({
                    margin: '10px 5px',
                    position: 'relative',
                    textShadow: 'none'
                })
				.appendTo(this.el);
        this.moment.location = 'Berkeley, California'
        var locationEl = $('<div></div>')
				.css({
				    fontSize: '11px',
                    left: 0,
				    lineHeight: '11px',
				})
				.text((this.moment.location ?
                            (this.moment.location + ' \u00B7 ') : '') +
                            this.moment.getElapsedTime())
				.appendTo(headerEl);
/*        var timeEl = $('<div></div>')
				.css({
				    fontSize: '11px',
				    lineHeight: '11px',
				    position: 'absolute',
                    right: 0
				})
				.text(this.moment.getElapsedTime())
				.appendTo(headerEl);*/

        //generate user thumbnails
        var users = this.moment.getWidgetOwners();
        if (users && users.length > 1) {
            var tumbnailContainerEl = $('<div></div>')
               .css({
                   padding: '4px 0px 0px 4px',
                   height: '32px',
                   position: 'relative'
               })
               .appendTo(headerEl);

            for (username in users) {
                var thumbnailEl1 = $('<span></span>')
                    .css({
                        backgroundImage: 'url(' + users[username].thumbnailSrc + ')',
                        backgroundSize: 'cover',
                        borderRadius: '100%',
                        height: '32px',
                        width: '32px',
                        display: 'inline-block',
                        position: 'relative',
                        float: 'left',
                        marginRight: '3px'
                    })
                    .appendTo(tumbnailContainerEl);
            }
        }

        //generate pictures
        var pictureContainerEl = $('<div></div>')
            .css({
                position: 'relative'
            })
            .appendTo(this.el);

        var addPictures = new AddPictures(
                this.pageWidth, false, false, null,
                this.moment.widgets, 1, 3);
        addPictures.getEl()
              .appendTo(pictureContainerEl);

        //contruct comment link
        var numComments = this.moment.getCommentCount();
        var numShares = this.moment.getShareCount();
        var linkTxt = '';
        if (numComments > 1)
            linkTxt = numComments + ' comments ';
        else if (numComments > 0)
            linkTxt = numComments + ' comment ';
        if (numComments > 0 && numShares > 1)
            linkTxt += 'in ' + numShares + ' shares';
        else if (numComments > 0 && numShares > 0)
            linkTxt += 'in ' + numShares + ' share';

        //add comment
/*        var commentsLinkContainerEl = $('<div></div>')
					.css({
					    marginBottom: '10px',
					    textAlign: 'right'
					})
					.appendTo(this.el);
        this.commentLinkEl = $('<span></span>')
                .css({
                    color: 'blue',
                    fontSize: '12px',
                    lineHeight: '12px',
                    cursor: 'pointer',
                    paddingRight: '6px'
                })
                .text(linkTxt)
                .appendTo(commentsLinkContainerEl);
                
        if (isIOS) {
            this.commentLinkEl.on(TOUCHSTART, this.touchStart.bind(this));
            this.commentLinkEl.on('touchmove', this.touchMove.bind(this));
            this.commentLinkEl.on(TOUCHEND, this.touchEnd.bind(this, this.moment.getMomentShares()));
        }
        else {
            this.commentLinkEl.on('click', this.touchEnd.bind(this, this.moment.getMomentShares())); 
        }*/


        return this.el;
    },

    touchStart: function (e) {
        this.touchStartY = this.touchEndY = e.originalEvent.pageY;
    },

    touchMove: function (e) {
        this.touchEndY = e.originalEvent.pageY;
    },

    touchEnd: function (shares) {
        if (Math.abs((this.touchEndY || 0) - (this.touchStartY || 0) < 5)) {
                ShareView.show(shares,false);
        }
    }

});

var LifeStreamPictureViewer = AddPictures.extend({
 init: function(width, scroller, moments) {
   this._super(width, true, scroller);
   this.moments = moments;
 },
 
 getNumSections: function() {
   return this.moments.length;
 },
 
 getAssetsForSection: function(sectionIndex) {
   return this.moments.widgets;
 },
});

var LifeStreamView = {
  pageEl: null,
  headerEl: null,
  profilePicEl: null,
  footerEl: null,
  pictureViewer: null
};

/**
 * Makes the life stream view the current view.
 */
LifeStreamView.show = function (animate) {
  $.mobile.pageContainer.on('pagecontainershow', LifeStreamView.onShow);
  $.mobile.pageContainer.pagecontainer('change', '#life-stream-load-view', {
    changeHash: false,
    showLoadMsg: false,
    transition: animate ? 'slide' : 'none'
  });
};

/**
 * Event handler. Called once the LifeStreamView is made visible.
 */
LifeStreamView.onShow = function(event) {
  $.mobile.pageContainer.off('pagecontainershow', arguments.callee);

  if (LifeStreamView.shown) {
    return;
  }
  LifeStreamView.shown = true;

  var pageEl = $('#life-stream-load-view');
  LifeStreamView.pageEl = pageEl;

  var homeBtn = pageEl.find('#home-btn')
      .on(TOUCHSTART, function () {
        FeedView.show();
      });
  var addPictureBtn = pageEl.find('#add-pictures-btn')
    	.on(TOUCHSTART, function () {
        AddPicturesView.show();
    	});

  LifeStreamView.headerEl = pageEl.find('#load-view-header');
  LifeStreamView.footerEl = pageEl.find('#load-view-footer');

  pageEl.find('#share-moment-icon')
      .css('background-image', 'url(' + Images.getPath() + 'check32.png)')
  pageEl.find('#lifestream-user-name')
      .text(Users.getCurrentUser().firstName);

  if (!LifeStreamView.lifeStream) {
    Moments.ajaxGetAll(LifeStreamView.loadMoments);
  } else {
    LifeStreamView.loadMoments(LifeStreamView.lifeStream.moments);
  }

  localStorage.setItem('current-view', LIFE_STREAM_VIEW_PAGE_IDX);
};


LifeStreamView.loadMoments = function (moments) {
  var scroller = new Scroller(pageEl.find('#scrollable'));
  var pictureViewer =
      new LifeStreamPictureViewer(pageEl.width(), scroller, moments);
  pictureViewer.getEl()
      .appendTo(pageEl.find('#picture-viewer'));
  LifeStreamView.pictureViewer = pictureViewer;

/*    var shareBtn = LifeStreamView.ui.toPage.find('#share-button')
        .on(TOUCHSTART, function () {
            LifeStreamShareView.show(LifeStreamView.lifeStream, false);
        });*/
};
