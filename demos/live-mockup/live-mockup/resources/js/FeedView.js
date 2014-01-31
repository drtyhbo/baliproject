var SHOW_THUMBNAIL_IN_COMMENTS = false;

var ShareElement = Class.extend({
	init: function(share) {
		this.share = share;
		this.currentPicture = 0;
		this.commentsEl = null;
		this.newCommentEl = null;
		this.isCommenting = false;
	},
	
	getEl: function() {
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
				.text(this.getElapsedTime())
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
		this.addNewCommentEl();

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
				.on(TOUCHEND, this.onCommentButton.bind(this))
				.appendTo(buttonsEl);
		this.shareButtonEl = $('<button></button>')
				.addClass('ui-btn ui-btn-inline')
				.css({
					fontSize: '11px',
					marginRight: 0
				})
				.text('Share')
				.on(TOUCHEND, this.onShareButton.bind(this))
				.appendTo(buttonsEl);

		return this.el;
	},

	createPicturesEl: function() {
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
				.on(TOUCHEND, function(e) {
					e.preventDefault();
				})
				.on(TOUCHEND, this.onTouchEndPicture.bind(this))
				.appendTo(picturesContainerEl);
	},
	
	getCommentEl: function(user, comment) {
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
					.appendTo(commentContainerEl);			
		}
		
		return commentEl;
	},
	
	addNewCommentEl: function() {
		this.newCommentEl = $('<form></form>')
				.css('display', 'none')
				.on('submit', (function(e) {
						this.postComment();
						e.preventDefault();
				}).bind(this))
				.appendTo(this.commentsEl);
		
		this.getCommentEl(Users.getUser('andreas'), null)
				.appendTo(this.newCommentEl);
	},
	
	getElapsedTime: function() {
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
	
	onTouchEndPicture: function(e) {
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
	
	showAddComment: function() {
		this.isCommenting = true;

		this.newCommentEl.css('display', 'block');

		setTimeout((function() {
			this.newCommentEl.find('input').focus();
		}).bind(this), 0);
	
		this.commentButtonEl.text('Save');
		this.shareButtonEl.text('Cancel');		
	},
	
	hideAddComment: function() {
		this.isCommenting = false;

		this.newCommentEl.remove();
		this.addNewCommentEl();
		this.commentButtonEl.text('Comment');
		this.shareButtonEl.text('Share');				
	},
	
	postComment: function() {
		this.getCommentEl(Users.getUser('andreas'),
											this.newCommentEl.find('input').val())
				.css('opacity', 0)
				.appendTo(this.commentsEl)
				.animate({
					opacity: 1
				}, 200);
		this.hideAddComment();
	},
	
	onCommentButton: function(e) {
		if (!this.isCommenting) {
			this.showAddComment();
		} else {
			this.postComment();
		}
	},
	
	onShareButton: function(e) {
		if (this.isCommenting) {
			this.hideAddComment();
		}
	}
})

var FeedView = {
	shares: [
		{
			user: Users.getUser('amine'),
			location: 'Kuala Lumpur, Malaysia',
			description: 'me in kuala lumpur <3',
			pictures: [
				CameraRoll.getCameraRoll()[0],
				CameraRoll.getCameraRoll()[1],
				CameraRoll.getCameraRoll()[2],
				CameraRoll.getCameraRoll()[3],
			],
			comments: [{
					comment: 'are you grabbing the shaft?',
					user: Users.getUser('marcello')
				}, {
					comment: 'it looked cooler in my mind...',
					user: Users.getUser('amine')
				}, {
					comment: 'dont forget to play with the... mall?',
					user: Users.getUser('marcello')
				}
			],
			// 6 minutes ago
			timestampMs: new Date().getTime() - 6 * 60 * 1000,
			visibleTo: [
				Users.getUser('amine'),
				Users.getUser('andreas'),
				Users.getUser('marcello'),
				Users.getUser('veronica')
			]
		}, {
			user: Users.getUser('andreas'),
			location: 'Kuala Lumpur, Malaysia',
			description: 'Kuala lumpur, standing in front of a big ass building.',
			pictures: [
				CameraRoll.getCameraRoll()[4],
				CameraRoll.getCameraRoll()[5],
				CameraRoll.getCameraRoll()[6],
				CameraRoll.getCameraRoll()[7],
			],
			comments: [],
			// 2 hours ago
			timestampMs: new Date().getTime() - 120 * 60 * 1000,
			visibleTo: [
				Users.getUser('amine')
			]
		}, {
			user: Users.getUser('andreas'),
			location: 'Phuket, Thailand',
			description: 'Beach, bay, babes and bikes :)',
			pictures: [
				CameraRoll.getCameraRoll()[8],
				CameraRoll.getCameraRoll()[9],
				CameraRoll.getCameraRoll()[10],
				CameraRoll.getCameraRoll()[11],
				CameraRoll.getCameraRoll()[12],
				CameraRoll.getCameraRoll()[13],
				CameraRoll.getCameraRoll()[14],
				CameraRoll.getCameraRoll()[15],
			],
			comments: [{
					comment: 'Be safe on those things!',
					user: Users.getUser('veronica')
				}, {
					comment: 'Lol, what a fruity pink bike ;)',
					user: Users.getUser('amine')
				}, {
					comment: 'At least it stays upright...',
					user: Users.getUser('andreas')
				} 
			],
			// 5 hours ago
			timestampMs: new Date().getTime() - 300 * 60 * 1000,
			visibleTo: [
				Users.getUser('amine'),
				Users.getUser('andreas'),
				Users.getUser('marcello'),
				Users.getUser('veronica')
			]
		}
	]
};

/**
 * Makes the feed view the current view.
 */
FeedView.show = function(animate) {
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
FeedView.beforeTransition = function(event, ui) {
  if (ui.absUrl.indexOf('#feed-view') == -1) {
    $.mobile.pageContainer.off('pagecontainerbeforetransition',
				arguments.callee);
    return;
  }

	var sharesEl = ui.toPage.find('#shares');
	sharesEl.empty();

	for (var i = 0, share; share = FeedView.shares[i]; i++) {
		var shareElement = new ShareElement(share);
		shareElement.getEl().appendTo(sharesEl);
	}
	var addPicturesBtn = ui.toPage.find('#add-pictures-btn')
			.on(TOUCHEND, function() {
				addPicturesBtn.off(TOUCHEND, arguments.callee);
				AddPicturesView.show();
			});
}
