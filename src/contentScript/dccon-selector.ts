import browser from 'webextension-polyfill';
import { globalObservers } from './global-events';
import { EVENT_KEYS } from './config/event-keys';
import EventEmitter from 'eventemitter3';
import { PLATFORM_STR } from './config/constants';
import { DOMSelectors } from './domSelector/domSelectors';
import { ChzzkDOMSelectors } from './domSelector/chzzkDOM';
import { CimeDOMSelctors } from './domSelector/cimeDOM';
import {DOMController} from './domController/dom-controller';
import {CimeDOMController} from './domController/cime-dom-controller';
import {ChzzkDOMController} from './domController/chzzk-dom-controller';  
import { AppListener } from './app-listener';

export class DcconSelector extends EventEmitter {
  private platform: string;
  private domSelectors: DOMSelectors;
  private domControler: DOMController;
  private iconttvDetected: boolean = false;
  
  constructor(platform: string) {
    super();
    this.platform = platform;
    this.domSelectors = this.platform === PLATFORM_STR.CHZZK ? ChzzkDOMSelectors : CimeDOMSelctors;
    if(this.platform === PLATFORM_STR.CHZZK) {
        this.domControler = new ChzzkDOMController(this.domSelectors);
    } else if(this.platform === PLATFORM_STR.CIME) {
        this.domControler = new CimeDOMController(this.domSelectors);
    } else {
        throw new Error(`Unsupported platform: ${this.platform}`);
    }
    this.init();
  }

  private init() {
    // console.log('[DcconSelector] Initializing...');

    // 0. 외부 확장 프로그램(iconttv 등) 변수 감지를 위한 메시지 리스너 등록
    window.addEventListener('message', (event) => {
      if (event.source !== window) return;
      if (event.data && event.data.type === 'iconttv') {
        this.iconttvDetected = !!event.data.variable;
        // console.log(`[DcconSelector] iconttv detected: ${this.iconttvDetected}`);
      }
    });

    // 페이지 컨텍스트(Main World)에 iconttv-detect.js 스크립트 주입
    const script = document.createElement('script');
    script.src = browser.runtime.getURL('common/iconttv-detect.js');
    (document.head || document.documentElement).appendChild(script);

    // 1. 옵저버 중앙 저장소 초기화 (URLObserver 등)
    globalObservers.init();

    // 2. 하위 옵저버들의 이벤트를 구독하여 외부로 중계(Forwarding)
    if (globalObservers.url) {
      globalObservers.url.on(EVENT_KEYS.URL_CHANGED, (url: string) => this.emit(EVENT_KEYS.URL_CHANGED, url));
    }

    if (globalObservers.dom) {
      globalObservers.dom.on(EVENT_KEYS.CHAT_CONTAINER_READY, () => this.emit(EVENT_KEYS.CHAT_CONTAINER_READY));
      globalObservers.dom.on(EVENT_KEYS.NEW_CHAT_MESSAGE, (node: Node) => this.emit(EVENT_KEYS.NEW_CHAT_MESSAGE, node));
    }

    if (globalObservers.userAction) {
      globalObservers.userAction.on(EVENT_KEYS.INPUT_CHAT, (text: string) => this.emit(EVENT_KEYS.INPUT_CHAT, text));
      globalObservers.userAction.on(EVENT_KEYS.SEND_CHAT, (text: string) => this.emit(EVENT_KEYS.SEND_CHAT, text));
      globalObservers.userAction.on(EVENT_KEYS.CLICK_DCCON, (text: string) => this.emit(EVENT_KEYS.CLICK_DCCON, text));
      globalObservers.userAction.on(EVENT_KEYS.CLICK_DCCON_LONG, (text: string) => this.emit(EVENT_KEYS.CLICK_DCCON_LONG, text));
      globalObservers.userAction.on(EVENT_KEYS.CLICK_DCCON_SET_EVENT, (text: string, forceEvent: number) => this.emit(EVENT_KEYS.CLICK_DCCON_SET_EVENT, text, forceEvent));
      globalObservers.userAction.on(EVENT_KEYS.USER_KEY_DOWN, (event: KeyboardEvent) => this.emit(EVENT_KEYS.USER_KEY_DOWN, event));
      globalObservers.userAction.on(EVENT_KEYS.USER_INPUT, (event: Event) => this.emit(EVENT_KEYS.USER_INPUT, event));
      globalObservers.userAction.on(EVENT_KEYS.USER_CLICK_SEND, (event: MouseEvent) => this.emit(EVENT_KEYS.USER_CLICK_SEND, event));
    }
    
    new AppListener(this);
  }

  public getPlatform(): string {
    return this.platform;
  }

  public getDomSelectors(): DOMSelectors {
    return this.domSelectors;
  }

  public getIconttvDetected(): boolean {
    return this.iconttvDetected;
  }

  public getDomController(): DOMController {
    return this.domControler;
  }
} 