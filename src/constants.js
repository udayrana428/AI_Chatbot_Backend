export const UserLoginTypeEnum = {
  GOOGLE: "GOOGLE",
  GITHUB: "GITHUB",
  EMAIL_PASSWORD: "EMAIL_PASSWORD",
};

export const AvailableSocialLogins = Object.values(UserLoginTypeEnum);

export const UserRolesEnum = {
  ADMIN: "ADMIN",
  USER: "USER",
};

export const AvailableUserRoles = Object.values(UserRolesEnum);

export const DB_NAME = "Chatapp";

export const ChatEventEnum = Object.freeze({
  CONNECTED_EVENT: "connected",

  DISCONNECTED_EVENT: "disconnected",

  NEW_CHAT_EVENT: "newChat",

  JOIN_CHAT_EVENT: "joinChat",

  LEAVE_CHAT_EVENT: "leaveChat",

  MESSAGE_RECEIVED_EVENT: "messageReceived",

  MESSAGE_DELETED_EVENT: "messageDeleted",

  UPDATE_GROUP_NAME_EVENT: "updateGroupName",

  TYPING_EVENT: "typing",

  STOP_TYPING_EVENT: "stopTyping",

  SOCKET_ERROR_EVENT: "socketError",
});

export const AvailableChatEvents = Object.values(ChatEventEnum);
