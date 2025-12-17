const express=require("express");
const body_parser=require("body-parser");
const axios=require("axios");
require('dotenv').config();

const app=express().use(body_parser.json());

const token=process.env.TOKEN;
const mytoken=process.env.MYTOKEN;//prasath_token

app.listen(process.env.PORT,()=>{
    console.log("webhook is listening");
});

//to verify the callback url from dashboard side - cloud api side
app.get("/webhook",(req,res)=>{
   let mode=req.query["hub.mode"];
   let challange=req.query["hub.challenge"];
   let token=req.query["hub.verify_token"];


    if(mode && token){

        if(mode==="subscribe" && token===mytoken){
            res.status(200).send(challange);
        }else{
            res.status(403);
        }

    }

});

app.post("/webhook", async (req, res) => {
  try {
    const body_param = req.body;

    console.log(JSON.stringify(body_param, null, 2));

    // Validate webhook structure
    if (
      body_param.object &&
      body_param.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
    ) {
      console.log("Inside body param");

      const value = body_param.entry[0].changes[0].value;

      const phone_no_id = value.metadata.phone_number_id;
      const from = value.messages[0].from;

      // Handle text messages safely
      const msg_body = value.messages[0].text?.body || "";

      console.log("phone number:", phone_no_id);
      console.log("from:", from);
      console.log("message:", msg_body);

      // Send reply
      await axios.post(
        `https://graph.facebook.com/v18.0/${phone_no_id}/messages`,
        {
          messaging_product: "whatsapp",
          to: from,
          text: {
            body:msg_body
          }
        },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      return res.sendStatus(200);
    }

    // If webhook event is not a message
    return res.sendStatus(200);

  } catch (error) {
    console.error("Webhook error:", error.response?.data || error.message);
    return res.sendStatus(500);
  }
});


app.get("/",(req,res)=>{
    res.status(200).send("hello this is webhook setup");
});
