import React, {useEffect, useState, useCallback} from 'react'
import axios from 'axios'
import TwilioChat from 'twilio-chat'

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
    const [client, setClient] = useState('')

    const getToken = useCallback((identity) =>{
        return new Promise((resolve, reject)=>{
            setMessages([...messages, {body: 'Connecting...'}])

            axios.get(url+identity)
                .then((token)=>{
                
                // setUsername(token.data.identity)
                resolve(token.data)
            }).catch(e => reject(e))
        })
    },[url])


    const onSubmit = e =>{
        setUsername(tempUsername)
        setLoggedIn(true)
        e.preventDefault()
    }

    const handleTempNewUser = e => setTempUsername(e.target.value)

    const addMessage = message =>{
        const messageData = {...message, me: message.author === username}
        setMessages([...messages, messageData])
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
                    }).catch(()=> reject(Error('Could not join general channel.')))

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

    const handleNewMessage = e =>{
        e.preventDefault()
        if(channel){
            console.log(channel)
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
            setClient(chatClient)

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
    },[username, getToken])

    const renderChatForm = () =>{
        return (<>
            <form onSubmit={handleNewMessage}>
                <input type="text" name="message" onChange={onMessageChange} value={newMessage}/>
                <input type="submit" value="Send"/>
            </form>
        </>)
    }

    const renderChat = () =>{
        return (<div>
            <h3>Messages</h3>
            <ul className = 'messages'>
                {console.log(messages)}
                {messages.map((m,i)=><li key={i}>{m.body}</li>)}
            </ul>
            {renderChatForm()}
        </div>)
    }

    const renderLoggin = () =>{
        return (
            <div>
                <form onSubmit={onSubmit}>
                    <input type="text" name="username" onChange={handleTempNewUser} value={tempUsername}/>
                    <input type='submit' value='Submit'/>
                </form>
            </div>
        )
    }

    return (!loggedIn ? (renderLoggin()) : (renderChat()))

 

}

export default Index
