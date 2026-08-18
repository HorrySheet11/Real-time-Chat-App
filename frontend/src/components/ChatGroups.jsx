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
    <div className="absolute top-0 left-0  w-min p-3  border-r h-full ">
      <ul className="flex flex-col gap-2">
        {chatGroups.map((group) => (
          <li key={group.info.uuid} className='bg-slate-800 px-2 py-0.5 rounded-sm '>
            <button
              type="button"
              className=" cursor-pointer"
              onClick={() => changeChatGroup(group.name)}
            >
              {group.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}