document.addEventListener('DOMContentLoaded', () => {
    const lookupPidForm = document.querySelector('#lookup-pid-form');

    lookupPidForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const pid = document.querySelector('form input#InputId');
        if (pid.value.includes('/')) {
            $('.msg-wraper').prepend(`
            <div class="alert alert-warning">
                <div class="alert-content">
                    ID cannot contain a "<b>/</b>" character.
                </div>
                <button type="button" class="btn-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>`);
            return;
        }

        window.location = `/pid/${pid.value}`;
    });
});