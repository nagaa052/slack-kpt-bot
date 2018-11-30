## What's this?

It's a Slack bot to encourage us KPT retrospect.
<img width="797" alt="2018-11-30 0 08 50" src="https://user-images.githubusercontent.com/1695727/49266654-5b609f80-f49a-11e8-9d75-6cfc25937351.png">


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

