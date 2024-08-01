var webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until;
var driver;

// Audible page selectors
var signin_link = "#anon_header_v2_signin a"
var login_email = "#ap_signin1a_email_row input#ap_email";
var login_password = "#ap_signin1a_password_row input#ap_password";
var login_submit = "#ap_signin1a_signin_button_row input#signInSubmit";
var message_error = "#topSlots div#message_error";
var message_warning = "#topSlots div#message_warning";
var alert_content = ".header-top-banner span.alert-content";

var table_css = ".adbl-lib-content table";
var titles_css = table_css + " td[name=titleInfo] a[name=tdTitle]"


// ---------------

var Audible = function() {
    this.url = 'http://www.audible.com/'
    this.libraryPath = this.url + 'lib?ref_=a_hp_lib_tnaft_1';
    this.login = 'signin';

    // withCapabilities(webdriver.Capabilities.phantomjs()).
    driver = new webdriver.Builder()
        .forBrowser('chrome')
        .usingServer('http://127.0.0.1:4444/wd/hub')
        .build();
}

Audible.prototype.closeDriver = function() {
    driver.quit();
}

Audible.prototype.connect = function(username, password) {
    driver.get(this.url + '?ipRedirectOverride=true');
    driver.isElementPresent(By.css(signin_link)).then(function(signinFirst) {
        if(signinFirst){
            console.log('go through login process');
            login(username, password);
        }
    });
}

Audible.prototype.getTable = function() {
    driver.get(this.libraryPath);
    // change to "all time", "all items"
    // title, author, date purchased, overall rating
    driver.findElement(By.css(table_css)).then(function(table) {
        table.getText().then(function(bigBlock) {
            console.log('all table text: ', bigBlock);
        });
    });

    driver.findElements(By.css(titles_css)).then(function(titles) {
        // todo async each title
    });
}

module.exports = Audible;

function login(username, password) {
    driver.findElement(By.css(signin_link)).click();
    var usernameField = driver.wait(until.elementLocated(By.css(login_email), 10000));
    usernameField.sendKeys(username);
    driver.findElement(By.css(login_password)).sendKeys(password);
    driver.findElement(By.css(login_submit)).click();
    verifyLogin();
}

function verifyLogin() {
    // check for login error
    driver.isElementPresent(By.css(message_error)).then(function(messageError) {
        if(messageError){
            driver.findElement(By.css(message_error)).getText().then(function(loginError) {
                console.log('LOGIN FAILED: ', loginError);
                throw loginError;
            });
        }
    });

    // allow warnings, but give a pause for user interaction
    // NOTE: this won't work with PhantomJS
    driver.isElementPresent(By.css(message_warning)).then(function(messageWarning) {
        if(messageWarning){
            driver.findElement(By.css(message_warning)).getText().then(function(loginWarning) {
                console.log('LOGIN WARNIN: ', loginWarning);
                waitTillElementIsGone(message_warning, 20);
            });
        }
    });

    // check for alert message after login
    driver.isElementPresent(By.css(alert_content)).then(function(alertContent) {
        if(alertContent){
            driver.findElement(By.css(alert_content)).getText().then(function(alertMessage) {
                console.log('ALERT MESSAGE: ', alertMessage);
                throw alertMessage;
            });
        }
    });
}

function waitTillElementIsGone(css_selector, timeout) {

    var elementIsNotLocated = function(css_selector) {
        return new until.Condition('element to be located by ' + css_selector, function() {
            return driver.isElementPresent(By.css(css_selector)).then(function(present) {
                console.log('elements presence', present)
                return !present;
            });
        });
    };

    driver.wait(elementIsNotLocated(css_selector), timeout, timeout + ' seconds to went by').then(
        function() {
            console.log('element is gone in time');
        }, function(err) {
            console.log('element is still hanging around...', err);
            driver.findElement(By.css(css_selector)).isDisplayed().then(function(v) {
                console.log('element visibility:', v);
            });
        }
    );
}