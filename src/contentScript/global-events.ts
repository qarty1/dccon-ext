import { DOMObserver } from './observers/dom-observer';
import { URLObserver } from './observers/url-observer';
import { UserActionObserver } from './observers/user-action-observer';

/**
 * 애플리케이션 전역에서 사용되는 옵저버 인스턴스들을 관리하는 중앙 저장소
 */
export const globalObservers = {
  url: null as URLObserver | null,
  dom: null as DOMObserver | null,
  userAction: null as UserActionObserver | null,

  init() {
    this.url = new URLObserver(document.body);
    this.dom = new DOMObserver();
    this.userAction = new UserActionObserver();
  }
};