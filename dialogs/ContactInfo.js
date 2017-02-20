module.exports = function(builder, bot) {
    return [
        function(session, results, next){
            session.userData.entities = null;
            // This wipes any previously stored entities.
            let bag = session.userData.entities;
            // points bag
            if(results) {
                console.log(results);
                // if results exists, then check its length
                if(results.entities.length > 0) {
                    bag = session.userData.entities = results.entities;
                    // console.log("Detected entities, line 8:", bag);
                }
            }
            next();

                // Perhaps if(!(user.email && user.phone)) { Store the information provided inside of an object, then confirm the data with the user?}
                // Not sure what the previous line is about, will have to revisit later. {4:22PM 2017/2/4}
        },
        function(session, results, next) {
            let bag = session.userData.entities;
            let user = session.userData;
            if(user.email && user.phone) {
                console.log("\nLine 24, this is the session.userData on hand:\n", user);
                builder.Prompts.confirm(session, `We already have contact information for this session, are the following your correct email and phone number?\n    1. ${user.email}\n    2. ${user.phone}`);
                // If both user.phone and user.email exists, confirm with user that these are the correct email and phone number.

            } else if(user.email) {
                console.log("\nLine 6, this is the session.userData on hand:\n", user);
                builder.Prompts.confirm(session, `We have the email, "${user.email}", for this session; is this the correct email?`);
                // If only user.email exists.

            } else if(user.phone) {
                console.log("\nLine 6, this is the session.userData on hand:\n", user);
                builder.Prompts.confirm(session, `We have the phone number, "${user.phone}", for this session; is this the correct phone number?`);
                // If only user.phone exists.

            // End any of user's contact info already existing
            } else {
                next();
            }

        },
        function(session, results, next) {
            let user = session.userData;
            let bag = session.userData.entities;
            // This code might need to go after the handling of the !user.email and !user.phone code, since it's just checking if results.response exists.
            // Will need to follow the logic train for it. {9:00AM 2017/2/4}

            // Nevermind, this will stay here, as the code below the confirming section (i.e. the code that adds either the email address or phone number) will parse the response for an email address or phone number.
            // The RegExp patterns below would prevent these confirmation responses from firing. {9:15AM 2017/2/4}
            if(results.response){
                if(user.email && user.phone) {
                    session.endDialog("Awesome!, Thanks for confirming your information!");
                // User confirmed email and phone number. Ending ContactInfo dialog.
                } else if (user.email) {
                    builder.Prompts.text(session, "Fantastic, what is your phone number?");
                // User confirmed email address, no pre-existing phone number in session.userData. Prompting for phone number.
                } else {
                    builder.Prompts.text(session, "Awesome! What is your email address?");
                // User confirmed phone number, no pre-existing email address in session.userData. Prompting for email address.
                }
                // End of user's response being an affirmative.
            } else if(!results.response){
                // User responded that information was incorrect.
                if((user.email && user.phone)) {
                    // User indicated email and phone are incorrect.
        // Prompting user for new/correct email address. In next waterfall steps, will proceed to prompt about the phone number.

        // Will eventually need to add code that check with user which piece of information inside of the session.userData object is incorrect.
        // If the email address is incorrect, then just nullify that property, not the phone number.
        // Afterwards, proceed to re-obtain the new and correct piece of user's contact information.
                    user.email = null;
                    user.phone = null;
                    // Might chain lines 75 & 76.
                    builder.Prompts.text(session, "I'm sorry about that! I will re-gather your information; what is your email address?");
                } else if (user.email) {
                    user.email = null;
                    builder.Prompts.text(session, "Sorry about that! What is your correct email address?");
                // The email address was not correct, remove it from session.userData and prompt user for new email address.
                } else if(user.phone){
                    user.phone = null;
                    builder.Prompts.text(session, "Sorry! What is your phone number?");
                // End of user responded no to previous confirms.
                } else {
                    next();
            // There was no response(?) so skip to next step? or no contact information existed?
                }
            }
        },
        function(session, results, next) {
            let user = session.userData;
            let bag = session.userData.entities;
                // // Perhaps if(!(user.email && user.phone)) { Store the information provided inside of an object, then confirm the data with the user?}
            console.log("~~~\nSession object userdata, line 100:", session.userData);
            if(!user.email) {
                // So user.email doesn't exist.
                // Now we need to check; and compare whether or not we need to examine the bag for the email?
                // Or if we take the provided response and subject it to regex to look for an email address.
                let email = builder.EntityRecognizer.findEntity(bag, 'builtin.email');
                if(email) {
                    user.email = email ? email.entity : null;
                    builder.Prompts.confirm(`This your email? "${user.email}"?`);
                } else {
                    builder.Prompts.text(session, "Please enter your email.");
                }

                // session.send("Hi!");
                // Why would !user.email == true?
                // 1. user.email didn't exist as of the start of this dialog.
                // 2. user.email was erased in the prior step and needs to be replaced.
                // How would we determine which answer is true for this case?
            }

        },
        function(session, results, next) {
            //Retrieves confirmation of email address, then checks and verifies or obtains phone number from user.
            let user = session.userData;
            let bag = session.userData.entities;

            if(results === true) {
                if(user.phone) {
                    builder.Prompts.text(session, `Awesome! Now, is this your phone number, ${user.phone}?`);
                } else {
                    if(bag.length > 0) {
                        let phone = builder.EntityRecognizer.findEntity(bag, 'customer.info.phone');
                        if(!phone) {
                            phone = builder.EntityRecognizer.findEntity(bag, 'builtin.phonenumber');
                        }

                    }
                    // There should be snippet of code here to parse through entities already stored in bag, if one exists, then verify if it is correct.
                    builder.Prompts.text(session, "Awesome! I'll keep track of that... What is your phone number?");
                }
            } else {
                // Placeholder, need to handle user replying no to the email confirmation.
                next();
            }


        },
        function(session, results, next) {

            let user = session.userData;
            let bag = session.userData.entities;

            if(!user.phone){
                let phone = builder.EntityRecognizer.findEntity(bag, 'customer.info.phone');
                if(!phone) {
                    phone = builder.EntityRecognizer.findEntity(bag, 'builtin.phonenumber');
                }
                user.phone = phone ? phone.entity : null;
                if(!user.phone) {

                }
            }

            next();

        },

        function(session, results, next) {
            let user = session.userData;

                if(!user.email) {
                    builder.Prompts.text(session, "What is your email address?");

                } else if(!user.phone) {
                    builder.Prompts.text(session, "What is your phone number?");

                } else {
                    next();
                }
            // End case of no user session data already existing
        },
        // might need to separate these two waterfall steps into three or four steps; one to check if entities were passed; one to check if user data already exists, one to handle retrieving data in the face of incomplete data, and one to proceed obtaining data as "normal".
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
