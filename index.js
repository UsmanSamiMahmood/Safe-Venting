const { Client, Collection, MessageEmbed } = require("discord.js");
const client = new Client({ disableEveryone: true });
const config = require("./config.json");
const { db } = require("./database/handler.js");
const color = require("colors");
const figlet = require("figlet");
const customId = require("custom-id");
const { token } = require("./secrets/token.json");
const { black, red_light, bright_green } = require("./colors.json");
const main = require("./secrets/main.js")

// Below we are telling the bot what to do on the 'ready' event.
client.on("ready", () => {
    client.user.setActivity(`${config.statusName}`, { type: "WATCHING" });
})

/* Below we tell the bot what to do on the 'guildMemberRemove' event.
   When someone leaves the ToggleVenting boolean in their document within the database will be set to ToggleVenting.
   This will be useful incases where someone will try to send a message to that user but the bot will encounter an error since it cannot send direct messages to people who are not in the server. 
*/
client.on("guildMemberRemove", async (client, member) => {
    await db.collection("clients").doc(member.id).get()
        .then((doc) => {
            if (!doc.exists) {
                return;
            } else {
                db.collection("clients").doc(doc.id).update({ ToggleVenting: false });
            }
        })

})

client.on("message", async (message) => {

    //If the author of the message is a bot then the bot will ignore the message.
    if (message.author.bot) return;

    let prefix = config.prefix;
    let messageArray = message.content.split(" ");
    let command = messageArray[0].toLowerCase();
    let args = messageArray.slice(1);

    var id1 = customId({ randomLength: 1 });
    /* Below we are doing a check to see if the user has a document in the database.
       If the user does not have a document then one will be made, the default values for toggleventing and blacklisted is false.
       We are using await so that the check can be completed before another check is started on line 135, if the document doesn't exist then it will error.
    */
    await db.collection("clients").doc(message.author.id).get()
        .then((doc) => {
            if (!doc.exists) {
                let queryRef = db.collection("clients").where("VentingID", "==", id1).get()
                    .then(snapshot => {
                        if (snapshot.empty) {
                            db.collection('clients').doc(message.author.id).set({
                                Blacklisted: false,
                                ToggleVenting: false,
                                UserID: message.author.id,
                                VentingID: id1,
                            })
                        } else {
                            let id2 = customId({ randomLength: 2 })
                            db.collection("clients").doc(message.author.id).set({
                                Blacklisted: false,
                                ToggleVenting: false,
                                UserID: message.author.id,
                                VentingID: id2,
                            })
                        }
                    })
                
            }
        })

    //If the type of channel the message is sent in is text, this code will run.
    if (message.channel.type === "text") {
        // Is the users message doesn't start with the prefix then the bot will ignore that message.
        if (!message.content.startsWith(prefix)) return;

        // This is a dummy command which I use to see if the bot is online and responding.
        if (message.content === `${prefix}ping`) return message.channel.send('Pong.');

        if (message.content.startsWith(`${prefix}blacklist`)) {
            // The bot will search the array of authorised ids and look to see if the authors id is in there, if it isn't then the bot will return.
            if (!config.ownerID.includes(message.author.id)) return message.channel.send("You're not a bot developer!");

            /* The bot is now checking to see if a userID has been specified.
                If a userID has not been specified the bot will return and notify the user.
            */
            if (!args[0]) {
                return message.channel.send("You must supply a user ID to blacklist.")
            } else {
                /* We will be using the global boolean nf as a way to identify whether or not the document was found within the databse.
                   If the boolean is false then the program knows that the document doesn't exist and will not continue the blacklist operation.
                   If the boolean is true then the program will know that a document was found and that it is okay to carry on.
                */
                global.nf = true;

                /* The global variable bid will be used so that the bot knows which person to send a DM to once they have blacklisted the ID.
                   At the start of the process the variable is set to nothing so that the ID from the previous operation isn't carried over.
                */
                global.bid = ""

                /* Below is where we will attempt to search all documents in the collection and try to find a document which has an ID matching the specified one.
                   If a matching document isn't found then the program will return and the message author will be notified.
                   If a matching document is found, the program will then set the Blacklisted boolean to true.
                   Once the Blaclisted boolean has been set to true the bot will then grab the users ID from the document name and send a DM to that user notifying them that they've been blacklisted.
                */
                let reference = db.collection("clients");
                let queryRef = db.collection("clients").where("VentingID", "==", args[0]).get()
                    .then(snapshot => {
                        if (snapshot.empty) {
                            global.nf = false
                            return message.channel.send(`**ERROR**: Failed to find \`${args[0]}\` in the database, are you sure this ID exists?`)
                        }

                        snapshot.forEach(doc => {
                            global.bid = doc.id;
                            if (doc.data().Blacklisted) {
                                global.nf = false;
                                return message.channel.send(`**ERROR**: \`${args[0]}\` is already blacklisted.`)
                            };
                            let reason = args.slice(1).join(" ");
                            if (!reason) {
                                global.nf = false;
                                return message.channel.send(`**ERROR**: Failed to balacklist \`${args[0]}\`, please supply a reason.`)
                            };
                            db.collection("clients").doc(doc.id).update({
                                Blacklisted: true,
                                BlacklistReason: reason,
                                ToggleVenting: false
                            });
                        });
                    })  
                    .then(() => {
                        if (!global.nf) return;
                        let reason = args.slice(1).join(" ")
                        let embed = new MessageEmbed()
                        .setColor(red_light)
                        .setTitle(`You have been blacklisted from using SafeVenting.`)
                        .setDescription(`Moderator: \`${message.author.username}\`. \nReason: ${reason}.`)
                        .setTimestamp()
                        .setFooter('SafeVenting, a bot created with love by MrShadow.')

                        client.users.cache.get(global.bid).send(embed)
                        return message.channel.send(`Success: \`${args[0]}\` has been blacklisted.`);
                    })
                    .catch(err => {
                        console.err(err);
                        return message.channel.send(`**ERROR**: An unexpected error has occured, please contact MrShadow **immediately**.`)
                    })
            }
        }

        if (message.content.startsWith(`${prefix}whitelist`)) {
            // The bot will search the array of authorised ids and look to see if the authors id is in there, if it isn't then the bot will return.
            if (!config.ownerID.includes(message.author.id)) return message.channel.send("You're not a bot developer!");
            
            if (!args[0]) {
                return message.channel.send("You must supply a user ID to whielist.");
            } else {
                global.nf3 = true;

                global.wid = ""

                let reference = db.collection("clients");
                let queryRef = db.collection("clients").where("VentingID", "==", args[0]).get()
                    .then(snapshot => {
                        if (snapshot.empty) {
                            global.nf3 = false;
                            return message.channel.send(`**ERROR**: Failed to find \`${args[0]}\` in the database, are you sure this ID exists?`)
                        }
                        
                        snapshot.forEach(doc => {
                            global.wid = doc.id;
                            if (!doc.data().Blacklisted) {
                                global.nf3 = false;
                                return message.channel.send(`**ERROR**: \`${args[0]}\` is already whitelisted.`)
                            };
                            let reason = args.slice(1).join(" ");
                            if (!reason) {
                            global.nf3 = false;
                            return message.channel.send(`**ERROR**: Failed to balacklist \`${args[0]}\`, please supply a reason.`)
                            };
                            db.collection("clients").doc(doc.id).update({ Blacklisted: false })
                            db.collection("clients").doc(doc.id).update({ BlacklistReason: reason })
                        });   
                    })
                    .then(() => {
                        if (!global.nf3) return;
                        let reason = args.slice(1).join(" ");
                        let embed = new MessageEmbed()
                        .setColor(bright_green)
                        .setTitle(`You have been whitelisted from using SafeVenting.`)
                        .setDescription(`Moderator: \`${message.author.username}\`. \nReason: ${reason}.`)
                        .setTimestamp()
                        .setFooter('SafeVenting, a bot created with love by MrShadow.')

                        client.users.cache.get(global.wid).send(embed)
                        return message.channel.send(`Success: \`${args[0]}\` has been whitelisted.`);
                    })
                    .catch(err => {
                        console.log(err);
                        return message.channel.send(`**ERROR**: An unexpected error has occured, please contact MrShadow **immediately**.`);
                    }) 
            }
        }

        if (message.content.startsWith(`${prefix}r`)) {
            /* The bot is now checking to see if a userID has been specified.
                If a userID has not been specified the bot will return and notify the user.
            */
            if (!args[0]) {
                return message.channel.send('You must supply an ID to reply to.');
            } else {
                /* We will be using the global boolean nf2 as a way to identify whether or not the document was found within the databse.
                   If the boolean is false then the program knows that the document doesn't exist and will not continue the reply operation.
                   If the boolean is true then the program will know that a document was found and that it is okay to carry on.
                */
                global.nf2 = true;

                /* The global variable bid will be used so that the bot knows which person to send a DM to once they have blacklisted the ID.
                   At the start of the process the variable is set to nothing so that the ID from the previous operation isn't carried over.
                */
                global.rid = "";

                let reference = db.collection("clients");
                let queryRef = db.collection("clients").where("VentingID", "==", args[0]).get()
                    .then((snapshot) => {
                        if (snapshot.empty) {
                            global.nf2 = false;
                            return message.channel.send(`**ERROR**: Failed to find \`${args[0]}\` in the database, are you sure this ID exists?`);
                        };

                        snapshot.forEach((doc) => {
                            if (doc.data().Blacklisted) return message.channel.send(`**ERROR**: Failed to send a message to \`${args[0]}\`, they are blacklisted from using SafeVenting.`)
                            if (!doc.data().ToggleVenting) return message.channel.send(`**ERROR**: Failed to send a message to \`${args[0]}\`, they have SafeVenting toggled off.`)
                            global.rid = doc.id
                        })
                    })
                    .then(() => {
                        if (!global.nf2) return;
                        let text = args.slice(1).join(" ");
                        if (!text) return message.channel.send(`**ERROR**: Failed to send a message to \`${args[0]}\`, you must give me some text to send.`);
                        let embed = new MessageEmbed()
                        .setColor(black)
                        .setTitle(`By ${message.author.tag}`)
                        .setDescription(`${text}`)
                        .setTimestamp()
                        .setFooter('SafeVenting, a bot created with love by MrShadow.')

                        client.users.cache.get(global.rid).send(embed);
                        return message.channel.send('Message Sent :white_check_mark:').then(m => m.delete( { timeout: 5000 }))
                    })
                    .catch(err => {
                        console.log(err);
                        return message.channel.send(`**ERROR**: An unexpected error has occured, please contact MrShadow **immediately**.`)
                    })
            }
        }

        if (message.content.startsWith(`${prefix}help`)) {
            if (!args[0]) {
                let embed = new MessageEmbed()
                .setColor(black)
                .setTitle('Safe Ventings Commands.')
                .setDescription(`Need more help? Do ${prefix}help <command name>`)
                .addField(`${prefix}r <id> <message>`, `Sends a message to the specified ID.`)
                .addField(`${prefix}blacklist <id> <reason>`, `Blacklists the specified ID from using SafeVenting.`)
                .addField(`${prefix}whitelist <id> <reason>`, `Whitelists the specified ID from using SafeVenting.`)
                .setTimestamp()
                .setFooter('SafeVenting, a bot created with love by MrShadow.')

                return message.channel.send(embed);

            } else {
                switch (args[0]) {
                    case 'r':
                        let embed = new MessageEmbed()
                        .setColor(black)
                        .setTitle('Reply Command')
                        .setDescription(`Usage: ${prefix}r <id> <message> \nThis command will send a message to the specified ID, and also performs several checks to make sure nothing goes wrong.`)
                        .setTimestamp()
                        .setFooter('SafeVenting, a bot created with love by MrShadow.')

                        message.channel.send(embed);
                        break;
                    case 'blacklist':
                        let embed2 = new MessageEmbed()
                        .setColor(black)
                        .setTitle('Blacklist Command')
                        .setDescription(`Usage: ${prefix}blacklist <id> <reason> \nThis command will blacklist the specified ID, and also performs several checks to make sure nothing goes wrong.`)
                        .setTimestamp()
                        .setFooter('SafeVenting, a bot created with love by MrShadow.')

                        message.channel.send(embed2);
                        break;
                    case 'whitelist':
                        let embed3 = new MessageEmbed()
                        .setColor(black)
                        .setTitle('Whitelist Command')
                        .setDescription(`Usage: ${prefix}whitelist <id> <reason> \nThis command will whitelist the specified ID, and also performs several checks to make sure nothing goes wrong.`)
                        .setTimestamp()
                        .setFooter('SafeVenting, a bot created with love by MrShadow.')

                        message.channel.send(embed3);
                        break;
                }
            }
        }
    }
    
    //If the type of channel the message is sent in is DM, this code will be run.
    if (message.channel.type === "dm") {
        global.off = true;
        if (message.content === "enableVenting") {
            global.off = false;
            db.collection("clients").doc(message.author.id).get()
                .then(async(doc) => {
                    let id = doc.data().VentingID;
                    
                    /* Below we have 2 checks, first we have a check to see if the user is blacklisted.
                       The users document will be checked in the database and if Blacklisted is true then the bot will return.
                       The second check will check to see if the user has already enabled venting, if they have the bot will return and notify the user.
                    */
                    if (doc.data().Blacklisted) return message.channel.send('You have been blacklisted from using SafeZone Venting.');
                    if (doc.data().ToggleVenting) return message.channel.send('You have already enabled venting! To disable it please type: `disableVenting`.');

                    /* If the two checks above have both returned false,
                       the bot will update the ToggleVenting boolean in the database to true.
                    */

                    await db.collection("clients").doc(message.author.id).update({
                        ToggleVenting: true
                    });
                    client.channels.fetch(`${config.outputChannel}`).then((chan) => {
                        let embed = new MessageEmbed()
                        .setColor(black)
                        .setTitle(`User ${id} turned SafeVenting \`on\`!`)
                        .setDescription(`To reply to them you must send: \`${prefix}r ${id} <message>\``)
                        chan.send(embed)
                        chan.send(`<@&${config.roleid}>`)
                    })
                    main.start(config.lchannelon, id, message.author.tag);
                    return message.channel.send('SafeVenting has been toggled on :white_check_mark: ');
                })
        }

        if (message.content === "disableVenting") {
            db.collection("clients").doc(message.author.id).get()
                .then(async(doc) => {
                    let id = doc.data().VentingID;
                    if (doc.data().Blacklisted) return message.channel.send('You have been blacklisted from using SafeZone Venting.');
                    if (!doc.data().ToggleVenting) return message.channel.send('Venting is disabled already! To enable it please type: `enableVenting`');
                    await db.collection("clients").doc(message.author.id).update({
                        ToggleVenting: false
                    })
                    client.channels.fetch(`${config.outputChannel}`).then((chan) => {
                        const embed = new MessageEmbed()
                            .setDescription(`User \`${id}\` has turned SafeVenting off!`)
                        chan.send(embed)
                    })
                    main.end(config.lchanneloff, id, message.author.tag);
                    return message.channel.send('SafeVenting has been toggled off :x:');
                })
        } 

        db.collection("clients").doc(message.author.id).get()
            .then((doc) => {
                if(!doc.exists) return;
                if (doc.data().Blacklisted) return;
                if (doc.data().ToggleVenting) {
                    if (message.content === "disableVenting") return;
                    client.channels.fetch(`${config.outputChannel}`).then((chan) => {
                        let embed = new MessageEmbed()
                        .setColor(black)
                        .setTitle(`By ${doc.data().VentingID}`)
                        .setDescription(`${message.content}`)
                        .setTimestamp()
                        .setFooter('SafeVenting, a bot created with love by MrShadow.')
                        chan.send(embed)
                    })
                    return message.channel.send('Message Sent :white_check_mark:').then(m => m.delete( { timeout: 5000 }));
                } else {
                    if (!global.off) return;
                    return message.channel.send("Do you wish to enable venting? \nType: `enableVenting`");
                }
            }) 
        
    }
})

console.log(figlet.textSync("Safe Venting JS", {font: 'rectangles'}));
console.log("\nSafe Venting JS is an anonymous venting bot made by Usman Mahmood.");
console.log("\nPowered by:", "Node.JS & Discord.JS".blue.bold);
console.log("Version:", "0.0.2".yellow.bold);
console.log("Github:", "https://github.com/UsmanSamiMahmood/Safe-Venting-JS/".magenta.bold);
console.log("\nDeveloper: Usman Mahmood".underline.red.bold)

client.login(token)
    .then(() => {
        console.log(`\nLogged in on:`, `${client.user.tag}.`.bgBlack.brightGreen)
    })
    .catch((err) => {
        console.log('Something went wrong: ' + err);
    });