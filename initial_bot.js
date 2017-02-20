// let restify = require('restify');
const builder = require('botbuilder');
const BuyItemArr = require('./dialogs/BuyItem.js');
const ContactInfoArr = require('./dialogs/ContactInfo.js');
const FindProductsArr = require('./dialogs/FindProducts.js');
// const GetShippingArr = require('./dialogs/GetShippingAddress.js');

// let server = restify.createServer();
// server.listen(process.env.port || process.env.PORT || 3978, function () {
//     console.log(`\n${server.name} listening to ${server.url}.\n`);
// });
//
// let connector = new builder.ChatConnector({
//     appId: process.env.MICROSOFT_APP_ID,
//     appPassword: process.env.MICROSOFT_APP_PASSWORD
// });


let connector = new builder.ConsoleConnector().listen();
let model = require('./LUISConfig.js').model;
let recognizer = new builder.LuisRecognizer(model);
let dialog = new builder.IntentDialog({ recognizers: [recognizer] });
// __IntentDialog__ Information:
// https://docs.botframework.com/en-us/node/builder/chat-reference/classes/_botbuilder_d_.intentdialog.html
let bot = new builder.UniversalBot(connector);

let BuyItem = BuyItemArr(builder, bot);
let ContactInfo = ContactInfoArr(builder, bot);
let FindProducts = FindProductsArr(builder, bot);
// let GetShippingAddress = GetShippingArr(builder, bot);

bot.dialog('/', dialog);

dialog.matches('ContactInfo', function (session, results) {
    //Through having the LuisRecognizer and IntentDialog match to this; we're able to create a dialog which can be called in methods such as session.replaceDialog, and session.beingDialog
    session.beginDialog('/ContactInfo', results);
});
bot.dialog('/ContactInfo', ContactInfo);

dialog.matches('BuyItem',
    function(session, results){
        session.beginDialog('/BuyItem', results);
    }
);
bot.dialog('/BuyItem', BuyItem);

dialog.matches('FindProducts',
    function(session, results){
        session.beginDialog('/FindProducts');
    }
);
bot.dialog('/FindProducts', FindProducts);

// dialog.matches('GetShippingAddress',
//     function (session, results) {
//          session.beginDialog('/GetShippingAddress', results);
//     },
// );
// bot.dialog('/GetShippingAddress', GetShippingAddress);

dialog.onDefault(builder.DialogAction.send("I'm sorry I didn't understand. I only assist in shopping."));
