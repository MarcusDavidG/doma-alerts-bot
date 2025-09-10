# DomaPulse

A Telegram bot for real-time domain alerts on the Doma Protocol blockchain. Stay updated with on-chain domain events like registrations, expirations, and transfers.

## Description

DomaPulse is a Telegram bot that monitors the Doma Protocol smart contracts for domain-related events. Users can subscribe to specific domains and receive instant notifications when events occur.

**Try the bot on Telegram:** [https://t.me/DomaPulse_Bot](https://t.me/DomaPulse_Bot)

## Features

- **Real-time Event Monitoring**: Listens to DomainRegistered, DomainExpired, and DomainTransferred events from Doma Protocol contracts.
- **User Subscriptions**: Subscribe/unsubscribe to specific domains using simple Telegram commands.
- **Personalized Alerts**: Only receive notifications for domains you're interested in.
- **Bot Status**: Check bot health and RPC connection status.
- **Easy Commands**: Intuitive command interface with help menu.

## Technologies Used

- **Node.js**: Runtime environment for the bot.
- **Telegraf**: Modern Telegram Bot API framework for Node.js.
- **ethers.js**: Library for interacting with the Ethereum/Doma blockchain.
- **dotenv**: For managing environment variables.
- **JSON**: Lightweight data storage for user subscriptions.

## Category

This project belongs to the **Web3 / Blockchain** category, specifically focusing on decentralized domain name services (DNS) and real-time blockchain event monitoring.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/doma-alerts-bot.git
   cd doma-alerts-bot
   ```

2. Install dependencies:
   ```bash
   cd bot
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Telegram Bot Token and Doma RPC URL

4. Start the bot:
   ```bash
   npm start
   ```

## Usage

1. Start a chat with your bot on Telegram by searching for your bot's username.
2. Use `/start` to receive a welcome message that introduces the bot and its purpose.
3. Use `/help` to see a list of all available commands along with brief descriptions.
4. Subscribe to a domain by typing `/subscribe example.dom`. Replace `example.dom` with the domain you want to monitor.
5. Check your current subscriptions with `/list`. This will display all domains you are subscribed to.
6. Get the bot's current status and RPC connection info by using `/status`.
7. Unsubscribe from a domain with `/unsubscribe example.dom` to stop receiving alerts for that domain.

## Commands

- `/start` - Sends a welcome message and brief introduction to the bot.
- `/help` - Displays a help menu listing all available commands and their usage.
- `/subscribe <domain>` - Adds the specified domain to your subscription list to receive alerts.
- `/unsubscribe <domain>` - Removes the specified domain from your subscription list.
- `/list` - Shows all domains you are currently subscribed to.
- `/status` - Provides the bot's health status, including RPC chain ID and number of active subscriptions.

## Environment Variables

The bot requires the following environment variables to be set in a `.env` file at the root of the `bot` directory:

- `TELEGRAM_BOT_TOKEN`: Your Telegram bot token obtained from BotFather.
- `DOMA_RPC_URL`: The RPC URL endpoint for connecting to the Doma Protocol blockchain.
- `TEST_CHAT_ID` (optional): A Telegram chat ID used for testing block notifications.

## Subscription Storage

User subscriptions are stored in a JSON file (`subscriptions.json`) located in the `bot` directory. This file keeps track of which users are subscribed to which domains. The bot reads from and writes to this file to manage subscriptions.

## Event Listening and Notifications

The bot listens to on-chain events from the Doma Protocol smart contracts, specifically:

- `DomainRegistered`
- `DomainExpired`
- `DomainTransferred`

When one of these events occurs, the bot sends a Telegram alert message to all users subscribed to the affected domain.

## Development and Contribution

To contribute to the project:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes and commit them with clear messages.
4. Push your branch and open a Pull Request.

Please ensure your code follows the existing style and includes appropriate documentation.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
