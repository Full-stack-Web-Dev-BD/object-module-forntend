import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import jwtDecode from "jwt-decode";
import { MyContext } from "../../../../store/ContextProvider";
import { remoteProxyURL } from "../../../../config";
import { socket } from "../../../../web-sockets";

// UI
const ConversationList = () => {
  const { state, allAction } = useContext(MyContext);
  const [sockets, setSockets] = useState([]);
  const [me, setMe] = useState({});
  useEffect(() => {
    let decoded = jwtDecode(window.localStorage.getItem("chatapptoken"));
    if (decoded.id) {
      socket.on("connected", (data) => {
        setSockets(data.sockets);
        axios
          .get(`${remoteProxyURL}/users/${decoded.id}`)
          .then((resp) => {
            setMe(resp.data);
          })
          .catch((err) => {
            console.log(err);
          });
      });
    }
  }, []);

  //
  const conversationSetter = (userinfo) => {
    allAction.setactiveconversation(userinfo);
    let id1 = me.id;
    let id2 = userinfo.id;
    let activeConversationID = id1 < id2 ? `${id1}-${id2}` : `${id2}-${id1}`;
    let allMessage = state.allMessage;
    // filter message for  selected user
    let activeConversation = allMessage.filter(
      (singleMessage) => singleMessage.conversationid === activeConversationID
    );
    allAction.setActiveMessages(activeConversation);
  };
  const isActive = (_id) => {
    var i;
    for (i = 0; i < sockets.length; i++) {
      if (sockets[i].userid === _id) {
        return true;
      }
    }
    return false;
  };
  const findLastMessageBetweenMe = (userinfo) => {
    let id1 = me.id;
    let id2 = userinfo.id;
    let activeConversationID = id1 < id2 ? `${id1}-${id2}` : `${id2}-${id1}`;
    let allMessage = state.allMessage;
    // filter message for  selected user
    let activeConversation = allMessage.filter(
      (singleMessage) => singleMessage.conversationid === activeConversationID
    );
    return activeConversation ? activeConversation[0] : {};
  };
  return (
    <div id="conversation-list">
      {state.users.map((user, i) => {
        return (
          <>
            {me.id === user.id ? (
              ""
            ) : (
              <div
                onClick={(e) => conversationSetter(user)}
                key={i}
                className="conversation"
              >
                {user.img ? (
                  <img
                    src={`/images/profiles/${user.img}`}
                    alt="logo"
                    id="logo"
                  />
                ) : (
                  <div className="defaultimg">
                    <span>{user.username ? user.username.charAt(0) : "A"}</span>
                    <div
                      className="active-status"
                      style={
                        isActive(user._id) ? { background: "#1DBF73" } : {}
                      }
                    ></div>
                  </div>
                )}
                <div className="title-text">
                  {user.username ? user.username : "N/A"}
                </div>
                <div className="created-date">{"12:00"}</div>
                <div className="conversation-message">
                  {findLastMessageBetweenMe(user)
                    ? findLastMessageBetweenMe(user).body
                    : ""}
                </div>
              </div>
            )}
          </>
        );
      })}
    </div>
  );
};

export default ConversationList;
