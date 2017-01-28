// let restify = require('restify');
const builder = require('botbuilder');
const BuyItemArr = require('./dialogs/BuyItem.js');
const ContactInfoArr = require('./dialogs/ContactInfo.js');

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

bot.dialog('/', dialog);

dialog.matches('BuyItem',
    function(session, results){
        session.beginDialog('/BuyItem', results);
    }
);

bot.dialog('/BuyItem', BuyItem);


// dialog.matches('GetShippingAddress', [
//     function (session, args, next) {
//
//     },
//     //end GetShippingAddress function 1
// ]);
//
// dialog.matches('PriceCheck', [
//     function (session, args, next) {
//
//     },
//     //end PriceCheck function 1
// ]);
//
// bot.dialog('/PriceCheck',
//     function(session,args) {
//         console.log();
//     })
// dialog.matches('FindProducts', function(session) {session.beginDialog('/FindProducts')}
/*[
    function (session, args, next) {
        let intent = args.intent;
        console.log("These are the args: \n", args);
        let product = builder.EntityRecognizer.findEntity(args.entities, 'inventory.product.name');
        let quantity = builder.EntityRecognizer.findEntity(args.entities, 'inventory.product.quantity');
        let iQuery = session.dialogData.iQuery = {
            product: product ? product.entity : null,
            quantity: quantity ? quantity.entity : null
        };
        if(!iQuery.product) {
            builder.Prompts.text(session, "I'm sorry but I don't understand, would you please restate the item you are looking for?");
        } else {
            next();
        }
    },
    //end FindProducts function 1
    function (session, results, next) {
        let iQuery = session.dialogData.iQuery;
        if(results.response) {
            iQuery.product = results.response;
        }
        console.log("line 155, iQuery object", session.dialogData.iQuery);
        if(iQuery.quantity){
            builder.Prompts.text(session, `So you are inquiring about ${iQuery.product}, is this correct? yes/no`);
        } else {
            // session.dialogStack();
            builder.Prompts.text(session, "How many are you looking for?");
        }
    },
    //end FindProducts function 2
    function (session, results, next) {
        let iQuery = session.dialogData.iQuery;
        if(iQuery.quantity) {
            if(results.response == "yes") {
                let randNum = Math.floor(Math.random() * (100 - 1) + 1);
                session.dialogData.iQuery = {inventory: randNum};
                session.endDialog(`We have ${randNum} ${iQuery.product}`);
            }
            if(results.response == "no") {
                session.replaceDialog('FindProducts');
            }
        } else {
            iQuery.quantity = results.response;
            console.log(`Line 175, iQuery Object`, iQuery);
        }
    }
]*///);
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
//end of intent 'BuyItem'
dialog.matches('ContactInfo', function (session, results) {
        //Through having the LuisRecognizer and IntentDialog match to this; we're able to create a dialog which can be called in methods such as session.replaceDialog, and session.beingDialog
    session.beginDialog('/ContactInfo', results);
});

