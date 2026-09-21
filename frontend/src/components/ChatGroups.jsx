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
    <div className="w-[50px] 2xs:w-[40px] xs:w-[45px] sm:w-40 md:w-50 p-2 2xs:p-1 xs:p-1.5 sm:p-3 border-r shrink-0 h-full flex flex-col">
      <ul className="flex flex-col flex-1 overflow-y-auto gap-1.5 2xs:gap-0.5 xs:gap-1 sm:gap-1.5 md:gap-2">
        {chatGroups.map((group) => (
          <li
            key={group.info.uuid}
            className='bg-slate-800 px-2 2xs:px-1 xs:px-1.5 sm:px-2 py-0.5 2xs:py-0.5 xs:py-0.5 sm:py-1 rounded-sm cursor-pointer hover:bg-slate-700'
            onClick={() => {changeChatGroup(group.name)}}
            onKeyPress={() => {}}
          >
            {group.name.length > 15 ? (
              <span className="text-xs 2xs:text-[10px] xs:text-sm sm:text-base">{group.name.substring(0, 15)}...</span>
            ) : (
              <span className="text-xs 2xs:text-[10px] xs:text-sm sm:text-base">{group.name}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}