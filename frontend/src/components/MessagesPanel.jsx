import Message from "./Message.jsx";

export default function MessagesPanel({channel}){

  return(
    <div className="messages-panel">
      <div className="messages-list">
        {channel?.messages?.map((message) => (
          <Message
            key={message.id}
            senderName={message.senderName}
            text={message.text}
          />
        )) || <p>No messages</p>}
      </div>
      <div className="messages-input">
        <input type="text" name="message" id="message" />
        <button type="submit" id="form-submit">Send</button>
      </div>
    </div>
  );
}