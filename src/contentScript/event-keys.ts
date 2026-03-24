/**
 * 애플리케이션 전역에서 사용되는 이벤트 이름 상수 목록
 */
export const EVENT_KEYS = {
  URL_CHANGED: 'urlChanged',
  CHAT_CONTAINER_READY: 'chatContainerReady',
  NEW_CHAT_MESSAGE: 'newChatMessage',
  USER_KEY_DOWN: 'userKeyDown',
  USER_INPUT: 'userInput',
  INPUT_CHAT: 'inputChat',
  SEND_CHAT: 'sendChat',
  CLICK_DCCON: 'clickDccon',
  CLICK_DCCON_LONG: 'clickDcconLong',
  CLICK_DCCON_SET_EVENT: 'clickDcconSetEvent',
  USER_CLICK_SEND: 'userClickSend'
} as const;
