// let restify = require('restify');
const builder = require('botbuilder');
const BuyItemArr = require('./dialogs/BuyItem.js');
const ContactInfoArr = require('./dialogs/ContactInfo.js');
const FindProductsArr = require('./dialogs/FindProducts.js');

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
let model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/cf50007f-d18f-483b-9c5c-98fde2dd4160?subscription-key=0620fb642aa145b6a9bf5a5023b0d3f5';
let recognizer = new builder.LuisRecognizer(model);
let dialog = new builder.IntentDialog({ recognizers: [recognizer] });
// __IntentDialog__ Information:
// https://docs.botframework.com/en-us/node/builder/chat-reference/classes/_botbuilder_d_.intentdialog.html
let bot = new builder.UniversalBot(connector);

let BuyItem = BuyItemArr(builder, bot);
let ContactInfo = ContactInfoArr(builder, bot);
let FindProducts = FindProductsArr(builder, bot);

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

// dialog.matches('GetShippingAddress', [
//     function (session, args, next) {
//
//     },
//     //end GetShippingAddress function 1
// ]);

// bot.dialog('/FindProducts', [
//     function (session, args, next) {
//         // let intent = args.intent;
//         let product = builder.EntityRecognizer.findEntity(args.entities, 'inventory.product.name');
//         let quantity = builder.EntityRecognizer.findEntity(args.entities, 'inventory.product.quantity');
//         let iQuery = session.dialogData.iQuery = {
//             product: product ? product.entity : null,
//             quantity: quantity ? quantity.entity : null
//         };
//         if(!iQuery.product) {
//             builder.Prompts.text(session, "I'm sorry but I don't understand, would you please restate the item you are looking for?");
//         } else {
//             next();
//         }
//     },
//     //end FindProducts function 1
//     function (session, results, next) {
//         let iQuery = session.dialogData.iQuery;
//         if(results.response) {
//             iQuery.product = results.response;
//         }
//         console.log("line 155, iQuery object", session.dialogData.iQuery);
//         if(iQuery.quantity){
//             builder.Prompts.text(session, `So you are inquiring about ${iQuery.product}, is this correct? yes/no`);
//         } else {
//             // session.dialogStack();
//             builder.Prompts.text(session, "How many are you looking for?");
//         }
//     },
//     //end FindProducts function 2
//     function (session, results, next) {
//         let iQuery = session.dialogData.iQuery;
//         if(iQuery.quantity) {
//             if(results.response == "yes") {
//                 let randNum = Math.floor(Math.random() * (100 - 1) + 1);
//                 session.dialogData.iQuery = {inventory: randNum};
//                 session.endDialog(`We have ${randNum} ${iQuery.product}`);
//             }
//             if(results.response == "no") {
//                 session.replaceDialog('/FindProducts');
//             }
//         } else {
//             iQuery.quantity = results.response;
//             console.log(`Line 175, iQuery Object`, iQuery);
//         }
//     }
// ]);

dialog.onDefault(builder.DialogAction.send("I'm sorry I didn't understand. I only assist in shopping."));
