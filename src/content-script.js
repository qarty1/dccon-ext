import PreferencesHandler from "./modules/preferences-handler.js";
import {ObservableState as State} from "./modules/observable-state.js"
import {ChzzkDOMController, domMessage, chzzkDOM} from "./modules/chzzk-dom-controller.js";
import { DcconBtnObserver } from "./observer/dccon-button-observer.js";
import { DcconWindowObserver } from "./observer/dccon-window-observer.js";
import { DcconChatWindowObserver } from "./observer/dccon-chat-window-observer.js";
import { DcconMqObserver } from "./observer/dccon-mq-observer.js";

const enableDcconKey = [
	"7d4157ae4fddab134243704cab847f23",
	"df41352562ee012a0b43831fd675775f"
];

var browser = require("webextension-polyfill");

const script = document.createElement('script');
script.src = browser.runtime.getURL('common/iconttv-detect.js');
(document.head || document.documentElement).appendChild(script);

window.addEventListener('message', function(event) {
	// 보낸 곳이 같은 페이지인지 확인
	if (event.source !== window) return;

	// 원하는 데이터가 있는 메시지인지 확인
	if (event.data.type && event.data.type === 'iconttv') {
	console.log('Received variable:', event.data.variable);
	this.window.iconttv = event.data.variable;
	// 여기서 event.data.variable을 사용
	}
});

var iconttvDetect = window.iconttv;

const dcconActive = await PreferencesHandler.getDcconActive();
const imageAction = await PreferencesHandler.getImageAction();
const chatToDccon = await PreferencesHandler.getChatToDccon();
const showCopyToast = await PreferencesHandler.getShowCopyToast();
const dcconWindowWidth = await PreferencesHandler.getDcconWindowWidth();
const dcconNewline = await PreferencesHandler.getDcconNewline();
const showScrollbar = await PreferencesHandler.getShowScrollbar();
const iconttvCompatiableMode = await PreferencesHandler.getIconttvCompatible();
const useTagConverter = await PreferencesHandler.getUseTagConverter();
const dcconColumnFixed = await PreferencesHandler.getDcconColumnFixed(); 
const dcconColumnCount = await PreferencesHandler.getDcconColumnCount();
const actionKey = await PreferencesHandler.getActionKey();

window.dcconActive = dcconActive;
window.imageAction = imageAction;
window.chatToDccon = chatToDccon;
window.showCopyToast = showCopyToast;
window.dcconWindowWidth = dcconWindowWidth;
window.dcconNewline = dcconNewline;
window.showScrollbar = showScrollbar;
window.iconttvCompatiableMode = iconttvCompatiableMode;
window.useTagConverter = useTagConverter;
window.dcconColumnFixed = dcconColumnFixed;
window.dcconColumnCount = dcconColumnCount;
window.actionKey = actionKey;

var dcconState = new State();
var dcconChatState = new State();
var inputState = new State();

var dcconMqObserver = new DcconMqObserver();
var chzzkDOMController = new ChzzkDOMController();
const btnObserver = new DcconBtnObserver(dcconState);
const windowObserver = new DcconWindowObserver(dcconState);
const chatWindowObserver = new DcconChatWindowObserver(dcconChatState);

var frameObserver = new MutationObserver((mutationsList) => {
	for (const mutation of mutationsList) {

		mutation.removedNodes.forEach((node) => {
			if(node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SECTION') {
				if(node.classList.contains(chzzkDOM.liveContainer)) {
					
					$(`.${chzzkDOM.chatActionArea}`).find(`.${chzzkDOM.inputContainer}`).remove("#dcconBtn");
					dcconState.unsubscribe(btnObserver);
					dcconState.unsubscribe(windowObserver);
					dcconChatState.unsubscribe(chatWindowObserver);
					inputState.unsubscribe(chzzkDOMController);
				}
			}
			if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'DIV')  {
				if (node.classList.contains(chzzkDOM.chatActionArea)) {
					$(`.${chzzkDOM.chatActionArea}`).find(`.${chzzkDOM.inputContainer}`).remove("#dcconBtn");
					dcconState.unsubscribe(btnObserver);
					dcconState.unsubscribe(windowObserver);
					dcconChatState.unsubscribe(chatWindowObserver);
					inputState.unsubscribe(chzzkDOMController);
				}
				if (node.classList.contains('dcconDiv')) {
					$(".tooltip").remove();
				}
			}
		});

		mutation.addedNodes.forEach((node) => {
			if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'DIV')  {
				if (node.classList.contains(chzzkDOM.chatActionArea)) {
					const loc = window.location.href;
					let enableFlag = false;
					enableDcconKey.forEach(element => {
						if(loc.includes(element)) {
							enableFlag = true;
						}
					});
					if(enableFlag) {
						dcconState.subscribe(btnObserver);
						dcconState.subscribe(windowObserver);
						dcconChatState.subscribe(chatWindowObserver);
						inputState.subscribe(chzzkDOMController);
						const chatTargetNode = document.getElementsByClassName(chzzkDOM.chatItemWrapper)[0];
						chatObserver.observe(chatTargetNode, observerConfig);
					} else {
						$(`.${chzzkDOM.chatActionArea}`).find(`.${chzzkDOM.inputContainer}`).remove("#dcconBtn");
						dcconState.unsubscribe(btnObserver);
						dcconState.unsubscribe(windowObserver);
						dcconChatState.unsubscribe(chatWindowObserver);
						inputState.unsubscribe(chzzkDOMController);
						chatObserver.disconnect();
					}
				}
			}
			
			if (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() === chzzkDOM.chatInputActiveTag) {
					
				if (node.classList.contains(chzzkDOM.chatInput)) {
					inputState.setState(true);
					$(node).on("keydown", (e) => {
						
						if(e.originalEvent.key == 'Enter' || e.originalEvent.key == 'Escape') {
							dcconState.setState(false);
							dcconChatState.setState(false);
						}

						if(e.key == actionKey) {
							if(dcconChatState.getState()) {
								e.preventDefault();
								e.stopPropagation();
								$("ul.dcconList li:visible").eq(0).focus();
							}
						}
						dcconMqObserver.keydown(e);
					});
					$(node).on("input", (e) => {
						dcconMqObserver.input(e);
					});
					
				}
			}

			if (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() === chzzkDOM.chatInputInActiveTag) {
				
				if (node.classList.contains(chzzkDOM.chatInput)) {
					inputState.setState(false);
					$('.tooltip').remove();
				}
			}
		});
	}
});
var chatObserver = new MutationObserver((mutationsList) => {
	for (const mutation of mutationsList) {

		mutation.addedNodes.forEach((node) => {
			if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'DIV')  {
				if(node.classList.contains(chzzkDOM.chatItemContainer)) {
					if($(node).find(`.${chzzkDOM.chatText}`).find("img").length == 0) {
						dcconMqObserver.handleChatting(node);
					}
				}
			}
		});
	}
});

