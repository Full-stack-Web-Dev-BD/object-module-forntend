import React, { useContext, useEffect, useState } from "react";
import { socket } from "../../../../web-sockets";
import jwtDecode from "jwt-decode";
import { MyContext } from "../../../../store/ContextProvider";
import moment from "moment";
moment(new Date());

// UI
const MessageList = () => {
  const [isTyping, setIsTyping] = useState(null);
  const { state, allAction } = useContext(MyContext);
  const [myID, setMyID] = useState();
  const [allMessage, setAllMessage] = useState([]);
  const [currentConversationID, setCurrentConversationID] = useState();

  const [typinguser, setTypinguser] = useState({});
  useEffect(() => {
    if (localStorage.getItem("chatapptoken")) {
      let decoded = jwtDecode(window.localStorage.getItem("chatapptoken"));
      setMyID(decoded.id);
      socket.on("receivemessage", (data) => {
        saver(data.data);
      });
      socket.on("partnerTyping", (data) => {
        if (typinguser.receipientid) return;
        setTypinguser(data);
        setTimeout(() => {
          setTypinguser({});
        }, 1000);
      });
    }
  }, []);

  const saver = (obj) => {
    allAction.createmessage(obj);
  };
  return (
    <div id="chat-message-list">
      {state.activeMessages.length < 1 ? (
        <div
          style={{
            textAlign: "center",
            fontSize: "26px",
            color: "gray",
            fontFamily: "cursive",
            padding: "100px 0",
          }}
        >
          <h2>Send Text to start Conversation !!</h2>
        </div>
      ) : (
        ""
      )}
      {state.activeMessages.map((item, index) => {
        return (
          <div
            key={index}
            className={`message-row ${
              myID == item.senderid ? "you-message" : "other-message"
            } `}
          >
            <div className="message-content">
              {myID == item.senderid ? (
                ""
              ) : (
                <>
                  {state.activeConversation.img ? (
                    <img
                      src={`/images/profiles/${user.img}`}
                      alt="logo"
                      id="logo"
                    />
                  ) : (
                    <div className="imagealt">
                      <span>
                        {state.activeConversation.username
                          ? state.activeConversation.username.charAt(0)
                          : "A"}
                      </span>
                    </div>
                  )}
                </>
              )}
              <div className="message-text ">{item.body}</div>
              <div className="message-time">{moment().format("lll")}</div>
            </div>
            <div style={{ padding: "30px" }}></div>
          </div>
        );
      })}
      {typinguser.senderid === state.activeConversation.id ? (
        <img className="typingstatus" src="/typing.gif" />
      ) : (
        ""
      )}
    </div>
  );
};

export default MessageList;
