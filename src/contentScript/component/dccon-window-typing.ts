import browser from "webextension-polyfill";
import PreferencesHandler from "../config/preferences-handler";
import { DOMSelectors } from "../domSelector/domSelectors";
import { globalObservers } from "../global-events";
import { GlobalUtils } from "../utils/global-utils";

declare const dcConsData: any[]; // 외부에서 주입되는 디시콘 데이터

export class DcconWindowTyping {
    private dcconWindowElement: HTMLElement;
    private dcconWidthObserver?: ResizeObserver;
    private addTarget?: Element;
    private ulElement: HTMLUListElement;
    private caretPos: number = 0;

    constructor(private domSelectors: DOMSelectors, private onClose: () => void) {
        
		const isColumnFixed = PreferencesHandler.getCached(PreferencesHandler.DCCON_COLUMN_FIXED);
        if (!isColumnFixed) {
            this.dcconWidthObserver = new ResizeObserver(entries => {
                for (const entry of entries) {
                    const dcconForLine = Math.floor(entry.contentRect.width / 100);
                    this.ulElement.style.gridTemplateColumns = `repeat(${dcconForLine}, 1fr)`;
                }
            });
        }

        const isCime = GlobalUtils.isCime();
        
		const div = document.createElement("div");
		div.setAttribute("class", "dcconDiv");

        if(isCime) {
            div.classList.add("cm");
        }

		this.dcconWindowElement = div;

        const windowWidth = PreferencesHandler.getCached(PreferencesHandler.DCCON_WINDOW_WIDTH);
        
		if (windowWidth !== null) {
            this.dcconWindowElement.style.width = `${windowWidth}px`;
        }

		const headerDiv = document.createElement("div");
		headerDiv.setAttribute("class", "dcconHeader");
		const strongTitle = document.createElement("strong");
		strongTitle.textContent = "디시콘";	
		headerDiv.appendChild(strongTitle);

		const closeBtn = document.createElement("span");
		closeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/></svg>';
		closeBtn.addEventListener("click", () => {
			this.onClose();
		});

		headerDiv.style.marginBottom = "12px";
		headerDiv.appendChild(closeBtn);
		div.append(headerDiv);
		
		this.ulElement = document.createElement("ul");
		this.ulElement.setAttribute("class", "dcconList");
		this.buildDcconList();

		div.appendChild(this.ulElement);
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
				li.setAttribute("title", `${keywords.join(",")}\r\n태그 : ${tags.join(",")}`);
				li.setAttribute("data-bs-placement", "top");
				li.setAttribute("tabindex", "0"); // 포커스를 받기 위해 필수 속성 추가

				let pressTimer: number | null = null;
				let isLongPress = false;

				li.addEventListener("mousedown", (e) => {
					if (e.button !== 0) return; // 왼쪽 클릭만
					isLongPress = false;
					pressTimer = window.setTimeout(() => {
						isLongPress = true;
						globalObservers.userAction?.notifyDcconLongClick("~" + targetKeyword);
					}, 200); // 500ms 타이머
				});

				li.addEventListener("mouseup", () => {
					if (pressTimer) clearTimeout(pressTimer);
				});
				li.addEventListener("mouseleave", () => {
					if (pressTimer) clearTimeout(pressTimer);
				});

				li.addEventListener("click", (e) => {
					e.preventDefault();
					if (!isLongPress) globalObservers.userAction?.notifyDcconClick("~" + targetKeyword);
				});
				
				(function(keyword) { 
					li.addEventListener("keydown", (e) => {
						if (e.key === 'Enter' || e.keyCode === 13) {
							e.preventDefault();
							globalObservers.userAction?.notifyDcconClickForceEvent("~" + targetKeyword, PreferencesHandler.IMAGE_ACTION_MAP.COPY_AND_SEND);
						}
					});
				})(targetKeyword);

				this.ulElement.appendChild(li);
            });
        }
		
        this.dcconWindowElement.appendChild(this.ulElement);
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
            if (this.dcconWidthObserver && !PreferencesHandler.getCached(PreferencesHandler.DCCON_COLUMN_FIXED)) {
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

    public filter(query: string) {
        let hasVisible = false;
        const searchVal = query.toLowerCase();
        const items = this.ulElement.querySelectorAll('li');

        items.forEach(li => {
            const keywords = Array.from(li.querySelectorAll('.keyword')).map(el => el.textContent?.toLowerCase() || '');
            const match = searchVal === '' || keywords.some(k => k.includes(searchVal));

            if (match) {
                li.style.display = 'block';
                hasVisible = true;
            } else {
                li.style.display = 'none';
            }
        });

        this.ulElement.scrollTop = 0;
        return hasVisible;
    }

    public hasFocus(): boolean {
        return this.dcconWindowElement.contains(document.activeElement);
    }

    public focusNextItem() {
        const currentLi = document.activeElement as HTMLElement;
        let nextLi: HTMLElement | null = null;
        
        // 포커스가 현재 리스트 아이템 내부에 있다면 다음 항목으로 이동
        if (currentLi && currentLi.tagName === 'LI' && this.ulElement.contains(currentLi)) {
            nextLi = currentLi.nextElementSibling as HTMLElement | null;
            while (nextLi && nextLi.style.display === 'none') {
                nextLi = nextLi.nextElementSibling as HTMLElement | null;
            }
        }
        
        // 다음 항목이 없거나, 포커스가 리스트 외부에 있었다면 첫 번째 항목으로 이동 (순환)
        if (!nextLi) {
            nextLi = Array.from(this.ulElement.querySelectorAll('li')).find(li => li.style.display !== 'none') as HTMLElement | null;
        }

        if (nextLi) {
            nextLi.focus();
        }
		//console.log("포커스 이동: ", nextLi);
    }

    public setCaretPos(pos: number) {
        this.caretPos = pos;
    }

    public getCaretPos(): number {
        return this.caretPos;
    }
}