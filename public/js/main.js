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
            $('#ClearFileBtn').prop('disabled', true);
            return;
        }

        $('.file-select-group label').text(`${file.name}`);
        $('#ClearFileBtn').prop('disabled', false);

        if (file.size > maxAvatarSize) {
            $('.file-select-group label').addClass('wrong');
        }
        else {
            $('.file-select-group label').removeClass('wrong');
        }
    });

    // Password Toggle Visibility
    $('#togglePassword').on('click', (e) => {
        const type = $('#InputPassword').attr('type') === 'password' ? 'text' : 'password';
        $('#InputPassword').attr('type', type);
        $(e.currentTarget).toggleClass('fa-eye-slash');
    });
});

// Alerts
$(document).on('click', '.alert .btn-close', (event) => {
    $(event.currentTarget).parent().remove();
});