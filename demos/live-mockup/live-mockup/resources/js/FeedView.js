var FeedView = {
	shares: [
		{
			name: 'Amine Zejli',
			description: 'Silly republicans...',
			pictures: [
				CameraRoll.getCameraRoll()[0],
				CameraRoll.getCameraRoll()[1],
				CameraRoll.getCameraRoll()[2],
				CameraRoll.getCameraRoll()[3],
			]
		},
		{
			name: 'Marcello Chermak',
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
				.appendTo(sharesEl);
		
		var nameEl = $('<div></div>')
				.css({
					fontSize: '18px',
					fontWeight: 'bold'
				})
				.text(share.name)
				.appendTo(shareEl)

		var descriptionEl = $('<div></div>')
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