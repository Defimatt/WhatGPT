import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
const app = express()

import bodyParser from 'body-parser'
app.use(bodyParser.urlencoded({ extended: true }))

import twilio from 'twilio'
const { MessagingResponse } = twilio.twiml

import { ChatGPTAPI } from 'chatgpt'
import fs from 'fs'
import { spawn } from 'child_process';

const runPythonScript = async (audioFilePath) => {
  const pythonProcess = spawn('./venv/bin/python3', ['./transcribe.py', audioFilePath, process.env.OPENAI_API_KEY]);

  let transcript = '';

  for await (const data of pythonProcess.stdout) {
    transcript += data.toString();
  }

  let error = '';

  for await (const data of pythonProcess.stderr) {
    error += data.toString();
  }

  const exitCode = await new Promise((resolve) => {
    pythonProcess.on('close', resolve);
  });

  if (exitCode !== 0) {
    throw new Error(`Python script exited with code ${exitCode}. Error: ${error}`);
  }

  return transcript;
};




app.post('/sms', async (req, res) => {
  const chatGpt = new ChatGPTAPI({
    apiKey: process.env.OPENAI_API_KEY
  })

  let chat = ""

  if (!!req.body.MediaUrl0) {
    const audioUrl = req.body.MediaUrl0
    const audio = new Uint8Array([...new Uint8Array(await fetch(audioUrl).then(res => res.arrayBuffer()))])
    
    const audioFile = `./audio/${Date.now()}.ogg`
    fs.writeFileSync(audioFile, Buffer.from(audio))

    const transcription = JSON.parse(await runPythonScript(audioFile))
    chat = transcription.text
  } else {
    chat = req.body.Body
  }

  const twiml = new MessagingResponse();
  const aiResponse = (await chatGpt.sendMessage(chat)).text

  twiml.message(aiResponse);

  res.type('text/xml').send(twiml.toString());
});

app.listen(3000, () => {
  console.log('Express server listening on port 3000')
});
