var SHOW_THUMBNAIL_IN_COMMENTS = false;

var FeedPictureViewer = AddPictures.extend({
  init: function(width, assets) {
    this.assets = assets;
    this._super(width, null, true);
  },
  
  getNumGroups: function() {
    return 1;
  },

  getAssetsForGroup: function(groupIndex) {
    return this.assets;
  }
});

/**
 * Encapsulates all the logic behind an item in the feed.
 */
var FeedItem = Class.extend({
    init: function (width, share) {
        this.width = width;
        this.share = share;
        this.currentIdx = 0;
        this.commentsEl = null;
        this.newCommentEl = null;
        this.isCommenting = false;
    },

    /**
     * Returns this feed item as a jQuery object that can be inserted into the
     * dom.
     */
    getEl: function () {
        this.el = $('<div></div>')
            .css('margin-bottom', 10);

        //header
        var headerEl = $('<div></div>')
    				.addClass('header')
    				.appendTo(this.el);

        //header - tumbnail: 
        var thumbnailEl = $('<span></span>')
				.css({
				    backgroundImage: 'url(' + this.share.sharedBy.thumbnailSrc + ')',
				    backgroundSize: 'cover',
				    borderRadius: '36px',
				    display: 'inline-block',
				    float: 'left',
				    height: '36px',
				    marginTop: '-2px',
				    width: '36px'
				})
				.appendTo(headerEl);

        //hearder - nameContainer
        var nameContainerEl = $('<div></div>')
				.css({
				    height: '32px',
				    marginLeft: '41px',
				    position: 'relative'
				})
				.appendTo(headerEl);

        //header - nameContainer - name
        var nameEl = $('<div></div>')
    				.css({
    				    fontSize: '15px',
    				    fontWeight: 'bold',
    				    lineHeight: '15px',
    				    position: 'absolute',
    				    left: 0,
    				    top: 0
    				})
    				.text(this.share.sharedBy.name == Users.getCurrentUser().name ?
                'Me' : this.share.sharedBy.firstName)
    				.appendTo(nameContainerEl);

        //header - nameContainer - name
        var sharedWithEl = $('<div></div>')
    				.css({
    				    fontSize: '12px',
    				    lineHeight: '12px',
    				    position: 'absolute',
    				    left: 0,
    				    bottom: 0
    				})
    				.text('Amine, Erica, Natalia, and 3 others')
    				.appendTo(nameContainerEl);

        //header - nameContainer - location
        var locationEl = $('<div></div>')
				.css({
				    fontSize: '11px',
				    lineHeight: '11px',
				    position: 'absolute',
				    left: 0,
				    bottom: 0
				})
				.text(this.share.location)
				.appendTo(nameContainerEl);

        //header - nameContainer - time
        var timeEl = $('<div></div>')
				.css({
				    bottom: 0,
				    fontSize: '11px',
				    lineHeight: '11px',
				    position: 'absolute',
				    right: 0
				})
				.text(this.share.getElapsedTime())
				.appendTo(nameContainerEl);

        //set pics
        this.createPicturesEl();

        return this.el;        
    },

    /**
     * Creates the main picture element and inserts it into the dom.
     */
    createPicturesEl: function () {
        var picturesContainerEl = $('<div></div>')
						.css({
						    position: 'relative'
						})
						.appendTo(this.el);

        this.pictureViewer =
            new FeedPictureViewer(this.width, this.share.sharedAssets);
        this.pictureViewer.getEl()
            .appendTo(picturesContainerEl);
    },

    /**
     * Creates and returns the element containing the comments.
     */
    getCommentEl: function (commenter, comment) {

        //commentEl
        var commentEl = $('<div></div>')
				.css({
				    clear: 'left',
				    fontSize: '12px',
				    lineHeight: '12px',
				    marginBottom: '5px'
				});

        //commentEl - commentThumbnail (thumbnail)  
        if (SHOW_THUMBNAIL_IN_COMMENTS) {
            var commentThumbnailEl = $('<div></div>')
					.css({
					    backgroundImage: 'url(' + commenter.thumbnailSrc + ')',
					    backgroundSize: 'cover',
					    borderRadius: '24px',
					    display: 'inline-block',
					    float: 'left',
					    height: '24px',
					    width: '24px'
					})
					.appendTo(commentEl);
        }

        //commentEl - commentContainerEl
        var commentContainerEl = $('<div></div>')
				.css({
				    marginLeft: SHOW_THUMBNAIL_IN_COMMENTS ? '29px' : 'auto'
				})
				.appendTo(commentEl);

        //commentEl - commentContainerEl - username + usercomment
        if (comment) {
            if (SHOW_THUMBNAIL_IN_COMMENTS) {
                var commentUserNameEl = $('<div></div>')
						.css({
						    fontWeight: 'bold'
						})
						.text(commenter.name)
						.appendTo(commentContainerEl);
                var commentUserCommentEl = $('<div></div>')
						.text(comment)
						.appendTo(commentContainerEl);
            } else {
                var commentUserNameEl = $('<span></span>')
						.css({
						    fontWeight: 'bold'
						})
						.text(commenter.name)
						.appendTo(commentContainerEl);
                var commentUserCommentEl = $('<span></span>')
						.text(': ' + comment)
						.appendTo(commentContainerEl);
            }
        //commentEl - commentContainerEl - commentUserInput
        } else {
            var commentUserCommentEl = $('<input></input>')
					.css({
					    width: '100%'
					})
					.attr('placeholder', 'Your comment...')
					.text(comment)
					//.blur(this.hideNewCommentEl.bind(this))
					.appendTo(commentContainerEl);
        }

        return commentEl;
    },

    /**
     * Creates the new comment element and inserts it into the dom.
     */
    createNewCommentEl: function () {
        this.newCommentEl = $('<form></form>')
				.css('display', 'none')
				.on('submit', (function (e) {
				    this.postNewComment();
				    e.preventDefault();
				}).bind(this))
				.appendTo(this.commentsEl);

        this.getCommentEl(Users.getCurrentUser(), null)
				.appendTo(this.newCommentEl);
    },

    /**
     * Shows the new comment element.
     */
    showNewCommentEl: function () {
        this.isCommenting = true;

        this.newCommentEl.css('display', 'block');

        setTimeout((function () {
            this.newCommentEl.find('input').focus();
        }).bind(this), 0);

        this.commentButtonEl.text('Save');
        this.shareButtonEl.text('Cancel');
    },

    /**
     * Hides the new comment element.
     */
    hideNewCommentEl: function () {
        this.isCommenting = false;

        this.newCommentEl.remove();
        this.createNewCommentEl();
        this.commentButtonEl.text('Comment');
        this.shareButtonEl.text('Share');
    },

    /**
     * Adds the new comment to the comment stream.
     */
    postNewComment: function () {
        var comment = this.newCommentEl.find('input').val();
        this.getCommentEl(Users.getCurrentUser(),
											comment)
				.css('opacity', 0)
				.appendTo(this.commentsEl)
				.animate({
				    opacity: 1
				}, 200);
        this.hideNewCommentEl();

        //save comments (no need for callback: fire & forget)
        Shares.ajaxAddComment(this.share.id,
            comment,
            Users.getCurrentUser(),
            null);
    },

    /**
     * Event handler. Called when the user touches the comment button.
     */
    onTouchCommentButton: function (e) {
        if (!this.isCommenting) {
            this.showNewCommentEl();
        } else {
            this.postNewComment();
        }
    },

    /**
     * Event handler. Called when the user touches the share button.
     */
    onTouchShareButton: function (e) {
        if (this.isCommenting) {
            this.hideNewCommentEl();
        }

        ReshareView.show(false, this.share.sharedAssets);
    },

    /**
     * Event handler. Called when the user touches the picture.
     */
    onTouchPicture: function (e) {
        var pageX = e.changedTouches ? e.changedTouches[0].pageX : e.pageX;

        // Next picture...
        if (pageX > this.pictureEl.width() / 2) {
            this.currentIdx = (this.currentIdx + 1) % this.share.sharedAssets.length;
        } else {
            this.currentIdx--;
            if (this.currentIdx < 0) {
                this.currentIdx = this.share.sharedAssets.length - 1;
            }
        }

        this.pictureEl
				.css({
				    backgroundImage:
						'url(' + this.share.sharedAssets[this.currentIdx].url + ')'
				});
    },

    stepAnimation: function() {
      this.pictureViewer.stepAnimation();
    }
})

