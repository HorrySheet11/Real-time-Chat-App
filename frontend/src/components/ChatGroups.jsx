import { useContext } from "react";
import { ChatContext } from "../context/ChatContext";

export default function ChatGroups() {
  const { setChatGroup, chatGroups, socket } = useContext(ChatContext);

  async function changeChatGroup(chatGroup) {
    // console.log(`changed to ${chatGroup}`);
    socket.emit("change_collection", chatGroup);
    setChatGroup(chatGroup);
  }

  return (
    <div className="w-40 p-3 border-r shrink-0 flex flex-col">
      <ul className="flex flex-col flex-1 overflow-y-auto gap-2">
        {chatGroups.map((group) => (
          <li
            key={group.info.uuid}
            className='bg-slate-800 px-2 py-0.5 rounded-sm cursor-pointer hover:bg-slate-700'
            onClick={() => {changeChatGroup(group.name)}}
            onKeyPress={() => {}}
          >
            {group.name}
          </li>
        ))}
      </ul>
    </div>
  );
}