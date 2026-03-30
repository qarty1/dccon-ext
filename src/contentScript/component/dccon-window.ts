import browser from "webextension-polyfill";
import PreferencesHandler from "../config/preferences-handler";
import { DOMSelectors } from "../domSelector/domSelectors";
import { globalObservers } from "../global-events";
import { GlobalUtils } from "../utils/global-utils";
import tippy from "tippy.js";

declare const dcConsData: any[]; // 외부에서 주입되는 디시콘 데이터

export class DcconWindow {
    private dcconWindowElement: HTMLElement;
    private dcconWidthObserver?: ResizeObserver;
    private addTarget?: Element;
    private ulElement: HTMLUListElement;

    constructor(private domSelectors: DOMSelectors, private onClose: () => void) {
        // 1. 템플릿 리터럴로 전체 정적 구조 정의
        const templateStr = `
            <div class="dcconDiv">
                <div class="dcconHeader">
                    <strong>디시콘</strong>
                    <span class="close-btn" style="cursor: pointer;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                        </svg>
                    </span>
                </div>
                <div class="searchDiv">
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
                </div>
                <div class="searchDiv">
                    <div style="flex-grow: 1; display: flex;">
                        <input type="text" id="dcconPaste" placeholder="선택한 디시콘이 입력됩니다" readonly style="flex-grow: 1"/>
                        <button class="pasteCon" id="pasteConBtn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16">
                              <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"/>
                              <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <ul class="dcconList"></ul>
            </div>
        `;

        // 2. 문자열 파싱 후 Element로 캐싱
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = templateStr.trim();
        this.dcconWindowElement = tempContainer.firstElementChild as HTMLElement;
        
        const isCime = GlobalUtils.isCime();

        if(isCime) {
            this.dcconWindowElement.classList.add("cm");
        }

        const windowWidth = PreferencesHandler.getCached(PreferencesHandler.DCCON_WINDOW_WIDTH);
        if (windowWidth !== null) {
            this.dcconWindowElement.style.width = `${windowWidth}px`;
        }

        // 닫기 버튼 이벤트
        const closeBtn = this.dcconWindowElement.querySelector('.close-btn');
        closeBtn?.addEventListener('click', () => {
            this.onClose(); // 창 닫기 콜백 실행
        });

        // 3. 디시콘 리스트 구성 및 이벤트 바인딩
        this.ulElement = this.dcconWindowElement.querySelector('.dcconList') as HTMLUListElement;
        this.buildDcconList();
        this.setupSearch();
        this.setupClipboard();

        // 4. 가변 너비 모드일 경우 ResizeObserver 설정
        const isColumnFixed = PreferencesHandler.getCached(PreferencesHandler.DCCON_COLUMN_FIXED);
        if (!isColumnFixed) {
            this.dcconWidthObserver = new ResizeObserver(entries => {
                for (const entry of entries) {
                    const dcconForLine = Math.floor(entry.contentRect.width / 100);
                    this.ulElement.style.gridTemplateColumns = `repeat(${dcconForLine}, 1fr)`;
                }
            });
        }
    }

