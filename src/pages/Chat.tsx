import { useEffect, useRef, useState } from "react";
import Input from "../components/form/input/InputField";
import Button from "../components/ui/button/Button";
import { PaperPlaneIcon } from "../icons";
import TextAreaInput from "../components/form/form-elements/TextAreaInput";
import io, { Socket } from "socket.io-client";
import axios from "axios";
import { getUserIdFromLocalStorage } from "../components/common/utils";
import moment from "moment";

const host = `${import.meta.env.VITE_API_URL}`

type Chat = {
  name: string;
  avatar: string;
  time: string;
  opponentId: string;
};

type Message = {
  senderId: string;
  receiverId: string | undefined;
  content: string;
  createdAt: string;
};

export default function ChatApp() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const [id, setId] = useState<string | null>(null);

  const [newMessage, setNewMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const userId = getUserIdFromLocalStorage()

  useEffect(() => {
    socketRef.current = io(host)

    if (socketRef.current) {
      socketRef.current.on('getId', (data: string) => {
        setId(data);
      })
      socketRef.current.on('sendDataServer', dataGot => {
        setMessages(oldMsgs => [...oldMsgs, dataGot.data.data])
      })
      return () => {
        socketRef.current?.disconnect();
      };
    }

  }, []);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        await axios.get(`${import.meta.env.VITE_API_URL}/user/fetch-chat-history/${userId}`).then(res => {
          setChats(res.data)
        })
      } catch (error) {
        console.log(error)
      }
    }
    fetchChatHistory()
  }, [])

  const sendMessage = () => {
    if (newMessage.trim()) {
      setNewMessage("");

      socketRef.current?.emit('sendDataClient', {
        id: id,
        data: {
          senderId: userId,
          receiverId: selectedChat?.opponentId,
          content: newMessage,
          createdAt: moment().format('YYYY-MM-DD HH:mm:ss')
        },
      });
    }
  };

  const loadMessageHistory = async ({opponentId}: {opponentId: string}) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/user/load-message-history`, {
        userId: userId,
        opponentId: opponentId
      })
      setMessages(res.data)
    } catch (error) {
      console.log(error)
    }
  }


  const handleChatClick = (chat: Chat) => {
    setSelectedChat(chat);
    loadMessageHistory({opponentId: chat.opponentId})
  }
  return (
    <div className="h-screen w-full flex bg-white dark:bg-dark-900 text-gray-900 dark:text-white">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto bg-gray-100 dark:bg-gray-800">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Chats</h2>
        <Input placeholder="Search..." className="mb-4 bg-gray-100 dark:bg-gray-800" />
        <div className="space-y-4">
          {chats.map((chat, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" onClick={() => handleChatClick(chat)}>
              <div className="relative">
                <img src={chat.avatar} alt={chat.name} className="w-10 h-10 rounded-full" />
              </div>
              <div>
                <div className="font-medium">{chat.name}</div>
                <div className="text-gray-500 dark:text-gray-400 text-sm">{chat.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {selectedChat && (
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-100 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <img src={selectedChat?.avatar} alt={selectedChat?.name} className="w-10 h-10 rounded-full" />
            <div className="text-sm dark:text-white text-gray-900">{selectedChat?.name}</div>
          </div>

        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-100 dark:bg-gray-800">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.senderId === userId
                ? 'justify-end'
                : 'justify-start'
                }`}>
              <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.senderId === userId
                ? 'bg-blue-600 text-white'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}>
                {msg.content}
                {msg.senderId && <div className={`${msg.senderId === userId ? 'text-right text-gray-100 text-sm' : 'text-right text-gray-500 dark:text-white text-sm'} `}>{moment(msg.createdAt).format('HH:mm DD/MM/YYYY')}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="flex p-4 border-t border-gray-200 dark:border-gray-700 items-center gap-2 bg-gray-100 dark:bg-gray-800">
          <TextAreaInput
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 w-full"
          />
          <Button size="sm" onClick={sendMessage}><PaperPlaneIcon /></Button>
          </div>
        </div>
      )}
      {!selectedChat && (
        <div className="flex-1 flex flex-col items-center justify-center dark:bg-gray-800">
          <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Chọn một cuộc hội thoại để bắt đầu</h1>
        </div>
      )}
    </div>
  );
}
