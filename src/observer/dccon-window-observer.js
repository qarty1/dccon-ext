import { chzzkDOM, DOMMessageHandler } from "../modules/cime-dom-controller";
import PreferencesHandler from "../modules/preferences-handler";
var browser = require("webextension-polyfill");

export class DcconWindowObserver {
    constructor(dcconState) {

		this.dcconWidthObserver = new ResizeObserver(entries => {
			for (let entry of entries) {
				// 감시 대상의 크기가 변화했을 때 실행할 코드	
				const dcconForLine = parseInt(entry.contentRect.width / 100);
				$(entry.target).find("ul.dcconList").css("grid-template-columns", `repeat(${dcconForLine}, 1fr)`);
			}
		});
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
				dcconState.setState(false);
			})
		);
		div.append(headerDiv);
		
		const $searchDiv = $("<div>").addClass("searchDiv");
		$searchDiv.html(
			`
				<div>
					<input type="text" id="dcconName" placeholder="이름 검색"/>
					<button>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
						  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
						</svg>
					</button>
				</div>
				<div>
					<input type="text" id="dcconTag" placeholder="태그 검색"/>
					<button>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
						  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
						</svg>
					</button>
				</div>
			`
		);
		
		const $pasteDiv = $("<div>").addClass("searchDiv");
		$pasteDiv.html(
			`
				<div style="flex-grow: 1">
					<input type="text" id="dcconPaste" placeholder="선택한 디시콘이 입력됩니다" readonly style="flex-grow: 1"/>
					<button class="pasteCon" data-clipboard-target="#dcconPaste">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16">
						  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"/>
						  <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"/>
						</svg>
					</button>
				</div>
			`
		);
		const $doubleConDiv = $("<div>").addClass("searchDiv");
		$doubleConDiv.html(
			`
			<strong>더블콘 프리셋</strong>
			<div style="display: flex;flex-direction: row">
				<input type="text" id="double-con1" placeholder="디시콘1"/>
			</div>
			<div style="display: flex;flex-direction: row">
				<input type="text" id="double-con1" placeholder="더블콘2"/>
			</div>
			`
		);
		
		
		div.append($searchDiv);
		div.append($pasteDiv);
		//div.append($doubleConDiv);
		
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

			const targetKeyword = replaceKeyword ? replaceKeyword : keywords[0];

			keywords.forEach((keyword) => {
				//$(li).append($("<div>").addClass("keyword").text(keyword));
				$(li).append($("<div>").addClass("keyword").text(keyword));
			});

			tags.forEach((tag) => $(li).append($("<div>").addClass("tag").text(tag)));
			
			$(li).attr("data-bs-toggle", "tooltip");
			$(li).attr("title", `${keywords.join(",")}\r\n태그 : ${tags.join(",")}`);
			$(li).attr("data-bs-placement", "top");
			

			(function(keyword) { $(li).click(function(e) {
				e.preventDefault();
				$("#dcconPaste").val("~"+keyword);
				DOMMessageHandler.handleDcconClick("~"+keyword);
			});
			})(targetKeyword);
			
			ul.get(0).appendChild(li);
		}
		
		div.append(ul);
		this.$dcconWindow = div;
    }

	updateScribe(scribe) {
		if(scribe) {
			this.addTarget = document.getElementsByClassName(chzzkDOM.chatActionArea)[0];
		} else {
			this.addTarget = undefined;
		}
    }

    update(state) {
        if(state) {
			const cloneDiv = this.$dcconWindow.clone(true, true);
			this.addTarget.appendChild(cloneDiv.get(0));
			this.attachDcconWindow = cloneDiv;

			if(!window.dcconColumnFixed) {
				this.dcconWidthObserver.observe(this.attachDcconWindow.get(0));
			}

			$('input#dcconName').quicksearch('ul.dcconList li', {
				'delay': 100,
				'selector': 'div.keyword',
				'onAfter': function() {
					$('ul.dcconList').scroll(0,0);
				}
			});
			$('input#dcconTag').quicksearch('ul.dcconList li', {
				'delay': 100,
				'selector': 'div.tag',
				'onAfter': function() {
					$('ul.dcconList').scroll(0,0);
				}
			});
			
			new ClipboardJS(".pasteCon").on('success', function(e) {
				if(window.showCopyToast) {
					showCopyToast(e.text);
				}
			});
		} else {
			if(this.attachDcconWindow != undefined) {
				this.attachDcconWindow.remove();
				if(!window.dcconColumnFixed) {
					this.dcconWidthObserver.disconnect();
				}
			}
		}
    } 
}