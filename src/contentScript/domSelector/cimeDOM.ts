import { DOMSelectors } from "./domSelectors";

export const CimeDOMSelctors: DOMSelectors = {
    layoutBody: 'layout-body',
    chatContainer: '[data-rune=LiveChatView]',
    chatItemContainer: '[data-rune=MessageItemView]',
    chatListContainer: '[data-rune=MessageListView]',
    chatText: '[data-rune=MessageItemView] .text__74953ad1',
    chatTextWrapper: 'live_chatting_message_wrapper__xpYre',
    chatActionArea: '[data-rune=StreamEditorView]',
    inputContainer: '.editor_input__9f2e591a',
    chatInput: '[data-rune=ChatEditor]',
    chatInputInActiveTag: 'p',
    chatInputActiveTag: 'div',
    chatActionButton: '.editor_actions__9f2e591a',
    chatSendButton: '.editor_send__9f2e591a',
    liveContainer: 'live_container__Ccraj',
    dcconButtonAppender: '[data-rune=ChatEmoticonButtonView]'
} as const;