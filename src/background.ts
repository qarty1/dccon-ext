import browser from "webextension-polyfill";
import PreferencesHandler from "./contentScript/config/preferences-handler";

browser.runtime.onInstalled.addListener(async (details) => {
    // 확장 프로그램이 처음 설치되거나 업데이트되었을 때 실행됩니다.
    if (details.reason === "install" || details.reason === "update") {
        // console.log(`[Background] Extension ${details.reason}ed. Initializing default preferences...`);
        await PreferencesHandler.initializeDefaults();
    }
});
