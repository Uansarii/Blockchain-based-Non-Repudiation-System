import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import GunContext from "../contexts/gun";
import { format } from "date-fns";
import { Message } from "../utils/constants";
import {
  broadcastSendMessage,
  verifyBroadcastedMessage,
} from "../utils/blockchain";

const crypto = window.crypto.subtle;

const AVATAR_API = `https://api.dicebear.com/7.x/pixel-art/svg`;

const ChatPage = () => {
  const params = useParams();
  const navigate = useNavigate();

  const { username, malicious } = params;
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const [privateKey, setPrivateKey] = useState<CryptoKey>();

  const gun = useContext(GunContext);
  if (!gun) {
    throw new Error("Gun not found");
  }

  if (malicious === "1") {
    alert("Malicious Intervention Detected, Please be careful");
  }

  // Get all previous messages for display
  useEffect(() => {
    gun
      .get("chat")
      .map()
      .once(message => {
        setMessages(prev => [
          ...prev,
          {
            from: message.from,
            message: message.message,
            timestamp: message.timestamp,
          },
        ]);
      });

    gun.get("broadcast").on(async data => {
      if (data.username === username) return;

      await verifyBroadcastedMessage(
        data.username,
        // Man in the middle modified the broadcast message
        "Malicious Message",
        "Malicious Signature",
        gun,
        success => {
          if (success) {
            gun
              .get("records")
              .get(username as string)
              .put(data);
            console.log("Verified and stored");
          } else {
            alert(
              "Verification of Broadcasted Message Failed, Malicious Intervention Detected. Please be careful"
            );
          }
        }
      );
    });
  }, [gun]);

  // Key Use Effect
  useEffect(() => {
    const getKeys = async () => {
      const privateKeyString = localStorage.getItem(`${username}-privateKey`);
      if (!privateKeyString) {
        alert("Error, could not find key");
        navigate("/");
        return;
      }

      const key = await crypto.importKey(
        "jwk",
        JSON.parse(privateKeyString),
        {
          name: "ECDSA",
          namedCurve: "P-384",
        },
        true,
        ["sign"]
      );
      setPrivateKey(key);
      console.log("Key Read Successfully");
    };

    getKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMessageSend = async () => {
    if (!inputMessage) {
      alert("Please enter a message");
      return;
    }

    const data: Message = {
      from: username as string,
      message: inputMessage,
      timestamp: Date.now(),
    };

    gun.get("chat").get(`${username}-${Date.now()}`).put(data);

    // Broadcasting the events
    const dataWritten = await broadcastSendMessage(
      data,
      privateKey as CryptoKey,
      gun
    );

    // Storing on self record
    gun
      .get("records")
      .get(username as string)
      .put(
        malicious === "1"
          ? dataWritten
          : {
              ...dataWritten,
              message: "Malicious Message",
            }
      );

    console.log({ dataWritten });
    console.log("Sent and stored");

    setInputMessage("");
  };

  return (
    <>
      <Navbar username={username} />
      {/* Container */}
      <div className="flex flex-col items-center justify-between h-4/5">
        {/* Chat Window */}
        <div className="flex flex-col w-full h-full p-3 space-y-3 overflow-y-scroll bg-slate-400">
          {/* Message Bubbles */}
          {messages.map(msg => {
            return (
              <div
                key={msg.timestamp + msg.from}
                className="flex items-start gap-2.5"
                style={{
                  marginLeft: username === msg.from ? "auto" : undefined,
                }}
              >
                <img
                  className="w-8 h-8 rounded-full"
                  src={`${AVATAR_API}?seed=${msg.from}`}
                  alt={username}
                />
                <div className="flex flex-col gap-1 w-full max-w-[320px]">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {msg.from}
                    </span>
                    <span className="text-sm text-white font-semi opacity-80">
                      {format(new Date(msg.timestamp), "hh:mm a")}
                    </span>
                  </div>
                  <div className="flex flex-col leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
                    <p className="text-sm font-normal text-gray-900 dark:text-white">
                      {msg.message}
                    </p>
                  </div>
                </div>
                {/* <button
                  id="dropdownMenuIconButton"
                  data-dropdown-toggle="dropdownDots"
                  data-dropdown-placement="bottom-start"
                  className="inline-flex items-center self-center p-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 dark:focus:ring-gray-600"
                  type="button"
                >
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 4 15"
                  >
                    <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                  </svg>
                </button>
                <div
                  id="dropdownDots"
                  className="z-10 hidden w-40 bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600"
                >
                  <ul
                    className="py-2 text-sm text-gray-700 dark:text-gray-200"
                    aria-labelledby="dropdownMenuIconButton"
                  >
                    <li>
                      <a
                        href="#"
                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        Reply
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        Forward
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        Copy
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        Report
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        Delete
                      </a>
                    </li>
                  </ul>
                </div> */}
              </div>
            );
          })}
        </div>
        {/* Input field */}
        <div className="flex items-center justify-center w-full gap-0 space-y-4 border">
          <input
            type="text"
            placeholder="Message"
            value={inputMessage}
            className="flex-[4] p-2 text-black"
            onChange={e => setInputMessage(e.target.value)}
            required
          />
          <button
            style={{ margin: 0 }}
            onClick={handleMessageSend}
            className="flex-[1] p-2 text-white bg-pink-700 rounded-md"
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatPage;
