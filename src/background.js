import PreferencesHandler from './modules/preferences-handler.js';

import { domMessage } from './modules/chzzk-dom-controller.js';
var browser = require("webextension-polyfill");

browser.runtime.onInstalled.addListener((details) => {
    
    if (details.reason === browser.runtime.OnInstalledReason.INSTALL) {
        PreferencesHandler.setToDefault();
    }

    if (details.reason === browser.runtime.OnInstalledReason.UPDATE) {
        let newVersion = browser.runtime.getManifest().version_name ? browser.runtime.getManifest().version_name : browser.runtime.getManifest().version;

        if(newVersion == "1.0.2") {
            PreferencesHandler.setImageAction(PreferencesHandler.IMAGE_ACTION.default);
        }

        if(newVersion == "1.0.3") {
            PreferencesHandler.setUseTagConverter(PreferencesHandler.USE_TAG_CONVERTER.default);
            PreferencesHandler.setDcconColumnCount(PreferencesHandler.DCCON_COLUMN_COUNT.default);
        }

        if(newVersion == "1.0.4") {
            PreferencesHandler.setActionKey(PreferencesHandler.ACTION_KEY.default);
        }
    }
});

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if(message.type && message.type === domMessage.TYPE) {
        const {tab} = sender;
        browser.tabs.sendMessage(tab.id, message);
    }
});
