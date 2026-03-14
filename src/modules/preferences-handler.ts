import browser from "webextension-polyfill";

interface PreferenceConfig<T> {
    msgKey: string;
    default: T;
}

class PreferencesHandler {

    /**
     * IMAGE_ACTION_MAP 디시콘 이미지 클릭시 동작
     * COPY_ONLY: 복사
     * COPY_AND_INPUT: 복사 & 입력
     * COPY_AND_SEND: 복사 & 바로전송
     */
    static readonly IMAGE_ACTION_MAP = {
        COPY_ONLY: 0,
        COPY_AND_INPUT: 1,
        COPY_AND_SEND: 2
    } as const;

    /**
     * _DCCON_ACTIVE 디시콘 선택기 사용 여부
     * true: 사용, false: 미사용
     * default: true
     */
    static readonly DCCON_ACTIVE: PreferenceConfig<boolean> = {
        msgKey: "dcconActive",
        default: true
    };

    /**
     * IMAGE_ACTION 디시콘 바로 복사 사용 여부
     * true: 사용, false: 미사용
     * default: true
     */
    static readonly IMAGE_ACTION: PreferenceConfig<number> = {
        msgKey: "imageAction",
        default: this.IMAGE_ACTION_MAP.COPY_ONLY
    };

    /**
     * CHAT_TO_DCCON 채팅 디시콘 변환기능 사용 여부 프로퍼티 키
     * true: 사용, false: 미사용
     * default: true
     */
    static readonly CHAT_TO_DCCON: PreferenceConfig<boolean> = {
        msgKey: "chatToDccon",
        default: true
    };

    /**
     * SHOW_COPY_TOAST 복사 완료 메세지 출력 여부 프로퍼티 키
     * true: 표시, false: 표시 안함
     * default: true
     */
    static readonly SHOW_COPY_TOAST: PreferenceConfig<boolean> = {
        msgKey: "showCopyToast",
        default: true
    };

    /**
     * DCCON_WINDOW_WIDTH 디시콘 창 사용자 너비
     * default: null
     */
    static readonly DCCON_WINDOW_WIDTH: PreferenceConfig<number | null> = {
        msgKey: "dcconWindowWidth",
        default: null
    };

    /**
     * DCCON_NEWLINE 디시콘을 채팅 다음줄에 표시합니다
     * default: null
     */
    static readonly DCCON_NEWLINE: PreferenceConfig<boolean> = {
        msgKey: "dcconNewline",
        default: false
    };

    /**
     * SHOW_SCROLLBAR 디시콘 스크롤바 표시 여부
     * default: true
     */
    static readonly SHOW_SCROLLBAR: PreferenceConfig<boolean> = {
        msgKey: "showScrollbar",
        default: true
    };

    /**
     * ICONTTV_COMPATIBILITY_MODE ICONTTV 호환 모드 설정 여부
     * default: false
     */
    static readonly ICONTTV_COMPATIBILITY_MODE: PreferenceConfig<boolean> = {
        msgKey: "iconttvCompatibility",
        default: false
    };

    /**
     * USE_TAG_CONVERTER 채팅 태그 변환여부 설정
     * default: true
     */
    static readonly USE_TAG_CONVERTER: PreferenceConfig<boolean> = {
        msgKey: "tagConverter",
        default: true
    };

    /**
     * COLUMN_TYPE_MAP 디시콘 표시 방법 (0 : 고정, 1 : 유동)
     * FIXED : 고정
     * FLUID : 유동
     */
    static readonly COLUMN_TYPE_MAP = {
        FIXED: 0,
        FLUID: 1
    } as const;

    /**
     * DCCON_COLUMN_FIXED 디시콘 줄 수 고정
     * default: FIXED
     */
    static readonly DCCON_COLUMN_FIXED: PreferenceConfig<boolean> = {
        msgKey: "dcconColumnFixed",
        default: false
    };

    /**
     * DCCON_COLUMN_COUNT 한 줄에 표시할 디시콘 갯수
     * default: 3
     */
    static readonly DCCON_COLUMN_COUNT: PreferenceConfig<number> = {
        msgKey: "dcconColumnCount",
        default: 3
    };

    /**
     * ACTION_KEY 상호작용 키
     * default: Tab
     */
    static readonly ACTION_KEY: PreferenceConfig<string> = {
        msgKey: "actionKey",
        default: 'Tab'
    };

    /**
     * DCCON_CHANGE_COUNT 변환할 디시콘 갯수
     * default: 2
     */
    static readonly DCCON_CHANGE_COUNT: PreferenceConfig<number> = {
        msgKey: "dcconChangeCount",
        default: 2
    };

