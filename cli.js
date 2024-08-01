// This script is to perform a sample test against the command line before UI developement
//     could be reused as a test script later...

var Audible = require('./lib/audible');
var audibleUser = process.argv[2];
var audiblePassword = process.argv[3];

console.log("audibleUser:", audibleUser);
console.log("audiblePassword:", audiblePassword);
console.log("-----");

var audible = new Audible();
audible.connect(audibleUser, audiblePassword);
audible.getTable();

audible.closeDriver();

