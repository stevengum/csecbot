module.exports = function(builder, bot) {
    return [
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

    ];
}
