"use strict";

const chat = require("../../twitch-chat");

const spamRaidProtection = {
    definition: {
        id: "firebot:spamRaidProtection",
        name: "Spam Raid Protection",
        active: true,
        hidden: true,
        trigger: "!spamraidprotection",
        description: "Toggles protective measures such as follow-only mode, slow mode, etc.",
        autoDeleteTrigger: false,
        scanWholeMessage: false,
        cooldown: {
            user: 0,
            global: 30
        },
        restrictionData: {
            restrictions: [
                {
                    id: "sys-cmd-mods-only-perms",
                    type: "firebot:permissions",
                    mode: "roles",
                    roleIds: [
                        "broadcaster",
                        "mod"
                    ]
                }
            ]
        },
        options: {
            displayTemplate: {
                type: "string",
                title: "Output Template",
                description: "A message that will tell the users what is going on",
                default: `We are currently experiencing a spam raid, and have therefore temporarily turned on protective measures.`,
                useTextArea: true
            },
            enableFollowerOnly: {
                type: "boolean",
                title: "Follower only mode",
                description: "Follower mode only allows chat message from followers that have a follow age of 15 minutes and longer.",
                default: true
            },
            enableEmoteOnly: {
                type: "boolean",
                title: "Emote only mode",
                description: "Chatters can only chat with Twitch emotes.",
                default: false
            },
            enableSubscriberOnly: {
                type: "boolean",
                title: "Subscriber only mode",
                description: "Only subscribers to the channel are allowed to chat.",
                default: false
            },
            enableSlowMode: {
                type: "boolean",
                title: "Slow mode",
                description: "In slow mode, users can only post one chat message every 30 seconds.",
                default: true
            },
            clearChat: {
                type: "boolean",
                title: "Clear chat",
                description: "The chat will be cleared.",
                default: true
            },
            blockRaiders: {
                type: "boolean",
                title: "Block raiders",
                description: "Block every user that posted the raid message.",
                default: true
            },
            banRaiders: {
                type: "boolean",
                title: "Ban raiders",
                description: "Ban every user that posted the raid message from your channel.",
                default: true
            }
        }
    },
    /**
     * When the command is triggered
     */
    onTriggerEvent: async event => {
        const { commandOptions } = event;
        chat.sendChatMessage(commandOptions.spamRaidProtectionTemplate);

        if (commandOptions.enableFollowerOnly) {
            chat.enableFollowersOnly("15m");
        }

        if (commandOptions.enableSubscriberOnly) {
            chat.enableSubscriberOnly();
        }

        if (commandOptions.enableEmoteOnly) {
            chat.enableEmoteOnly();
        }

        if (commandOptions.enableSlowMode) {
            chat.enableSlowMode();
        }
    }
};

module.exports = spamRaidProtection;