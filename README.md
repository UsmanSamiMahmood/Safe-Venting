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