import { DcconSelector } from './dccon-selector';
import { EVENT_KEYS } from './config/event-keys';
import { extractStreamerHandle } from './utils/streamer-handle';
import { globalObservers } from './global-events';
import { STREAMER_HANDLE, PLATFORM_STR } from './config/constants';
import { ChatConverter } from './chat-converter';
import { DcconButton } from './component/dccon-button';
import { DcconWindow } from './component/dccon-window';
import { DcconWindowTyping } from './component/dccon-window-typing';
import PreferencesHandler from './config/preferences-handler';
import { DOMController } from './domController/dom-controller';
import { GlobalUtils } from './utils/global-utils';

export class AppListener {
  private chatConverter: ChatConverter;
  private dcconButton: DcconButton;
  private dcconWindow: DcconWindow;
  private dcconWindowTyping: DcconWindowTyping;
  private isDcconOpen: boolean = false; // 중앙 상태 관리 변수 추가
  private isDcconTypingOpen: boolean = false;
  private domController: DOMController;
  private lastInputText: string = ''; // 직전 입력 텍스트를 저장할 변수

  constructor(private selector: DcconSelector) {
    // 1. 인스턴스를 한 번만 생성 (메모리 누수 및 재생성 렉 방지)
    this.dcconButton = new DcconButton(this.selector.getDomSelectors(), () => this.toggleDccon());
    this.dcconWindow = new DcconWindow(this.selector.getDomSelectors(), () => this.setDcconState(false));
    this.dcconWindowTyping = new DcconWindowTyping(this.selector.getDomSelectors(), () => this.setDcconTypingState(false));
    this.chatConverter = new ChatConverter(this.selector.getDomSelectors());
    this.domController = this.selector.getDomController();

    this.setupListeners();

    // 2. 리스너 생성 시점에 현재 URL을 검사하여 감시 여부 결정
    this.checkAndObserve(window.location.href);

  }

  private setupListeners() {
    this.selector.on(EVENT_KEYS.URL_CHANGED, this.onUrlChanged.bind(this));
    this.selector.on(EVENT_KEYS.CHAT_CONTAINER_READY, this.onChatContainerReady.bind(this));
    this.selector.on(EVENT_KEYS.NEW_CHAT_MESSAGE, this.onNewChatMessage.bind(this));
    this.selector.on(EVENT_KEYS.CLICK_DCCON, this.onClickDccon.bind(this));
    this.selector.on(EVENT_KEYS.CLICK_DCCON_LONG, this.onClickDcconLong.bind(this));
    this.selector.on(EVENT_KEYS.CLICK_DCCON_SET_EVENT, this.onClickDcconSetEvent.bind(this));
    this.selector.on(EVENT_KEYS.USER_KEY_DOWN, this.onUserKeyDown.bind(this));
    this.selector.on(EVENT_KEYS.USER_CLICK_SEND, this.onUserClickSend.bind(this));
    this.selector.on(EVENT_KEYS.USER_INPUT, this.onUserInput.bind(this));
  }

  private onUrlChanged(url: string) {
    // 2. URL이 변경되면, 핸들을 검사하여 DOM 감시를 시작/중지
    this.checkAndObserve(url);
  }

  private isValidUrl(url: string): boolean {
    const platform = this.selector.getPlatform();
    const handle = extractStreamerHandle(platform, url);
    const validHandles = STREAMER_HANDLE[platform as keyof typeof STREAMER_HANDLE];
    
    return !!(handle && validHandles && (validHandles as readonly string[]).includes(handle));
  }

  private checkAndObserve(url: string) {
    const platform = this.selector.getPlatform();
    const handle = extractStreamerHandle(platform, url);
    // console.log(`[AppListener] Checking URL... Platform: ${platform}, Handle: ${handle}`);

    if (this.isValidUrl(url)) {
      // console.log(`[AppListener] Valid handle detected. Starting DOM observer.`);
      this.startDOMObserver();
    } else {
      // console.log(`[AppListener] Invalid or no handle detected. Stopping DOM observer.`);
      this.stopDOMObserver();
    }
  }