    private buildDcconList() {
        const isColumnFixed = PreferencesHandler.getCached(PreferencesHandler.DCCON_COLUMN_FIXED);
        const columnCount = PreferencesHandler.getCached(PreferencesHandler.DCCON_COLUMN_COUNT);
        const showScrollbar = PreferencesHandler.getCached(PreferencesHandler.SHOW_SCROLLBAR);

        if (isColumnFixed) {
            this.ulElement.classList.add("grid");
            if (columnCount) {
                this.ulElement.style.gridTemplateColumns = `repeat(${columnCount}, 1fr)`;
                if (columnCount > 5) this.ulElement.style.gap = "4px";
                if (columnCount > 8) this.ulElement.style.gap = "2px";
            } else {
                this.ulElement.style.gridTemplateColumns = 'repeat(3, 1fr)';
            }
        }

        if (showScrollbar) {
            this.ulElement.classList.add("showScroll");
        }

        if (typeof dcConsData !== 'undefined') {
            this.createRandomDcconBtn();

            dcConsData.forEach(dcCon => {
                const li = document.createElement("li");
                const a = document.createElement("a");

                if (Array.isArray(dcCon.uri)) {
                    dcCon.uri.forEach((uri: string) => {
                        const img = document.createElement("img");
                        img.src = browser.runtime.getURL(uri);
                        img.className = "lazy doubleConPlus";
                        img.setAttribute("alt", dcCon.keywords[0]);
                        a.appendChild(img);
                    });
                } else {
                    const img = document.createElement("img");
                    img.src = browser.runtime.getURL(dcCon.uri);
                    img.className = "lazy";
                    img.setAttribute("alt", dcCon.keywords[0]);
                    a.appendChild(img);
                }
                li.appendChild(a);

                const keywords: string[] = dcCon.keywords;
                const tags: string[] = dcCon.tags;
                const targetKeyword = dcCon.replaceKeyword ? dcCon.replaceKeyword : keywords[0];

                keywords.forEach((keyword) => {
                    const div = document.createElement("div");
                    div.className = "keyword";
                    div.style.display = "none";
                    div.textContent = keyword;
                    li.appendChild(div);
                });

                tags.forEach((tag) => {
                    const div = document.createElement("div");
                    div.className = "tag";
                    div.style.display = "none";
                    div.textContent = tag;
                    li.appendChild(div);
                });

                li.setAttribute("data-bs-toggle", "tooltip");
                //li.setAttribute("title", `${keywords.join(",")}\r\n태그 : ${tags.join(",")}`);
                li.setAttribute("data-bs-placement", "top");

                let pressTimer: number | null = null;
                let isLongPress = false;

                li.addEventListener("mousedown", (e) => {
                    if (e.button !== 0) return; 
                    isLongPress = false;
                    pressTimer = window.setTimeout(() => {
                        isLongPress = true;
                        globalObservers.userAction?.notifyDcconLongClick("~" + targetKeyword);
                    }, 200);
                });

                li.addEventListener("mouseup", () => {
                    if (pressTimer) clearTimeout(pressTimer);
                });
                li.addEventListener("mouseleave", () => {
                    if (pressTimer) clearTimeout(pressTimer);
                });

                li.addEventListener("click", (e) => {
                    e.preventDefault();
                    if (!isLongPress) {
                        const pasteInput = this.dcconWindowElement.querySelector("#dcconPaste") as HTMLInputElement;
                        if (pasteInput) pasteInput.value = "~" + targetKeyword;
                        globalObservers.userAction?.notifyDcconClick("~" + targetKeyword);
                    }
                });

                const useTooltip = PreferencesHandler.getCached(PreferencesHandler.USE_DCCON_TOOLTIP);
                if(useTooltip) {
                    tippy(li, {
                        content: `${keywords.join(", ")}<br>태그: ${tags.join(", ")}`,
                        allowHTML: true,
                        placement: 'top',
                        theme: 'light-border',
                    });
                }
                this.ulElement.appendChild(li);
            });
        }
    }
    private getRandomDccon() {
        if(typeof dcConsData !== 'undefined') {
            const randomDccon = dcConsData[Math.floor(Math.random() * dcConsData.length)];
            return randomDccon;
        }
        return null;
    }

