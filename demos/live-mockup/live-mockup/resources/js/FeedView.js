var FeedView = {
	shares: [
		{
			name: 'Amine Zejli',
			description: 'Silly republicans...',
			pictures: [
				cameraRoll[0],
				cameraRoll[0],
				cameraRoll[0],
				cameraRoll[0]
			]
		},
		{
			name: 'Marcello Chermak',
			description: 'Isn\'t California wonderful?',
			pictures: [
				cameraRoll[1],
				cameraRoll[1],
				cameraRoll[1],
				cameraRoll[1]
			]
		}
	]
};

/**
 * Makes the feed view the current view.
 */
FeedView.show = function() {
  $.mobile.pageContainer.on('pagecontainerbeforetransition',
			FeedView.beforeTransition);
	$.mobile.pageContainer.pagecontainer('change', '#feed-view', {
		changeHash: false,
		showLoadMsg: false,
    transition: 'slide'
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
						'url(' + CameraRoll.getSrc(share.pictures[0]) + ')',
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