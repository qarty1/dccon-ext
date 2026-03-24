import browser from "webextension-polyfill";
import PreferencesHandler from "./config/preferences-handler";
import { DOMSelectors } from "./domSelector/domSelectors";
import { globalObservers } from "./global-events";

declare const dcConsData: any[]; // 외부에서 주입되는 디시콘 데이터

export class ChatConverter {
    // 마퀴 태그 추출 정규식
    private readonly tagOpenRegExp = /\[(b|i|s|mq[^\]]*|ㅠ|ㅑ|ㄴ|ㅡㅂ[^\]]*)\]/g
    private readonly tagCloseRegExp = /\[\/(b|i|s|mq|ㅠ|ㅑ|ㄴ|ㅡㅂ)[^\]]*\]/g;

    private readonly mqBehaviorRegExp = /\[(mq|ㅡㅂ)( direction=(up|down|right|left))? b$/g
    private readonly mqLoopRegExp = /\[(mq|ㅡㅂ)( direction=(up|down|right|left))?( behavior=(scroll|slide|alternate))? l$/g
    private readonly mqScrollamountRegExp = /\[(mq|ㅡㅂ)( direction=(up|down|right|left))?( behavior=(scroll|slide|alternate))?( loop=[^\ ]*)? s$/g
    private readonly mqScrolldelayRegExp = /\[(mq|ㅡㅂ)( direction=(up|down|right|left))?( behavior=(scroll|slide|alternate))?( loop=[^\ ]*)?(?: scrollamount=[0-9]+|^(?!.*scrollamount).*)? sc$/g
    
    
    private readonly mqNotCloseRegExp = /\[(mq|ㅡㅂ)( direction=(up|down|right|left))?( behavior=(scroll|slide|alternate)*)?( loop=[^\ ]*)?( scrollamount=[0-9]+)?( scrolldelay=[0-9]+)?\](?!.*\[\/(mq|ㅡㅂ|)\])/g;
    private readonly mqRegExp = /\[(mq|ㅡㅂ)( direction=[^\ \[]*)?( behavior=[^\ \[]*)?( loop=[^\ \[]*)?( scrollamount=[0-9]+)?( scrolldelay=[0-9]+)?\](.*)\[\/(mq|ㅡㅂ|)\]/g;
    private readonly mqPrefixExp = /\[(mq|ㅡㅂ)( direction=(up|down|right|left))?( behavior=(scroll|slide|alternate)*)?( loop=[^\ ]*)?( scrollamount=[0-9]+)?( scrolldelay=[0-9]+)?\]/g;
    private readonly mqSuffixExp = /\[\/(mq|ㅡㅂ)\]/g;
    private readonly mqAttributeCompleteRegExp = {
        direction: /.* direction=(up|down|right|left).*/g,
        behavior: /.* behavior=(scroll|slide|alternate).*/g,
    };

    private readonly attributes = [
        'direction',
        'behavior',
        'loop',
        'scrollamount',
        'scrolldelay'
    ];
    
    private readonly attrValues = {
        direction: ['up', 'down', 'left', 'right'],
        behavior: ['scroll', 'slide', 'alternate']
    };
    
    constructor(private domSelectors: DOMSelectors) {}

    public handleChatting(chatNode: Element): void {
        const chatToDccon = PreferencesHandler.getCached(PreferencesHandler.CHAT_TO_DCCON);
        const chatTextSelector = this.domSelectors.chatText;
        const chatText = chatNode.querySelector(chatTextSelector);
        
        if (!chatText) return;

        // 1. 디시콘 변환 시도 (TEXT_NODE를 찾아서 IMG로 변환)
        if (chatToDccon) {
            this.changeDccon(chatText);
        }

        // 2. 마퀴태그 및 기타 텍스트 포맷 변환
        Array.from(chatText.childNodes).forEach(child => {
            if (child.nodeType === Node.TEXT_NODE && child.textContent) {
                let escaped = child.textContent.replaceAll("<", "&lt;").replace(">", "&gt;");
                
                // 정규식을 활용해 마퀴 태그 파싱
                let changedText = escaped.replace(this.mqRegExp, this.replaceMarquee as any);
                
                // 텍스트 포맷(볼드, 이탤릭 등) 처리
                changedText = this.replaceTag(changedText);

                // 기존 텍스트와 다르다면 DOM 교체
                if (changedText !== escaped) {
                    const tempDiv = document.createElement("div");
                    tempDiv.innerHTML = changedText;

                    const parent = child.parentNode;
                    if (parent) {
                        const fragment = document.createDocumentFragment();
                        while (tempDiv.firstChild) {
                            fragment.appendChild(tempDiv.firstChild);
                        }
                        parent.replaceChild(fragment, child);
                    }
                }
            }
        });
    }

    private replaceTag(text: string): string {
        // Non-greedy(.*?) 매칭을 사용하여 같은 줄에 여러 태그가 있어도 정상 파싱되도록 개선
        text = text.replace(/\[b\](.*?)\[\/b\]/g, "<b>$1</b>"); 
        text = text.replace(/\[i\](.*?)\[\/i\]/g, "<i>$1</i>"); 
        text = text.replace(/\[s\](.*?)\[\/s\]/g, "<del>$1</del>"); 

        text = text.replace(/\[ㅠ\](.*?)\[\/ㅠ\]/g, "<b>$1</b>"); 
        text = text.replace(/\[ㅑ\](.*?)\[\/ㅑ\]/g, "<i>$1</i>"); 
        text = text.replace(/\[ㄴ\](.*?)\[\/ㄴ\]/g, "<del>$1</del>"); 

        // 나무위키식
        text = text.replace(/'''(.*?)'''/g, "<b>$1</b>");
        text = text.replace(/''(.*?)''/g, "<i>$1</i>");
        text = text.replace(/~~(.*?)~~/g, "<del>$1</del>");
        text = text.replace(/--(.*?)--/g, "<del>$1</del>");
        text = text.replace(/__(.*?)__/g, "<ins>$1</ins>");

        // 닫는 태그가 없는 경우
        text = text.replace(/\[b\](.*)/g, "<b>$1</b>");
        text = text.replace(/\[i\](.*)/g, "<i>$1</i>");
        text = text.replace(/\[s\](.*)/g, "<del>$1</del>");
        text = text.replace(/\[ㅠ\](.*)/g, "<b>$1</b>");
        text = text.replace(/\[ㅑ\](.*)/g, "<i>$1</i>");
        text = text.replace(/\[ㄴ\](.*)/g, "<del>$1</del>");

        // 강제 개행
        text = text.replace(/\[br\]/gi, "<br/>");
        text = text.replace(/\[ㅠㄱ\]/gi, "<br/>");
        
        return text;
    }

    private replaceMarquee = (match: string, mq: string, direction?: string, behavior?: string, loop?: string, scrollamount?: string, scrolldelay?: string, body?: string): string => {
        direction = direction || "";
        behavior = behavior || "";
        loop = loop || "";
        scrollamount = scrollamount || "";
        scrolldelay = scrolldelay || "";

        if (!body) return "";

        const scrollamountValue = parseInt(scrollamount.replace(/[^0-9]/g, ""), 10);
        if (!isNaN(scrollamountValue) && scrollamountValue > 50) {
            scrollamount = ' scrollamount=50';
        }
        
        // 디시콘 이미지가 포함된 경우 마퀴 적용 X
        if (body.includes("<img")) return body;
		// 마퀴태그 만들어 반환
		return '<div class=\'dccon-marquee\'><marquee' + direction + behavior + loop + scrollamount + scrolldelay + '>' + body + '</marquee></div>';
    }

    private changeDccon(chatTarget: Element): boolean {
        let changeFlag = false;
        Array.from(chatTarget.childNodes).forEach(child => {
            if (child.nodeType === Node.TEXT_NODE) {
                if (this.replaceTextNodeWithImage(child)) {
                    changeFlag = true;
                }
            }
        });
        return changeFlag;
    }

    private createImageElement(dcCon: any): HTMLImageElement {
        const img = document.createElement("img");
        img.className = "dccon";
        img.src = browser.runtime.getURL(dcCon.uri);
        img.alt = dcCon.keywords[0];
        img.title = `${dcCon.keywords.join(",")}\r\n태그 : ${dcCon.tags.join(",")}`;
        img.setAttribute("data-bs-toggle", "tooltip");
        img.setAttribute("data-bs-placement", "top");

        if (dcCon.doubleCon) {
            img.style.width = "199px";
            img.style.height = "99px";
        } else {
            img.style.width = "99px";
            img.style.height = "99px";
        }
        
        let pressTimer: number | null = null;
        let isLongPress = false;

        img.addEventListener("mousedown", (e) => {
            if (e.button !== 0) return; 
            isLongPress = false;
            pressTimer = window.setTimeout(() => {
                isLongPress = true;
                globalObservers.userAction?.notifyDcconLongClick("~" + dcCon.keywords[0]);
            }, 200);
        });

        img.addEventListener("mouseup", () => {
            if (pressTimer) clearTimeout(pressTimer);
        });
        img.addEventListener("mouseleave", () => {
            if (pressTimer) clearTimeout(pressTimer);
        });

        img.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isLongPress) {
                globalObservers.userAction?.notifyDcconClick("~" + dcCon.keywords[0]);
            }
        });
        
        return img;
    }
    
    private replaceTextNodeWithImage(node: Node): boolean {
        if (!node.textContent) return false;
        
        let changed = false;
        const pattern = /~([^\[~\s]*)(\.|,|)?/g;
        let matches = [...node.textContent.matchAll(pattern)];
        
        if (matches.length === 0) return changed;
    
        let lastIndex = 0;
        const newNodes: Node[] = [];
        
        const dcconChangeCount = PreferencesHandler.getCached(PreferencesHandler.DCCON_CHANGE_COUNT);
        if (dcconChangeCount > 0) {
            matches = matches.splice(0, dcconChangeCount);
        }

        matches.forEach(match => {
            const keyword = match[1].trim();
            const con = typeof dcConsData !== 'undefined' ? dcConsData.find((dccon: any) => {
                return !dccon.doubleConPlus && dccon.keywords.includes(keyword);
            }) : undefined;
            
            if (match.index !== undefined && match.index > lastIndex) {
                newNodes.push(document.createTextNode(node.textContent!.slice(lastIndex, match.index)));
            }

            if (con) {
                const dcconNewline = PreferencesHandler.getCached(PreferencesHandler.DCCON_NEWLINE);
                if (dcconNewline) {
                    const lastNode = newNodes.length > 0 ? newNodes[newNodes.length - 1] : null;
                    if (!lastNode) {
                        newNodes.push(document.createElement("br"));
                    }
                }
                newNodes.push(this.createImageElement(con));
                changed = true;
            } else {
                newNodes.push(document.createTextNode(match[0]));
            }
            
            if (match.index !== undefined) {
                lastIndex = match.index + match[0].length;
            }
        });
    
        if (lastIndex < node.textContent.length) {
            newNodes.push(document.createTextNode(node.textContent!.slice(lastIndex)));
        }

        if (!changed) return false;
        
        if (node.parentNode) {
            newNodes.forEach(newNode => node.parentNode!.insertBefore(newNode, node));
            node.parentNode.removeChild(node);
        }
    
        return changed;
    }

    input(event) {
        //console.log(`mq event : ${event.originalEvent.data}` );
        
        if(event.originalEvent.data == ']') {
            this.autoClose(event);
        }
        
    }

    public autoClose(event: InputEvent): void {
        
        const sel = window.getSelection();
        if(sel == null || sel.rangeCount == 0) return;

        const range = sel.getRangeAt(0);

        const curOffset = sel.focusOffset;
        const editor = event.target;
        const currentTextNode = range.startContainer;
        const content = range.startContainer.textContent;
        if(editor == null || content == null) return;
        
        const matchTag = content.match(this.tagOpenRegExp)?.map(e => {
            if(e.indexOf("mq")>-1) return "mq";
            if(e.indexOf("ㅡㅂ")>-1) return "ㅡㅂ";
            else return e.replace(this.tagOpenRegExp, "$1");
        });
        if(matchTag == null || matchTag.length == 0) return;

        const matchCloseTag = content.match(this.tagCloseRegExp)?.map(e => e.replace(this.tagCloseRegExp, "$1"));
        const lastMatchTag = content.substring(0, curOffset).match(this.tagOpenRegExp);
        
        if (lastMatchTag) {
            if(matchTag != null && matchCloseTag != null && matchCloseTag.length == matchTag.length) {
                return;
            }

            if(matchTag.length > 0) {
                const tagName = matchTag[matchTag.length-1];
                const closingTag = `[/${tagName}]`;
                
                const prefix = content.substring(0, curOffset);
                const suffix = content.substring(curOffset);
                const newTextNode = document.createTextNode(prefix + closingTag + suffix);

                if(currentTextNode != null) {
                    (editor as HTMLElement).replaceChild(newTextNode, currentTextNode);
                } else {
                    (editor as HTMLElement).appendChild(newTextNode);
                }
                
                const range = document.createRange();
                range.setStart(newTextNode, curOffset);
                range.setEnd(newTextNode, curOffset);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
                /*
                range.setStart(range.startContainer, curOffset);
                range.setEnd(range.startContainer, curOffset);
                                     
                range.collapse(true);*/
                //range.insertNode(document.createTextNode(closingTag));
                //range.collapse(true);
            }
        }
    }

    /*inputMq(matchedAttribute) {

        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const startContainer = range.startContainer;
        const startOffset = range.startOffset;

        // 텍스트 노드에서 텍스트를 추출
        let text = startContainer.textContent;
        const prefix = text.substring(0, startOffset);
        const suffix = text.substring(startOffset);

        const lastBracketIndex = prefix.lastIndexOf('[');
        const lastSpaceIndex = prefix.lastIndexOf(' ');
        const lastAssignIndex = prefix.lastIndexOf('=');

        // 자동완성된 속성으로 텍스트 교체
        const attrAssignFlag = lastAssignIndex > lastSpaceIndex;
        let adjustEnd = 0;
        if(attrAssignFlag) {
            adjustEnd = lastAssignIndex + 1;
        } else {
            adjustEnd = lastSpaceIndex + 1;
        }

        const newText = prefix.substring(0, adjustEnd) + matchedAttribute;

        // 텍스트 노드 업데이트
        startContainer.textContent = newText + suffix;

        // 커서를 자동완성된 텍스트의 끝으로 이동
        const newCursorPosition = newText.length;
        range.setStart(startContainer, newCursorPosition);
        range.setEnd(startContainer, newCursorPosition);
        selection.removeAllRanges();
        selection.addRange(range);
    }*/

    public autoCompleteMQ(event: KeyboardEvent): void { 
        const sel = window.getSelection();
        if(sel == null || sel.rangeCount == 0) return;

        const curOffset = sel.focusOffset;

        const range = sel.getRangeAt(0);
        const editor = event.target;
        const content = range.startContainer.textContent;
        
        if(content == null) return;

        const typingMq = content.substring(0, curOffset);

        if(typingMq.match(this.mqScrolldelayRegExp) && typingMq.indexOf("scrolldelay") == -1) {
            event.preventDefault();
            const prefix = content.substring(0, curOffset);
            const suffix = content.substring(curOffset);
            range.startContainer.textContent = prefix + 'rolldelay=' + suffix;

            range.setStart(range.startContainer, (prefix + 'rolldelay=').length);
            range.setEnd(range.startContainer, (prefix + 'rolldelay=').length);
            //sel.removeAllRanges();
            range.collapse(true);
            return;
        }
        
        if(typingMq.match(this.mqScrollamountRegExp) && typingMq.indexOf("scrollamount") == -1) {
            event.preventDefault();
            const prefix = content.substring(0, curOffset);
            const suffix = content.substring(curOffset);
            range.startContainer.textContent = prefix + 'crollamount=' + suffix;

            range.setStart(range.startContainer, (prefix + 'crollamount=').length);
            range.setEnd(range.startContainer, (prefix + 'crollamount=').length);
            //sel.removeAllRanges();
            range.collapse(true);
            return;
        }

        if(typingMq.match(this.mqLoopRegExp) && typingMq.indexOf("loop") == -1) {
            event.preventDefault();
            const prefix = content.substring(0, curOffset);
            const suffix = content.substring(curOffset);
            range.startContainer.textContent = prefix + 'oop=' + suffix;

            range.setStart(range.startContainer, (prefix + 'oop=').length);
            range.setEnd(range.startContainer, (prefix + 'oop=').length);
            //sel.removeAllRanges();
            range.collapse(true);
            return;
        }

        if(typingMq.match(this.mqBehaviorRegExp) && typingMq.indexOf("behavior") == -1) {
            event.preventDefault();
            const prefix = content.substring(0, curOffset);
            const suffix = content.substring(curOffset);
            range.startContainer.textContent = prefix + 'ehavior=' + suffix;

            range.setStart(range.startContainer, (prefix + 'ehavior=').length);
            range.setEnd(range.startContainer, (prefix + 'ehavior=').length);
            //sel.removeAllRanges();
            range.collapse(true);
            return;
        }

        if(typingMq.endsWith("[mq d") || typingMq.endsWith("[ㅡㅂ d")) {
            event.preventDefault();
            const prefix = content.substring(0, curOffset);
            const suffix = content.substring(curOffset);
            range.startContainer.textContent = prefix + 'irection=' + suffix;

            range.setStart(range.startContainer, (prefix + 'irection=').length);
            range.setEnd(range.startContainer, (prefix + 'irection=').length);
            //sel.removeAllRanges();
            range.collapse(true);
            return;
        }
    }

    /*makeAttrList(attr) {
        if(this.preAttr != undefined && this.preAttr.join() == attr.join()) {
            return;
        }
        this.preAttr = attr;
        const input = document.querySelector(`.${chzzkDOM.chatInput}`);

        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const containerRect = input.getBoundingClientRect();

        if(document.getElementsByClassName("mqAutocomplete")[0] != undefined) {
            document.getElementsByClassName("mqAutocomplete")[0].remove();
        }

        const autocompleteElement = document.createElement(this.tagName);
        autocompleteElement.classList.add(this.className);
        attr.forEach(attr => {
            const li = document.createElement("li");
            li.innerText=attr;
            li.setAttribute("tabindex", "0");
            li.addEventListener("keydown", (e) => {
                if(e.key == 'Enter') {
                    DOMMessageHandler.inputChat(e.target.innerText, true);
                }
            });
            autocompleteElement.appendChild(li);
        });

        autocompleteElement.style.bottom = '30px';
        autocompleteElement.style.left = (rect.left - containerRect.left) + 30 + 'px';
        document.getElementsByClassName(chzzkDOM.inputContainer)[0].appendChild(autocompleteElement);
    }

    remove() {
        if(document.getElementsByClassName("mqAutocomplete").length > 0) {
            document.getElementsByClassName("mqAutocomplete")[0].remove();    
        }
        this.inAutocomplete = false;
    }*/
}
