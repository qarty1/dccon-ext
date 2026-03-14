var browser = require("webextension-polyfill");

const chzzkDOM = { 
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
const domMessage = {
    TYPE: 'domControl',
    ACTIVE_INPUT: 'activeInput',
    INPUT_CHAT: 'inputChat',
    SEND_CHAT: 'sendChat',
    CLICK_DCCON: 'handleDcconClick'
}

class DOMMessageHandler {
    constructor() {
    }
    
    static async activeInput() {
        /*const {result} = await browser.runtime.sendMessage({ type:domMessage.TYPE, msg: domMessage.ACTIVE_INPUT});
        console.log(result);
        return result;*/
        browser.runtime.sendMessage({ type:domMessage.TYPE, msg: domMessage.ACTIVE_INPUT});
    }

    static async inputChat(text, addFlag = true, trigInput = true, pos = undefined) {
        /*const {result} = await browser.runtime.sendMessage({ type:domMessage.TYPE, msg: domMessage.INPUT_CHAT, data: {text, addFlag, trigInput}});
        return result;*/
        browser.runtime.sendMessage({ type:domMessage.TYPE, msg: domMessage.INPUT_CHAT, data: {text, addFlag, trigInput, pos}});
    }

    static async sendChat(text, addFlag = true, trigInput = true) {
        /*const {result} = await browser.runtime.sendMessage({ type:domMessage.TYPE, msg: domMessage.SEND_CHAT});
        return result;*/
        browser.runtime.sendMessage({ type:domMessage.TYPE, msg: domMessage.SEND_CHAT,  data: {text, addFlag, trigInput}});
    }

    static handleDcconClick(text) {
        /*const {result} = await browser.runtime.sendMessage({ type:domMessage.TYPE, msg: domMessage.CLICK_DCCON, data: text});
        return result;*/
        browser.runtime.sendMessage({ type:domMessage.TYPE, msg: domMessage.CLICK_DCCON, data: {text}});
    }
}

class ChzzkDOMController {
    constructor() {
        this.isActive = false;
        this.isInit = false;
        this.adjustOffset = 0;
    }

    init() {
    }

    checkInputActive() {
        if(document.querySelectorAll(`${chzzkDOM.chatInputActiveTag} ${chzzkDOM.chatInputInActiveTag}`)[0] == undefined) {
            return true;
        } else {
            return false;
        }
    }
    updateScribe(scribe) {
        if(scribe) {  
            this.inputContainer = document.getElementsByClassName(chzzkDOM.inputContainer)[0];
            this.input = document.getElementsByClassName(chzzkDOM.chatInput)[0];
            this.isInit = true;
            console.log("ChatInputController scribe.");
        } else {
            this.inputContainer = undefined;
            this.input = undefined;
            this.isInit = false;
            console.log("ChatInputController unscribe.");
        }
    }
    update(state) {
        if(state) {
            this.isActive = true;
            this.input = document.querySelectorAll(`${chzzkDOM.chatInputActiveTag}.${chzzkDOM.chatInput}`)[0];
            
            this.input.addEventListener("input", (e) => {
                if(this.adjustOffset > window.getSelection().anchorOffset) {
                    this.adjustOffset = window.getSelection().anchorOffset;
                }
                if(e.data == " ") {
                    this.adjustOffset = window.getSelection().anchorOffset;
                }
            });
        } else {
            this.isActive = false;
            this.input = document.querySelectorAll(`${chzzkDOM.chatInputInActiveTag}.${chzzkDOM.chatInput}`)[0];
        }
    }

    getTextRangeAroundCaretLast() {
        var sel = window.getSelection();
        if (sel.rangeCount > 0) {
            var range = sel.getRangeAt(0).cloneRange();
            range.collapse(true);
    
            range.setStart(range.startContainer, 0);
            range.setEnd(range.endContainer, range.endOffset);
    
            return range.toString().substring(range.toString().length-1);
        }
        return '';
    }

    getTextRangeAroundCaret() {
        var sel = window.getSelection();
        if (sel.rangeCount > 0) {
            var range = sel.getRangeAt(0).cloneRange();
            range.collapse(true);
    
            range.setStart(range.startContainer, 0);
            range.setEnd(range.endContainer, range.endOffset);
    
            return range.toString();
        }
        return '';
    }

    async activeChat() {
        if(!this.isInit) {
            console.log("ChatInputController not initialized.");
            return;
        }
        if(this.checkInputActive()) {
            return new Promise((resolve, reject) => {
                this.update(true);
                resolve(true);
            });
        }
        return new Promise((resolve, reject) => {
            /*const chatInputActiveObserver = new MutationObserver((mutationsList, observer) => {
                for (const mutation of mutationsList) {
                    mutation.addedNodes.forEach((node) => {
                        
                        if (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() === chzzkDOM.chatInputActiveTag)  {
                            this.update(true);
                            observer.disconnect();
                            resolve(true);
                        }
                    });
                }
            });
            const config = { childList: true, subtree: true };
            chatInputActiveObserver.observe(this.inputContainer, config);*/
            this.input.dispatchEvent(new FocusEvent("focus", {bubbles: true, composed: true}));
            this.update(true);
            resolve(true);
        });
    }
    inputChat(text, add = true, trigInput = true, pos = undefined) {
        console.log(`caretpos : ${pos}`);
        if(!this.isInit) {
            console.log("ChatInputController not initialized.");
            return;
        }

        if(!this.isActive) {
            return;
        }
        var sel = window.getSelection();


        if(add) {
            if(pos == undefined || pos > this.input.innerText.length) {
                this.input.innerText += text;
            } else {
                this.input.innerText = this.input.innerText.substring(0,pos) + text + this.input.innerText.substring(pos, this.input.innerText.length-1);
            }
        } else {
            if(pos == undefined || pos > this.input.innerText.length) {
                this.input.innerText = text;
            } else {
                this.input.innerText = this.input.innerText.substring(0,pos) + text;
            }
        }

        var range = document.createRange();
        range.selectNodeContents(this.input);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
        
        if(trigInput) {
            this.input.dispatchEvent(new InputEvent('input', {bubbles: true,cancelable: true, inputType: 'insertText',  data: ''}));
        }
        
        /*let startOffset = this.adjustOffset;
        let endOffset = sel.focusOffset;

        var range = sel.getRangeAt(0);

        range.setStart(range.startContainer, startOffset);
        range.setEnd(range.startContainer, endOffset);

        var fragment = document.createDocumentFragment();
        fragment.appendChild(document.createTextNode(text));

        range.deleteContents();
        range.insertNode(fragment);

        sel.removeAllRanges();*/

        
        //this.input.dispatchEvent(new InputEvent('input', {bubbles: true,cancelable: true, inputType: 'insertText',  data: ' ',}));

    }
    async sendChat() {
        if(!this.isInit) {
            console.log("ChatInputController not initialized.");
            return;
        }
        return new Promise((resolve, reject) => {
            /*const chatInputInActiveObserver = new MutationObserver((mutationsList) => {
                for (const mutation of mutationsList) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() === chzzkDOM.chatInputActiveTag)  {
                            this.isActive = false;
                            this.input = document.querySelectorAll(`${chzzkDOM.chatInputInActiveTag}.${chzzkDOM.chatInput}`)[0];
                            chatInputInActiveObserver.disconnect();
                            resolve(true);
                        }
                    });
                }
            });
            const config = { childList: true, subtree: true };
            chatInputInActiveObserver.observe(this.inputContainer, config);*/
            this.input.dispatchEvent(new InputEvent('input', {bubbles: true,cancelable: true, inputType: 'insertText',  data: '\n',}));
            this.input.dispatchEvent(new KeyboardEvent("keydown", {bubbles: true, composed: true, key: 'Enter'}));
            this.input.innerText = "";
            resolve(true);
        });
        
    }
}

export {chzzkDOM, domMessage, DOMMessageHandler, ChzzkDOMController}