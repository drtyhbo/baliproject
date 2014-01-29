setTimeout(function () {
    $(document).ready(function () {
        $(document.body).show();

        localStorage.setItem('initialized', 0);
        if (!localStorage.getItem('initialized') ||
          localStorage.getItem('initialized') < 2 && false) {
            setTimeout(function () {
                if (localStorage.getItem('initialized') == 1) {
                    RegistrationCreateUserPage.show(false);
                } else {
                    RegistrationAddPicturesPage.show(false);
                }
            }, 100);
        } else {
            setTimeout(function () {
                LifeStreamLoadView.show(false);
            }, 100);
        }
    });
}, 100);