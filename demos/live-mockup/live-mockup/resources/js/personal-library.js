var PersonalLibrary = {
	pictures: localStorage.getItem('personal-library') || {},
	uploadTimerId: 0,
	toUpload: [],
  uploadEl: null,
	numToUpload: 0,
	numUploaded: 0
};

/**
 * The maximum amount of time it should take to upload an individual asset.
 */
PersonalLibrary.MAX_UPLOAD_DURATION_MS = 2000;

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

	if (!PersonalLibrary.uploadTimerId) {
		PersonalLibrary.numToUpload = 0;
		PersonalLibrary.numUploaded = 0;
	}

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
	console.log(PersonalLibrary.numUploaded, PersonalLibrary.numToUpload);

	PersonalLibrary.numUploaded++;
	PersonalLibrary.toUpload.shift().isUploaded = true;
	PersonalLibrary.updateUploadBar();

	if (PersonalLibrary.toUpload.length) {
		PersonalLibrary.uploadTimerId = setTimeout(PersonalLibrary.uploadNext,
				Math.random() * PersonalLibrary.MAX_UPLOAD_DURATION_MS);
	} else {
		PersonalLibrary.uploadEl.animate({
			opacity: 0
		}, 400);		
	}
};

/**
 * Updates the upload bar UI to reflect the current upload progress.
 */
PersonalLibrary.updateUploadBar = function() {
	PersonalLibrary.uploadEl.stop();
	PersonalLibrary.uploadEl.animate({
		opacity: 1,
		width:
			(PersonalLibrary.numUploaded / PersonalLibrary.numToUpload) * 100 + '%'
	}, 400);
};