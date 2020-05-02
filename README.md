[![Codacy Badge](https://api.codacy.com/project/badge/Grade/e649ec1c0cb74956879164f56ccd3686)](https://app.codacy.com/manual/SergeantShadoww/Safe-Venting-JS?utm_source=github.com&utm_medium=referral&utm_content=UsmanSamiMahmood/Safe-Venting-JS&utm_campaign=Badge_Grade_Dashboard)

This project is powered by [Node.JS](https://nodejs.org/en/) and [Discord.JS](https://discord.js.org/#/)

# Safe-Venting
 A bot I made which allows users to vent anonymously.

## How does it work?
First, a user must send the bot a direct message which is shown below, then the user will be asked if they want to enable venting.

![Screenshot](https://cdn.discordapp.com/attachments/704774573408649278/705950317069729852/unknown.png)

Once the user enables venting, the bot will confirm that they have enabled venting and an embed will be sent to the channel which is set as the output channel in the config.json file.
As well as the embed being sent, the roleid which is set in the config file (the support role), will be pinged.

Venting enabled confirmation:

![Screenshot](https://cdn.discordapp.com/attachments/704774573408649278/705951626321461340/unknown.png)

Alert sent to output channel and role being pinged:

![Screenshot](https://cdn.discordapp.com/attachments/704774573408649278/705951742214406185/unknown.png)

Now that venting is enabled, anyone will be able to send messages to that user via the **prefixr id message** command.
Once the commmand is run, the bot will send a message to the channel confirming that it has been sent and then deletes that same message after 5 seconds.

An example where I am sending a message to myself:

![Screenshot](https://cdn.discordapp.com/attachments/704774573408649278/705954036146241576/unknown.png)

Below is a screenshot of what the user sees in their direct messages:

![Screenshot](https://cdn.discordapp.com/attachments/704774573408649278/705954240266502175/unknown.png)

## What if someone abuses the bot and I want to blacklist them?
No problem, just use the command **prefixblacklist id reason** to blacklist a user.
Once a user is blacklisted they will no longer be able to enable venting, recieve messages and intereact with the bot at all.
The blacklisted user will also recieve a direct message from the bot notifying them that they have been blacklisted as well as the reason in an embed.

Blacklist command in use:

![Screenshot](https://cdn.discordapp.com/attachments/704774573408649278/705966354070634546/unknown.png)

Notification which the blacklisted user recieves:

![Screenshot](https://cdn.discordapp.com/attachments/704774573408649278/705966646761619507/unknown.png)

## Can I whitelist someone after they've been blacklisted?
Yes, just use the command **prefixwhitelist id reason** to whitelist a user.
This command works similarly to blacklist, once a user is whitelisted, they will be able to use the safe venting bot again.
The whitelisted user will also recieve a direct message from the bot notifying them that they have been whitelisted as well as the reason in an embed.

Whitelist command in use:

![Screenshot](https://cdn.discordapp.com/attachments/704774573408649278/705968777174581318/unknown.png)

Notification which the whitelisted user recieves:

![Screenshot](https://cdn.discordapp.com/attachments/704774573408649278/705968995425189898/unknown.png)

**WARNING**: I am yet to add support for attachments being sent in the chat so if you attempt to do this, the bot wil encounter an error.

**NOTE**: Self hosting support coming soon.
