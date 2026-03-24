import { GlobalUtils } from "./utils/global-utils";
import  { PLATFORM_STR } from "./config/constants";
import { extractStreamerHandle } from "./utils/streamer-handle";
import { DcconSelector } from "./dccon-selector";
import PreferencesHandler from "./config/preferences-handler"

const isChzzk = GlobalUtils.isChzzk();
const isCime = GlobalUtils.isCime();

const init = async () => {
  const url = window.location.href;
  const platform = isChzzk ? PLATFORM_STR.CHZZK : isCime ? PLATFORM_STR.CIME : null;
  
  if (!platform) return;

  // 1. 초기화 시점에 사용할 모든 설정을 전역 캐시 메모리에 먼저 로드
  await PreferencesHandler.loadAll();
  const useDcconSelector = await PreferencesHandler.getDcconActive();
  if (!useDcconSelector) return;
  
  const handle = extractStreamerHandle(platform, url);
  // console.log(`[Init] Platform: ${platform}, handle: ${handle}`);
  
  const selector = new DcconSelector(platform);
};

// DOM 로드 완료 시 최초 한 번 호출
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
