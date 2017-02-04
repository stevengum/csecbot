module.exports = function(builder, bot) {
    return [
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
    ];
}
