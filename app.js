const express = require('express')
const axios = require('axios')

const WHATSAPP_ACCESS_TOKEN = "EAAKePyNJnaUBQAaoZB1YtuLBXnOlUwM6O6gL3c66VEg3BZAqmPuc8ZBVsWXcZCrFAfAymGEbSspi4l3ygmnSpVKtQ9XQWsF6bEOT60LBR9GNSq79xZBXvtYhR2XZBcONPIjLiZA2rGms4mFIe7i5MMYfpcA0l8T7rzIXZBNPb1tbZCNT4FxB2xsnbZCSCbv0NLaPJdoMO3Vb0yhglIdhrjSyle8OKiPn0B2rsO8ALO3wqjJCUFTqHyoJGAyprG9ATKfMeQui1TSJFXDZAOZCu2l2xy0ozgWAgQZDZD"
const WEBHOOK_VERIFY_TOKEN = "KAVI"
const phoneNumberId ="960587527127470"

const app = express()
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Whatsapp with Node.js and Webhooks')
})

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode']
  const challenge = req.query['hub.challenge']
  const token = req.query['hub.verify_token']

  if (mode && token === WEBHOOK_VERIFY_TOKEN) {
    res.status(200).send(challenge)
  } else {
    res.sendStatus(403)
  }
})

app.post('/webhook', async (req, res) => {
  const { entry } = req.body

  if (!entry || entry.length === 0) {
    return res.status(400).send('Invalid Request')
  }

  const changes = entry[0].changes

  if (!changes || changes.length === 0) {
    return res.status(400).send('Invalid Request')
  }

  const statuses = changes[0].value.statuses ? changes[0].value.statuses[0] : null
  const messages = changes[0].value.messages ? changes[0].value.messages[0] : null

  if (statuses) {
    // Handle message status
    console.log(`
      MESSAGE STATUS UPDATE:
      ID: ${statuses.id},
      STATUS: ${statuses.status}
    `)
  }
    console.log('From', messages);

  if (messages) {
    // Handle received messages
    if (messages.type === 'text') {
      if (messages.text.body.toLowerCase() === 'hi') {
        replyMessage(messages.from, 'Hello 👋 How can I help you today?', messages.id)
      }

      if (messages.text.body.toLowerCase() === 'list') {
        sendList(messages.from)
      }

      if (messages.text.body.toLowerCase() === 'buttons') {
        sendReplyButtons(messages.from)
      }
      const regexMap = {
        REQUEST_BUTTON: /^REQ-\d{4}$/,
        HOTPART_BUTTON: /^HP-\d{4}$/,
        NCI_BUTTON: /^NCI-\d{6}-\d{4}$/
      };   
      const buttonId = messages.interactive.button_reply.id;
      const selectedRegex = regexMap[buttonId];
      const userInput = messages.text.body.trim();
      const errorMessageMap = {
            REQUEST_BUTTON: '❌ Invalid Request ID. Use format: REQ-1234',
            HOTPART_BUTTON: '❌ Invalid Hot Part ID. Use format: HP-1234',
            NCI_BUTTON: '❌ Invalid NCI ID. Use format: NCI-202512-1234'
          };
      const successMessageMap = {
            REQUEST_BUTTON: '✅ Thank you! Your Request ID has been verified successfully.',
            HOTPART_BUTTON: '✅ Thank you! Your Hot Part ID has been verified successfully.',
            NCI_BUTTON: '✅ Thank you! Your NCI number has been verified successfully.'
          };

      if (!selectedRegex.test(userInput)) {

          // if (buttonId === 'REQUEST_BUTTON') {
          //   sendMessage(
          //     messages.from,
          //     '✅ Thank you! Your Request ID has been verified successfully.'
          //   );
          // } else if (buttonId === 'HOTPART_BUTTON') {
          //   sendMessage(
          //     messages.from,
          //     '✅ Thank you! Your Hot Part ID has been verified successfully.'
          //   );
          // } else if (buttonId === 'NCI_BUTTON') {
          //   sendMessage(
          //     messages.from,
          //     '✅ Thank you! Your NCI number has been verified successfully.'
          //   );
          // } 
           sendMessage(
            messages.from,
            successMessageMap[buttonId]
          );
       
      } else {
           sendMessage(
            messages.from,
            errorMessageMap[buttonId]
          );
        }
      
    }

    if (messages.type === 'interactive') {
      if (messages.interactive.type === 'list_reply') {

        sendMessage(messages.from, `You selected the option with ID ${messages.interactive.list_reply.id} - Title ${messages.interactive.list_reply.title}`)
      }

     if (messages?.interactive?.type === 'button_reply') {

        const buttonId = messages.interactive.button_reply.id;
        const buttonTitle = messages.interactive.button_reply.title;

            if (buttonId === 'REQUEST_BUTTON') {

              sendMessage(
                messages.from,
                '📝 You selected REQUEST. Please enter your Request ID (example: REQ-1234)'
              );

            } else if (buttonId === 'HOTPART_BUTTON') {

              sendMessage(
                messages.from,
                '📝 You selected REQUEST. Please enter your Request ID. (example: HP-1234)'
              );

            } else if (buttonId === 'NCI_BUTTON') {

              sendMessage(
                messages.from,
                '📝 You selected REQUEST. Please enter your Request ID. (example: NCI-202512-1234)'
              );

            } else {

              sendMessage(
                messages.from,
                `You selected: ${buttonTitle}`
              );
            }
      }

    }
    
    
    console.log(JSON.stringify(messages, null, 2))
  }
  
  res.status(200).send('Webhook processed')
})

