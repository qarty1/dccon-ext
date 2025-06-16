var browser = require("webextension-polyfill");

class PreferencesHandler {
    
    /**
     * IMAGE_ACTION_MAP 디시콘 이미지 클릭시 동작
     * COPY_ONLY: 복사
     * COPY_AND_INPUT: 복사 & 입력
     * COPY_AND_SEND: 복사 & 바로전송
     */
    static IMAGE_ACTION_MAP = {
        COPY_ONLY: 0,
        COPY_AND_INPUT: 1,
        COPY_AND_SEND: 2
    };

    /**
     * _DCCON_ACTIVE 디시콘 선택기 사용 여부 
     * true: 사용, false: 미사용
     * default: true
     */
    static DCCON_ACTIVE = {
        msgKey: "dcconActive",
        default: true
    };

    /**
     * IMAGE_ACTION 디시콘 바로 복사 사용 여부
     * true: 사용, false: 미사용
     * default: true
     */
    static IMAGE_ACTION = {
        msgKey: "imageAction",
        default: this.IMAGE_ACTION_MAP.COPY_ONLY
    };

    /**
     * CHAT_TO_DCCON 채팅 디시콘 변환기능 사용 여부 프로퍼티 키
     * true: 사용, false: 미사용
     * default: true
     */
    static CHAT_TO_DCCON = {
        msgKey: "chatToDccon", 
        default: true
    };

    /**
     * SHOW_COPY_TOAST 복사 완료 메세지 출력 여부 프로퍼티 키
     * true: 표시, false: 표시 안함
     * default: true
     */
    static SHOW_COPY_TOAST = {
        msgKey: "showCopyToast",
        default: true
    };

    /**
     * DCCON_WINDOW_WIDTH 디시콘 창 사용자 너비
     * default: null
     */
    static DCCON_WINDOW_WIDTH = {
        msgKey: "dcconWindowWidth",
        default: null
    };

    /**
     * DCCON_NEWLINE 디시콘을 채팅 다음줄에 표시합니다
     * default: null
     */
    static DCCON_NEWLINE = {
        msgKey: "dcconNewline",
        default: false
    };

    /**
     * SHOW_SCROLLBAR 디시콘 스크롤바 표시 여부
     * default: true
     */
    static SHOW_SCROLLBAR = {
        msgKey: "showScrollbar",
        default: true
    };

    /**
     * ICONTTV_COMPATIBILITY_MODE ICONTTV 호환 모드 설정 여부
     * default: false
     */
    static ICONTTV_COMPATIBILITY_MODE = {
        msgKey: "iconttvCompatibility",
        default: false
    };

    /**
     * USE_TAG_CONVERTER 채팅 태그 변환여부 설정
     * default: true
     */
    static USE_TAG_CONVERTER = {
        msgKey: "tagConverter",
        default: true
    };

    /**
     * COLUMN_TYPE_MAP 디시콘 표시 방법 (0 : 고정, 1 : 유동)
     * FIXED : 고정
     * FLUID : 유동
     */
    static COLUMN_TYPE_MAP = {
        FIXED: 0,
        FLUID: 1
    }
    
    /**
     * DCCON_COLUMN_FIXED 디시콘 줄 수 고정
     * default: FIXED
     */
    static DCCON_COLUMN_FIXED = {
        msgKey: "dcconColumnFixed",
        default: false
    };
    
    /**
     * DCCON_COLUMN_COUNT 한 줄에 표시할 디시콘 갯수
     * default: 3
     */
    static DCCON_COLUMN_COUNT = {
        msgKey: "dcconColumnCount",
        default: 3
    };

    /**
     * ACTION_KEY 상호작용 키
     * default: Tab
     */
    static ACTION_KEY = {
        msgKey: "actionKey",
        default: 'Tab'
    };

    static setToDefault() {
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
        
    }

    static async setDcconActive(active) {
        await browser.storage.local.set({[this.DCCON_ACTIVE.msgKey]: active});
        console.log(`디시콘 선택기 사용 : ${active}`);
        return true;                
    }

    static async getDcconActive() {
        let result = await browser.storage.local.get([this.DCCON_ACTIVE.msgKey]);
        return result[this.DCCON_ACTIVE.msgKey];
    }

    static async setImageAction(action) {
        await browser.storage.local.set({[this.IMAGE_ACTION.msgKey]: action});
        console.log(`디시콘 바로 복사 사용 : ${action}`);
        return true;
    }

    static async getImageAction() {
        let result = await browser.storage.local.get([this.IMAGE_ACTION.msgKey]);
        return result[this.IMAGE_ACTION.msgKey];
    }

