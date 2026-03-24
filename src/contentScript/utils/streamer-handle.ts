import { PLATFORM_STR } from "../config/constants";

/**
 * URL에서 스트리머 핸들을 추출하는 함수
 * @param platform - 플랫폼 (chzzk 또는 cime)
 * @param url - 현재 URL
 * @returns 추출된 핸들 또는 null
 */
export function extractStreamerHandle(platform: string, url: string): string | null {
  if (platform === PLATFORM_STR.CHZZK) {
    // chzzk: 32자리 영문자+숫자 추출 (첫 번째 매치)
    const match = url.match(/[a-zA-Z0-9]{32}/);
    return match ? match[0] : null;
  } else if (platform === PLATFORM_STR.CIME) {
    // ci.me: 슬래시 사이의 '@무작위 문자' 추출 (첫 번째 매치)
    const match = url.match(/\/@([^\/]+)/);
    return match ? match[1] : null;
  }
  return null;
}