    private createRandomDcconBtn() {
        const li = document.createElement("li");
        const a = document.createElement("a");

        const img = document.createElement("img");
        img.src = browser.runtime.getURL("/images/dccon/random.jpg");
        img.className = "lazy";
        a.appendChild(img);
        li.appendChild(a);

        li.setAttribute("data-bs-toggle", "tooltip");
        li.setAttribute("data-bs-placement", "top");

        let pressTimer: number | null = null;
        let isLongPress = false;

        li.addEventListener("mousedown", (e) => {
            if (e.button !== 0) return; 
            isLongPress = false;
            pressTimer = window.setTimeout(() => {
                const randomDccon = this.getRandomDccon();
                const targetKeyword = randomDccon.replaceKeyword ? randomDccon.replaceKeyword : randomDccon.keywords[0];
                isLongPress = true;
                globalObservers.userAction?.notifyDcconLongClick("~" + targetKeyword);
            }, 200);
        });

        li.addEventListener("mouseup", () => {
            if (pressTimer) clearTimeout(pressTimer);
        });
        li.addEventListener("mouseleave", () => {
            if (pressTimer) clearTimeout(pressTimer);
        });

        li.addEventListener("click", (e) => {
            e.preventDefault();
            if (!isLongPress) {
                const randomDccon = this.getRandomDccon();
                const targetKeyword = randomDccon.replaceKeyword ? randomDccon.replaceKeyword : randomDccon.keywords[0];
                globalObservers.userAction?.notifyDcconClick("~" + targetKeyword);
            }
        });
        tippy(li, {
            content: `랜덤<br/>랜덤한 디시콘을 하나 입력합니다.`,
            allowHTML: true,
            placement: 'top',
        });
        this.ulElement.appendChild(li);
    }

    private setupSearch() {
        const nameInput = this.dcconWindowElement.querySelector('#dcconName') as HTMLInputElement;
        const tagInput = this.dcconWindowElement.querySelector('#dcconTag') as HTMLInputElement;
        let timeoutId: number;

        const filterList = () => {
            clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => {
                const nameVal = nameInput?.value.toLowerCase() || '';
                const tagVal = tagInput?.value.toLowerCase() || '';
                const items = this.ulElement.querySelectorAll('li');

                items.forEach(li => {
                    const keywords = Array.from(li.querySelectorAll('.keyword')).map(el => el.textContent?.toLowerCase() || '');
                    const tags = Array.from(li.querySelectorAll('.tag')).map(el => el.textContent?.toLowerCase() || '');

                    const matchName = nameVal === '' || keywords.some(k => k.includes(nameVal));
                    const matchTag = tagVal === '' || tags.some(t => t.includes(tagVal));

                    li.style.display = (matchName && matchTag) ? '' : 'none';
                });
                this.ulElement.scrollTop = 0;
            }, 100);
        };

        nameInput?.addEventListener('input', filterList);
        tagInput?.addEventListener('input', filterList);
    }

    private setupClipboard() {
        const pasteBtn = this.dcconWindowElement.querySelector('#pasteConBtn');
        const pasteInput = this.dcconWindowElement.querySelector('#dcconPaste') as HTMLInputElement;

        pasteBtn?.addEventListener('click', () => {
            if (pasteInput && pasteInput.value) {
                navigator.clipboard.writeText(pasteInput.value).then(() => {
                    const showCopyToast = PreferencesHandler.getCached(PreferencesHandler.SHOW_COPY_TOAST);
                    if (showCopyToast) {
                        // 백그라운드나 DOMMessageHandler를 통해 Toast 호출
                    }
                });
            }
        });
    }

    public mount() {
        const areaSelector = this.domSelectors.chatActionArea;
        this.addTarget = document.querySelector(areaSelector) || undefined;
    }

    public unmount() {
        this.addTarget = undefined;
        this.setVisibility(false);
    }

    public setVisibility(isVisible: boolean) {
        if (!this.addTarget) return;

        if (isVisible) {
            this.addTarget.appendChild(this.dcconWindowElement);
            if (this.dcconWidthObserver) {
                this.dcconWidthObserver.observe(this.dcconWindowElement);
            }
        } else {
            if (this.dcconWindowElement.parentNode) {
                this.dcconWindowElement.remove();
            }
            if (this.dcconWidthObserver) {
                this.dcconWidthObserver.disconnect();
            }
        }
    }
}