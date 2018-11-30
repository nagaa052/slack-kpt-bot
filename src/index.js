'use strict';

const Botkit = require('botkit');
const moment = require('moment-timezone');

const slackBotToken = process.env.SLACK_BOT_TOKEN;
const slackTeam = process.env.SLACK_TEAM;

if (!slackBotToken || !slackTeam) {
  console.log('Error: Specify token in environment');
  process.exit(1);
}

const commonParams = {
  token: slackBotToken,
};

const controller = Botkit.slackbot({
  debug: !!process.env.DEBUG
});

const bot = controller.spawn({
  token: slackBotToken
})

bot.startRTM(function(err, bot, payload) {
  if (err) {
    throw new Error('Could not connect to Slack');
  }
});

/*
   This KPI bot waits for you to call him. Here is sample usage.

   Format:
     @bot-name summary $from_date $to_date
     - from_date: Required. Start of time range of messages.
     - to_date:   Optional. End of time range of messages.

   Sample:
     @bot-name 2016-11-01 2016-11-30

     The bot gathers KPTs you posted 2016-11-01 00:00:00 to 2016-11-30 23:59:59 in your timezone
     from history of a channel you called the bot.

   ```
   K
   - Started daily meeting
   - Find a release blocker earlier
   P
   - Cannot help each other... :cry:
   T
   - How about going lunch? :smile:
   ```
 */
controller.hears("^summary (.+)",["direct_message","direct_mention","mention"], (bot, message) => {
  let users;

  const fetchUserListDone = (err, res) => {
    if (err) {
      console.log(err)
      return;
    }
    users = res.members;

    // https://api.slack.com/methods/channels.history
    bot.api.callAPI('channels.history', paramsToFetchChannelHistory(message, users), postSummary);
  };

  const postSummary = (err, res) => {
    if (err) {
      console.log(err)
      return;
    }

    let result = { K: [], P: [], T: [] };

    for (const message of res.messages) {
      if (!message.text) {
        continue;
      }

      const matched = message.text.match(/^([KkPpTt])\s+(.+)/);

      if (matched) {
        result[matched[1].toUpperCase()].push({
          content: matched[2],
          userId: message.user,
          reactions: (message.reactions || []),
          ts: message.ts
        });
      }
    }

    let attachments = createSummary(result, users, message);

    let reply = {
      attachments : attachments
    }

    bot.reply(message, reply);
  };

  // https://api.slack.com/methods/users.list
  bot.api.callAPI('users.list', commonParams, fetchUserListDone)
});

/*
   If no command matched, show usage.
 */
controller.hears("^((?!summary).)*$",["direct_message","direct_mention","mention"], (bot, message) => {
  const reply = `
Sorry, I can't understand the order. :cry: Can you try again?

Format:
  @bot-name summary $from_date $to_date
  - from_date: Required. Start of time range of messages.
  - to_date:   Optional. End of time range of messages.

Sample:
  @bot-name summary 2016-11-01 2016-11-30
  @bot-name summary 2016-11-01
`;
  bot.reply(message, reply);
});

const checkError = (err) => {
  if (err) {
    console.log(err)
    return false
  }
};

const createSummary = (result, users, message) => {
  return ['K', 'P', 'T'].map((section) => {
    return makeAttachment(section, `${createSectionSummary(result[section], users, message)}\n`);
  });
};

const makeAttachment = (type, text) => {
  let title;
  let color;
  if (type == 'K') {
    title = 'Keep';
    color = 'warning'
  } else if (type == 'P') {
    title = 'Problem';
    color = 'danger'
  } else if (type == 'T') {
    title = 'Try';
    color = 'good'
  }

  return {
    title: title,
    text: text,
    color: color
  };
}

const createSectionSummary = (elements, users, message) => {
  return elements.map(e => {
    const username = users.find(u => u.id == e.userId).name;
    const reactions = e.reactions.map(r => ` :${r.name}: `.repeat(r.count)).join('');
    const link = `https://${slackTeam}.slack.com/archives/${message.channel}/p${e.ts.replace(".","")}`

    //return `- ${e.content} by ${username} `;
    return `- ${e.content} by ${username} ${reactions} (${link})`;
  }).reverse().join('\n')
};

const paramsToFetchChannelHistory = (message, users) => {
  const [from_date, to_date] = message.match[1].split(' ');

  const userTimezone = users.find(u => u.id == message.user).tz;

  let params = Object.assign(commonParams, {
    channel: message.channel,
    oldest: moment.tz(from_date, userTimezone).unix(),
    count: 1000,
  });

  // `latest` is optional parameter, and its default value is `now`.
  if (to_date) {
    params = Object.assign(params, {
      latest: moment.tz(to_date, userTimezone).endOf('day').unix(),
    });
  }
  return params;
};
