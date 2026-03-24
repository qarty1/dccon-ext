import EventEmitter from 'eventemitter3';
import { EVENT_KEYS } from '../config/event-keys';
import PreferencesHandler from '../config/preferences-handler';

export interface UserActionObserverEvents {
  [EVENT_KEYS.USER_KEY_DOWN]: (event: KeyboardEvent) => void;
  [EVENT_KEYS.USER_INPUT]: (event: Event) => void;
  [EVENT_KEYS.INPUT_CHAT]: (text: string) => void;
  [EVENT_KEYS.SEND_CHAT]: (text: string) => void;
  [EVENT_KEYS.CLICK_DCCON]: (text: string) => void;
  [EVENT_KEYS.CLICK_DCCON_LONG]: (text: string) => void;
  [EVENT_KEYS.CLICK_DCCON_SET_EVENT]: (text: string, forceEvent: number) => void;
  [EVENT_KEYS.USER_CLICK_SEND]: (event: MouseEvent) => void;
}

export class UserActionObserver extends EventEmitter<UserActionObserverEvents> {
  private chatInputSelector: string = '';
  private chatSendButtonSelector: string = '';
  private boundKeydownHandler: (e: KeyboardEvent) => void;
  private boundInputHandler: (e: Event) => void;
  private boundClickHandler: (e: MouseEvent) => void;
  private boundMousedownHandler: (e: MouseEvent) => void;

  constructor() {
    super();
    this.boundKeydownHandler = this.handleKeydown.bind(this);
    this.boundInputHandler = this.handleInput.bind(this);
    this.boundClickHandler = this.handleClick.bind(this);
    this.boundMousedownHandler = this.handleMousedown.bind(this);
  }

  /**
   * 채팅 입력창에 대한 이벤트 감지 시작 (이벤트 위임 방식 사용)
   * @param chatInputSelector 채팅 입력창 셀렉터
   * @param chatSendButtonSelector 채팅 전송 버튼 셀렉터
   */
  public startObserving(chatInputSelector: string, chatSendButtonSelector: string): void {
    this.chatInputSelector = chatInputSelector;
    this.chatSendButtonSelector = chatSendButtonSelector;
    // DOM이 교체되더라도 이벤트를 놓치지 않도록 document 레벨에서 캡처링
    document.addEventListener('keydown', this.boundKeydownHandler, true);
    document.addEventListener('input', this.boundInputHandler, true);
    document.addEventListener('click', this.boundClickHandler, true);
    document.addEventListener('mousedown', this.boundMousedownHandler, true);
  }

  /**
   * 이벤트 리스너 제거 및 초기화
   */
  public disconnect(): void {
    document.removeEventListener('keydown', this.boundKeydownHandler, true);
    document.removeEventListener('input', this.boundInputHandler, true);
    document.removeEventListener('click', this.boundClickHandler, true);
    document.removeEventListener('mousedown', this.boundMousedownHandler, true);
    this.chatInputSelector = '';
    this.chatSendButtonSelector = '';
  }

  /**
   * 외부 UI 컴포넌트에서 발생한 디시콘 클릭 이벤트를 중계합니다.
   * @param text 입력할 디시콘 키워드 (예: "~고양이")
   */
  public notifyDcconClick(text: string): void {
    this.emit(EVENT_KEYS.CLICK_DCCON, text);
  }

  /**
   * 외부 UI 컴포넌트에서 발생한 디시콘 롱클릭 이벤트를 중계합니다.
   * @param text 입력할 디시콘 키워드 (예: "~고양이")
   */
  public notifyDcconLongClick(text: string): void {
    this.emit(EVENT_KEYS.CLICK_DCCON_LONG, text);
  }

   /**
   * 외부 UI 컴포넌트에서 발생한 디시콘 클릭 이벤트를 중계합니다.
   * @param text 입력할 디시콘 키워드 (예: "~고양이")
   */
  public notifyDcconClickForceEvent(text: string, forceEvent: number): void {
    this.emit(EVENT_KEYS.CLICK_DCCON_SET_EVENT, text, forceEvent);
  }

  private handleKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (target && this.chatInputSelector && (target.closest(this.chatInputSelector) || target.closest('.dcconDiv'))) {
      this.emit(EVENT_KEYS.USER_KEY_DOWN, event);
    }
  }

  private handleInput(event: Event): void {
    const target = event.target as HTMLElement;
    if (target && this.chatInputSelector && target.closest(this.chatInputSelector)) {
      this.emit(EVENT_KEYS.USER_INPUT, event);
    }
  }

  private handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target && this.chatSendButtonSelector && target.closest(this.chatSendButtonSelector)) {
      this.emit(EVENT_KEYS.USER_CLICK_SEND, event);
    }
  }

  private handleMousedown(event: MouseEvent): void {
    if (event.button !== 0) return; // 왼쪽 클릭만 처리

    const target = event.target as HTMLElement;
    if (!target) return;

    // 외부 확장 프로그램(iconttv) 디시콘 클릭 호환성 처리
    const iconttvElement = target.closest('.iconttv');
    if (iconttvElement) {
      const iconttvCompatiableMode = PreferencesHandler.getCached(PreferencesHandler.ICONTTV_COMPATIBILITY_MODE);
      if (iconttvCompatiableMode) {
        const altText = iconttvElement.getAttribute('alt');
        if (altText) {
          event.preventDefault();
          event.stopPropagation();
          
          // AppListener로 이벤트를 보내 사용자가 설정한 동작(복사, 입력 등)을 수행합니다.
          // 만약 무조건 "복사만" 수행되게 강제하고 싶다면 아래 주석 처리된 줄을 대신 사용하세요.
          this.emit(EVENT_KEYS.CLICK_DCCON, altText);
          // this.notifyDcconClickForceEvent(altText, PreferencesHandler.IMAGE_ACTION_MAP.COPY_ONLY);
        }
      }
    }
  }
}