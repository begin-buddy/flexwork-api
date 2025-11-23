module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 새로운 기능
        'fix', // 버그 수정
        'docs', // 문서 수정
        'style', // 코드 스타일 변경 (포맷팅, 세미콜론 등)
        'refactor', // 리팩토링
        'test', // 테스트 코드
        'chore', // 빌드, 설정 파일 수정
        'perf', // 성능 개선
        'ci', // CI/CD 설정
        'build', // 빌드 시스템 변경
        'revert', // 되돌리기
      ],
    ],
    'subject-case': [0], // subject case 제한 없음 (한글 지원)
  },
};