  private onChatContainerReady() {
    // DOM이 준비되었더라도 유효한 방송 주소가 아니라면 UI를 마운트하지 않음
    if (!this.isValidUrl(window.location.href)) return;

    // console.log('[AppListener] Chat container is ready (mounted).');

    this.dcconButton.mount();
    this.dcconWindow.mount();
    this.dcconWindowTyping.mount();
    this.domController.init();
    
    // Cime 플랫폼의 경우 최초 로드 시 이미 존재하는 채팅 내역을 일괄 변환
    if (this.selector.getPlatform() === PLATFORM_STR.CIME) {
      const selectors = this.selector.getDomSelectors();
      const existingChats = document.querySelectorAll(selectors.chatItemContainer);
      existingChats.forEach(chatNode => {
        this.onNewChatMessage(chatNode);
      });
    }
  }

  private toggleDccon() {
    this.setDcconState(!this.isDcconOpen);
  }

  private setDcconState(isOpen: boolean) {
    this.isDcconOpen = isOpen;
    this.dcconButton.setActive(isOpen);
    this.dcconWindow.setVisibility(isOpen);
  }

  private setDcconTypingState(isOpen: boolean) {
    this.isDcconTypingOpen = isOpen;
    this.dcconWindowTyping.setVisibility(isOpen);
  }

  private onClickDccon(text: string) {
    const clickAction = PreferencesHandler.getCached(PreferencesHandler.IMAGE_ACTION);
    this.handleDcconAction(text, clickAction);
  }

  private onClickDcconLong(text: string) {
    //console.log(`[AppListener] Long clicked: ${text}`);
    const clickAction = PreferencesHandler.getCached(PreferencesHandler.IMAGE_ACTION);
    this.handleDcconAction(text+text, clickAction);
  }

  private onClickDcconSetEvent(text: string, forceEvent: number) {
    this.handleDcconAction(text, forceEvent);
  }

  private handleDcconAction(text: string, action: number) {
    const selectors = this.selector.getDomSelectors();

    // 타이핑 자동완성 창이 열려있다면 기존 텍스트 뒤에 추가하는 것이 아니라 caretPos부터 덮어씁니다.
    const isTyping = this.isDcconTypingOpen;
    const addFlag = !isTyping;
    const pos = isTyping ? this.dcconWindowTyping.getCaretPos() : undefined;
    const showToast = PreferencesHandler.getCached(PreferencesHandler.SHOW_COPY_TOAST);

    switch(action) {
      case PreferencesHandler.IMAGE_ACTION_MAP.COPY_ONLY:
        navigator.clipboard.writeText(text).then(() => {
          //console.log('디시콘 텍스트가 클립보드에 복사되었습니다.');
          if (showToast) GlobalUtils.showToast(text, document.querySelector(selectors.chatActionArea) as HTMLElement);
          if (isTyping) this.setDcconTypingState(false);
        });
        break;
      case PreferencesHandler.IMAGE_ACTION_MAP.COPY_AND_INPUT:
        navigator.clipboard.writeText(text).then(async () => {
          //console.log('디시콘 텍스트가 클립보드에 복사되었습니다.');
          const activeChat = await this.domController.activateChat();
          if (activeChat) {
            this.domController.inputChat(text, addFlag, true, pos);
            if (showToast) GlobalUtils.showToast(text, document.querySelector(selectors.chatActionArea) as HTMLElement);
            if (isTyping) this.setDcconTypingState(false);
            this.lastInputText = '';
          } else {
            console.warn('채팅 입력창을 활성화하는 데 실패했습니다.');
          }
        }); 
        break;
      case PreferencesHandler.IMAGE_ACTION_MAP.COPY_AND_SEND:
        navigator.clipboard.writeText(text).then(async () => {
          //console.log('디시콘 텍스트가 클립보드에 복사되었습니다.');
          if (showToast) GlobalUtils.showToast(text, document.querySelector(selectors.chatActionArea) as HTMLElement);
          const activeChat = await this.domController.activateChat();
          if (activeChat) {
            this.domController.inputChat(text, addFlag, true, pos);
            const sendSuccess = await this.domController.sendChat();
            if(sendSuccess) {
              this.setDcconState(false);
              this.setDcconTypingState(false);
              this.lastInputText = ''; // 채팅 전송 후 직전 텍스트 상태 초기화
            }
          } else {
            console.warn('채팅 입력창을 활성화하는 데 실패했습니다.');
          }
        }); 
        break;
      default:
        console.warn(`[AppListener] Unknown click action: ${action}`);
    }
  }

