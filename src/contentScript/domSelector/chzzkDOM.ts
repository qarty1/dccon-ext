import { DOMSelectors } from "./domSelectors";

export const ChzzkDOMSelectors: DOMSelectors = {
    layoutBody: 'layout-body',
    chatContainer: '.live_chatting_container__SvtrD',   
    chatItemContainer: '.live_chatting_list_item__0SGhw',
    chatListContainer: '.live_chatting_list_wrapper__a5XTV',
    chatText: '.live_chatting_message_text__DyleH',
    chatTextWrapper: '.live_chatting_message_wrapper__xpYre',
    chatActionArea: '.live_chatting_area__hUPJw',
    inputContainer: '.live_chatting_input_container__qA0ad',
    chatInput: '.live_chatting_input_input__2F3Et',
    chatInputInActiveTag: 'textarea',
    chatInputActiveTag: 'pre',
    chatActionButton: '.live_chatting_input_input_button__sjwrf',
    chatSendButton: '.live_chatting_input_send_button__8KBrn',
    liveContainer: '.live_container__Ccraj',
    dcconButtonAppender: '.live_chatting_input_input_button__sjwrf'
} as const;