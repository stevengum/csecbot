// let restify = require('restify');
let builder = require('botbuilder');

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


bot.dialog('/', dialog);
// __Class Dialog__ Information:
// https://docs.botframework.com/en-us/node/builder/chat-reference/classes/_botbuilder_d_.dialog.html
// the class dialog is the base class for all dialogs; line 23 is the dialog passed in as a parameter
// core component of the botbuilder framework

dialog.matches('BuyItem',
    function(session, results){
        session.beginDialog('/BuyItem', results);
    }
);

bot.dialog('/BuyItem', [
    function (session, results, next) {
        let product = builder.EntityRecognizer.findEntity(results.entities, 'order.product.name');
        let quantity = builder.EntityRecognizer.findEntity(results.entities, 'order.product.quantity');
        if(!quantity) {
            quantity = builder.EntityRecognizer.findEntity(results.entities, 'builtin.number');
        }

        let order = session.dialogData.order = {
            product: product ? product.entity : null,
            quantity: quantity ? quantity.entity : null
        }

        if(!order.product) {
            builder.Prompts.text(session,'What would you like to order? (Please only state the product/product name that you wish to purchase)');
        } else {
            next();
        }
    },
    //end first BuyItem function
    function (session, results, next) {
        let order = session.dialogData.order;
        if(results.response && !order.product) {
            order.product = results.response;
        }

        if(!order.quantity) {
            builder.Prompts.number(session, 'How many would you like to order?');
        } else {
            next();
        }
    },
    //end second BuyItem function
    function (session, results, next) {
        let order = session.dialogData.order;

        if(typeof results.response == "number") {
            order.quantity = results.response;
        }

        if(!order.quantity) {
            builder.Prompts.number(session, "I'm sorry, I didn't understand your response. How many would you like to order?");
        } else {
            next();
        }
    },
    //end third BuyItem function
    function (session, results, next) {
        let order = session.dialogData.order;

        if(typeof results.response == "number") {
            order.quantity = results.response;
        }

        if(order.product && order.quantity) {
            builder.Prompts.confirm(session, `If I understand correctly, you wish to order ${order.quantity} "${order.product}"? yes/no`);
        } else {
            next();
        }
    },
    //end fourth BuyItem function

    function (session, results, next) {
        let order = session.dialogData.order;
        let user = session.userData;

        if(results.response) {
            // If the user has confirmed their order, the ChatBot will then check its session object to see if contact information for the user exists.
            if(!user.email && !user.phone) {
                // If no contact info, yes will begin the dialog '/ContactInfo'.
                builder.Prompts.confirm(session, "You replied \"yes\", unfortunately your contact information is not on hand, if you wish to do so, we are still able to complete your order.\nIf you'd like to, you may submit your contact information. Would you like to do so? yes/no");
                // The user should be prompted to confirm their contact information that is stored within the session object.

            } else if (!user.email){
                //if no email, yes will start builder.Prompts.text(session, "Okay, what is your email address?");
                builder.Prompts.confirm(session, "You replied \"yes\", unfortunately your email is not on hand, if you wish to do so, we are still able to complete your order.\nIf you'd like to, you may submit your email. Would you like to do so? yes/no");
                // These else if statements should be rolled into the session.beginDialog().
                // Code to follow.... (1.28.16)
                // The user should be prompted to confirm their contact information that is stored within the session object.

            } else if (!user.phone){
                //if no email, yes will start builder.Prompts.text(session, "Okay, what is your phone number?");
                builder.Prompts.confirm(session, "You replied \"yes\", unfortunately your phone number is not on hand, if you wish to do so, we are still able to complete your order.\nIf you'd like to, you may submit your phone number. Would you like to do so? yes/no");
                // These else if statements should be rolled into the session.beginDialog().
                // Code to follow.... (1.28.16)
                // The user should be prompted to confirm their contact information that is stored within the session object.

            } else {
                // If both user.email & user.phone exists, confirm order and close dialog. See line 91 for builder.Prompts.confirm().
                session.endDialog(`You said "yes", order confirmed! This dialog will now end; thanks for ordering!`);
            }
            // End of results.response.

        } else if(!results.response) {
            // Rapid closure of dialog on response of 'no'.
            session.endDialog(`You said "no", the order has been canceled. This dialog will now end.`);
        }
    },
    //end fifth BuyItem function

    function (session, results, next) {
        let user = session.userData;
        if(results.response) {
            // User replied yes to one of the queries regarding user inputting contact information.

            if (!user.email && !user.phone) {
                session.beginDialog('/ContactInfo');

                // session.beginDialog("/ContactInfo", results);
                //passing results along, but since the answer will be yes... the results won't (shouldn't) do anything in the /ContactInfo waterfall.
            } else if (!user.email) {
                // Prompt for email address.
                builder.Promtpts.text(session, "What is your email address?");

            } else if (!user.phone) {
                // Prompt for phone number.
                builder.Prompts.text(session, "What is your phone number? ###-###-####");

            } else {
                // User's data exists, user confirms order, dialog ends.
                session.endDialog(`Order confirmed! This dialog will now end; thanks for ordering!`);
            }
            // This is the end of results.response.

        } else if(!results.response) {
            // User has decided against the order.

            // This needs to be reworked, the user might be saying no to supplying their contact information, in which case they may still proceed with their order.
            session.endDialog(`You said "no", the order has been canceled. This dialog will now end.`);
        }
    },
    //end sixth BuyItem function

    function (session, results, next) {
        let user = session.userData;

        console.log("line 170 results.response:\n", results.response);
        if(!user.email) {
            let regex = new RegExp(/\w+@+\w+\.+\w{2,10}$/);
            user.email = regex.test(results.response) ? results.response : null;

            if(!user.email) {
                session.endDialog("Email received, order confirmed. Thank you!");
            }

            session.endDialog("Email received, order confirmed. Thank you!");
        }

        if(!user.phone) {
            let regexA = new RegExp(/\d{3}\-\d{3}\-\d{4}/);
            user.phone = regexA.test(results.response) ? results.response : null;

            if(!user.phone) {
                let regexB = new RegExp(/\d{3}\-\d{3}/);
                user.phone = regexB.test(results.response) ? results.response : null;

                if(user.phone) {
                    session.endDialog("Phone number received, order confirmed. Thank you!");
                }

            } else {
                session.endDialog("Phone number received, order confirmed. Thank you!");
            }

        } else {
            // Not sure if this will ever be hit..
            // Wow, it was after we were redirected to the "/ContactInfo" dialog.
            session.endDialog("Line 184: Contact info received, order confirmed. Thank you!");
        }
    },
    // end seventh BuyItem function

]);

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

