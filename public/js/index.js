document.addEventListener('DOMContentLoaded', () => {
    const lookupPidForm = document.querySelector('#lookup-pid-form');

    lookupPidForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const pid = document.querySelector('form input#InputId');

        showMessage('warning', '<div class="loading-container"><div class="spinner-border" role="status"><span class="sr-only"></span></div></div>');

        const response = await fetch(`/api/${pid.value}`, {
            method: 'GET'
        });
    
        const result = await response.json();
        if (result.error || !result.foundId) {
            showMessage('warning', result.message);
        }
        else {
            showMessage('success',
            `<b>Full Name</b> ${result.Id.firstName} ${result.Id.middleName} ${result.Id.lastName}<br>
            <b>Birthdate</b> ${new Date(result.Id.birthdate).toDateString()}<br>
            <b>Email</b> <a href="mailto:${result.Id.email}">${result.Id.email}</a><br>
            <b>Phone</b> <a href="tel:${result.Id.phone}">${result.Id.phone}</a>`);
        }
    });
});