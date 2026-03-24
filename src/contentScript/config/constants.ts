/**
 * 프로젝트 상수 및 설정 값들
 */

export const PLATFORM_STR = {
  CHZZK: 'chzzk',
  CIME: 'cime',
} as const;

export const STREAMER_HANDLE = {
  // 치지직 스트리머 핸들
  [PLATFORM_STR.CHZZK]: 
    [
      '7d4157ae4fddab134243704cab847f23',
      'df41352562ee012a0b43831fd675775f'
    ]
  ,
  // 씨미 스트리머 핸들
  [PLATFORM_STR.CIME]: [
    'funzinnu',
    'qarty'
  ],
} as const;