bot.dialog('/ContactInfo', [
    function(session, results, next){
        let user = session.userData;
        if(user) {
            console.log("\nLine 325, this is the session.userData on hand:\n", user);
        }
        // Need to add code for case of session.userData already existing.

        if(results) {
            let phone = builder.EntityRecognizer.findEntity(results.entities, 'customer.info.phone');
            if(!phone) {
                phone = builder.EntityRecognizer.findEntity(results.entities, 'builtin.phonenumber');
            }

            let email = builder.EntityRecognizer.findEntity(results.entities, 'builtin.email');
            user.phone = phone ? phone.entity : null;
            user.email = email ? email.entity : null;
            console.log("\n~~~~~\nLine 374, results object: ", results);
            console.log("~~~~~");
        }
        if(!user.email) {
            builder.Prompts.text(session, "What is your email address?");

        } else if(!user.phone) {
            builder.Prompts.text(session, "What is your phone number?");

        } else {
            next();
        }
    },

    function (session,results,next) {
        let user = session.userData;

        if(!user.email) {
            let regex = new RegExp(/\w+@+\w+\.+\w{2,10}$/);
            user.email = regex.test(results.response) ? results.response : null;
            console.log("\nRegex results:", regex.test(results.response));

            if (!user.email) {
                builder.Prompts.text(session, "That is an invalid email, please reenter your email address.");
            }
        }
        next();
    },

    function(session,results,next){
        let user = session.userData;

        if(!user.email) {
            let regex = new RegExp(/\w+@+\w+\.+\w{2,10}$/);
            user.email = regex.test(results.response) ? results.response : null;

            if(!user.email) {
                // Need to think of what to put here.....
                // Or in other words, how to handle a user inputting an invalid email twice.
                session.send("Invalid email.");
            }
            if(!user.phone) {
                builder.Prompts.text(session, "Email received! Please enter your phone number in the format of ###-###-#### or ###-####.\n");
            }

        } else if (!user.phone) {
            let regexA = new RegExp(/\d{3}\-\d{3}\-\d{4}/);
            user.phone = regexA.test(results.response) ? results.response : null;

            if(!user.phone) {
                let regexB = new RegExp(/\d{3}\-\d{3}/);
                user.phone = regexB.test(results.response) ? results.response : null;
            }

            if(user.phone) {
                next();
            } else {
                builder.Prompts.text(session, "Please enter your phone number in the format of ###-###-#### or ###-####.");
            }

        } else {
            // If user.email and user.phone exists, then we move to the next step.
            next();
        }
    },

    function (session, results, next) {
        let user = session.userData;

        if (!user.phone) {
            // First regex attempt, which uses the format of NNN-NNN-NNNN.
            // LUIS only picks up on this format (a.k.a. US-format) for its builtin.phonenumber.
            let regexA = new RegExp(/\d{3}\-\d{3}\-\d{4}/);
            user.phone = regexA.test(results.response) ? results.response : null;

            if(!user.phone) {
                // The previous regex attempt did not work, we're now using a regex pattern without the area code.
                let regexB = new RegExp(/\d{3}\-\d{3}/);
                user.phone = regexB.test(results.response) ? results.response : null;
            }

            if (!user.phone) {
                // After both regex attempts, if the phone number is not valid, reprompt user for phone number.
                builder.Prompts.text(session, "That is an invalid phone number, please reenter your phone number in the format of ###-###-#### or ###-###-###.\n");

            } else {
                // Otherwise, the phone number is valid and we proceed to next step.
                next();
            }

        } else {
            // If user.phone already exists, then we move to the next step.
            next();
        }
    },

    function(session, results, next){
        let user = session.userData;

        if (!user.phone) {
            // First regex attempt, which uses the format of NNN-NNN-NNNN.
            // LUIS only picks up on this format (a.k.a. US-format) for its builtin.phonenumber.
            let regexA = new RegExp(/\d{3}\-\d{3}\-\d{4}/);
            user.phone = regexA.test(results.response) ? results.response : null;

            if(!user.phone) {
                // The previous regex attempt did not work, we're now using a regex pattern without the area code.
                let regexB = new RegExp(/\d{3}\-\d{3}/);
                user.phone = regexB.test(results.response) ? results.response : null;
            }
        }

        if (user.email && user.phone) {
            // For UX, there should be an if statement here which displays their contact info.
            // It should present a builder.Prompts.confirm() which verifies that the information they submitted is correct.

            // User's email and phone number received, so "/ContactInfo" ends.
            session.endDialog("Conact information received, ending of '/ContactInfo'");
        } else {
            //if user.email and user.phone are not complete, prompt for the dialog to restart.
            builder.Prompts.confirm(session, "Incomplete contact information, would you like to try submitting your info again?");
        }
    },

    function(session, results, next) {
        if(results.response) {
            // User decided to attempt resubmitting their missing contact information, which restarts this dialog.
            session.beginDialog("/ContactInfo");
        } else {
            // User decided on proceeding with incomplete contact information, which ends this dialog.
            session.endDialog("Understood, closing this dialog!");
        }
    }
])
dialog.onDefault(builder.DialogAction.send("I'm sorry I didn't understand. I only assist in shopping."));