async function sendMessage(to, body) {
    console.log(to, body);
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to:to,
        type: 'text',
        text: {
          body:body
        },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error(
      'WhatsApp reply failed:',
      error.response?.data || error.message
    );
  }
}

async function replyMessage(to, body, messageId) {
  console.log(to, body, messageId);
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to:to,
        type: 'text',
        text: {
          body:body
        },
        context: {
          message_id: messageId
        }
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('WhatsApp reply sent:', response.data);

  } catch (error) {
    console.error(
      'WhatsApp reply failed:',
      error.response?.data || error.message
    );
  }
}


async function sendList(to) {
    console.log(to);
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
      {
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'list',
        header: {
          type: 'text',
          text: 'VYAPI SOFT'
        },
        body: {
          text: 'Select an option to proceed.'
        },
        footer: {
          text: 'Powered by VYAPI SOFT'
        },
        action: {
          button: 'Tap for the options',
          sections: [
            {
              title: 'First Section',
              rows: [
                {
                  id: 'first_option',
                  title: 'First option',
                  description: 'This is the description of the first option'
                },
                {
                  id: 'second_option',
                  title: 'Second option',
                  description: 'This is the description of the second option'
                }
              ]
            },
            {
              title: 'Second Section',
              rows: [
                {
                  id: 'third_option',
                  title: 'Third option'
                }
              ]
            }
          ]
        }
      }
    },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error(
      'WhatsApp reply failed:',
      error.response?.data || error.message
    );
  }
}

async function sendReplyButtons(to) {
   console.log(to);
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
      {
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        header: {
          type: 'text',
          text: 'VYAPI SOFT'
        },
       body: {
        text: 'Select an option to proceed.'
        },
        footer: {
          text: 'Powered by VYAPI SOFT'
          },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: 'REQUEST_BUTTON',
                title: 'REQUEST'
              }
            },
            {
              type: 'reply',
              reply: {
                id: 'HOTPART_BUTTON',
                title: 'HOT PART'
              }
            },
            {
              type: 'reply',
              reply: {
                id: 'NCI_BUTTON',
                title: 'NCI'
              }
            }
          ]
        }
      }
    },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error(
      'WhatsApp reply failed:',
      error.response?.data || error.message
    );
  }
}

app.listen(3000, () => {
  console.log('Server started on port 3000')
})
