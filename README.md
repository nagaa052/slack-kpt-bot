## What's this?

It's a Slack bot to encourage us KPT retrospect.

## Usage

- Post any messages starting with "K " or "P " or "T " as like...
  - "K Found a good restaurant near our office"
  - "P This project is getting delayed..."
  - "T Start daily meeting"
- Call your KPT bot when you want to start retrospect with posted KPTs.

### Format

`@bot-name summary $from_date $to_date`

- from_date: Required. Start of time range of messages.
- to_date:   Optional. End of time range of messages.

### Sample

`@bot-name summary 2016-11-01 2016-11-30`

The bot gathers KPTs you posted from 2016-11-01 and 2016-11-30 from history of a channel you called the bot.

