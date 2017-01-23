let restify = require('restify');
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
//
// server.post('/api/messages', connector.listen());
//
// let bot = new builder.UniversalBot(connector, function (session) {
//     session.send(`You said ${session.message.text}`);
// });

let connector = new builder.ConsoleConnector().listen();
let model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/cf50007f-d18f-483b-9c5c-98fde2dd4160?subscription-key=0620fb642aa145b6a9bf5a5023b0d3f5';
let recognizer = new builder.LuisRecognizer(model);
let dialog = new builder.IntentDialog({ recognizers: [recognizer] });
// __IntentDialog__ Information:
// https://docs.botframework.com/en-us/node/builder/chat-reference/classes/_botbuilder_d_.intentdialog.html
// It is a class...
let bot = new builder.UniversalBot(connector);


bot.dialog('/', dialog);
// __Class Dialog__ Information:
// https://docs.botframework.com/en-us/node/builder/chat-reference/classes/_botbuilder_d_.dialog.html
// the class dialog is the base class for all dialogs; line 23 is the dialog passed in as a parameter
// core component of the botbuilder framework


dialog.matches('BuyItem', [
// the matches method receives a RegExp or string to examine for an already existing intent
    function (session, args, next) {
        let intent = args.intent;
        let product = builder.EntityRecognizer.findEntity(args.entities, 'order.product.name');
        let quantity = builder.EntityRecognizer.findEntity(args.entities, 'order.product.quantity');
        let order = session.dialogData.order = {
            product: product ? product : null,
            quantity: quantity ? quantity : null
        };
        if(!order.product) {
            builder.Prompts.text(session,'What would you like to order? (Please only state the product/product name that you wish to purchase)');
        } else {
            next();
        }
    },
    //end first BuyItem function

    function (session, results, next) {
        let order = session.dialogData.order;
        console.log(order.product.entity);
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
        // if(typeof results.response == "string") {
        //     let temp = builder.EntityRecognizer.findEntity(results.response, 'order.product.quantity');
        // } else if (typeof results.response == "number") {
        //     order.quantity = results.response;
        // }
        //above is beta code, the typeof results.response isn't required due to builder.Propts.number requiring a number input; pending deletion which will occur on 1/25/2016
        // if (typeof results.response == "number") {
        //      order.quantity = results.response;
        // }
        order.quantity = results.response;
        if(!order.quantity) {
            builder.Prompts.number(session, "I'm sorry, I didn't understand your response. How many would you like to order?");
        } else {
            console.log(order.product);
            next();
        }
    },
    //end third BuyItem function

// Need to convert the following messages prompts below to builder.Prompt.confirm(session, <question>)


    function (session, results, next) {
        let order = session.dialogData.order;
        console.log(order);
        if(order.product.entity && order.quantity) {
            builder.Prompts.text(session, `If I understand correctly, you wish to order ${order.quantity} ${order.product.entity}? yes/no`);
        } else if(order.product && order.quantity) {
            builder.Prompts.text(session, `If I understand correctly, you wish to order ${order.quantity} ${order.product}? yes/no`);
        } else {
            next();
        }
    },
    //end fourth BuyItem function

    function (session, results, next) {
        let order = session.dialogData.order;
        if(results.response == "yes") {
            session.endDialog(`You said "yes", order confirmed! This dialog will now end; thanks for ordering!`);
        } else if(results.response == "no") {
            session.endDialog(`You said "no", the order has been canceled. This dialog will now end.`);
        } else {
            builder.Prompts.text(session, `Please answer with either "yes" or "no".`);
        }
    },
    //end fifth BuyItem function

    function (session, results, next) {
        if(results.response == "yes") {
            session.endDialog(`You said "yes", order confirmed! This dialog will now end; thanks for ordering!`);
        } else if(results.response == "no") {
            session.endDialog(`You said "no", the order has been canceled. This dialog will now end.`);
        } else {
            session.endDialog(`I'm sorry but I do not understand... I will now end this dialog. Goodbye.`);
        }
    }
] );
//end of intent 'BuyItem'

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
dialog.matches('FindProducts', [
    function (session, args, next) {

    },
    //end FindProducts function 1
]);
//
// dialog.matches('ContactInfo', [
//     function (session, args, next) {
//
//     }
//     //end ContactInfo function 1
// ]);
dialog.onDefault(builder.DialogAction.send("I'm sorry I didn't understand. I only assist in shopping."));
