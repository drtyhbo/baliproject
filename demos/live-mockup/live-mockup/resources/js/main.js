$(document).ready(function() {
	if (localStorage.getItem('initialized')) {
		setTimeout(function() {
			RegistrationAddPictures.show();
		}, 100);
	} else {
//    $.mobile.pageContainer.pagecontainer('change', 'user-profile.html');
	}
	localStorage.setItem('initialized', true);
});