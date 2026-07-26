---
name: git-issue
description: 작업 시작 전 GitHub 이슈를 템플릿에 맞춰 작성하고 승인 후 gh로 생성합니다.
allowed-tools: Bash
---

# Git Issue Creator

작업을 시작하기 전, 무슨 작업을 할지 GitHub 이슈로 먼저 정의합니다.

## Instructions

1. **템플릿 선택**: 작업 성격을 파악해 아래 중 하나를 고릅니다. 불명확하면 사용자에게 확인합니다.
   - `feature.md` — 새 기능 추가/변경
   - `bug.md` — 버그 리포트
   - `test.md` — 테스트 작성
   - `custom.md` — 그 외 작업/논의/요청

2. **내용 채우기**: 선택한 `.github/ISSUE_TEMPLATE/{템플릿}` 파일을 읽어 섹션 구조 그대로 사용자와 함께 채웁니다.
   - 사용자가 준 정보로 각 섹션을 작성하고, 비어 있는 필수 섹션은 질문해서 메꿉니다.
   - 억지로 지어내지 말고, 모르는 항목은 물어봅니다.

3. **제목 작성**: 간결하고 명확한 한글 제목을 제안합니다.

4. **보고 및 승인**: 아래를 보고하고 **사용자 승인을 받습니다**.
   - **📋 제목**: 제안 제목
   - **📄 본문**: 완성된 이슈 본문 (마크다운)
   - **🏷 라벨**: 템플릿에 대응하는 라벨 제안 (예: feature→`enhancement`, bug→`bug`)

5. **생성**: 승인 후에만 실행합니다.
   ```bash
   gh issue create --title "{제목}" --body "{본문}" --label "{라벨}"
   ```
   - 생성 후 반환된 이슈 번호를 사용자에게 알립니다.

6. **브랜치 생성 제안 (선택)**: 이슈 생성 후, 이어서 작업 브랜치를 만들지 물어봅니다.
   - 형식: `{기능종류}/{작업설명}` (예: `feat/login-oauth-api`)
   - 기능종류: `feat` `fix` `refactor` `chore` `test` `docs` `improvement` `config`
   - 승인 시: `git switch develop && git pull && git switch -c {종류}/{설명}`

## 중요 제약 사항

- **승인 후 생성**: 사용자가 명시적으로 승인한 경우에만 `gh issue create`를 실행합니다.
- **자동 생성 금지**: 승인 없이 먼저 이슈를 생성하지 않습니다.
- **템플릿 준수**: `.github/ISSUE_TEMPLATE`의 섹션 구조를 임의로 바꾸지 않습니다.
