import React, {useEffect, useState} from 'react'
import axios from 'axios'
import TwilioChat from 'twilio-chat'
import Chat from './Chat'

//Chat
function Index() {
    const port = process.env.REACT_APP_BACKEND_PORT
    const url = 'http://localhost:'+port+'/token'+'/'

    const [messages,setMessages] = useState([])
    const [username, setUsername] = useState('')
    const [tempUsername, setTempUsername] = useState('')
    const [channel, setChannel] = useState('General')
    const [newMessage, setNewMessage] = useState('')
    const [loggedIn, setLoggedIn] = useState(false)

    const getToken = (identity) =>{
        return new Promise((resolve, reject)=>{
            setMessages([...messages, {body: 'Connecting...'}])

            axios.get(url+identity)
                .then((token)=>{
                
                // setUsername(token.data.identity)
                resolve(token.data)
            }).catch(e => reject(e))
        })
    }

    const onSubmitNewUser = e =>{
        setUsername(tempUsername)
        setLoggedIn(true)
        e.preventDefault()
    }

    const handleTempNewUser = e => setTempUsername(e.target.value)

    const addMessage = msg =>{
        const messageData = {...msg, me: msg.author === username}
        setMessages(prevMessages => [...prevMessages, messageData])
    }

    const createChatClient = token =>{
        return new Promise((resolve, reject)=>{
            resolve(new TwilioChat.create(token.jwt))
        })
        
    }

    const createGeneralChannel = chatClient => {
        return new Promise((resolve, reject)=>{
            addMessage({body:'Creating general channel...'})
            chatClient.createChannel({uniqueName:channel, friendlyName:'General Chat'})
                .then(()=> joinGeneralChannel(chatClient))
                .catch(()=> reject(Error('Could not create general channel')))
        })
    }

    const joinGeneralChannel = chatClient => {
        return new Promise((resolve,reject)=>{
            chatClient.getSubscribedChannels().then(()=>{
                chatClient.getChannelByUniqueName(channel).then((channel)=>{
                    addMessage({body:'Joining channel...'})
                    setChannel(channel)

                    channel.join().then(()=>{
                        addMessage({body:'Joined general chat as '+username})
                        window.addEventListener('beforeunload', ()=>channel.leave())
                    })
                    .catch(()=> reject(Error('Could not join general channel.')))
                    .then(()=>{
                        channel.getMessages().then(messagesLoaded)
                    })
                    .catch(()=>console.log(Error('Messages were not loaded properly.')))
                    
                    resolve(channel)

                }).catch(()=>createGeneralChannel(chatClient))
            }).catch(()=> reject(Error('Could not get channel list.')))
        })
        
    }

    const configureChannelEvents = channel =>{
        channel.on('messageAdded', ({author,body})=>{
            addMessage({author,body})
        })
        channel.on('memberJoined', member =>{
            addMessage({body: `${member.identity} has joined the channel`})
        })
        channel.on('memberLeft', member =>{
            addMessage({body: `${member.identity} has left the channel`})
            member.shutdown()
        })
    }

    const onMessageChange = e =>{
        setNewMessage(e.target.value)
    }

    const messagesLoaded = messagePage => {
        setMessages(messagePage.items)
    }

    const onSubmitNewMessage = e =>{
        e.preventDefault()
        if(channel){
            channel.sendMessage(newMessage)
        }
        setNewMessage('')
    }

    let mainAsync = async () => {
        try{
            const token = await getToken(username)
            const chatClient = await createChatClient(token)
            const channel = await joinGeneralChannel(chatClient)
            await configureChannelEvents(channel)
        }
        catch(e)
        {
            console.log(e)
        }
    }

    useEffect(()=>{
        if(loggedIn)
            mainAsync()
       //return async function?
    },[loggedIn])


 

    const renderLoggin = () =>{
        return (
            <div>
                <form onSubmit={onSubmitNewUser}>
                    <input type="text" name="username" onChange={handleTempNewUser} value={tempUsername}/>
                    <input type='submit' value='Submit'/>
                </form>
            </div>
        )
    }

    return (!loggedIn ? (renderLoggin()) 
    : <Chat 
    messages={messages} 
    onSubmitNewMessage={onSubmitNewMessage} 
    onMessageChange={onMessageChange}
    newMessage={newMessage} ></Chat>)


}

export default Index
