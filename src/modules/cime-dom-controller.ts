import { Observer } from "./observable-state";
import browser from "webextension-polyfill";
import { DOMController, DOMMessageHandler} from "./dom-controller";

const cimeDOM = {
    layoutBody: 'layout-body',
    chatContainer: 'scroll_wrapper__74953ad1',
    chatItemContainer: 'item__74953ad1',
    chatItemWrapper: 'message_list_view__74953ad1',
    chatText: 'text__74953ad1',
    chatTextWrapper: 'live_chatting_message_wrapper__xpYre',
    chatActionArea: 'stream_editor__74953ad1',
    inputContainer: 'chat_container__9f2e591a',
    chatInput: 'stream_editor_chat_editor__9f2e591a',
    chatInputInActiveTag: 'p',
    chatInputActiveTag: 'div',
    chatActionButton: 'chat_emoticon_button__f4ac3f5a',
    chatSendButton: 'editor_send__9f2e591a',
    liveContainer: 'live_container__Ccraj'
};
// ...existing code...

// ...existing code...

export class CimeDOMController extends DOMController implements Observer<boolean> {
    constructor() {
        super();
        this.isActive = false;
        this.isInit = false;
    }

    updateScribe(flag: boolean): void {
        // 옵저버 등록/해제 시 동작
        if (flag) {
            // 등록 시
        } else {
            // 해제 시
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
