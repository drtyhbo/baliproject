/**
 * This object represents the user's personal library of pictures that have
 * either been uploaded, or are in the process of being uploaded.
 *
 * The upload is represented as a bar on the top of the screen. The bar works
 * as follows:
 *   The bar will progress normally for the first set of pictures to be
 *   uploaded. If 10 pictures are being uploaded, the width of the bar
 *   (where 0 is no width and 1.0 is 100% width) would be
 *   <num pictures uploaded> / 10.
 *
 *   We don't want the bar to decrease in length if more items are added to the
 *   queue during an existing upload. Therefore, we keep track of the current
 *   progress, and have the new items fill the remainder of the bar.
 *   For example, the user uploads 5 out of 10 items. The bar is at 50%.
 *   9 more items are queued for a total of 14 items remaining. Those items
 *   should fill the remaining 50%. 7 out of those 14 items are uploaded and
 *   the bar is at 75% now. 10 more items are queued for a total of 17 items
 *   remaining. Those 17 items should now fill the last 25%.
 */

var PersonalLibrary = {
	pictures: localStorage.getItem('personal-library') || {},
	uploadTimerId: 0,
	toUpload: [],
  uploadEl: null,
	numToUpload: 0,
	numUploaded: 0,
	percentUploaded: 0
};

/**
 * The maximum amount of time it should take to upload an individual asset.
 */
PersonalLibrary.MAX_UPLOAD_DURATION_MS = 2000;
/**
 * The progress bar animation duration.
 */
PersonalLibrary.UPLOAD_BAR_ANIMATION_DURATION_MS = 400;

/**
 * Adds pictures to the user's personal library.
 */
PersonalLibrary.add = function(pictures) {
	for (var i = 0, picture; picture = pictures[i]; i++) {
		if (picture.num in PersonalLibrary.pictures) {
			continue;
		}

		PersonalLibrary.pictures[picture.num] = {
			picture: picture,
			isUploaded: false
		};
	}
	
	PersonalLibrary.startUpload();
};

/**
 * Determines what needs to be uploaded and kicks off that process.
 */
PersonalLibrary.startUpload = function() {
	if (!PersonalLibrary.uploadEl) {
		PersonalLibrary.uploadEl = $('<div></div>').css({
			background: '#0000ff',
      height: '2px',
      left: 0,
			opacity: 0,
      position: 'fixed',
      top: 0
		})
		.appendTo($(document.body));
	}

	// Are we already uploading something?
	if (PersonalLibrary.numToUpload) {
		PersonalLibrary.percentUploaded += PersonalLibrary.numUploaded /
				PersonalLibrary.numToUpload * (1 - PersonalLibrary.percentUploaded);
	} else {
		PersonalLibrary.uploadEl.css({
			opacity: 0,
			width: 0
		});
	}
	PersonalLibrary.numToUpload = PersonalLibrary.numUploaded = 0;

	var toUpload = [];
	for (var pictureNum in PersonalLibrary.pictures) {
		var picture = PersonalLibrary.pictures[pictureNum];
		if (picture.isUploaded) {
			continue;
		}

		toUpload.push(picture);
		PersonalLibrary.numToUpload++;
	}
	PersonalLibrary.toUpload = toUpload;
		
	PersonalLibrary.updateUploadBar();
	if (toUpload.length && !PersonalLibrary.uploadTimerId) {
		PersonalLibrary.uploadTimerId = setTimeout(PersonalLibrary.uploadNext,
				Math.random() * PersonalLibrary.MAX_UPLOAD_DURATION_MS);
	}
};

/**
 * Called when the next file has been uploaded. Kicks off the process again if
 * there are files remaining.
 */
PersonalLibrary.uploadNext = function() {
	PersonalLibrary.numUploaded++;
	PersonalLibrary.toUpload.shift().isUploaded = true;
	PersonalLibrary.updateUploadBar();

	// Continue to upload if there's stuff left to upload...
	if (PersonalLibrary.toUpload.length) {
		PersonalLibrary.uploadTimerId = setTimeout(PersonalLibrary.uploadNext,
				Math.random() * PersonalLibrary.MAX_UPLOAD_DURATION_MS);
	} else {
		PersonalLibrary.uploadTimerId = PersonalLibrary.percentUploaded =
				PersonalLibrary.numToUpload = PersonalLibrary.numUploaded = 0;
		PersonalLibrary.uploadEl.animate({
			opacity: 0
		}, PersonalLibrary.UPLOAD_BAR_ANIMATION_DURATION_MS);		
	}
};

/**
 * Updates the upload bar UI to reflect the current upload progress.
 */
PersonalLibrary.updateUploadBar = function() {
	var percentUploaded = PersonalLibrary.percentUploaded +
					(PersonalLibrary.numUploaded / PersonalLibrary.numToUpload) *
					(1 - PersonalLibrary.percentUploaded);

	PersonalLibrary.uploadEl.stop();
	PersonalLibrary.uploadEl.animate({
		opacity: 1,
		width: percentUploaded * 100 + '%'
	}, PersonalLibrary.UPLOAD_BAR_ANIMATION_DURATION_MS);
};