import EventEmitter from 'eventemitter3';
import { EVENT_KEYS } from '../config/event-keys';

export interface DOMObserverEvents {
  [EVENT_KEYS.CHAT_CONTAINER_READY]: () => void;
  [EVENT_KEYS.NEW_CHAT_MESSAGE]: (node: Node) => void;
}

export class DOMObserver extends EventEmitter<DOMObserverEvents> {
  private observer: MutationObserver | null = null;
  private chatContainer: Element | null = null;
  private chatContainerSelector: string = '';
  private chatItemSelector: string = '';

  constructor() {
    super();
  }

  /**
   * 채팅 컨테이너 및 메시지 변화 감지 시작
   * @param chatContainerSelector 채팅창을 감싸는 컨테이너 셀렉터
   * @param chatItemSelector 개별 채팅 메시지 노드 셀렉터
   */
  public startObserving(chatContainerSelector: string, chatItemSelector: string): void {
    this.disconnect(); // 기존 옵저버 정리

    this.chatContainerSelector = chatContainerSelector;
    this.chatItemSelector = chatItemSelector;
    
    // 1. 페이지에 이미 채팅창이 있는지 즉시 확인합니다.
    const container = document.querySelector(this.chatContainerSelector);

    if (container) {
      // 있다면, 바로 채팅 메시지 감시를 시작합니다.
      this.observeChatMessages(container);
    } else {
      // 없다면, 채팅 컨테이너가 생길 때까지 body를 감시합니다.
      this.observeForChatContainer();
    }
  }

  /**
   * 모니터링 중지 및 초기화
   */
  public disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.chatContainer = null;
  }

  /**
   * body를 감시하여 채팅 컨테이너를 찾습니다.
   */
  private observeForChatContainer(): void {
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          const element = node as HTMLElement;
          const foundContainer = element.matches(this.chatContainerSelector) ? element : element.querySelector(this.chatContainerSelector);

          if (foundContainer) {
            this.observer?.disconnect(); // body 감시 중지
            this.observeChatMessages(foundContainer); // 채팅 메시지 감시로 전환
            return;
          }
        }
      }
    });
    this.observer.observe(document.body, { childList: true, subtree: true });
  }

  /**
   * 채팅 컨테이너 내부의 메시지 추가를 감시합니다.
   */
  private observeChatMessages(container: Element): void {
    this.chatContainer = container;
    this.emit(EVENT_KEYS.CHAT_CONTAINER_READY);

    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          const element = node as HTMLElement;
          const newItems = element.matches(this.chatItemSelector) ? [element] : Array.from(element.querySelectorAll(this.chatItemSelector));
          for (const item of newItems) {
            this.emit(EVENT_KEYS.NEW_CHAT_MESSAGE, item);
          }
        }
      }
    });
    this.observer.observe(this.chatContainer, { childList: true, subtree: true });
  }
}