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
			]
		},
		{
			user: Users.getUser('marcello'),
			description: 'Isn\'t California wonderful?',
			pictures: [
				CameraRoll.getCameraRoll()[4],
				CameraRoll.getCameraRoll()[5],
				CameraRoll.getCameraRoll()[6],
				CameraRoll.getCameraRoll()[7],
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
	var sharesEl = ui.toPage.find('#shares');
	for (var i = 0, share; share = FeedView.shares[i]; i++) {
		var shareEl = $('<div></div>')
				.css({
					marginBottom: '40px'
				})
				.appendTo(sharesEl);
		
		var nameContainerEl = $('<div></div>')
				.css({
					marginBottom: '10px'
				})
				.appendTo(shareEl);
		var thumbnailEl = $('<span></span>')
				.css({
					backgroundImage: 'url(' + share.user.thumbnailSrc + ')',
					backgroundSize: 'cover',
					borderRadius: '32px',
					display: 'inline-block',
					float: 'left',
					height: '32px',
					width: '32px'
				})
				.appendTo(nameContainerEl);
		var nameEl = $('<div></div>')
				.css({
					display: 'inline-block',
					fontSize: '18px',
					fontWeight: 'bold',
					lineHeight: '32px',
					marginLeft: '5px'
				})
				.text(share.user.name)
				.appendTo(nameContainerEl);

		var descriptionEl = $('<div></div>')
				.css({
					fontSize: '14px',
					margin: '0 20px 10px 20px'
				})		
				.text(share.description)
				.appendTo(shareEl)
				
		var imagesContainerEl = $(
				'<div>' +
						'<div style="padding-top: 100%"></div>' +
				'</div>')
						.css({
							margin: '0 20px',
							position: 'relative'
						})
						.appendTo(shareEl);
		var imageEl = $('<div></div>')
				.css({
					backgroundImage:
						'url(' + share.pictures[0].getSrc() + ')',
					backgroundSize: 'cover',
					bottom: 0,
					left: 0,
					position: 'absolute',
					right: 0,
					top: 0
				})
				.appendTo(imagesContainerEl);
	}
}
