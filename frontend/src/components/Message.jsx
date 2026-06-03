
export default function Message({senderName, text}) {
  return (
    <div className="message-item">
      <div><b>{senderName}:</b></div>
      <span>{text}</span>
    </div>
   );
}