function showToast(text) {
	const toast = document.createElement("div");
	toast.classList.add("copyToast");
	
	toast.innerText = `"${text}" 복사 완료!`;
	document.getElementsByClassName(chzzkDOM.chatActionArea)[0].appendChild(toast);
	
	setTimeout(() => {
		toast.classList.add('dccon-fade-out');
	}, 400);
	
	toast.addEventListener('transitionend', function() {
		toast.remove();
	});
}
function handleDcconClick(text) {
	const tempTextArea = document.createElement("textarea");
	tempTextArea.value = text;
	document.body.appendChild(tempTextArea);
	tempTextArea.select();
	document.execCommand("copy");
	document.body.removeChild(tempTextArea);

	if(showCopyToast) {
		showToast(text);
	}
	if(imageAction == PreferencesHandler.IMAGE_ACTION_MAP.COPY_AND_INPUT) {
		(async() => {
			
			let activeChat = await chzzkDOMController.activeChat();
			
			if(activeChat) {
				chzzkDOMController.inputChat(text);
			}
		})();
	}

	if(imageAction == PreferencesHandler.IMAGE_ACTION_MAP.COPY_AND_SEND) {
		
		(async() => {
			let activeChat = await chzzkDOMController.activeChat();
			if(activeChat) {
				chzzkDOMController.inputChat(text);
				let sendSuccess = await chzzkDOMController.sendChat();
				
				if(sendSuccess) {
					dcconChatState.setState(false);
					dcconState.setState(false);
					$('.tooltip').remove();
				}
			}
		})();
	}
}

$(function() {
	
	new bootstrap.Tooltip(document.body, {
		selector: 'ul.dcconList li, img.dccon'
	});
	
	$(document).on("mousedown", `.${chzzkDOM.chatSendButton}`, function(e) {
		dcconState.setState(false);
	});

	$(document).on("input", `.${chzzkDOM.chatInput}`, function(e) {		

		if(chzzkDOMController.getTextRangeAroundCaret() === '~') {
			if(dcconChatState.getState() == false) {
				dcconChatState.setState(true);
				dcconState.setState(false);
			}
		}
		if(chzzkDOMController.getTextRangeAroundCaret().trim() === '') {
			dcconChatState.setState(false);
		}
	});

	
	if(iconttvCompatiableMode && iconttvDetect) {
		$(document).on("mousedown", ".iconttv", function(e) {
			handleDcconClick($(this).attr("alt"));
		});
	}
});
const observerConfig = { childList: true, subtree: true };

if(dcconActive) {
	if (document.readyState === 'loading') { 

	} else {
		//const frameTargetNode = document.getElementById(chzzkDOM.layoutBody);
		const frameTargetNode = document.body;
		frameObserver.observe(frameTargetNode, observerConfig);
	}
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.msg === domMessage.ACTIVE_INPUT) {
		chzzkDOMController.activeChat();
    }

	if (message.msg === domMessage.INPUT_CHAT) {
		const {text, addFlag, trigInput} = message.data;
		(async () => {
			let active = await chzzkDOMController.activeChat();
			if(active) {
				chzzkDOMController.inputChat(text, addFlag, trigInput);
				dcconChatState.setState(false);
			};
		})();
    }

	if (message.msg === domMessage.SEND_CHAT) {
		const {text, addFlag, trigInput} = message.data;
		(async () => {
			let active = await chzzkDOMController.activeChat();
			if(active) {
				chzzkDOMController.inputChat(text, addFlag, trigInput);
				let sendSuccess = await chzzkDOMController.sendChat();
				if(sendSuccess) {
					dcconChatState.setState(false);
				}
			};
		})();
    }
	if (message.msg === domMessage.CLICK_DCCON) {
		const text = message.data.text;
		handleDcconClick(text);
    }
});