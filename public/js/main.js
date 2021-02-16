$(document).ready(() => {
    $("body").removeClass("preload");

    // Menu
    $('.topnav button.open-menu-button').on('click', () => {
        $('.topnav .nav-container').toggleClass('show-nav');
    });

    // Custom file select
    $('#SelectFileBtn').on('click', () => {
        $('#InputAvatar').trigger('click');
    });

    $('#InputAvatar').on('change', (e) =>  {
        const file = $('input#InputAvatar')[0].files[0];
        if (file == null) {
            $('.file-select-group label').text('no file selected');
            $('.file-select-group label').removeClass('wrong');
            return;
        }

        $('.file-select-group label').text(`${file.name}`);

        if (file.size > maxAvatarSize) {
            $('.file-select-group label').addClass('wrong');
        }
        else {
            $('.file-select-group label').removeClass('wrong');
        }
    });
});

// Alerts
$(document).on('click', '.alert .btn-close', (event) => {
    $(event.currentTarget).parent().remove();
});