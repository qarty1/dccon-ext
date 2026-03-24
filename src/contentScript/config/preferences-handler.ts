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
     * USE_DCCON_WINDOW_TYPING 디시콘 자동완성창(~) 사용 여부
     * true: 사용, false: 미사용
     * default: true
     */
    static readonly USE_DCCON_WINDOW_TYPING: PreferenceConfig<boolean> = {
        msgKey: "useDcconWindowTyping",
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

    private static cache: Record<string, any> = {};
    private static isListening = false;

    private static getDefaults(): Record<string, any> {
        return {
            [this.DCCON_ACTIVE.msgKey]: this.DCCON_ACTIVE.default,
            [this.IMAGE_ACTION.msgKey]: this.IMAGE_ACTION.default,
            [this.CHAT_TO_DCCON.msgKey]: this.CHAT_TO_DCCON.default,
            [this.USE_DCCON_WINDOW_TYPING.msgKey]: this.USE_DCCON_WINDOW_TYPING.default,
            [this.SHOW_COPY_TOAST.msgKey]: this.SHOW_COPY_TOAST.default,
            [this.DCCON_WINDOW_WIDTH.msgKey]: this.DCCON_WINDOW_WIDTH.default,
            [this.DCCON_NEWLINE.msgKey]: this.DCCON_NEWLINE.default,
            [this.SHOW_SCROLLBAR.msgKey]: this.SHOW_SCROLLBAR.default,
            [this.ICONTTV_COMPATIBILITY_MODE.msgKey]: this.ICONTTV_COMPATIBILITY_MODE.default,
            [this.USE_TAG_CONVERTER.msgKey]: this.USE_TAG_CONVERTER.default,
            [this.DCCON_COLUMN_FIXED.msgKey]: this.DCCON_COLUMN_FIXED.default,
            [this.DCCON_COLUMN_COUNT.msgKey]: this.DCCON_COLUMN_COUNT.default,
            [this.ACTION_KEY.msgKey]: this.ACTION_KEY.default,
            [this.DCCON_CHANGE_COUNT.msgKey]: this.DCCON_CHANGE_COUNT.default,
        };
    }

    /**
     * 확장 프로그램 설치/업데이트 시 1회만 호출되어
     * 누락된 설정의 기본값을 스토리지에 기록합니다.
     */
    static async initializeDefaults(): Promise<void> {
        const defaults = this.getDefaults();

        // 1. 현재 스토리지에 물리적으로 저장된 실제 값들만 가져옵니다.
        const currentStorage = await browser.storage.local.get(Object.keys(defaults));
        const missingData: Record<string, any> = {};

        // 2. 확장 프로그램 업데이트 등으로 스토리지에 아예 없는 키(undefined)가 있다면 기본값을 할당합니다.
        for (const [key, defaultValue] of Object.entries(defaults)) {
            if (currentStorage[key] === undefined) {
                missingData[key] = defaultValue;
            }
        }
        if (Object.keys(missingData).length > 0) {
            await browser.storage.local.set(missingData);
            // console.log('[PreferencesHandler] Default preferences initialized:', missingData);
        }
    }

    /**
     * 확장 프로그램 초기화 시점에 호출하여 모든 설정값을 메모리에 캐싱합니다.
     * 캐시 이후에는 getCached()를 통해 동기적으로 설정값을 가져올 수 있습니다.
     */
    static async loadAll(): Promise<void> {
        const defaults = this.getDefaults();

        // 3. 완벽하게 병합된 최신 상태를 메모리(캐시)에 올립니다.
        this.cache = await browser.storage.local.get(defaults);

        // 다른 컨텍스트(설정창 등)에서 설정이 변경될 경우 캐시에 즉각 반영
        if (!this.isListening) {
            browser.storage.onChanged.addListener((changes, areaName) => {
                if (areaName === "local") {
                    for (const [key, { newValue }] of Object.entries(changes)) {
                        this.cache[key] = newValue;
                    }
                }
            });
            this.isListening = true;
        }
    }

    /**
     * 캐시된 설정값을 동기적으로 가져옵니다.
     */
    static getCached<T>(config: PreferenceConfig<T>): T {
        return (this.cache[config.msgKey] ?? config.default) as T;
    }

    static setToDefault(): void {
        this.setDcconActive(this.DCCON_ACTIVE.default).then((success) => {
            if(success) {
                // console.log(`디시콘 선택기 사용 여부  기본값 세팅 : ${this.DCCON_ACTIVE.default}`);
            }
        });
        this.setImageAction(this.IMAGE_ACTION.default).then((success) => {
            if(success) {
                // console.log(`디시콘 바로복사 사용 여부 기본값 세팅 : ${this.IMAGE_ACTION.default}`)
            }
        });
        this.setChatToDccon(this.CHAT_TO_DCCON.default).then((success) => {
            if(success) {
                // console.log(`채팅 디시콘 변환기능 사용 여부  기본값 세팅 : ${this.CHAT_TO_DCCON.default}`)
            }
        });
        this.setUseDcconWindowTyping(this.USE_DCCON_WINDOW_TYPING.default).then((success) => {
            if(success) {
                // console.log(`디시콘 자동완성창(~) 사용 여부 기본값 세팅 : ${this.USE_DCCON_WINDOW_TYPING.default}`)
            }
        });
        this.setShowCopyToast(this.SHOW_COPY_TOAST.default).then((success) => {
            if(success) {
                // console.log(`복사 완료 메세지 출력 여부 기본값 세팅 : ${this.SHOW_COPY_TOAST.default}`)
            }
        });

        this.setDcconWindowWidth(this.DCCON_WINDOW_WIDTH.default).then((success) => {
            if(success) {
                // console.log(`디시콘 창 사용자 너비 기본값 세팅 : ${this.DCCON_WINDOW_WIDTH.default}`)
            }
        });

        this.setDcconNewline(this.DCCON_NEWLINE.default).then((success) => {
            if(success) {
                // console.log(`디시콘 다음줄 표시 기본값 세팅 : ${this.DCCON_NEWLINE.default}`)
            }
        });

        this.setShowScrollbar(this.SHOW_SCROLLBAR.default).then((success) => {
            if(success) {
                // console.log(`디시콘 스크롤바 표시 여부 기본값 세팅 : ${this.SHOW_SCROLLBAR.default}`)
            }
        });

        this.setIconttvCompatible(this.ICONTTV_COMPATIBILITY_MODE.default).then((success) => {
            if(success) {
                // console.log(`iconttv 호환성 모드 기본값 세팅 : ${this.ICONTTV_COMPATIBILITY_MODE.default}`)
            }
        });

        this.setUseTagConverter(this.USE_TAG_CONVERTER.default).then((success) => {
            if(success) {
                // console.log(`태그 변환 기본값 세팅 : ${this.USE_TAG_CONVERTER.default}`)
            }
        });

        this.setDcconColumnFixed(this.DCCON_COLUMN_FIXED.default).then((success) => {
            if(success) {
                // console.log(`디시콘 선택기 열 표현 : ${this.DCCON_COLUMN_FIXED.default}`)
            }
        });

        this.setDcconColumnCount(this.DCCON_COLUMN_COUNT.default).then((success) => {
            if(success) {
                // console.log(`한 줄에 표시할 디시콘 기본값 세팅 : ${this.DCCON_COLUMN_COUNT.default}`)
            }
        });

        this.setActionKey(this.ACTION_KEY.default).then((success) => {
            if(success) {
                // console.log(`상호작용 키 세팅 : ${this.ACTION_KEY.default}`)
            }
        });

        this.setDcconChangeCount(this.DCCON_CHANGE_COUNT.default).then((success) => {
            if(success) {
                // console.log(`디시콘 변환 갯수 세팅 : ${this.DCCON_CHANGE_COUNT.default}`)
            }
        });
    }

    /**
     * 공통 설정 저장 유틸리티
     */
    private static async setPref<T>(config: PreferenceConfig<T>, value: T): Promise<boolean> {
        await browser.storage.local.set({ [config.msgKey]: value });
        this.cache[config.msgKey] = value;
        return true;
    }

    /**
     * 공통 설정 불러오기 유틸리티 (타입 안전성 보장 및 기본값 처리)
     */
    private static async getPref<T>(config: PreferenceConfig<T>): Promise<T> {
        // get()에 객체를 넘기면, 해당 키가 없을 때 지정한 기본값을 반환합니다.
        const result = await browser.storage.local.get({ [config.msgKey]: config.default });
        // TS가 result의 밸류 타입을 any로 추론하므로 명시적으로 T 타입으로 캐스팅합니다.
        return result[config.msgKey] as T;
    }

    static async setDcconActive(active: boolean): Promise<boolean> {
        // console.log(`디시콘 선택기 사용 : ${active}`);
        return this.setPref(this.DCCON_ACTIVE, active);
    }

    static async getDcconActive(): Promise<boolean> {
        return this.getPref(this.DCCON_ACTIVE);
    }

    static async setImageAction(action: number): Promise<boolean> {
        // console.log(`디시콘 바로 복사 사용 : ${action}`);
        return this.setPref(this.IMAGE_ACTION, action);
    }

    static async getImageAction(): Promise<number> {
        return this.getPref(this.IMAGE_ACTION);
    }

    static async setChatToDccon(active: boolean): Promise<boolean> {
        // console.log(`채팅 디시콘 변환기능 사용 : ${active}`);
        return this.setPref(this.CHAT_TO_DCCON, active);
    }

    static async getChatToDccon(): Promise<boolean> {
        return this.getPref(this.CHAT_TO_DCCON);
    }

    static async setUseDcconWindowTyping(active: boolean): Promise<boolean> {
        // console.log(`디시콘 자동완성창(~) 사용 : ${active}`);
        return this.setPref(this.USE_DCCON_WINDOW_TYPING, active);
    }   

    static async getUseDcconWindowTyping(): Promise<boolean> {
        return this.getPref(this.USE_DCCON_WINDOW_TYPING);
    }

    static async setShowCopyToast(active: boolean): Promise<boolean> {
        // console.log(`복사 완료 메세지 출력 : ${active}`);
        return this.setPref(this.SHOW_COPY_TOAST, active);
    }

    static async getShowCopyToast(): Promise<boolean> {
        return this.getPref(this.SHOW_COPY_TOAST);
    }

    static async setDcconWindowWidth(width: number | null): Promise<boolean> {
        // console.log(`디시콘 창 가로 설정 : ${width}`);
        return this.setPref(this.DCCON_WINDOW_WIDTH, width);
    }

    static async getDcconWindowWidth(): Promise<number | null> {
        return this.getPref(this.DCCON_WINDOW_WIDTH);
    }

    static async setDcconNewline(newline: boolean): Promise<boolean> {
        // console.log(`디시콘 다음줄에 표시 : ${newline}`);
        return this.setPref(this.DCCON_NEWLINE, newline);
    }

    static async getDcconNewline(): Promise<boolean> {
        return this.getPref(this.DCCON_NEWLINE);
    }

    static async setShowScrollbar(show: boolean): Promise<boolean> {
        // console.log(`디시콘 다음줄에 표시 : ${show}`);
        return this.setPref(this.SHOW_SCROLLBAR, show);
    }

    static async getShowScrollbar(): Promise<boolean> {
        return this.getPref(this.SHOW_SCROLLBAR);
    }

    static async setIconttvCompatible(active: boolean): Promise<boolean> {
        // console.log(`iconttv 호환성 모드 작동 : ${active}`);
        return this.setPref(this.ICONTTV_COMPATIBILITY_MODE, active);
    }

    static async getIconttvCompatible(): Promise<boolean> {
        return this.getPref(this.ICONTTV_COMPATIBILITY_MODE);
    }

    static async setUseTagConverter(active: boolean): Promise<boolean> {
        // console.log(`채팅 태그변환 사용 : ${active}`);
        return this.setPref(this.USE_TAG_CONVERTER, active);
    }

    static async getUseTagConverter(): Promise<boolean> {
        return this.getPref(this.USE_TAG_CONVERTER);
    }

    static async setDcconColumnFixed(fixed: boolean | null): Promise<boolean> {
        const val = fixed ?? this.DCCON_COLUMN_FIXED.default;
        // console.log(`디시콘 표시 방법 : ${val}`);
        return this.setPref(this.DCCON_COLUMN_FIXED, val);
    }

    static async getDcconColumnFixed(): Promise<boolean> {
        return this.getPref(this.DCCON_COLUMN_FIXED);
    }

    static async setDcconColumnCount(count: number | null): Promise<boolean> {
        const val = count ?? this.DCCON_COLUMN_COUNT.default;
        // console.log(`한줄에 표시할 디시콘 : ${val}`);
        return this.setPref(this.DCCON_COLUMN_COUNT, val);
    }

    static async getDcconColumnCount(): Promise<number> {
        return this.getPref(this.DCCON_COLUMN_COUNT);
    }

    static async setActionKey(key: string | null): Promise<boolean> {
        const val = key ?? this.ACTION_KEY.default;
        // console.log(`상호작용 키 : ${val}`);
        return this.setPref(this.ACTION_KEY, val);
    }

    static async getActionKey(): Promise<string> {
        return this.getPref(this.ACTION_KEY);
    }

    static async setDcconChangeCount(count: number | null): Promise<boolean> {
        const val = count ?? this.DCCON_CHANGE_COUNT.default;
        // console.log(`변환할 디시콘 갯수: ${val}`);
        return this.setPref(this.DCCON_CHANGE_COUNT, val);
    }

    static async getDcconChangeCount(): Promise<number> {
        return this.getPref(this.DCCON_CHANGE_COUNT);
    }
 }

 export default PreferencesHandler;