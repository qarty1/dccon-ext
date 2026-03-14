import browser from "webextension-polyfill";
import { DOMController, DOMMessageHandler } from "./dom-controller";
import { Observer } from "./observable-state";

const chzzkDOM = {
    layoutBody: 'layout-body',
    chatContainer: 'live_chatting_container__SvtrD',
    chatItemContainer: 'live_chatting_list_item__0SGhw',
    chatItemWrapper: 'live_chatting_list_wrapper__a5XTV',
    chatText: 'live_chatting_message_text__DyleH',
    chatTextWrapper: 'live_chatting_message_wrapper__xpYre',
    chatActionArea: 'live_chatting_area__hUPJw',
    inputContainer: 'live_chatting_input_container__qA0ad',
    chatInput: 'live_chatting_input_input__2F3Et',
    chatInputInActiveTag: 'textarea',
    chatInputActiveTag: 'pre',
    chatActionButton: 'live_chatting_input_input_button__sjwrf',
    chatSendButton: 'live_chatting_input_send_button__8KBrn',
    liveContainer: 'live_container__Ccraj'
};

// ...existing code...

export class ChzzkDOMController extends DOMController implements Observer<boolean> {
    constructor() {
        super();
        this.isActive = false;
        this.isInit = false;
    }

    updateScribe(flag: boolean): void {
        // 옵저버 등록/해제 시 동작
        if (flag) {
            // 등록 시
            // 예: inputContainer, input 등 초기화
        } else {
            // 해제 시
            // 예: inputContainer, input 등 해제
        }
    }

    update(data: boolean): void {
        // 상태 변경 시 동작
        this.isActive = data;
        // 필요시 추가 동작 구현
    }
    init(): void {
        // 구현 필요
    }
    activate(): void {
        // 구현 필요
    }
    deactivate(): void {
        // 구현 필요
    }
    async sendChat(text: string): Promise<void> {
        await DOMMessageHandler.sendChat(text);
    }
    async inputChat(text: string): Promise<void> {
        await DOMMessageHandler.inputChat(text);
    }
}
