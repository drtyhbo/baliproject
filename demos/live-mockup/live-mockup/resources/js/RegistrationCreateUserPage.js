var RegistrationCreateUserPage = {
	emailEl: null,
	footerEl: null,
	nameEl: null,
	passwordEl: null
};

RegistrationCreateUserPage.show = function(animate) {
  $.mobile.pageContainer.on('pagecontainerbeforetransition',
			RegistrationCreateUserPage.onBeforeTransition);
  $.mobile.pageContainer.on('pagecontainershow',
			RegistrationCreateUserPage.onShow);
	$.mobile.pageContainer.pagecontainer('change',
			'#registration-create-user', {
    changeHash: false,
    showLoadMsg: false,
    transition: animate ? 'slide' : 'none'
  });
};

RegistrationCreateUserPage.onBeforeTransition = function(event, ui) {
  if (ui.absUrl.indexOf('#registration-create-user') == -1) {
    $.mobile.pageContainer.off('pagecontainerbeforetransition',
				arguments.callee);
    return;
  }

	RegistrationCreateUserPage.emailEl = ui.toPage.find('#create-user-email')
			.focus(RegistrationCreateUserPage.focusInput)
			.blur(RegistrationCreateUserPage.blurInput);
	RegistrationCreateUserPage.nameEl = ui.toPage.find('#create-user-name')
			.focus(RegistrationCreateUserPage.focusInput)
			.blur(RegistrationCreateUserPage.blurInput);
	RegistrationCreateUserPage.passwordEl = ui.toPage.find('#create-user-password')
			.focus(RegistrationCreateUserPage.focusInput)
			.blur(RegistrationCreateUserPage.blurInput);

	RegistrationCreateUserPage.footerEl = ui.toPage.find('#create-user-footer')
			.on(TOUCHEND, RegistrationCreateUserPage.clickFooterButton);
};

RegistrationCreateUserPage.onShow = function(event, ui) {
  $.mobile.pageContainer.off('pagecontainershow', arguments.callee);
	RegistrationCreateUserPage.nameEl.focus();
};

RegistrationCreateUserPage.clickFooterButton = function(e) {
  e.preventDefault();

	if (!RegistrationCreateUserPage.nameEl.val()) {
		RegistrationCreateUserPage.nameEl.focus();
	} else if (!RegistrationCreateUserPage.emailEl.val()) {
		RegistrationCreateUserPage.emailEl.focus();
	} else if (!RegistrationCreateUserPage.passwordEl.val()) {
		RegistrationCreateUserPage.passwordEl.focus();
	} else {
        var name = RegistrationCreateUserPage.nameEl.val();
        var email = RegistrationCreateUserPage.emailEl.val();
        var password = RegistrationCreateUserPage.passwordEl.val();
        Users.ajaxCreateUser(name, email, password,
                RegistrationCreateUserPage.onCreateUser);
	}
};

RegistrationCreateUserPage.onCreateUser = function(data) {
    FeedView.show(true);
};

RegistrationCreateUserPage.focusInput = function() {
	RegistrationCreateUserPage.footerEl.hide();
};

RegistrationCreateUserPage.blurInput = function() {
	RegistrationCreateUserPage.footerEl.show();
};
