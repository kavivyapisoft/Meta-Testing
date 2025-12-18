const express = require('express')
const axios = require('axios')

const WHATSAPP_ACCESS_TOKEN = "EAAKePyNJnaUBQH4IkUpUmEuk7YyCLY8SBtEhACy4E1v8dQULBV9S1fboqh3lqF80pU1htaWGEuLE7FoiJ9grjGpV7g6mi49jTeWY1SQot7axUgcP30p2Y72FV19Uj7oZBmMlmoa48r06ukkmPaUnK4AGKSJhzWYtHQU4DYy3CmGsdOTlIwMQYEdLrZC10j5QLpmH2WrKEXGZANC7dvrZATMwjpoQMFqrtfKIPYf8b38SZCRff6TT3saLopTGXEuZCMzLcZAhSdepm1F9sQaCiz8GLIQIwZDZD"
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
     const  from = messages.from
  
  if (messages) {
    // Handle received messages
    if (messages.type === 'text') {
      if (messages.text.body.toLowerCase() === 'hi') {
        replyMessage(messages.from, 'Hello 👋 How can I help you today?', messages.id);
        sendReplyButtons(messages.from)
      }

      if (messages.text.body.toLowerCase() === 'list') {
        sendList(messages.from)
      }

      if (messages.text.body.toLowerCase() === 'buttons') {
        sendReplyButtons(messages.from)
      }
      
        const patterns = {
          requesttemp: /^REQ-\d{4}$/i,
          hotparttemp: /^HP-\d{4}$/i,
          dailydemandtemp: /^DD-\d{4}$/i,
          ncitemp: /^NCI-\d{6}-\d{4}$/i
        };
          const userInput = messages.text.body.trim().replace(/\s+/g, '');
      
      if (patterns.requesttemp.test(userInput)) {
            console.log('✅ REQUEST matched');
        replyMessage(messages.from, 
          '✅ Thank you! Your Request ID has been verified successfully.', 
          messages.id)
      }

      if (patterns.hotparttemp.test(userInput)) {
          console.log('✅ REQUEST matched');
            const match = userInput.match(/^HP-(\d{4})$/i);
          if (match) {
            const numberOnly = match[1];
            const ApiUrl = 'hotparts';
            const title = 'Hot Parts';              
            hpAndDD(
              ApiUrl,
              title,
              numberOnly,
              from
             )
            
          }
      } 
      if (patterns.dailydemandtemp.test(userInput)) {
          console.log('✅ REQUEST matched');
            const match = userInput.match(/^DD-(\d{4})$/i);
          if (match) {
            const numberOnly = match[1];
            const ApiUrl = 'Daily%20Demand';
            const title = 'Daily Demand';

             hpAndDD(
              ApiUrl,
              title,
              numberOnly,
              from
             )
          }
      }

      if (patterns.ncitemp.test(userInput)) {
         console.log('✅ REQUEST matched');
         replyMessage(messages.from, 
          '✅ Thank you! Your NCI number has been verified successfully.', 
          messages.id)
      } 
            
    }

    if (messages.type === 'interactive') {
      if (messages.interactive.type === 'list_reply') {

        sendMessage(messages.from, `You selected the option with ID ${messages.interactive.list_reply.id} - Title ${messages.interactive.list_reply.title}`)
      }

     if (messages?.interactive?.type === 'button_reply') {

            if (messages?.interactive?.button_reply?.id === 'request_btn') {

            replyMessage(messages.from, '📝 Please enter your Request ID (example: REQ-1234)', messages.id)
            

            } else if (messages?.interactive?.button_reply?.id === 'hp_btn') {

              sendMessage(
                messages.from,
                '📝 Please enter your Request ID. (example: HP-1234)'
              );

            }  else if (messages?.interactive?.button_reply?.id === 'dd_btn') {

              sendMessage(
                messages.from,
                '📝 Please enter your Request ID. (example: DD-1234)'
              );

            }  else if (messages?.interactive?.button_reply?.id === 'nci_btn') {

              sendMessage(
                messages.from,
                '📝 Please enter your Request ID. (example: NCI-202512-1234)'
              );

            }   
      }

    }
    
    
    console.log(JSON.stringify(messages, null, 2))
  }
  
  res.status(200).send('Webhook processed')
})

async function hpAndDD(apiurl, title, value, from) {
  try {
   const apiResponse = await axios.get(
                  `https://zfdevapi.sunlandls.com/ctarmticket/Hotparts/Getdetailsbyid?Type=${apiurl}&TicketId=${value}`
                );

                const data = apiResponse.data[0];

                let TempSend =`
🚨 Basic Information
 Id : ${data.id}
 Storer :${ data.storer}
 Sku : ${data.Sku}
 Item Description : ${data.itemdescription}
 Grn : ${data.Grn}
 Status : ${data.status}
 Type : ${data.Type}
 MRP Code : ${data.MRPCode}
 Quantity : ${data.Quantity}
 Available Quantity : ${data.AvailableQuantity}
 Category : ${data.Category}
 Department : ${data.Department}
 Demand Date : ${data.DemandDate}
 Priority : ${data.Priority}
 Priority Code : ${data.PriorityCode}
 Latest Hotpart_reasoncodes : ${data.Latesthotpart_reasoncodes}
 Trailer Number : ${data.TRAILERNUMBER}
 Created At :${data.CreatedAt}
 Created By User : ${data.CreatedByUser}
 Edited At : ${data.EditedAt}
 Edited By User : ${data.editedbyuser}
 Assigned To Email : ${data.assignedtoemail}
 ✅ Thank you!
  `
                sendMessage(
                  messages.fromfrom,
                  TempSend
                );

  } catch (error) {
        sendMessage(
           messages.from,
           `❌ Sorry,  ${title} +'  '+ ${userInput} not found.\nPlease check and try again.`
         );
  }
}

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
                id: 'dd_btn',
                title: 'DAILY DEMAND'
              }
            },
            // {
            //   type: 'reply',
            //   reply: {
            //     id: 'nci_btn',
            //     title: 'NCI'
            //   }
            // }
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
