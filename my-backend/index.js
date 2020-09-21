require('dotenv-flow').config({node_env:"local"})


const express = require('express')
const app = express()
const cors = require('cors')
const Twilio = require('twilio')
const path = require('path')


const AccessToken = Twilio.jwt.AccessToken
const ChatGrant = AccessToken.ChatGrant

if(process.env.NODE_ENV == 'production')
{
  app.use(express.static(path.join(__dirname,'build')))
  app.get('*',(req,res)=>{
    res.sendFile(path.join(__dirname,'build','index.html'))
  })
}

app.use(cors())

app.get('/token/:identity', function (req, res) {
  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET,
  )

  token.identity = req.params.identity
  token.addGrant(new ChatGrant({
    serviceSid: process.env.TWILIO_CHAT_SERVICE_SID
  }))

  res.set('Content-Type', 'application/json')
  res.send({
    identity: token.identity,
    jwt: token.toJwt()
  })
})

app.listen(process.env.PORT, function () {
  console.log('Programmable Chat token server listening on port 3001!')
})
