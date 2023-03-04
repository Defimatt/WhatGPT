import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
const app = express()

import bodyParser from 'body-parser'
app.use(bodyParser.urlencoded({ extended: true }))

import twilio from 'twilio'
const { MessagingResponse } = twilio.twiml

import { ChatGPTAPI } from 'chatgpt'

app.post('/sms', async (req, res) => {
  const chatGpt = new ChatGPTAPI({
    apiKey: process.env.OPENAI_API_KEY
  })

  const twiml = new MessagingResponse();
  const aiResponse = (await chatGpt.sendMessage(req.body.Body)).text

  twiml.message(aiResponse);

  res.type('text/xml').send(twiml.toString());
});

app.listen(3000, () => {
  console.log('Express server listening on port 3000')
});
