import { chzzkDOM, DOMMessageHandler } from "../modules/cime-dom-controller";
import PreferencesHandler from "../modules/preferences-handler";
var browser = require("webextension-polyfill");

export class DcconChatWindowObserver {
    constructor(dcconChatState) {
        
		this.dcconWidthObserver = new ResizeObserver(entries => {
			for (let entry of entries) {
				// 감시 대상의 크기가 변화했을 때 실행할 코드
				const dcconForLine = parseInt(entry.contentRect.width / 100);
				$(entry.target).find("ul.dcconList").css("grid-template-columns", `repeat(${dcconForLine}, 1fr)`);
			}
		});
		this.dcconChatState = dcconChatState;
		this.caretPos = 0;

		this.autoCompleteList = [];
		this.autoCompleteCursor = 0;

		const div = $("<div>").addClass("dcconDiv");
		
		if(window.dcconWindowWidth != null) {
			div.css("width", `${window.dcconWindowWidth}px`);
		}

		const headerDiv = $("<div>").addClass("dcconHeader");
		headerDiv.append(
			$("<strong>").text("디시콘")
		);
		headerDiv.append(
			$("<span>").html('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/></svg>').click(() => {
				this.dcconChatState.setState(false);
			})
		);
		headerDiv.css("margin-bottom", "12px");
		div.append(headerDiv);
		
		const ul = $("<ul>").addClass("dcconList");

		if(window.dcconColumnFixed) {
			ul.addClass("grid");
			if(dcconColumnCount) {
				ul.css("grid-template-columns", `repeat(${dcconColumnCount}, 1fr)`);
				if(dcconColumnCount > 5) {
					ul.css("gap", "4px");
				}
				if(dcconColumnCount > 8) {
					ul.css("gap", "2px");
				}
			} else {
				ul.css("grid-template-columns", 'repeat(3, 1fr)');
			}
		}
		
		if(window.showScrollbar) {
			ul.addClass("showScroll");
		}

		for(var i=0; i<dcConsData.length; i++) {
			var dcCon = dcConsData[i];
			var li = document.createElement("li");
			li.style.display = "block";
			var a = document.createElement("a");
			
			if(Array.isArray(dcCon.uri)) {
							
				dcCon.uri.forEach(uri => {
					var img = document.createElement("img");
				
					img.src = browser.runtime.getURL(uri);
					img.classList = "lazy doubleConPlus";
					img.setAttribute("alt", dcCon.keywords[0]);
					
					a.appendChild(img);
				})
				
				li.appendChild(a);
			} else {
				var img = document.createElement("img");
				
				img.src = browser.runtime.getURL(dcCon.uri);
				img.className = "lazy";
				img.setAttribute("alt", dcCon.keywords[0]);

				a.appendChild(img);
				li.appendChild(a);
			}
			
			var keywords = dcCon.keywords;
			var tags = dcCon.tags;
			var replaceKeyword = dcCon.replaceKeyword;
			keywords.forEach((keyword) => {
				//$(li).append($("<div>").addClass("keyword").text(keyword));
				$(li).append($("<div>").addClass("keyword").text(`~${keyword}`));
			});
			$(li).attr("data-bs-toggle", "tooltip");
			$(li).attr("title", `${keywords.join(",")}\r\n태그 : ${tags.join(",")}`);
			$(li).attr("data-bs-placement", "top");
			$(li).attr("tabindex", "0");

			tags.forEach((tag) => $(li).append($("<div>").addClass("tag").text(tag)));

			const self = this;

			const targetKeyword = replaceKeyword ? replaceKeyword : keywords[0];

			(function(keyword) { $(li).click(function(e) {
				DOMMessageHandler.inputChat("~"+keyword, false, true, self.getCaretPos()-1);
				/*(async() => {
					let active = await DOMMessageHandler.activeInput();
					if(active) {
						DOMMessageHandler.inputChat("~"+keyword, false);
						this.dcconChatState.setState(false);
						$('.tooltip').hide();
					};
				})();*/
			});
			})(targetKeyword);
			
			(function(keyword) { $(li).keypress(function(e) {
				if (e.key === 'Enter' || e.keyCode === 13) {
					e.preventDefault();
					DOMMessageHandler.sendChat("~"+keyword, false);
					//DOMMessageHandler.inputChat("~"+keyword, false, true, self.getCaretPos()-1);
					/*(async() => {
						let active = await DOMMessageHandler.activeInput();
						if(active) {
							await DOMMessageHandler.inputChat("~"+keyword, false);
							this.dcconChatState.setState(false);
							$('.tooltip').hide();
							let sendSuccess = await DOMMessageHandler.sendChat();
							if(sendSuccess) {
								this.dcconChatState.setState(false);
							}
						};
					})();*/
				}
			});
			})(targetKeyword);
			ul.get(0).appendChild(li);
		}
		
		div.append(ul);
		this.$dcconChatWindow = div;
		this.listener = (e) => {
			if(this.dummyDiv == undefined) return;

			const currentText = e.target.textContent;

			// 마지막으로 등장한 ~의 위치
			const tildeIndex = currentText.lastIndexOf("~");
			if (tildeIndex !== -1) {
				const afterTilde = currentText.slice(tildeIndex + 1);
				this.dummyDiv.get(0).textContent = afterTilde;
				const evt = new Event('input', { bubbles: true });
				this.dummyDiv.get(0).dispatchEvent(evt);
			} else {
			// ~가 제거되면 dummy는 초기화 (또는 숨김 등 처리 가능)
				this.dummyDiv.get(0).remove();
				this.dummyDiv = undefined;
			}
		};
	}
	