  private onUserKeyDown(event: KeyboardEvent) {
    const actionKey = PreferencesHandler.getCached(PreferencesHandler.ACTION_KEY);
    
    if (event.key === actionKey) {
      this.chatConverter.autoCompleteMQ(event);
    }

    // 자동완성 창이 열려 있을 때의 키보드 제어
    if (this.isDcconTypingOpen) {
      // 1. 포커스가 이미 자동완성 창 내부에 있는 경우
      if (this.dcconWindowTyping.hasFocus()) {
        if (event.key === actionKey && !event.shiftKey) {
          event.preventDefault();
          event.stopPropagation();
          this.dcconWindowTyping.focusNextItem(); // 다음 항목으로 이동
          return;
        }
        if (event.key === 'Enter') {
          // 항목 선택용 엔터이므로, 아래의 창 닫기 로직을 타지 않게 방어
          return; 
        }
      } 
      // 2. 포커스가 채팅 입력창에 있고 actionKey를 누른 경우
      else if (event.key === actionKey && !event.shiftKey) {
        event.preventDefault();
        event.stopPropagation();
        this.dcconWindowTyping.focusNextItem(); // 창으로 포커스 진입
        return;
      }
    }

    if (event.key === 'Enter' || event.key === 'Escape') {
      // 일반 디시콘 창의 검색 입력창에서 엔터를 쳤을 때 창이 닫히는 것을 방지
      const target = event.target as HTMLElement;
      if (event.key === 'Enter' && target.tagName === 'INPUT' && target.closest('.dcconDiv')) {
        return;
      }
      
      this.setDcconState(false);
      this.setDcconTypingState(false);
      const chatInput = document.querySelector(this.selector.getDomSelectors().chatInput) as HTMLElement;
      if (chatInput) {
        chatInput.focus();
      }

      if (event.key === 'Enter') {
        this.lastInputText = ''; // 엔터 키로 채팅 전송 시 직전 텍스트 상태 초기화
      }
    }
  }

  private onUserInput(event: Event) {
    // 확장 프로그램(디시콘 클릭 등)이 자바스크립트로 강제 발생시킨 이벤트는 무시합니다.
    document.querySelectorAll('div[data-tippy-root]').forEach(el => el.remove()); // tippy로 생성된 툴팁이 남아있는 경우 제거
    
    if (!event.isTrusted) return;

    const target = event.target as HTMLElement;
    const inputEvent = event as InputEvent;
    let text = '';

    // 플랫폼별로 input이 textarea일 수도, contenteditable div일 수도 있으므로 분기 처리
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      text = target.value;
    } else {
      text = target.textContent || target.innerText || '';
    }

    // 실제 텍스트 내용의 변경이 없는 중복 이벤트(Firefox 한글 조합 완료 시 발생하는 이벤트 등) 방어
    if (this.lastInputText === text) {
      return;
    }
    this.lastInputText = text; // 다음 비교를 위해 현재 텍스트 저장

    if (inputEvent.data === ']') {
      this.chatConverter.autoClose(inputEvent);
    }