    static setToDefault(): void {
        this.setDcconActive(this.DCCON_ACTIVE.default).then((success) => {
            if(success) {
                console.log(`디시콘 선택기 사용 여부  기본값 세팅 : ${this.DCCON_ACTIVE.default}`);
            }
        });
        this.setImageAction(this.IMAGE_ACTION.default).then((success) => {
            if(success) {
                console.log(`디시콘 바로복사 사용 여부 기본값 세팅 : ${this.IMAGE_ACTION.default}`)
            }
        });
        this.setChatToDccon(this.CHAT_TO_DCCON.default).then((success) => {
            if(success) {
                console.log(`채팅 디시콘 변환기능 사용 여부  기본값 세팅 : ${this.CHAT_TO_DCCON.default}`)
            }
        });
        this.setShowCopyToast(this.SHOW_COPY_TOAST.default).then((success) => {
            if(success) {
                console.log(`복사 완료 메세지 출력 여부 기본값 세팅 : ${this.SHOW_COPY_TOAST.default}`)
            }
        });

        this.setDcconWindowWidth(this.DCCON_WINDOW_WIDTH.default).then((success) => {
            if(success) {
                console.log(`디시콘 창 사용자 너비 기본값 세팅 : ${this.DCCON_WINDOW_WIDTH.default}`)
            }
        });

        this.setDcconNewline(this.DCCON_NEWLINE.default).then((success) => {
            if(success) {
                console.log(`디시콘 다음줄 표시 기본값 세팅 : ${this.DCCON_NEWLINE.default}`)
            }
        });

        this.setShowScrollbar(this.SHOW_SCROLLBAR.default).then((success) => {
            if(success) {
                console.log(`디시콘 스크롤바 표시 여부 기본값 세팅 : ${this.SHOW_SCROLLBAR.default}`)
            }
        });

        this.setIconttvCompatible(this.ICONTTV_COMPATIBILITY_MODE.default).then((success) => {
            if(success) {
                console.log(`iconttv 호환성 모드 기본값 세팅 : ${this.ICONTTV_COMPATIBILITY_MODE.default}`)
            }
        });

        this.setUseTagConverter(this.USE_TAG_CONVERTER.default).then((success) => {
            if(success) {
                console.log(`태그 변환 기본값 세팅 : ${this.USE_TAG_CONVERTER.default}`)
            }
        });

        this.setDcconColumnFixed(this.DCCON_COLUMN_FIXED.default).then((success) => {
            if(success) {
                console.log(`디시콘 선택기 열 표현 : ${this.DCCON_COLUMN_FIXED.default}`)
            }
        });

        this.setDcconColumnCount(this.DCCON_COLUMN_COUNT.default).then((success) => {
            if(success) {
                console.log(`한 줄에 표시할 디시콘 기본값 세팅 : ${this.DCCON_COLUMN_COUNT.default}`)
            }
        });

        this.setActionKey(this.ACTION_KEY.default).then((success) => {
            if(success) {
                console.log(`상호작용 키 세팅 : ${this.ACTION_KEY.default}`)
            }
        });

        this.setDcconChangeCount(this.DCCON_CHANGE_COUNT.default).then((success) => {
            if(success) {
                console.log(`디시콘 변환 갯수 세팅 : ${this.DCCON_CHANGE_COUNT.default}`)
            }
        });
    }

    static async setDcconActive(active: boolean): Promise<boolean> {
        await browser.storage.local.set({[this.DCCON_ACTIVE.msgKey]: active});
        console.log(`디시콘 선택기 사용 : ${active}`);
        return true;
    }

    static async getDcconActive(): Promise<boolean | undefined> {
        let result = await browser.storage.local.get([this.DCCON_ACTIVE.msgKey]);
        return result[this.DCCON_ACTIVE.msgKey];
    }

    static async setImageAction(action: number): Promise<boolean> {
        await browser.storage.local.set({[this.IMAGE_ACTION.msgKey]: action});
        console.log(`디시콘 바로 복사 사용 : ${action}`);
        return true;
    }

    static async getImageAction(): Promise<number | undefined> {
        let result = await browser.storage.local.get([this.IMAGE_ACTION.msgKey]);
        return result[this.IMAGE_ACTION.msgKey];
    }

    static async setChatToDccon(active: boolean): Promise<boolean> {
        await browser.storage.local.set({[this.CHAT_TO_DCCON.msgKey]: active});
        console.log(`채팅 디시콘 변환기능 사용 : ${active}`);
        return true;
    }

    static async getChatToDccon(): Promise<boolean | undefined> {
        let result = await browser.storage.local.get([this.CHAT_TO_DCCON.msgKey]);
        return result[this.CHAT_TO_DCCON.msgKey];
    }

    static async setShowCopyToast(active: boolean): Promise<boolean> {
        await browser.storage.local.set({[this.SHOW_COPY_TOAST.msgKey]: active});
        console.log(`복사 완료 메세지 출력 : ${active}`);
        return true;
    }

    static async getShowCopyToast(): Promise<boolean | undefined> {
        let result = await browser.storage.local.get([this.SHOW_COPY_TOAST.msgKey]);
        return result[this.SHOW_COPY_TOAST.msgKey];
    }

