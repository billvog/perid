const year = new Date().getFullYear();

module.exports = {
    AccountVerification: (UserFirstName, Url) => {
        return `<html>
        <header>
            <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                background-color: #212529;
                color:#C3C4C5 !important;
                padding: 10px;
            }
            a {
                color:gold;
            }
            .perid-a {
                color: cadetblue;
                font-weight: bold;
                text-decoration: none;
            }
            a.link-button {
                text-decoration: none;
                background-color: #8CC63F;
                color: hsl(86, 54%, 15%);
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
                margin-top: 0;
            }
            div.wraper .title img {
                width: 24px;
                transform: translateY(8px);
                background-color: #212529;
                border-radius: 30px;
                padding: 4px;
                margin-left: 5px;
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
            }
            </style>
        </header>
        <body>
            <div class="wraper">
                <h2 class="title">Verify your email address for Perid <img src="https://perid.tk/assets/PeridIcon.svg"></h2>
                <p>Hey there <b>${UserFirstName}</b>,</p>
                <p>Your email has been recently used to create an account to <a target='_blank' href='https://perid.tk/' class="perid-a">Perid</a>.</p>
                <p>If you don't verify your email address you won't be visible in search and your account will be deleted in 30 days from the registration date.</p>
                <p>Click <a target="_blank" rel="noopener noreferrer" href="${Url}" class='link-button'>here</a> to verify your email address or follow this link:</p>
                <p><span class="full-link"><a href="${Url}" target="_blank" rel="noopener noreferrer">${Url}</a></span></p>
                <p class="bottom-text">© ${year} BILLVOG, email sent from <a href="https://perid.tk" target="_blank" rel="noopener noreferrer">perid.tk</a><br>
                You have recieved this email because a user was registered in our service with this email. This email has been sent by a no-reply email account, any reply will be ignored.</p>
            </div>
        </body>
    </html>`
    }
}