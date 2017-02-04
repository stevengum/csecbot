module.exports = function(builder, bot) {
    return [
        function (session, results, next) {
            let intent = results.intent;
            console.log("These are the results: \n", results);
            let product = builder.EntityRecognizer.findEntity(results.entities, 'inventory.product.name');
            let quantity = builder.EntityRecognizer.findEntity(results.entities, 'inventory.product.quantity');
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
            console.log("line 24-FindProducts.js, iQuery object", session.dialogData.iQuery);
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
                console.log(`Line 46-FindProducts, iQuery Object`, iQuery);
            }
        }
    ]
}
