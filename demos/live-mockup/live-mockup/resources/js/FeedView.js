var SHOW_THUMBNAIL_IN_COMMENTS = false;

/**
 * Encapsulates all the logic behind an item in the feed.
 */
var FeedItem = Class.extend({
    init: function (share) {
        this.share = share;
        this.currentPicture = 0;
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
				.css({
				    marginBottom: '10px'
				});

        var headerEl = $('<div></div>')
				.addClass('header')
				.appendTo(this.el);
        var thumbnailEl = $('<span></span>')
				.css({
				    backgroundImage: 'url(' + this.share.user.thumbnailSrc + ')',
				    backgroundSize: 'cover',
				    borderRadius: '36px',
				    display: 'inline-block',
				    float: 'left',
				    height: '36px',
				    marginTop: '-2px',
				    width: '36px'
				})
				.appendTo(headerEl);

        var nameContainerEl = $('<div></div>')
				.css({
				    height: '32px',
				    marginLeft: '41px',
				    position: 'relative'
				})
				.appendTo(headerEl);
        var nameEl = $('<div></div>')
				.css({
				    fontSize: '18px',
				    fontWeight: 'bold',
				    left: 0,
				    lineHeight: '18px',
				    position: 'absolute',
				    top: 0
				})
				.text(this.share.user.name)
				.appendTo(nameContainerEl);
        var locationEl = $('<div></div>')
				.css({
				    bottom: 0,
				    fontSize: '11px',
				    left: 0,
				    lineHeight: '11px',
				    position: 'absolute'
				})
				.text(this.share.location)
				.appendTo(nameContainerEl);
        var timeEl = $('<div></div>')
				.css({
				    bottom: 0,
				    fontSize: '11px',
				    right: 0,
				    lineHeight: '11px',
				    position: 'absolute'
				})
				.text(this.getElapsedTimeString())
				.appendTo(nameContainerEl);

        this.createPicturesEl();

        this.commentsEl = $('<div></div>')
				.css({
				    margin: '10px 10px 0 10px'
				})
				.appendTo(this.el);
        if (this.share.description) {
            this.getCommentEl(this.share.user, this.share.description)
					.appendTo(this.commentsEl);
        }

        for (var i = 0, comment; comment = this.share.comments[i]; i++) {
            this.getCommentEl(comment.user, comment.comment)
					.appendTo(this.commentsEl);
        }
        this.createNewCommentEl();

        var buttonsEl = $('<div></div>')
				.css({
				    margin: '10px 10px 0 0',
				    textAlign: 'right'
				})
				.appendTo(this.el)
        this.commentButtonEl = $('<button></button>')
				.addClass('ui-btn ui-btn-inline')
				.css({
				    fontSize: '11px',
				})
				.text('Comment')
				.on(TOUCHEND, this.onTouchCommentButton.bind(this))
				.appendTo(buttonsEl);
        this.shareButtonEl = $('<button></button>')
				.addClass('ui-btn ui-btn-inline')
				.css({
				    fontSize: '11px',
				    marginRight: 0
				})
				.text('Share')
				.on(TOUCHEND, this.onTouchShareButton.bind(this))
				.appendTo(buttonsEl);

        return this.el;
    },

    /**
     * Creates the main picture element and inserts it into the dom.
     */
    createPicturesEl: function () {
        var picturesContainerEl = $(
				'<div>' +
						'<div style="padding-top: 100%"></div>' +
				'</div>')
						.css({
						    position: 'relative'
						})
						.appendTo(this.el);

        this.pictureEl = $('<div></div>')
				.css({
				    backgroundImage:
						'url(' + this.share.pictures[0].getSrc() + ')',
				    backgroundSize: 'cover',
				    bottom: 0,
				    left: 0,
				    position: 'absolute',
				    right: 0,
				    top: 0
				})
				.on(TOUCHEND, function (e) {
				    e.preventDefault();
				})
				.on(TOUCHEND, this.onTouchPicture.bind(this))
				.appendTo(picturesContainerEl);
    },

    /**
     * Creates and returns the element containing the comments.
     */
    getCommentEl: function (user, comment) {
        var commentEl = $('<div></div>')
				.css({
				    clear: 'left',
				    fontSize: '12px',
				    lineHeight: '12px',
				    marginBottom: '5px'
				});
        if (SHOW_THUMBNAIL_IN_COMMENTS) {
            var commentThumbnailEl = $('<div></div>')
					.css({
					    backgroundImage: 'url(' + user.thumbnailSrc + ')',
					    backgroundSize: 'cover',
					    borderRadius: '24px',
					    display: 'inline-block',
					    float: 'left',
					    height: '24px',
					    width: '24px'
					})
					.appendTo(commentEl);
        }
        var commentContainerEl = $('<div></div>')
				.css({
				    marginLeft: SHOW_THUMBNAIL_IN_COMMENTS ? '29px' : 'auto'
				})
				.appendTo(commentEl);
        if (comment) {
            if (SHOW_THUMBNAIL_IN_COMMENTS) {
                var commentUserNameEl = $('<div></div>')
						.css({
						    fontWeight: 'bold'
						})
						.text(user.name)
						.appendTo(commentContainerEl);
                var commentUserCommentEl = $('<div></div>')
						.text(comment)
						.appendTo(commentContainerEl);
            } else {
                var commentUserNameEl = $('<span></span>')
						.css({
						    fontWeight: 'bold'
						})
						.text(user.firstName)
						.appendTo(commentContainerEl);
                var commentUserCommentEl = $('<span></span>')
						.text(': ' + comment)
						.appendTo(commentContainerEl);
            }
        } else {
            var commentUserCommentEl = $('<input></input>')
					.css({
					    width: '100%'
					})
					.attr('placeholder', 'Your comment...')
					.text(comment)
					.blur(this.hideNewCommentEl.bind(this))
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
     * Returns a string which contains the time that's elapsed since this feed
     * item was created.
     */
    getElapsedTimeString: function () {
        var elapsedMs = new Date().getTime() - this.share.timestampMs;

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
        this.getCommentEl(Users.getUser('andreas'),
											this.newCommentEl.find('input').val())
				.css('opacity', 0)
				.appendTo(this.commentsEl)
				.animate({
				    opacity: 1
				}, 200);
        this.hideNewCommentEl();
    },

    /**
     * Event handler. Called when the user touches the picture.
     */
    onTouchPicture: function (e) {
        var pageX = e.changedTouches ? e.changedTouches[0].pageX : e.pageX;

        // Next picture...
        if (pageX > this.pictureEl.width() / 2) {
            this.currentPicture = (this.currentPicture + 1) % this.share.pictures.length;
        } else {
            this.currentPicture--;
            if (this.currentPicture < 0) {
                this.currentPicture = this.share.pictures.length - 1;
            }
        }

        this.pictureEl
				.css({
				    backgroundImage:
						'url(' + this.share.pictures[this.currentPicture].getSrc() + ')'
				});
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
    }
})

var FeedView = {
    isShown: false
};

/**
 * Makes the feed view the current view.
 */
FeedView.show = function (animate) {
    $.mobile.pageContainer.on('pagecontainerbeforetransition',
              FeedView.beforeTransition);
    $.mobile.pageContainer.pagecontainer('change', '#feed-view', {
        changeHash: false,
        showLoadMsg: false,
        transition: animate ? 'slide' : 'none'
    });
};

/**
 * Event handler. Called before the feed view is made visible.
 */
FeedView.beforeTransition = function (event, ui) {
    $.mobile.pageContainer.off('pagecontainerbeforetransition',
              arguments.callee);

    if (FeedView.isShown) {
        return;
    }
    FeedView.isShown = true;

    var addPicturesBtn = ui.toPage.find('#add-pictures-btn')
			.on(TOUCHSTART, function () {
			    AddPicturesView.show();
			});

    var viewProfileBtn= ui.toPage.find('#profile-btn')
			.on(TOUCHSTART, function () {
			    LifeStreamView.show();
			});

    var sharesEl = ui.toPage.find('#shares');
    sharesEl.empty();

    var feed = Feed.getFeed();
    for (var i = 0, feedItem; feedItem = feed[i]; i++) {
        new FeedItem(feedItem).getEl()
            .appendTo(sharesEl);
    }

    localStorage.setItem('current-view', FEED_VIEW_PAGE_IDX);
}