    static async setChatToDccon(active) {
        await browser.storage.local.set({[this.CHAT_TO_DCCON.msgKey]: active});
        console.log(`채팅 디시콘 변환기능 사용 : ${active}`);
        return true;
    }

    static async getChatToDccon() {
        let result = await browser.storage.local.get([this.CHAT_TO_DCCON.msgKey]);
        return result[this.CHAT_TO_DCCON.msgKey];
    }
    
    static async setShowCopyToast(active) {
        await browser.storage.local.set({[this.SHOW_COPY_TOAST.msgKey]: active});
        console.log(`복사 완료 메세지 출력 : ${active}`);
    }

    static async getShowCopyToast() {
        let result = await browser.storage.local.get([this.SHOW_COPY_TOAST.msgKey]);
        return result[this.SHOW_COPY_TOAST.msgKey];
    }
    
    static async setDcconWindowWidth(width) {
        await browser.storage.local.set({[this.DCCON_WINDOW_WIDTH.msgKey]: width});
        console.log(`디시콘 창 가로 설정 : ${width}`);
        return true;
    }

    static async getDcconWindowWidth() {
        let result = await browser.storage.local.get([this.DCCON_WINDOW_WIDTH.msgKey]);
        return result[this.DCCON_WINDOW_WIDTH.msgKey];
    }

    static async setDcconNewline(newline) {
        await browser.storage.local.set({[this.DCCON_NEWLINE.msgKey]: newline});
        console.log(`디시콘 다음줄에 표시 : ${newline}`);
        return true;
    }

    static async getDcconNewline() {
        let result = await browser.storage.local.get([this.DCCON_NEWLINE.msgKey]);
        return result[this.DCCON_NEWLINE.msgKey];
    }

    static async setShowScrollbar(show) {
        await browser.storage.local.set({[this.SHOW_SCROLLBAR.msgKey]: show});
        console.log(`디시콘 다음줄에 표시 : ${show}`);
        return true;
    }

    static async getShowScrollbar() {
        let result = await browser.storage.local.get([this.SHOW_SCROLLBAR.msgKey]);
        return result[this.SHOW_SCROLLBAR.msgKey];
    }

    static async setIconttvCompatible(active) {
        await browser.storage.local.set({[this.ICONTTV_COMPATIBILITY_MODE.msgKey]: active});
        console.log(`iconttv 호환성 모드 작동 : ${active}`);
        return true;
    }

    static async getIconttvCompatible() {
        let result = await browser.storage.local.get([this.ICONTTV_COMPATIBILITY_MODE.msgKey]);
        return result[this.ICONTTV_COMPATIBILITY_MODE.msgKey];
    }

    static async setUseTagConverter(active) {
        await browser.storage.local.set({[this.USE_TAG_CONVERTER.msgKey]: active});
        console.log(`채팅 태그변환 사용 : ${active}`);
        return true;
    }

    static async getUseTagConverter() {
        let result = await browser.storage.local.get([this.USE_TAG_CONVERTER.msgKey]);
        return result[this.USE_TAG_CONVERTER.msgKey];
    }

    static async setDcconColumnFixed(fixed) {
        
        if(fixed == null) {
            fixed = this.DCCON_COLUMN_FIXED.default;
        }
        await browser.storage.local.set({[this.DCCON_COLUMN_FIXED.msgKey]: fixed});
        console.log(`디시콘 표시 방법 : ${fixed}`);
        return true;
    }

    static async getDcconColumnFixed() {
        let result = await browser.storage.local.get([this.DCCON_COLUMN_FIXED.msgKey]);
        return result[this.DCCON_COLUMN_FIXED.msgKey];
    }

    static async setDcconColumnCount(count) {
        
        if(count == null) {
            count = this.DCCON_COLUMN_COUNT.default;
        }
        await browser.storage.local.set({[this.DCCON_COLUMN_COUNT.msgKey]: count});
        console.log(`한줄에 표시할 디시콘 : ${count}`);
        return true;
    }

    static async getDcconColumnCount() {
        let result = await browser.storage.local.get([this.DCCON_COLUMN_COUNT.msgKey]);
        return result[this.DCCON_COLUMN_COUNT.msgKey];
    }

    static async setActionKey(key) {
        if(key == null) {
            key = this.ACTION_KEY.default;
        }
        await browser.storage.local.set({[this.ACTION_KEY.msgKey]: key});
        console.log(`한줄에 표시할 디시콘 : ${key}`);
        return true;
    }

    static async getActionKey() {
        let result = await browser.storage.local.get([this.ACTION_KEY.msgKey]);
        if([this.ACTION_KEY.msgKey] == undefined) {
            return this.ACTION_KEY.default;
        }
        return result[this.ACTION_KEY.msgKey];
    }
 }

 export default PreferencesHandler;