bot.dialog('/ContactInfo', ContactInfo);
// [
//     function(session, results, next){
//         let user = session.userData;
//         if(user) {
//             console.log("\nLine 325, this is the session.userData on hand:\n", user);
//         }
//         // Need to add code for case of session.userData already existing.
//
//         if(results) {
//             let phone = builder.EntityRecognizer.findEntity(results.entities, 'customer.info.phone');
//             if(!phone) {
//                 phone = builder.EntityRecognizer.findEntity(results.entities, 'builtin.phonenumber');
//             }
//
//             let email = builder.EntityRecognizer.findEntity(results.entities, 'builtin.email');
//             user.phone = phone ? phone.entity : null;
//             user.email = email ? email.entity : null;
//             console.log("\n~~~~~\nLine 374, results object: ", results);
//             console.log("~~~~~");
//         }
//         if(!user.email) {
//             builder.Prompts.text(session, "What is your email address?");
//
//         } else if(!user.phone) {
//             builder.Prompts.text(session, "What is your phone number?");
//
//         } else {
//             next();
//         }
//     },
//
//     function (session,results,next) {
//         let user = session.userData;
//
//         if(!user.email) {
//             let regex = new RegExp(/\w+@+\w+\.+\w{2,10}$/);
//             user.email = regex.test(results.response) ? results.response : null;
//             console.log("\nRegex results:", regex.test(results.response));
//
//             if (!user.email) {
//                 builder.Prompts.text(session, "That is an invalid email, please reenter your email address.");
//             }
//         }
//         next();
//     },
//
//     function(session,results,next){
//         let user = session.userData;
//
//         if(!user.email) {
//             let regex = new RegExp(/\w+@+\w+\.+\w{2,10}$/);
//             user.email = regex.test(results.response) ? results.response : null;
//
//             if(!user.email) {
//                 // Need to think of what to put here.....
//                 // Or in other words, how to handle a user inputting an invalid email twice.
//                 session.send("Invalid email.");
//             }
//             if(!user.phone) {
//                 builder.Prompts.text(session, "Email received! Please enter your phone number in the format of ###-###-#### or ###-####.\n");
//             }
//
//         } else if (!user.phone) {
//             let regexA = new RegExp(/\d{3}\-\d{3}\-\d{4}/);
//             user.phone = regexA.test(results.response) ? results.response : null;
//
//             if(!user.phone) {
//                 let regexB = new RegExp(/\d{3}\-\d{3}/);
//                 user.phone = regexB.test(results.response) ? results.response : null;
//             }
//
//             if(user.phone) {
//                 next();
//             } else {
//                 builder.Prompts.text(session, "Please enter your phone number in the format of ###-###-#### or ###-####.");
//             }
//
//         } else {
//             // If user.email and user.phone exists, then we move to the next step.
//             next();
//         }
//     },
//
//     function (session, results, next) {
//         let user = session.userData;
//
//         if (!user.phone) {
//             // First regex attempt, which uses the format of NNN-NNN-NNNN.
//             // LUIS only picks up on this format (a.k.a. US-format) for its builtin.phonenumber.
//             let regexA = new RegExp(/\d{3}\-\d{3}\-\d{4}/);
//             user.phone = regexA.test(results.response) ? results.response : null;
//
//             if(!user.phone) {
//                 // The previous regex attempt did not work, we're now using a regex pattern without the area code.
//                 let regexB = new RegExp(/\d{3}\-\d{3}/);
//                 user.phone = regexB.test(results.response) ? results.response : null;
//             }
//
//             if (!user.phone) {
//                 // After both regex attempts, if the phone number is not valid, reprompt user for phone number.
//                 builder.Prompts.text(session, "That is an invalid phone number, please reenter your phone number in the format of ###-###-#### or ###-###-###.\n");
//
//             } else {
//                 // Otherwise, the phone number is valid and we proceed to next step.
//                 next();
//             }
//
//         } else {
//             // If user.phone already exists, then we move to the next step.
//             next();
//         }
//     },
//
//     function(session, results, next){
//         let user = session.userData;
//
//         if (!user.phone) {
//             // First regex attempt, which uses the format of NNN-NNN-NNNN.
//             // LUIS only picks up on this format (a.k.a. US-format) for its builtin.phonenumber.
//             let regexA = new RegExp(/\d{3}\-\d{3}\-\d{4}/);
//             user.phone = regexA.test(results.response) ? results.response : null;
//
//             if(!user.phone) {
//                 // The previous regex attempt did not work, we're now using a regex pattern without the area code.
//                 let regexB = new RegExp(/\d{3}\-\d{3}/);
//                 user.phone = regexB.test(results.response) ? results.response : null;
//             }
//         }
//
//         if (user.email && user.phone) {
//             // For UX, there should be an if statement here which displays their contact info.
//             // It should present a builder.Prompts.confirm() which verifies that the information they submitted is correct.
//
//             // User's email and phone number received, so "/ContactInfo" ends.
//             session.endDialog("Conact information received, ending of '/ContactInfo'");
//         } else {
//             //if user.email and user.phone are not complete, prompt for the dialog to restart.
//             builder.Prompts.confirm(session, "Incomplete contact information, would you like to try submitting your info again?");
//         }
//     },
//
//     function(session, results, next) {
//         if(results.response) {
//             // User decided to attempt resubmitting their missing contact information, which restarts this dialog.
//             session.beginDialog("/ContactInfo");
//         } else {
//             // User decided on proceeding with incomplete contact information, which ends this dialog.
//             session.endDialog("Understood, closing this dialog!");
//         }
//     }
// ])
dialog.onDefault(builder.DialogAction.send("I'm sorry I didn't understand. I only assist in shopping."));
