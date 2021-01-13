document.addEventListener('DOMContentLoaded', () => {
    const lookupPidForm = document.querySelector('#lookup-pid-form');

    lookupPidForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const pid = document.querySelector('form input#InputId');
        window.location = `/pid/${pid.value}`;
    });
});