import React from 'react'

function Chat({messages, onSubmitNewMessage, onMessageChange, newMessage}) {
    
    const renderChatForm = () =>{
        return (<>
            <form onSubmit={onSubmitNewMessage}>
                <input type="text" name="message" onChange={onMessageChange} value={newMessage}/>
                <input type="submit" value="Send"/>
            </form>
        </>)
    }

    const renderChat = () =>{
        return (<div>
            
            <h3>Messages</h3>
            <ul className = 'messages'>

        {messages.map((m,i)=>  (m.author ? 
        <li key={i}>{m.author} : {m.body}</li> : 
        <li key={i}>{m.body}</li>))}
            </ul>
            {renderChatForm()}
        </div>)
    }

    //try and trigger event listener memberLeft
    const logOut = () =>{
        return (<div>
            <form ></form>
        </div>)
    }
    
    return (
        <div>
            {renderChat()}
        </div>
    )
}

export default Chat