    // 디시콘 자동완성 창 사용 옵션이 꺼져있으면 여기서 이벤트를 중단합니다.
    if (!PreferencesHandler.getCached(PreferencesHandler.USE_DCCON_WINDOW_TYPING)) {
      return;
    }

    // 자동완성 창이 닫혀있는 상태에서 새로 입력된 문자가 '~'가 아니라면 무시합니다.
    // 이를 통해 디시콘 입력 후 다른 문자를 칠 때 자동완성 창이 다시 열리는 것을 방지합니다.
    if (!this.isDcconTypingOpen && inputEvent.data !== '~') {
      return;
    }

    const lastTildeIndex = text.lastIndexOf('~');
    
    if (lastTildeIndex !== -1) {

      if((event as InputEvent).isComposing === false && (event as InputEvent).inputType === "insertCompositionText") {
        return;
      }

      if (document.activeElement !== target) {
        return;
      }
      
      const keyword = text.slice(lastTildeIndex + 1);
      
      // 공백이나 줄바꿈이 포함되어 있으면 일반 채팅으로 간주하고 검색을 중단
      if (!/[\s]/.test(keyword)) {
        this.dcconWindowTyping.setCaretPos(lastTildeIndex);
        this.setDcconTypingState(true);
        this.dcconWindowTyping.filter(keyword);
        return;
      }
    }
    
    this.setDcconTypingState(false);
  }

  private onUserClickSend(event: MouseEvent) {
    // 전송 버튼 클릭 시 디시콘 윈도우 닫기
    this.setDcconState(false);
    this.setDcconTypingState(false);
    this.lastInputText = ''; // 클릭으로 채팅 전송 시 직전 텍스트 상태 초기화
  }

  private onNewChatMessage(node: Node) {
    // 새로 추가된 채팅 텍스트 영역 내부에 <img> 태그가 포함되어 있다면 변환을 수행하지 않고 무시합니다. (프로필, 배지 등은 제외)
    if (node instanceof Element) {
      const chatTextSelector = this.selector.getDomSelectors().chatText;
      const chatTextNode = node.querySelector(chatTextSelector);
      if (chatTextNode && chatTextNode.querySelector('img')) {
        return;
      }
    }

    const iconttvCompatiableMode = PreferencesHandler.getCached(PreferencesHandler.ICONTTV_COMPATIBILITY_MODE);
    const isIconttvDetected = this.selector.getIconttvDetected();

    // 호환성 모드가 켜져있고, 외부 확장이 감지되었다면 디시콘 이미지 변환만 건너뜁니다.
    const skipDcconConversion = iconttvCompatiableMode && isIconttvDetected;

    // 새 채팅 메시지가 감지되면 디시콘 및 마퀴 태그 변환 모듈 호출
    const chatToDccon = PreferencesHandler.getCached(PreferencesHandler.CHAT_TO_DCCON);
    if(skipDcconConversion) return;

    if (chatToDccon) {
      this.chatConverter.handleChatting(node as Element);
    }
  }

  private startDOMObserver() {
    const selectors = this.selector.getDomSelectors();

    if (globalObservers.dom && selectors) {
      globalObservers.dom.startObserving(selectors.chatListContainer, selectors.chatItemContainer);
    }
    
    if (globalObservers.userAction && selectors) {
      globalObservers.userAction.startObserving(selectors.chatInput, selectors.chatSendButton);
    }

    //this.setDcconState(true);

    this.dcconButton.mount();
    this.dcconWindow.mount();
    this.dcconWindowTyping.mount();
    this.domController.init();
  }

  private stopDOMObserver() {
    if (globalObservers.dom) {
      globalObservers.dom.disconnect();
    }
    
    if (globalObservers.userAction) {
      globalObservers.userAction.disconnect();
    }

    this.setDcconState(false);
    this.setDcconTypingState(false);
    this.dcconButton.unmount();
    this.dcconWindow.unmount();
    this.dcconWindowTyping.unmount();
  }
}