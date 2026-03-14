// 추상 클래스: DOMController
import browser from "webextension-polyfill";

export const domMessage = {
    TYPE: 'domControl',
    ACTIVE_INPUT: 'activeInput',
    INPUT_CHAT: 'inputChat',
    SEND_CHAT: 'sendChat',
    CLICK_DCCON: 'handleDcconClick'
};

export class DOMMessageHandler {
    static async activeInput() {
        browser.runtime.sendMessage({ type:domMessage.TYPE, msg: domMessage.ACTIVE_INPUT});
    }
    static async inputChat(text: string, addFlag = true, trigInput = true, pos?: any) {
        browser.runtime.sendMessage({ type:domMessage.TYPE, msg: domMessage.INPUT_CHAT, data: {text, addFlag, trigInput, pos}});
    }
    static async sendChat(text: string, addFlag = true, trigInput = true) {
        browser.runtime.sendMessage({ type:domMessage.TYPE, msg: domMessage.SEND_CHAT,  data: {text, addFlag, trigInput}});
    }
    static handleDcconClick(text: string) {
        browser.runtime.sendMessage({ type:domMessage.TYPE, msg: domMessage.CLICK_DCCON, data: {text}});
    }
}

export abstract class DOMController {
    isActive: boolean = false;
    isInit: boolean = false;

    abstract init(): void;
    abstract activate(): void;
    abstract deactivate(): void;
    abstract sendChat(text: string): Promise<void>;
    abstract inputChat(text: string): Promise<void>;
    // 필요시 추가 메서드 정의
}
