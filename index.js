const { Client, Collection, MessageEmbed } = require("discord.js");
const client = new Client({ disableEveryone: true });
const config = require("./config.json");
const { db } = require("./database/handler.js");
const color = require("colors");
const figlet = require("figlet");
const customId = require("custom-id");
const { token } = require("./secrets/token.json")

// Below we are telling the bot what to do on the 'ready' event.
client.on('ready', () => {
    client.user.setActivity(`${config.statusName}`, { type: "WATCHING" });
})

client.on('message', async (message) => {
    console.log("Active")

    //If the author of the message is a bot then the bot will ignore the message.
    if (message.author.bot) return;

    let prefix = config.prefix;
    let messageArray = message.content.split(" ");
    let command = messageArray[0].toLowerCase();
    let args = messageArray.slice(1);

    var id = customId({ randomLength: 1 })
    await db.collection('clients').doc(message.author.id).get()
        .then((doc) => {
            if (!doc.exists) {
                db.collection('clients').doc(message.author.id).set({
                    Blacklisted: false,
                    ToggleVenting: false,
                    UserID: message.author.id,
                    VentingID: id,
                })
            }
        })

    //If the type of channel the message is sent in is text, this code will run.
    if (message.channel.type === "text") {
        if (!message.content.startsWith(prefix)) return;

        if (message.content === `${prefix}ping`) return message.channel.send('Pong.');

        if (message.content.startsWith(`${prefix}blacklist`)) {
            if (!args[0]) {
                return message.channel.send("You must supply a user ID to blacklist.")
            } else {
                global.nf = true
                let reference = db.collection("clients")
                let queryRef = db.collection("clients").where("VentingID", "==", args[0]).get()
                    .then(snapshot => {
                        if (snapshot.empty) {
                            global.nf = false
                            return message.channel.send(`**ERROR**: Failed to find \`${args[0]}\` in the database, are you sure this ID exists?`)
                        }

                        snapshot.forEach(doc => {
                            db.collection("clients").doc(doc.id).update({ Blacklisted: true })
                        });
                    })  
                    .then(() => {
                        if (!global.nf) return;
                        return message.channel.send(`Success: \`${args[0]}\` has been blacklisted.`)
                    })
                    .catch(err => {
                        return message.channel.send('An unexpected error has occured please contact MrShadow.');
                    })
            }
        }
    }
    
    //If the type of channel the message is sent in is DM, this code will be run.
    if (message.channel.type === "dm") {
        global.off = true;
        if (message.content === "enableVenting") {
            db.collection("clients").doc(message.author.id).get()
                .then(async(doc) => {
                    let id = doc.data().VentingID
                    if (doc.data().ToggleVenting) return message.channel.send('You have already enabled venting! To disable it please type: `disableVenting`.')
                    await db.collection("clients").doc(message.author.id).update({
                        ToggleVenting: true
                    });
                    await global.off == false
                    client.channels.fetch(`${config.outputChannel}`).then((chan) => {
                        const embed = new MessageEmbed()
                        .setTitle(`User ${id} turned *SafeVenting* \`on\`!`)
                        .setDescription("To reply to them you must send:", `svr ${id} <message>`)
                        chan.send(embed)
                        chan.send(`<@&${config.roleid}>`)
                    })
                    return message.channel.send('SafeVenting has been toggled on :white_check_mark: ')
                })
        }

        if (message.content === "disableVenting") {
            db.collection("clients").doc(message.author.id).get()
                .then(async(doc) => {
                    let id = doc.data().VentingID
                    if (!doc.data().ToggleVenting) return message.channel.send('Venting is disabled already! To enable it please type: `enableVenting`')
                    await db.collection("clients").doc(message.author.id).update({
                        ToggleVenting: false
                    })
                    client.channels.fetch(`${config.outputChannel}`).then((chan) => {
                        const embed = new MessageEmbed()
                            .setTitle(`User \`${id}\` has turned *SafeVenting* off!`)
                        chan.send(embed)
                    })
                    return message.channel.send('SafeVenting has been toggled off :x:')
                })
        } 

        await db.collection("clients").doc(message.author.id).get()
            .then((doc) => {
                if(!doc.exists) return;
                if (doc.data().ToggleVenting) {

                } else {
                    if (global.off !== true) return;
                    console.log('Activated')
                    return message.channel.send("Do you wish to enable venting? \nType: `enableVenting`")
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