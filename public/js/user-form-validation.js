const maxAvatarSize = 5000000;
const allowedImageFormats = [
    'image/jpeg', 'image/jpg', 'image/png'
];

$(document).ready(() => {
    $('input#ClearAvatarInput').on('click', () => {
        if (confirm('You sure you want to reset avatar image file?')) {
            $('input#InputAvatar').val('');
        }
    });

    const formElement = $('form.validate-u-form');
    formElement.on('submit', (e) => {
        // Remove all alerts
        $('.alert').remove();

        const avatar = $('input#InputAvatar')[0].files[0];
        const phone = $('input#InputPhone').val();
        const password = $('input#InputPassword').val();
        const passwordConfirm = $('input#InputPasswordConfirm').val();

        // Validate avatar size
        if (avatar!= undefined && avatar.size > maxAvatarSize) {
            formElement.prepend(`<div class="alert alert-warning alert-dismissible fade show" role="alert">
                Avatar is too big, 5MB is the maximum size
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`);

            return false;
        }

        // Validate avatar image type
        if (avatar!= undefined && !allowedImageFormats.includes(avatar.type)) {
            formElement.prepend(`<div class="alert alert-warning alert-dismissible fade show" role="alert">
                Disallowed avatar image format
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`);

            return false;
        }

        // Validate phones
        if (phone.length > 0 && !phone.match('^[+]?[0-9]+$')) {
            formElement.prepend(`<div class="alert alert-warning alert-dismissible fade show" role="alert">
                    Phone number is invalid
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`);

            return false;
        }

        // Validate password
        if (password && password.length < 6) {
            formElement.prepend(`<div class="alert alert-warning alert-dismissible fade show" role="alert">
                    Password must be at least 6 characters
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`);

            return false;
        }

        if (passwordConfirm.length <= 0) {
            formElement.prepend(`<div class="alert alert-warning alert-dismissible fade show" role="alert">
                    Please confirm your password 
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`);

            return false;
        }

        // Check if passwords match
        if (password && passwordConfirm  && password.length >= 6 && passwordConfirm.length > 0 && password !== passwordConfirm) {
            formElement.prepend(`<div class="alert alert-warning alert-dismissible fade show" role="alert">
                    Passwords do not match
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`);

            return false;
        }
    });
});