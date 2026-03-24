/**
 * URL 변경 모니터링 모듈
 * MutationObserver를 사용하여 DOM 변경 시 URL 변경 감지
 */
import EventEmitter from 'eventemitter3';
import { EVENT_KEYS } from '../config/event-keys';

export interface URLObserverEvents {
  [EVENT_KEYS.URL_CHANGED]: (url: string) => void;
}

export class URLObserver extends EventEmitter<URLObserverEvents> {
  private currentURL: string;
  private observer: MutationObserver | null = null;

  constructor(target: Element = document.body) {
    super();
    this.currentURL = window.location.href;
    this.setupObserver(target);
  }

  /**
   * 현재 URL 반환
   */
  public getCurrentURL(): string {
    return this.currentURL;
  }

  /**
   * 모니터링 중지
   */
  public disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  /**
   * MutationObserver 설정
   */
  private setupObserver(target: Element): void {
    this.observer = new MutationObserver(() => {
      this.checkURLChange();
    });

    this.observer.observe(target, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['href', 'src'] // 필요한 경우 조정
    });
  }

  /**
   * URL 변경 확인
   */
  private checkURLChange(): void {
    const newURL = window.location.href;
    if (newURL !== this.currentURL) {
      this.currentURL = newURL;
      this.emit(EVENT_KEYS.URL_CHANGED, newURL);
    }
  }
}