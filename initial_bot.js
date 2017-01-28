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
        // console.log(results.entities);
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
            // currently do not remember what this little bit is for.
            // let temp = results.entities ? results.entities : "No results.entities";
            // let temp = builder.EntityRecognizer.findEntity(results.entities, 'builtin.number');
            // console.log(temp);
            // if(typeof temp == "string"){
            //     console.log("here is the results object:\n", results);
            // }
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
            if(!user.email && !user.phone) {
                //if no contact info, yes will 'beginDialog('/ContactInfo')'
                builder.Prompts.confirm(session, "You replied \"yes\", unfortunately your contact information is not on hand, if you wish to do so, we are still able to complete your order.\nIf you'd like to, you may submit your contact information. Would you like to do so? yes/no");
            } else if (!user.email){
                //if no email, yes will start builder.Prompts.text(session, "Okay, what is your email address?");
                builder.Prompts.confirm(session, "You replied \"yes\", unfortunately your email is not on hand, if you wish to do so, we are still able to complete your order.\nIf you'd like to, you may submit your email. Would you like to do so? yes/no");
            } else if (!user.phone){
                //if no email, yes will start builder.Prompts.text(session, "Okay, what is your phone number?");
                builder.Prompts.confirm(session, "You replied \"yes\", unfortunately your phone number is not on hand, if you wish to do so, we are still able to complete your order.\nIf you'd like to, you may submit your phone number. Would you like to do so? yes/no");

            } else {
                //if both user.email && user.phone, confirm order and close dialog.
                session.endDialog(`You said "yes", order confirmed! This dialog will now end; thanks for ordering!`);
            }
            //end of results.response == "yes"

        } else if(!results.response) {
            //rapid closure of dialog on response of 'no'
            session.endDialog(`You said "no", the order has been canceled. This dialog will now end.`);
        }
    },
    //end fifth BuyItem function

    function (session, results, next) {
        let user = session.userData;
        if(results.response) {
            if (!user.email && !user.phone) {//no contact information on hand, beginDialog("/ContactInfo");
            console.log("~~~~~\nline140 hello session.userData:\n", session.userData);
            console.log("~~~~~\n");
            session.beginDialog('/ContactInfo');

                // session.beginDialog("/ContactInfo", results);
                //passing results along, but since the answer will be yes... the results won't (shouldn't) do anything in the /ContactInfo waterfall.
            } else if (!user.email) {
                //prompt for email
                builder.Promtpts.text(session, "What is your email address?");
            } else if (!user.phone) {
                //prompt for phone number
                builder.Prompts.text(session, "What is your phone number?");
            } else {
                //user's data exists, user confirms order, dialog ends
                session.endDialog(`Order confirmed! This dialog will now end; thanks for ordering!`);
            }
            //this is the end of results.response == "yes"
        } else if(!results.response) {
            //user has decided against the order.
            session.endDialog(`You said "no", the order has been canceled. This dialog will now end.`);
        }
    },
    //end sixth BuyItem function

    function (session, results, next) {
        let user = session.userData;

        console.log("line 170 results.response:\n", results.response);
        if(!user.email) {
            let regex = new RegExp(/\w+@+\w+\.+\w{2,10}$/);

            if(regex.test(results.response)) {
                user.email = results.response;
                session.endDialog("Email received, order confirmed. Thank you!");
            }
        }

        if(!user.phone) {
            //regex phone number... if(regex.test(results.response)) {
        //     user.phone = results.response;
        // } else {
        //     //go back and ask again.. somehow.
        // }
            user.phone = results.reponse;
            session.endDialog("Phone number received, order confirmed. Thank you!");

        } else {
            session.endDialog("Contact info received, order conirmed. Thank you!");
            // next();
        }
    },
    // end seventh BuyItem function

    // function (session, results, next) {
    //     let user = session.userData;
    //     if(!user.email) {
    //         let regex = /[^\s@]+@[^\s@]+\.[^\s@]+/;
    //         regex.test(results.response);
    //     } else {
    //         if(!user.phone) {
    //             builder.Prompts.text(session, "What is your phone number? Please format it as e.g
    //\"222-333-4444\".");
    //         }
    //         next();
    //     }
    //
    // },
    //end eighth BuyItem function

    // function (session, results, next) {
    //     let user = session.userData;
    //     if(!user.phone) {
    //         let regex = /[0-9]/;
    //         let regex = ^[2-9]\d{2}-\d{3}-\d{4}$;
    //     } else {
    //         next();
    //     }
    //
    // },
    //end ninth BuyItem function
    // function (session, results, next) {
    //
    // },
    // //end eighth BuyItem function
    // function (session, results, next) {
    //
    // },
    // //end eighth BuyItem function
    //
    // function (session, results, next) {
    //     let user = session.userData;
    //     let email = builder.EntityRecognizer.findEntity(results.entities,'email');
    // }
])

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
dialog.matches('ContactInfo', [
    //uses LUIS to match intents...
    function (session, results) {
        //Through having the LuisRecognizer and IntentDialog match to this; we're able to create a dialog which can be called in methods such as session.replaceDialog, and session.beingDialog
        session.beginDialog('/ContactInfo', results);
    }
]);
bot.dialog('/ContactInfo', [
    function(session, results, next){
        let user = session.userData;
        if(user) {
            console.log("\nLine 363, session.userData?\n", user);
        }

        if(results) {
            let phone = builder.EntityRecognizer.findEntity(results.entities, 'customer.info.phone');
            if(!phone) {
                phone = builder.EntityRecognizer.findEntity(results.entities, 'builtin.phonenumber');
            }
            let email = builder.EntityRecognizer.findEntity(results.entities, 'builtin.email');
            user.phone = phone ? phone.entity : null;
            user.email = email ? email.entity : null;
            console.log("\n~~~~~\nLine 374, results object: ", results);
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

            builder.Prompts.text(session, "Line 390, Hello?");

        } else if (!user.phone) {
            let regex ;
            user.phone = regex.test(results.response) ? results.response : null;
            if (user.phone) {
                builder.Prompts.text(session, "Line 396");
            }
        }
    },

    function(session, results, next){
        let user = session.userData;
        console.log("Line 261, session.dialogData:\n", session.userData);
        // if (results) {
        //     console.log("\n~~~~~\nLine 261, results object: ", results);
        // }
        if (user.email && user.phone) {
            //email and phone number received, and /ContactInfo ends.
            session.endDialog("Conact information received, ending of '/ContactInfo'");
        } else {
            //if user.email and user.phone are not complete, the dialog restarts.
            session.beginDialog("/ContactInfo");
        }
    }
])
dialog.onDefault(builder.DialogAction.send("I'm sorry I didn't understand. I only assist in shopping."));
