const express = require('express')
const axios = require('axios')

const WHATSAPP_ACCESS_TOKEN = "EAAKePyNJnaUBQG2J1Eat0Jy9o650GpFkw8i3ag4hV39DIi7g06b6gj5WysE01el9G1nMRKsNeFXUt3uYifD0NcHt8dMb3rUci21ZCNeXdtdpzoSCslkOAtzBMZAdt3L8VBknI1wmQIybGZByeRHLWmgxY7Xqu5unOLRKCDLZCgeUZC2TNxbqCe7HdZARghFNHpIex23PM93Hlkv5f6dDxfKat47PSkGvUZCXRk4m5O3PJO2XpApfel49U6ZAhmeLaIp8MCyh3XcCzsTBUSj3cAkCLmDP"
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
    let regexMap = {
            request_btn: /^REQ-\d{4}$/,
            hp_btn: /^HP-\d{4}$/,
            nci_btn: /^NCI-\d{6}-\d{4}$/
          };   
    let buttonId = messages?.interactive?.button_reply?.id;
    let selectedRegex = regexMap[buttonId];
    let userInput = messages?.text?.body.trim();
    let errorMessageMap = {
            request_btn: '❌ Invalid Request ID. Use format: REQ-1234',
            hp_btn: '❌ Invalid Hot Part ID. Use format: HP-1234',
            nci_btn: '❌ Invalid NCI ID. Use format: NCI-202512-1234'
          };
    let successMessageMap = {
          request_btn: '✅ Thank you! Your Request ID has been verified successfully.',
          hp_btn: '✅ Thank you! Your Hot Part ID has been verified successfully.',
          nci_btn: '✅ Thank you! Your NCI number has been verified successfully.'
        };
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
        
      // if(messages.text.body && !selectedRegex.test(userInput)){
        
      //    sendMessage(
      //           messages.from,
      //           successMessageMap[buttonId]
      //         );

      //         // if (buttonId === 'request_btn') {
      //         //   sendMessage(
      //         //     messages.from,
      //         //     '✅ Thank you! Your Request ID has been verified successfully.'
      //         //   );
      //         // } else if (buttonId === 'hp_btn') {
      //         //   sendMessage(
      //         //     messages.from,
      //         //     '✅ Thank you! Your Hot Part ID has been verified successfully.'
      //         //   );
      //         // } else if (buttonId === 'nci_btn') {
      //         //   sendMessage(
      //         //     messages.from,
      //         //     '✅ Thank you! Your NCI number has been verified successfully.'
      //         //   );
      //         // } 

      // }else {
      //         sendMessage(
      //           messages.from,
      //           errorMessageMap[buttonId]
      //         );
      //       }
    }

    if (messages.type === 'interactive') {
      if (messages.interactive.type === 'list_reply') {

        sendMessage(messages.from, `You selected the option with ID ${messages.interactive.list_reply.id} - Title ${messages.interactive.list_reply.title}`)
      }

     if (messages?.interactive?.type === 'button_reply') {

            if (messages?.interactive?.button_reply?.id === 'request_btn') {

              sendMessage(
                messages.from,
                '📝 Please enter your Request ID (example: REQ-1234)'
              );

            } else if (messages?.interactive?.button_reply?.id === 'hp_btn') {

              sendMessage(
                messages.from,
                '📝 Please enter your Request ID. (example: HP-1234)'
              );

            } else if (messages?.interactive?.button_reply?.id === 'nci_btn') {

              sendMessage(
                messages.from,
                '📝 Please enter your Request ID. (example: NCI-202512-1234)'
              );

            } else {

              sendMessage(
                messages.from,
                `You selected: ${messages?.interactive?.button_reply?.title}`
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
                id: 'request_btn',
                title: 'REQUEST'
              }
            },
            {
              type: 'reply',
              reply: {
                id: 'hp_btn',
                title: 'HOT PART'
              }
            },
            {
              type: 'reply',
              reply: {
                id: 'nci_btn',
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
