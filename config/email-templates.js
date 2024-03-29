const year = new Date().getFullYear();

const styleSheet = `
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: #212529;
    color:#C3C4C5 !important;
    padding: 10px;
}
a {
    color:gold;
}
.ls-title {
    color: gold;
    font-weight: bold;
}
.li-title {
    color: cadetblue;
    font-weight: bold;
}
.perid-a {
    color: cadetblue;
    font-weight: bold;
    text-decoration: none;
}
a.link-button {
    text-decoration: none;
    background-color: #8CC63F;
    color: hsl(86, 54%, 15%) !important;
    font-weight: bold;
    font-size: 10.5pt;
    padding: 2px 8px;
    border-radius: 15px;
    transition: .1s;
}
a.link-button:hover {
    background-color: hsl(86, 54%, 61%);
}
div.wraper {
    background-color: #1a1d20;
    border-radius: 15px;
    padding: 10px 20px;
}
div.wraper .title {
    font-size: 20pt;
    font-weight: bold;
    margin-top: 10px;
}
div.wraper span.full-link {
    word-break: break-all;
}
div.wraper span.full-link a {
    color: goldenrod;
}
div.wraper p.bottom-text {
    font-size: 8.5pt;
    color: grey;
    margin-bottom: 7px;
}`;

module.exports = {
    AccountLoggedIn: (UserFirstName, Geolocation, Device) => {
        return `<html>
        <header>
            <style>
            ${styleSheet}
            </style>
        </header>
        <body>
            <div class="wraper">
                <h2 class="title">Someone has logged in to your Perid account</h2>
                <p>Hey there <b>${UserFirstName}</b>,</p>
                <p>Someone, or maybe you, has logged in to your account at <a target='_blank' href='https://perid.tk/' class="perid-a">Perid</a>.</p>
                <p>If you didn't logged in, then someone else did. The best we can suggest you is to change your password immediately.</p>
                <p>
                    <span class='ls-title'>More Information ⤵</span><br>
                    <span class='li-title'>IP</span> ${Geolocation.ip}<br>
                    <span class='li-title'>Location</span> ${Geolocation.city}, ${Geolocation.location.country_flag_emoji} ${Geolocation.country_name}<br>
                    <span class='li-title'>Platform</span> ${Device.platform}, ${Device.os}
                </p>
                <p>For any further help, you can contact <a href="mailto:support@perid.tk">support@perid.tk</a>.</p>
                <p class="bottom-text">© ${year} BILLVOG, email sent from <a href="https://perid.tk" target="_blank" rel="noopener noreferrer">perid.tk</a><br>
                You received this email because a user logged in to your account. This email has been sent by a no-reply email account, any reply will be ignored.</p>
            </div>
        </body>
    </html>`
    },
    // Authentication link
    AccountVerification: (UserFirstName, Url) => {
        return `<html>
        <header>
            <style>
            ${styleSheet}
            </style>
        </header>
        <body>
            <div class="wraper">
                <h2 class="title">Verify your email address for Perid</h2>
                <p>Hey there <b>${UserFirstName}</b>,</p>
                <p>Your email has been recently used to create an account to <a target='_blank' href='https://perid.tk/' class="perid-a">Perid</a>.</p>
                <p>If you don't verify your email address you won't be visible in search and your account will be deleted in 30 days from the registration date.</p>
                <p>Click <a target="_blank" rel="noopener noreferrer" href="${Url}" class='link-button'>here</a> to verify your email address or follow this link:</p>
                <p><span class="full-link"><a href="${Url}" target="_blank" rel="noopener noreferrer">${Url}</a></span></p>
                <p class="bottom-text">© ${year} BILLVOG, email sent from <a href="https://perid.tk" target="_blank" rel="noopener noreferrer">perid.tk</a><br>
                You received this email because a user was registered in our service with this email. This email has been sent by a no-reply email account, any reply will be ignored.</p>
            </div>
        </body>
    </html>`
    },
    PasswordReset: (UserFirstName, Url) => {
        return `<html>
        <header>
            <style>
            ${styleSheet}
            </style>
        </header>
        <body>
            <div class="wraper">
                <h2 class="title">Reset your password for Perid</h2>
                <p>Hey there <b>${UserFirstName}</b>,</p>
                <p>Someone, or maybe you, has requested a password reset for your account at <a target='_blank' href='https://perid.tk/' class="perid-a">Perid</a>.</p>
                <p>If you didn't triggered this action you can ignore this email.</p>
                <p>Click <a target="_blank" rel="noopener noreferrer" href="${Url}" class='link-button'>here</a> to create a new password or follow this link:</p>
                <p><span class="full-link"><a href="${Url}" target="_blank" rel="noopener noreferrer">${Url}</a></span></p>
                <p class="bottom-text">© ${year} BILLVOG, email sent from <a href="https://perid.tk" target="_blank" rel="noopener noreferrer">perid.tk</a><br>
                You received this email because a password reset request for your account was triggered. This email has been sent by a no-reply email account, any reply will be ignored.</p>
            </div>
        </body>
    </html>`
    },
    PasswordChange: (UserFirstName, Url) => {
        return `<html>
        <header>
            <style>
            ${styleSheet}
            </style>
        </header>
        <body>
            <div class="wraper">
                <h2 class="title">Change your password for Perid</h2>
                <p>Hey there <b>${UserFirstName}</b>,</p>
                <p>Someone, or maybe you, has requested to change the password of your account at <a target='_blank' href='https://perid.tk/' class="perid-a">Perid</a>.</p>
                <p>If you didn't triggered this action you can ignore this email.</p>
                <p>Click <a target="_blank" rel="noopener noreferrer" href="${Url}" class='link-button'>here</a> to create a new password or follow this link:</p>
                <p><span class="full-link"><a href="${Url}" target="_blank" rel="noopener noreferrer">${Url}</a></span></p>
                <p class="bottom-text">© ${year} BILLVOG, email sent from <a href="https://perid.tk" target="_blank" rel="noopener noreferrer">perid.tk</a><br>
                You received this email because a password change request for your account was triggered. This email has been sent by a no-reply email account, any reply will be ignored.</p>
            </div>
        </body>
    </html>`
    },
    // Credentials has changed
    EmailHasChanged: (UserFirstName, OldEmail, NewEmail) => {
        return `<html>
        <header>
            <style>
            ${styleSheet}
            </style>
        </header>
        <body>
            <div class="wraper">
                <h2 class="title">Your account's email for Perid has changed</h2>
                <p>Hey there <b>${UserFirstName}</b>,</p>
                <p>Someone, or maybe you, has changed the email of your account at <a target='_blank' href='https://perid.tk/' class="perid-a">Perid</a>.</p>
                <p>
                    <s style='color:#DC3545'>${OldEmail}</s> → <b style='color:#8CC63F'>${NewEmail}</b>
                </p>
                <p>If you didn't triggered this action please contact us at <a href="mailto:support@perid.tk">support@perid.tk</a>.</p>
                <p class="bottom-text">© ${year} BILLVOG, email sent from <a href="https://perid.tk" target="_blank" rel="noopener noreferrer">perid.tk</a><br>
                You received this email because the email of your account was changed. This email has been sent by a no-reply email account, any reply will be ignored.</p>
            </div>
        </body>
    </html>`
    },
    PasswordHasChanged: (UserFirstName) => {
        return `<html>
        <header>
            <style>
            ${styleSheet}
            </style>
        </header>
        <body>
            <div class="wraper">
                <h2 class="title">Your password for Perid has changed</h2>
                <p>Hey there <b>${UserFirstName}</b>,</p>
                <p>Someone, or maybe you, has changed the password of your account at <a target='_blank' href='https://perid.tk/' class="perid-a">Perid</a>.</p>
                <p>If you didn't triggered this action please contact us at <a href="mailto:support@perid.tk">support@perid.tk</a>.</p>
                <p class="bottom-text">© ${year} BILLVOG, email sent from <a href="https://perid.tk" target="_blank" rel="noopener noreferrer">perid.tk</a><br>
                You reveived this email because the password of your account was changed. This email has been sent by a no-reply email account, any reply will be ignored.</p>
            </div>
        </body>
    </html>`
    }
}