    static async setDcconWindowWidth(width: number | null): Promise<boolean> {
        await browser.storage.local.set({[this.DCCON_WINDOW_WIDTH.msgKey]: width});
        console.log(`디시콘 창 가로 설정 : ${width}`);
        return true;
    }

    static async getDcconWindowWidth(): Promise<number | null | undefined> {
        let result = await browser.storage.local.get([this.DCCON_WINDOW_WIDTH.msgKey]);
        return result[this.DCCON_WINDOW_WIDTH.msgKey];
    }

    static async setDcconNewline(newline: boolean): Promise<boolean> {
        await browser.storage.local.set({[this.DCCON_NEWLINE.msgKey]: newline});
        console.log(`디시콘 다음줄에 표시 : ${newline}`);
        return true;
    }

    static async getDcconNewline(): Promise<boolean | undefined> {
        let result = await browser.storage.local.get([this.DCCON_NEWLINE.msgKey]);
        return result[this.DCCON_NEWLINE.msgKey];
    }

    static async setShowScrollbar(show: boolean): Promise<boolean> {
        await browser.storage.local.set({[this.SHOW_SCROLLBAR.msgKey]: show});
        console.log(`디시콘 다음줄에 표시 : ${show}`);
        return true;
    }

    static async getShowScrollbar(): Promise<boolean | undefined> {
        let result = await browser.storage.local.get([this.SHOW_SCROLLBAR.msgKey]);
        return result[this.SHOW_SCROLLBAR.msgKey];
    }

    static async setIconttvCompatible(active: boolean): Promise<boolean> {
        await browser.storage.local.set({[this.ICONTTV_COMPATIBILITY_MODE.msgKey]: active});
        console.log(`iconttv 호환성 모드 작동 : ${active}`);
        return true;
    }

    static async getIconttvCompatible(): Promise<boolean | undefined> {
        let result = await browser.storage.local.get([this.ICONTTV_COMPATIBILITY_MODE.msgKey]);
        return result[this.ICONTTV_COMPATIBILITY_MODE.msgKey];
    }

    static async setUseTagConverter(active: boolean): Promise<boolean> {
        await browser.storage.local.set({[this.USE_TAG_CONVERTER.msgKey]: active});
        console.log(`채팅 태그변환 사용 : ${active}`);
        return true;
    }

    static async getUseTagConverter(): Promise<boolean | undefined> {
        let result = await browser.storage.local.get([this.USE_TAG_CONVERTER.msgKey]);
        return result[this.USE_TAG_CONVERTER.msgKey];
    }

    static async setDcconColumnFixed(fixed: boolean | null): Promise<boolean> {

        if(fixed == null) {
            fixed = this.DCCON_COLUMN_FIXED.default;
        }
        await browser.storage.local.set({[this.DCCON_COLUMN_FIXED.msgKey]: fixed});
        console.log(`디시콘 표시 방법 : ${fixed}`);
        return true;
    }

    static async getDcconColumnFixed(): Promise<boolean | null | undefined> {
        let result = await browser.storage.local.get([this.DCCON_COLUMN_FIXED.msgKey]);
        return result[this.DCCON_COLUMN_FIXED.msgKey];
    }

    static async setDcconColumnCount(count: number | null): Promise<boolean> {

        if(count == null) {
            count = this.DCCON_COLUMN_COUNT.default;
        }
        await browser.storage.local.set({[this.DCCON_COLUMN_COUNT.msgKey]: count});
        console.log(`한줄에 표시할 디시콘 : ${count}`);
        return true;
    }

    static async getDcconColumnCount(): Promise<number | null | undefined> {
        let result = await browser.storage.local.get([this.DCCON_COLUMN_COUNT.msgKey]);
        return result[this.DCCON_COLUMN_COUNT.msgKey];
    }

    static async setActionKey(key: string | null): Promise<boolean> {
        if(key == null) {
            key = this.ACTION_KEY.default;
        }
        await browser.storage.local.set({[this.ACTION_KEY.msgKey]: key});
        console.log(`상호작용 키 : ${key}`);
        return true;
    }

    static async getActionKey(): Promise<string | undefined> {
        let result = await browser.storage.local.get([this.ACTION_KEY.msgKey]);
        if(result[this.ACTION_KEY.msgKey] == undefined) {
            return this.ACTION_KEY.default;
        }
        return result[this.ACTION_KEY.msgKey];
    }

    static async setDcconChangeCount(count: number | null): Promise<boolean> {
        if(count == null) {
            count = this.DCCON_CHANGE_COUNT.default;
        }
        await browser.storage.local.set({[this.DCCON_CHANGE_COUNT.msgKey]: count});
        console.log(`변환할 디시콘 갯수: ${count}`);
        return true;
    }

    static async getDcconChangeCount(): Promise<number | null | undefined> {
        let result = await browser.storage.local.get([this.DCCON_CHANGE_COUNT.msgKey]);
        return result[this.DCCON_CHANGE_COUNT.msgKey];
    }
 }

 export default PreferencesHandler;