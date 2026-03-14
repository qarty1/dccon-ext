import { chzzkDOM, DOMMessageHandler } from "../modules/cime-dom-controller";
import PreferencesHandler from "../modules/preferences-handler";
var browser = require("webextension-polyfill");

export class DcconMqObserver {
    tagOpenRegExp = /\[(b|i|s|mq[^\]]*|ㅠ|ㅑ|ㄴ|ㅡㅂ[^\]]*)\]/g
    tagCloseRegExp = /\[\/(b|i|s|mq|ㅠ|ㅑ|ㄴ|ㅡㅂ)[^\]]*\]/g;

    mqBehaviorRegExp = /\[(mq|ㅡㅂ)( direction=(up|down|right|left))? b$/g
    mqLoopRegExp = /\[(mq|ㅡㅂ)( direction=(up|down|right|left))?( behavior=(scroll|slide|alternate))? l$/g
    mqScrollamountRegExp = /\[(mq|ㅡㅂ)( direction=(up|down|right|left))?( behavior=(scroll|slide|alternate))?( loop=[^\ ]*)? s$/g
    mqScrolldelayRegExp = /\[(mq|ㅡㅂ)( direction=(up|down|right|left))?( behavior=(scroll|slide|alternate))?( loop=[^\ ]*)?(?: scrollamount=[0-9]+|^(?!.*scrollamount).*)? sc$/g
d    
    
    mqNotCloseRegExp = /\[(mq|ㅡㅂ)( direction=(up|down|right|left))?( behavior=(scroll|slide|alternate)*)?( loop=[^\ ]*)?( scrollamount=[0-9]+)?( scrolldelay=[0-9]+)?\](?!.*\[\/(mq|ㅡㅂ|)\])/g;
    mqRegExp = /\[(mq|ㅡㅂ)( direction=[^\ \[]*)?( behavior=[^\ \[]*)?( loop=[^\ \[]*)?( scrollamount=[0-9]+)?( scrolldelay=[0-9]+)?\](.*)\[\/(mq|ㅡㅂ|)\]/g;
    mqPrefixExp = /\[(mq|ㅡㅂ)( direction=(up|down|right|left))?( behavior=(scroll|slide|alternate)*)?( loop=[^\ ]*)?( scrollamount=[0-9]+)?( scrolldelay=[0-9]+)?\]/g;
    mqSuffixExp = /\[\/(mq|ㅡㅂ)\]/g;
    mqAttributeCompleteRegExp = {
        direction: /.* direction=(up|down|right|left).*/g,
        behavior: /.* behavior=(scroll|slide|alternate).*/g,
    };
    className = "mqAutocomplete";
    tagName = "ul";

    attributes = [
        'direction',
        'behavior',
        'loop',
        'scrollamount',
        'scrolldelay'
    ];
    
    attrValues = {
        direction: ['up', 'down', 'left', 'right'],
        behavior: ['scroll', 'slide', 'alternate']
    };
    
    constructor() {
        /*window.addEventListener("click", (event) => {
            this.remove();
        });*/;
    }

    keydown(event) {
        //if(this.inAutocomplete) {
            if(event.key == actionKey) {
                this.watchMq(event);
                if(event.target.tagName.toLowerCase() == chzzkDOM.chatInputActiveTag) {
                    $(`${this.tagName}.${this.className} li:first-child`).focus();
                } else if(event.target.tagName.toLowerCase() == "li") {
                    if($(event.target).nextAll('li').first().length > 0)
                    {
                        $(event.target).nextAll('li').first().focus();
                    } 
                    else
                    {
                        $(`${this.tagName}.${this.className} li:first-child`).focus();
                    }
                }
                //event.preventDefault();
                /*if(this.preAttr.length == 1) {
                    //this.inputMq(this.preAttr[0]);
                } else {
                    if(event.target.tagName.toLowerCase() == chzzkDOM.chatInputActiveTag) {
                        $(`${this.tagName}.${this.className} li:first-child`).focus();
                    } else if(event.target.tagName.toLowerCase() == "li") {
                        if($(event.target).nextAll('li').first().length > 0)
                        {
                            $(event.target).nextAll('li').first().focus();
                        } 
                        else
                        {
                            $(`${this.tagName}.${this.className} li:first-child`).focus();
                        }
                    }
                    
                }*/
            }
        //}
    }

    input(event) {
        //console.log(`mq event : ${event.originalEvent.data}` );
        
        if(event.originalEvent.data == ']') {
            this.autoClose(event);
        }
        
    }

    autoClose(event) {
        
        const sel = window.getSelection();
        const range = sel.getRangeAt(0);

        const curOffset = sel.focusOffset;
        const editor = event.target;
        const currentTextNode = range.startContainer;
        const content = range.startContainer.textContent;
        
        const matchTag = content.match(this.tagOpenRegExp)?.map(e => {
            if(e.indexOf("mq")>-1) return "mq";
            if(e.indexOf("ㅡㅂ")>-1) return "ㅡㅂ";
            else return e.replace(this.tagOpenRegExp, "$1");
        });

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
                    editor.replaceChild(newTextNode, currentTextNode);
                } else {
                    editor.appendChild(newTextNode);
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

    inputMq(matchedAttribute) {

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
    }

    watchMq(event) { 
        const sel = window.getSelection();
        const curOffset = sel.focusOffset;

        const range = sel.getRangeAt(0);
        const editor = event.target;
        const content = range.startContainer.textContent;
        
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

        /*const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const startContainer = range.startContainer;
        const startOffset = range.startOffset;

        // 텍스트 노드에서 텍스트를 추출
        let text = startContainer.textContent;
        const prefix = text.substring(0, startOffset);
        const suffix = text.substring(startOffset);

        // 속성 및 값이 이미 있는 경우에도 새 속성을 자동완성할 수 있도록 함
        const lastBracketIndex = prefix.lastIndexOf('[');
        const lastSpaceIndex = prefix.lastIndexOf(' ');
        const lastAssignIndex = prefix.lastIndexOf('=');
        
        const attributeStart = prefix.substring(lastBracketIndex + 1, lastSpaceIndex).trim();
        const partialAttribute = prefix.substring(lastSpaceIndex + 1) == '' ? undefined : prefix.substring(lastSpaceIndex + 1);
        
        // 자동완성 대상 속성 분석
        const matchedAttribute = this.attributes.filter(attr => text.indexOf(attr) == -1).find(attr => attr.startsWith(partialAttribute));
        const matchedAttributeForValue = prefix.substr(lastSpaceIndex+1, lastAssignIndex - (lastSpaceIndex + 1));
        
        const attrAssignFlag = lastAssignIndex > lastSpaceIndex;
        console.log(`partialAttribute: ${partialAttribute}`);
        if(attrAssignFlag) {

            const partialAttrValue = prefix.substring(lastAssignIndex + 1) == '' ? undefined : prefix.substring(lastAssignIndex + 1);
            const matchedAttrValue = matchedAttributeForValue ? this.attrValues[matchedAttributeForValue].find(value => value.startsWith(partialAttrValue)) : undefined;	
            
            console.log(`matchedAttrValue: ${matchedAttrValue}`);
            if (matchedAttrValue) {
                
                this.makeAttrList([matchedAttrValue]);
                this.inAutocomplete = true;
            } else {	
                
                if(this.mqAttributeCompleteRegExp[matchedAttributeForValue] != undefined 
                    && this.mqAttributeCompleteRegExp[matchedAttributeForValue].test(text)) {
                    console.log("Test");
                    this.preAttr = undefined;
                    this.remove();
                    return;
                }
                this.makeAttrList(this.attrValues[matchedAttributeForValue]);
                this.inAutocomplete = true;
            }	
        } else {
            if (matchedAttribute) {
                this.makeAttrList([matchedAttribute]);
                this.inAutocomplete = true;
            } else {
                //makeAttrList(attributes.filter(attr => text.indexOf(attr) == -1));
                this.inAutocomplete = false;
            }
        }*/
    }

    handleChatting(chatNode) {
        //console.log("handled node :");
        //console.log(chatNode);
        const chatText = $(chatNode).find(`.${chzzkDOM.chatText}`).get(0);
        const wrapButton = $(chatNode).find(`.${chzzkDOM.chatTextWrapper}`);
        let dcconChanged = false;
        
        // 디시콘 변환 ON인 경우
        if(chatToDccon) {
            // 우선 디시콘을 변환해봄
            dcconChanged = this.changeDccon(chatText);
            // 변환된 디시콘이 있는 경우 mq태그 제거
            /*if(dcconChanged) {
                Array.from(chatText.childNodes).forEach(child => {
                    if (child.nodeType === Node.TEXT_NODE) {
                        child.textContent = child.textContent.replace(this.mqPrefixExp, '').replace(this.mqSuffixExp, '');
                    }
                });
            }*/
        }

        if(chatText != undefined) {

            Array.from(chatText.childNodes).forEach(child => {
                if (child.nodeType === Node.TEXT_NODE) {
                    let escaped = child.textContent.replaceAll("<", "&lt;").replace(">", "&gt;");

                    let changedMq = escaped.replace(this.mqRegExp, this.replaceMarquee);

                    if(changedMq != null) {
                        changedMq = this.replaceTag(changedMq);
                    }

                    const tempDiv = document.createElement("div");
                    tempDiv.innerHTML = changedMq;

                    const parent = child.parentNode;
                    const fragment = document.createDocumentFragment();
                    fragment.appendChild(tempDiv.firstChild);
                    while (tempDiv.firstChild) {
                        fragment.appendChild(tempDiv.firstChild);
                    }
                    parent.replaceChild(fragment, child);
                }
            });
        }
        
        // 디시콘 변환을 사용하지 않거나, 변환된 디시콘이 없으면서 채팅변환을 사용하는경우
        /*if((!chatToDccon || !dcconChanged) && useTagConverter) {
            if(chatText != undefined) {
                let text = chatText.innerHTML;
                
                text = text.replace(this.mqRegExp, this.replaceMarquee);
                if(text != null) {
                    text = this.replaceTag(text);
                    chatText.innerHTML = text;
                    // 마퀴태그가 있는 경우 가로너비 100%
                    if(text.indexOf("marquee") > -1) {
                        wrapButton.addClass("marquee");
                    }
                }
            }
        }*/
    }

    replaceTag(text) {
        text = text.replace(/\[b\](.*)\[\/b\]/g, "<b>$1</b>"); //볼드 [b]blah[/b]
		text = text.replace(/\[i\](.*)\[\/i\]/g, "<i>$1</i>"); //이탤릭 [i]blah[/i]
		text = text.replace(/\[s\](.*)\[\/s\]/g, "<del>$1</del>"); //취소선 [s]blahp[/s]

        text = text.replace(/\[ㅠ\](.*)\[\/ㅠ\]/g, "<b>$1</b>"); //볼드 [b]blah[/b]
		text = text.replace(/\[ㅑ\](.*)\[\/ㅑ\]/g, "<i>$1</i>"); //이탤릭 [i]blah[/i]
		text = text.replace(/\[ㄴ\](.*)\[\/ㄴ\]/g, "<del>$1</del>"); //취소선 [s]blahp[/s]

		// 나무위키식
		text = text.replace(/'''(.*)'''/g, "<b>$1</b>");
		text = text.replace(/''(.*)''/g, "<i>$1</i>");
		text = text.replace(/~~(.*)~~/g, "<del>$1</del>");
		text = text.replace(/--(.*)--/g, "<del>$1</del>");
		text = text.replace(/__(.*)__/g, "<ins>$1</ins>");

		//닫는 태그가 없는 [b][i][s]
		text = text.replace(/\[b\](.*)/g, "<b>$1</b>"); //볼드 [b]blah
		text = text.replace(/\[i\](.*)/g, "<i>$1</i>"); //이탤릭 [i]blah
		text = text.replace(/\[s\](.*)/g, "<del>$1</del>"); //취소선 [s]blah
		text = text.replace(/\[ㅠ\](.*)/g, "<b>$1</b>"); //볼드 [b]blah
		text = text.replace(/\[ㅑ\](.*)/g, "<i>$1</i>"); //이탤릭 [i]blah
		text = text.replace(/\[ㄴ\](.*)/g, "<del>$1</del>"); //취소선 [s]blah

		//강제개행
		text = text.replace(/\[br\]/g, "<br/>");
        text = text.replace(/\[ㅠㄱ\]/g, "<br/>");
        return text;
    }
    /**
     * see https://github.com/Lastorder-DC/ChatAssistX-Client/blob/master/js/chatassistx/plugins/dccon.js
     * @param {*} match 
     * @param {*} direction 
     * @param {*} behavior 
     * @param {*} loop 
     * @param {*} scrollamount 
     * @param {*} scrolldelay 
     * @param {*} body 
     * @param {*} offset 
     * @returns 
     */
    replaceMarquee(match, mq, direction, behavior, loop, scrollamount, scrolldelay, body, offset) {
		// 빈 값 확인
		if (typeof direction == "undefined") direction = "";
		if (typeof behavior == "undefined") behavior = "";
		if (typeof loop == "undefined") loop = "";
		if (typeof scrollamount == "undefined") scrollamount = "";
		if (typeof scrolldelay == "undefined") scrolldelay = "";

		// 내용이 빈 mq 태그는 무의미하므로 리턴
		if (typeof body == "undefined") return "";

		var scrollamount_value = scrollamount.replace(/[^0-9]/g, "");

		// scrollamount 값을 50 이하로 제한함(50이 넘으면 50으로 강제 하향조정)
		if (scrollamount_value > 50) scrollamount = ' scrollamount=50';

		// 우선 마퀴태그 내 이모티콘을 변환해봄
        //console.log(this);
        //const changedDccon = this.changeDccon(this.chatText);
        // 이모티콘이 있다면 빈 값을 변환
        //if (changedDccon) return null;
        
        // 이코티콘이 있는 경우 마퀴 적용 X
        if (body.match(/<img/) != null) return body;

		// 마퀴태그 만들어 반환
		return '<div class=\'dccon-marquee\'><marquee' + direction + behavior + loop + scrollamount + scrolldelay + '>' + body + '</marquee></div>';
	}

    changeDccon(chatTarget) {
        let changeFlag = false;
        
        if(!chatToDccon) {
            return changeFlag;
        }
    
        if(iconttvCompatiableMode && iconttvDetect) {
            return changeFlag;
        }
        const $chatSpan = $(chatTarget);
        if($chatSpan.get(0) != undefined) {
            Array.from($chatSpan.get(0).childNodes).forEach(child => {
                if (child.nodeType === Node.TEXT_NODE) {
                    changeFlag = this.replaceTextNodeWithImage(child);
                }
            });
        }
        console.log(changeFlag);
        return changeFlag;
    }

    createImageElement(dcCon) {
        const self = this;
        const $img = $("<img>")
        .attr("class", "dccon")
        .attr("src", browser.runtime.getURL(dcCon.uri))
        .attr("alt", dcCon.keywords[0])
        .attr("title", `${dcCon.keywords.join(",")}\r\n태그 : ${dcCon.tags.join(",")}`)
        .attr("data-bs-toggle", "tooltip")
        .attr("data-bs-placement", "top");
        if(dcCon.doubleCon) {
            $img.css({"width": "199px", "height": "99px"});
        } else {
            $img.css({"width": "99px", "height": "99px"});
        }
        
        $img.get(0).addEventListener("click", function(e) {
            e.preventDefault();
            e.stopPropagation();
            DOMMessageHandler.handleDcconClick("~"+dcCon.keywords[0]);
        });
        return $img.get(0);
    }
    
    // 텍스트 노드를 처리하는 함수
    replaceTextNodeWithImage(node) {
        let changed = false;
        let pattern = /~([^\[~\s]*)(\.|,|)?/g;
        let matches = [...node.textContent.matchAll(pattern)];
        if (matches.length === 0) return changed;
    
        let lastIndex = 0;
        let newNodes = [];
        // 1.1.0 더블디시콘 지원으로 2개 변환으로 변경
        // 한개만 변환함
        // matches = matches.splice(0, 1);

        if(parseInt(window.dcconChangeCount)) {
            matches = matches.splice(0, window.dcconChangeCount);
        }

        matches.forEach(match => {
            // 텍스트 노드 추가
            const con = dcConsData.find((dccon) => {
                let doubleConPlus = dccon.doubleConPlus;
                let keywords = dccon.keywords;
                let exist = false;
                keywords.forEach((keyword) => {
                    if(match[1].trim() == keyword) {
                        exist = true;
                    }
                });
                return exist && !doubleConPlus;
            });
            
            if (match.index > lastIndex) {
                newNodes.push(document.createTextNode(node.textContent.slice(lastIndex, match.index)));
            }

            // 추가될 노드가 이미지이면
            if(con != undefined) {
                // 디시콘 다음줄에 표시 옵션 사용시 첫 노드가 디시콘이면 노드 추가 전에 br노드를 추가하여 다음줄 표시 구현
                if(dcconNewline) {
                    const existDccon = newNodes.find(nodes => {
                        return nodes.tagName === "IMG";
                    });
                    const lastNode = newNodes.length > 0 ? newNodes[newNodes.length-1] : null;

                    if(lastNode == null) {
                        newNodes.push(document.createElement("br"));
                    }

                }
                newNodes.push(this.createImageElement(con));
                changed = true;
            } else {
                newNodes.push(document.createTextNode(match[0]));
                //changed = false;
            }
            
            lastIndex = match.index + match[0].length;
        });
    
        // 마지막 텍스트 노드 추가
        if (lastIndex < node.textContent.length) {
            newNodes.push(document.createTextNode(node.textContent.slice(lastIndex)));
        }

        if(!changed) {
            return false;
        }
        
        newNodes.forEach(newNode => node.parentNode.insertBefore(newNode, node));
        node.parentNode.removeChild(node);
    
        return changed;
    }

    makeAttrList(attr) {
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
    }
}