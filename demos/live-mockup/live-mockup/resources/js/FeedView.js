var ShareElement = Class.extend({
	init: function(share) {
		this.share = share;
		this.currentPicture = 0;
	},
	
	getEl: function() {
		this.el = $('<div></div>')
				.css({
					marginBottom: '40px'
				});
		
		var headerEl = $('<div></div>')
				.css({
					marginBottom: '10px'
				})
				.appendTo(this.el);
		var thumbnailEl = $('<span></span>')
				.css({
					backgroundImage: 'url(' + this.share.user.thumbnailSrc + ')',
					backgroundSize: 'cover',
					borderRadius: '32px',
					display: 'inline-block',
					float: 'left',
					height: '32px',
					width: '32px'
				})
				.appendTo(headerEl);

		var nameContainerEl = $('<div></div>')
				.css({
					height: '32px',
					marginLeft: '37px',
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
		var countEl = $('<div></div>')
				.css({
					bottom: 0,
					fontSize: '11px',
					left: 0,
					lineHeight: '11px',
					position: 'absolute'
				})
				.text(this.share.pictures.length + ' pictures')
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

		var descriptionEl = $('<div></div>')
				.css({
					fontSize: '12px',
					marginTop: '10px'
				})		
				.text(this.share.description)
				.appendTo(this.el)

		var commentsEl = $('<div></div>')
				.css({
					marginTop: '10px'
				})
				.appendTo(this.el);
		for (var i = 0, comment; comment = this.share.comments[i]; i++) {
			var commentEl = $('<div></div>')
					.css({
						fontSize: '12px',
						lineHeight: '16px'
					})
					.appendTo(commentsEl);
			var nameEl = $('<span></span>')
				.css({
					fontWeight: 'bold'
				})
				.text(comment.user.name + ': ')
				.appendTo(commentEl);
			var commentTextEl = $('<span></span>')
				.text(comment.comment)
				.appendTo(commentEl);
		}

		var buttonsEl = $('<div></div>')
				.css({
					marginTop: '10px',
					textAlign: 'right'
				})		
				.appendTo(this.el)
		var shareButtonEl = $('<button></button>')
				.addClass('ui-btn ui-btn-inline')
				.css({
					fontSize: '11px',
				})
				.text('Comment')
				.appendTo(buttonsEl);
		var shareButtonEl = $('<button></button>')
				.addClass('ui-btn ui-btn-inline')
				.css({
					fontSize: '11px',
					marginRight: 0
				})
				.text('Share')
				.appendTo(buttonsEl);


		return this.el;
	},
	
	getBackgroundPictureEl: function(offset) {
		return $('<div></div>')
				.css({
					backgroundColor: '#ddd',
					border: '1px solid #ccc',
					bottom: -offset,
					left: offset,
					position: 'absolute',
					right: -offset,
					top: offset
				});
	},

	createPicturesEl: function() {
		var picturesContainerEl = $(
				'<div>' +
						'<div style="padding-top: 100%"></div>' +
				'</div>')
						.css({
							margin: '0 -20px',
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
				.on(TOUCHEND, this.onTouchEndPicture.bind(this))
				.appendTo(picturesContainerEl);
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
		this.currentPicture = (this.currentPicture + 1) % this.share.pictures.length;
		this.pictureEl
				.css({
					backgroundImage:
						'url(' + this.share.pictures[this.currentPicture].getSrc() + ')'
			  });
	}
})

var FeedView = {
	shares: [
		{
			user: Users.getUser('amine'),
			description: 'Silly republicans... we met in a bar and started arguing about a bunch of crap. Got heated for a second, but then we became fast friends. They couldn\'t resist my moroccan charms.',
			pictures: [
				CameraRoll.getCameraRoll()[0],
				CameraRoll.getCameraRoll()[1],
				CameraRoll.getCameraRoll()[2],
				CameraRoll.getCameraRoll()[3],
			],
			comments: [{
					comment: 'Hah republicans are so funny...',
					user: Users.getUser('amine')
				}, {
					comment: 'Yeah they really are',
					user: Users.getUser('marcello')
				}
			],
			// 6 minutes ago
			timestampMs: new Date().getTime() - 6 * 60 * 1000
		},
		{
			user: Users.getUser('marcello'),
			description: 'Isn\'t California wonderful?',
			pictures: [
				CameraRoll.getCameraRoll()[4],
				CameraRoll.getCameraRoll()[5],
				CameraRoll.getCameraRoll()[6],
				CameraRoll.getCameraRoll()[7],
			],
			comments: [],
			// 2 hours ago
			timestampMs: new Date().getTime() - 120 * 60 * 1000
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
	var sharesEl = ui.toPage.find('#shares');
	for (var i = 0, share; share = FeedView.shares[i]; i++) {
		var shareElement = new ShareElement(share);
		shareElement.getEl().appendTo(sharesEl);
	}
}
