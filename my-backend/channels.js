//
require('dotenv-flow').config({node_env:"local"})

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);
const service_id = process.env.TWILIO_CHAT_SERVICE_SID

const displayChannels = (service_id) =>{
    client.chat.v1.services(service_id)
              .channels
              .list()
              .then(channels => channels.forEach(c => console.log(c.sid)));

}

const deleteChannels = (service_id) =>{
    client.chat.services(service_id)
              .channels
              .list()
              .then(channels => channels.forEach(channel=> channel.remove()))
}

const displayUsers = (service_id) =>{
client.chat.services(service_id)
    .users
    .list()
    .then(users => users.forEach(user=> console.log(user.sid)))

}

const deleteUsers = (service_id) =>{
    client.chat.services(service_id)
           .users
           .list()
            .then(users => users.forEach(user=> user.remove()))
}


// deleteUsers(service_id)
// deleteChannels(service_id)
// displayUsers(service_id)
// displayChannels(service_id)
// removeOneChannel()