# TODO: Update bot/index.js for DomaPulse

- [x] Remove the block listener (provider.on("block", ...))
- [x] Add const explorerUrl = "https://explorer-testnet.doma.xyz/tx";
- [x] Update DomainRegistered event listener: format message in Markdown, include transaction link, use notifySubscribers
- [x] Update DomainExpired event listener: format message in Markdown, include transaction link, use notifySubscribers
- [x] Update DomainTransferred event listener: format message in Markdown, include transaction link, use notifySubscribers
- [x] Verify bot starts cleanly and only notifies subscribed users
- [x] Add /simulate command to generate fake events for a domain (with 4-second delays between messages)
- [x] Update /help to include /simulate
- [x] Remove TEST_CHAT_ID logic completely
- [x] Update /start to store chat.id in subscriptions.json if not present
- [x] Ensure event listeners check all chatId entries and send alerts only to subscribed users
- [x] Allow multiple users to subscribe independently
