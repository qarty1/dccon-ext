import browser from "webextension-polyfill";
import { DOMController, DOMMessageHandler } from "./dom-controller";
import { DOMSelectors } from "../domSelector/domSelectors";
// ...existing code...

export class ChzzkDOMController extends DOMController {


    domSelectors: DOMSelectors;  
    private stateObserver?: MutationObserver;
  
    constructor(domSelectors: DOMSelectors) {
        super();
        this.domSelectors = domSelectors;
        this.isActive = false;
        this.isInit = false;
        this.inputContainer = undefined;
        this.input = undefined;
    }

    init(): void {
        this.inputContainer = document.querySelector(this.domSelectors.inputContainer);
        
        // 초기 상태 설정
        this.update(this.checkInputActive());

        // 사용자의 마우스 클릭 등으로 인한 DOM 변경(태그 스왑)을 자동 감지하여 상태 동기화
        if (this.inputContainer) {
            this.stateObserver = new MutationObserver(() => {
                const isActiveNow = this.checkInputActive();
                if (this.isActive !== isActiveNow) {
                    this.update(isActiveNow);
                }
            });
            this.stateObserver.observe(this.inputContainer, { childList: true, subtree: true });
        }

        this.isInit = true;
        console.log("CHZZK DOM CONTROLLER initialized.");
        //console.log(this.input);
        (window as any).domC = this;
    }

    checkDomReady(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    checkInputActive(): boolean {
        if(document.querySelector(`${this.domSelectors.chatInputActiveTag}${this.domSelectors.chatInput}`) != undefined) {
            return true;
        } else {
            return false;
        }
    }

    update(data: boolean): void {
        if(data) {
            this.isActive = true;
            this.input = document.querySelector(`${this.domSelectors.chatInputActiveTag}${this.domSelectors.chatInput}`);
        } else {
            this.isActive = false;
            this.input = document.querySelector(`${this.domSelectors.chatInputInActiveTag}${this.domSelectors.chatInput}`);
        }
    }
    activate(): void {
        // 구현 필요
    }
    deactivate(): void {
        if (this.stateObserver) {
            this.stateObserver.disconnect();
            this.stateObserver = undefined;
        }
        this.isInit = false;
    }
    async activateChat(): Promise<boolean> {
        if(!this.isInit) {
            //("ChatInputController not initialized.");
            return new Promise((resolve, reject) => {
                //this.update(true);
                resolve(false);
            });
        }
        if(this.checkInputActive()) {
            return new Promise((resolve, reject) => {
                this.update(true);
                resolve(true);
            });
        }
        return new Promise((resolve) => {
            this.input?.dispatchEvent(new FocusEvent("focusin", {bubbles: true, composed: true}));
            
            // 이벤트 발생 직후 이미 DOM이 변경되었을 수도 있으므로 한 번 검사
            if (this.checkInputActive()) {
                this.update(true);
                return resolve(true);
            }

            let timeoutId: number;
            
            const observer = new MutationObserver((mutations, obs) => {
                if (this.checkInputActive()) {
                    obs.disconnect();
                    clearTimeout(timeoutId);
                    this.update(true);
                    resolve(true);
                }
            });

            // inputContainer 하위의 자식 노드 변경 및 속성 변경을 감지합니다.
            const target = this.inputContainer || document.body;
            observer.observe(target, { childList: true, subtree: true, attributes: true });

            // 500ms 안에 활성화되지 않으면 옵저버를 끄고 실패 처리 (무한 대기 방지)
            timeoutId = window.setTimeout(() => {
                observer.disconnect();
                console.warn("Chat activation timeout.");
                resolve(false);
            }, 500);
        });
    }
    
    inputChat(text: string, addFlag: boolean = true, trigInput: boolean = true, pos?: number): void {
        if(!this.isInit || !this.input) {
            //console.log("ChatInputController not initialized.");
            return;
        }

        if(!this.isActive || !(this.input instanceof HTMLElement)) {
            return;
        }
        
        const inputEl = this.input;
        var sel = window.getSelection();
        
        if(addFlag) {
            if(pos == undefined || pos > inputEl.innerText.length) {
                inputEl.innerText += text;
            } else {
                inputEl.innerText = inputEl.innerText.substring(0,pos) + text + inputEl.innerText.substring(pos, inputEl.innerText.length-1);
            }
        } else {
            if(pos == undefined || pos > inputEl.innerText.length) {
                inputEl.innerText = text;
            } else {
                inputEl.innerText = inputEl.innerText.substring(0,pos) + text;
            }
        }

        var range = document.createRange();
        range.selectNodeContents(inputEl);
        range.collapse(false);
        if (sel) {
            sel.removeAllRanges();
            sel.addRange(range);
        }
        
        if(trigInput) {
            inputEl.dispatchEvent(new InputEvent('input', {bubbles: true,cancelable: true, inputType: 'insertText',  data: ''}));
        }
    }
    async sendChat(): Promise<boolean> {
        if(!this.isInit || !this.input) {
            //console.log("ChatInputController not initialized.");
            return false;
        }
        return new Promise((resolve) => {
            this.input?.dispatchEvent(new InputEvent('input', {bubbles: true,cancelable: true, inputType: 'insertText',  data: '\n',}));
            this.input?.dispatchEvent(new KeyboardEvent("keypress", {bubbles: true, composed: true, keyCode: 13}));
            
            if (this.input instanceof HTMLElement) {
                this.input.innerText = "";
            }
            resolve(true);
        });
    }
}
