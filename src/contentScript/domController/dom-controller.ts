// 추상 클래스: DOMController
import browser from "webextension-polyfill";

export const domMessage = {
    TYPE: 'domControl',
    ACTIVE_INPUT: 'activeInput',
    INPUT_CHAT: 'inputChat',
    SEND_CHAT: 'sendChat',
    NEW_CHAT: 'newChat',
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
    static async newChat(node: Node) {
        browser.runtime.sendMessage({ type:domMessage.TYPE, msg: domMessage.NEW_CHAT, data: {node}});
    }
    static handleDcconClick(text: string) {
        browser.runtime.sendMessage({ type:domMessage.TYPE, msg: domMessage.CLICK_DCCON, data: {text}});
    }
}

export abstract class DOMController {
    isActive: boolean = false;
    isInit: boolean = false;
    inputContainer?: HTMLElement | null;
    input?: HTMLElement | null;
    
    abstract init(): void;
    abstract activateChat(): Promise<boolean>;
    abstract deactivate(): void;
    abstract checkInputActive(): boolean;
    abstract sendChat(): Promise<boolean>;
    abstract inputChat(text: string, addFlag: boolean, trigInput: boolean, pos?: number): void;
    abstract checkDomReady(): Promise<boolean>;
    // 필요시 추가 메서드 정의
}
