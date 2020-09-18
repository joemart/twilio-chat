//

const accountSid = 'AC3c8a7fd1614c28153e37db964e496df7';
const authToken = '744cd9ff40c41ee15f608abd461f85e7';

const client = require('twilio')(accountSid, authToken);

const displayChannels = () =>{
    client.chat.v1.services('IS06453e11f29543d0b70589adea2b14f3')
              .channels
              .list({limit: 20})
              .then(channels => channels.forEach(c => console.log(c.sid)));

}

const deleteChannels = () =>{
    client.chat.services('IS06453e11f29543d0b70589adea2b14f3')
              .channels
              .list({limit:20})
              .then(channels => channels.forEach(channel=> channel.remove()))
}

const displayUsers = () =>{
client.chat.v1.services('IS06453e11f29543d0b70589adea2b14f3')
    .users
    .list({limit: 20})
    .then(users => users.forEach(user=> console.log(user.sid)))

}

const deleteUsers = () =>{
    client.chat.services('IS06453e11f29543d0b70589adea2b14f3')
           .users
           .list()
            .then(users => users.forEach(user=> user.remove()))
}