var FeedView = {
    newShareId: null,
    isShown: false,
    feedItems: []
};

FeedView.show = function (animate, newShareId, reload) {
    FeedView.reload = reload || false;
    FeedView.newShareId = newShareId || null;

    $.mobile.pageContainer.on('pagecontainerbeforetransition',
              FeedView.beforeTransition);
    $.mobile.pageContainer.pagecontainer('change', '#feed-view', {
        changeHash: true,
        showLoadMsg: false,
        transition: animate ? 'slide' : 'none'
    });
};

FeedView.beforeTransition = function (event, ui) {
    $.mobile.pageContainer.off('pagecontainerbeforetransition',
              arguments.callee);
    if (FeedView.isShown && !FeedView.reload)
        return;
    FeedView.isShown = true;

    //bind click events
    var addPicturesBtn = ui.toPage.find('#add-pictures-btn')
            .off(TOUCHSTART);
    addPicturesBtn.on(TOUCHSTART, function () {
			    AddPicturesView.show();
			});

    var viewProfileBtn = ui.toPage.find('#profile-btn')
            .off(TOUCHSTART);
    viewProfileBtn.on(TOUCHSTART, function () {
			    LifeStreamView.show();
			});

    //load shares
    FeedView.sharesEl = ui.toPage.find('#shares');
    FeedView.sharesEl.empty();
    var feed = Shares.ajaxGetAll(FeedView.LoadShares.bind(FeedView, ui.toPage));

    localStorage.setItem('current-view', FEED_VIEW_PAGE_IDX);
    
    Util.addAnimationHandler('feed-view', FeedView.stepAnimation);
}

FeedView.LoadShares = function (pageEl, shares) {
    if (!shares)
        Util.alert('no shares were returned');

    for (var i = 0, share; share = shares[i]; i++) {
        var feedItem = new FeedItem(pageEl.width(), share);
        FeedView.feedItems.push(feedItem);
        feedItem.getEl()
            .appendTo(FeedView.sharesEl);
    }
};

FeedView.stepAnimation = function() {
  for (var i = 0, feedItem; feedItem = FeedView.feedItems[i]; i++) {
    feedItem.stepAnimation();
  }
};