	getCaretPos() {
		return this.caretPos;	
	}
	
	updateScribe(scribe) {
		if(scribe) {
			this.addTarget = document.getElementsByClassName(chzzkDOM.chatActionArea)[0];
		} else {
			this.addTarget = undefined;
		}
    }

    update(state) {
		var self = this;
        if(state) {
			let postCaretPos = this.caretPos;
			this.caretPos = $(`${chzzkDOM.chatInputActiveTag}.${chzzkDOM.chatInput}`)[0].textContent.replace(/\u200B/g, '').length;

			const cloneDiv = this.$dcconChatWindow.clone(true, true);
			this.addTarget.appendChild(cloneDiv.get(0));
			this.attachDcconWindow = cloneDiv;
			
			if(!window.dcconColumnFixed) {
				this.dcconWidthObserver.observe(this.attachDcconWindow.get(0));
			}

			const $dummyDiv = $("<div/>").attr("class","dcconInputDummy").attr("contenteditable", true);
			this.dummyDiv = $dummyDiv;
			
			$(`${chzzkDOM.chatInputActiveTag}.${chzzkDOM.chatInput}`).get(0).addEventListener("input", this.listener);

			$dummyDiv.quicksearch('ul.dcconList li', {
				'delay': 0,
				'selector': 'div.keyword',
				'onAfter': function() {
					$('ul.dcconList').scroll(0,0);
					/*self.autoCompleteCursor = 0;
					$("ul.dcconList li:visible").each((index, element) => {
						self.autoCompleteList.push($(element));
					});*/
				},
			});
		
			$("ul.dcconList").on("keydown", function (e) {
				
				if(e.key == actionKey) {
					e.preventDefault();
					if($(e.target).nextAll('li:visible').first().length > 0)
					{
						$(e.target).nextAll('li:visible').first().focus();
					} 
					else
					{
						$('ul.dcconList li:visible').eq(0).focus();
					}
				}
				if(e.key == 'Escape') {
					e.preventDefault();
					self.update(false);
					$(`${chzzkDOM.chatInputActiveTag}.${chzzkDOM.chatInput}`).get(0).focus();
				}
			});
			
		} else {
			if(this.dummyDiv != undefined) {
				this.dummyDiv.remove();
			}
			
			if(this.attachDcconWindow != undefined) {
				this.attachDcconWindow.remove();
				if(!window.dcconColumnFixed) {
					this.dcconWidthObserver.disconnect();
				}
			}

			$(`${chzzkDOM.chatInputActiveTag}.${chzzkDOM.chatInput}`).get(0).removeEventListener("input", this.listener);
		}
    } 
}