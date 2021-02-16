const maxAvatarSize = 5000000;
const allowedImageFormats = [
    'image/jpeg', 'image/jpg', 'image/png'
];

$(document).ready(() => {
    const formElement = $('form.validate-u-form');
    formElement.on('submit', (e) => {
        // Remove all alerts
        $('.alert').remove();

        const avatar = $('input#InputAvatar')[0].files[0];
        const phone = $('input#InputPhone').val();
        const password = $('input#InputPassword').val();
        const passwordConfirm = $('input#InputPasswordConfirm').val();

        // Validate avatar size
        if (avatar != undefined && avatar.size > maxAvatarSize) {
            formElement.prepend(`<div class="alert alert-warning">
                <div class="alert-content">
                Avatar is too big, 5MB is the maximum size
                </div>
                <button type="button" class="btn-close"><i class="fas fa-times"></i>
            </div>`);

            return false;
        }

        // Validate avatar image type
        if (avatar!= undefined && !allowedImageFormats.includes(avatar.type)) {
            formElement.prepend(`<div class="alert alert-warning">
                <div class="alert-content">
                Disallowed avatar image format
                </div>
                <button type="button" class="btn-close"><i class="fas fa-times"></i>
            </div>`);

            return false;
        }

        // Validate phones
        if (phone.length > 0 && !phone.match('^[+]?[0-9]+$')) {
            formElement.prepend(`<div class="alert alert-warning">
                <div class="alert-content">
                Phone number is invalid
                </div>
                <button type="button" class="btn-close"><i class="fas fa-times"></i>
            </div>`);

            return false;
        }

        // Validate password
        if (password && password.length < 6) {
            formElement.prepend(`<div class="alert alert-warning">
                <div class="alert-content">
                Password must be at least 6 characters
                </div>
                <button type="button" class="btn-close"><i class="fas fa-times"></i>
            </div>`);

            return false;
        }

        if (passwordConfirm.length <= 0) {
            formElement.prepend(`<div class="alert alert-warning">
                <div class="alert-content">
                Please confirm your password
                </div>
                <button type="button" class="btn-close"><i class="fas fa-times"></i>
            </div>`);

            return false;
        }

        // Check if passwords match
        if (password && passwordConfirm  && password.length >= 6 && passwordConfirm.length > 0 && password !== passwordConfirm) {
            formElement.prepend(`<div class="alert alert-warning">
                <div class="alert-content">
                Passwords do not match
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"><i class="fas fa-times"></i>
            </div>`);

            return false;
        }
    });
});