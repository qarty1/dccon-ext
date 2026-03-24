import { DOMController } from "./dom-controller";
import { DOMSelectors } from "../domSelector/domSelectors";

export class CimeDOMController extends DOMController{
    
    domSelectors: DOMSelectors;  

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
        this.input = document.querySelector(this.domSelectors.chatInput);
        this.isInit = true;
        (window as any).domC = this;
    }

    update(data: boolean): void {
        if(data) {
            this.isActive = true;
            this.input = document.querySelector(this.domSelectors.chatInput);
        } else {
            this.isActive = false;
            this.input = null;
        }
    }

    checkInputActive(): boolean {
        // inactive 상태의 input이 존재하면 false를 리턴, 아니면 true를 리턴
        const input = document.querySelector(`${this.domSelectors.inputContainer} ${this.domSelectors.chatInputInActiveTag}`);
        if(input == null) {
            return true;
        } else {
            return false;
        }
    }
    checkDomReady(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    deactivate(): void {
        this.isInit = false;
    }
    
    async activateChat(): Promise<boolean> {
        // 구현 필요
        if(!this.isInit) {
            //console.log("ChatInputController not initialized.");
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
        return new Promise((resolve, reject) => {
            this.input?.dispatchEvent(new FocusEvent("focus", {bubbles: true, composed: true}));
            this.update(true);
            resolve(true);
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
            this.input?.dispatchEvent(new KeyboardEvent("keydown", {bubbles: true, composed: true, key: 'Enter'}));
            
            if (this.input instanceof HTMLElement) {
                this.input.innerText = "";
            }
            resolve(true);
        });
    }
}
