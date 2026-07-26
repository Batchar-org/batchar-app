---
name: git-pr
description: 작업 브랜치를 develop에 rebase하고 PR 템플릿 형식으로 develop 대상 PR을 생성/업데이트합니다.
allowed-tools: Bash
---

# Git PR Creator (rebase → develop)

작업 브랜치를 `develop`에 rebase한 뒤, `PULL_REQUEST_TEMPLATE.md` 형식으로 `develop` 대상 PR을 만듭니다.

## Instructions

1. **변경/이슈 수집**:
   ```bash
   git rev-parse --abbrev-ref HEAD          # 작업 브랜치
   git merge-base develop HEAD              # 분기점
   git diff --stat $(git merge-base develop HEAD) HEAD   # 변경 파일
   ```
   - 브랜치명은 `{기능종류}/{설명}` 형식이라 이슈번호가 없습니다. 관련 이슈번호를 사용자에게 물어봅니다. 없으면 `Closes` 줄을 생략합니다.

2. **rebase**: `develop`의 최신 내용 위로 작업 브랜치를 rebase합니다.
   ```bash
   git fetch origin
   git rebase origin/develop
   ```
   - **충돌 발생 시**: 즉시 멈추고 사용자에게 보고합니다. 임의로 해결하지 않습니다.
   - rebase 후 원격에 이미 푸시된 브랜치라면 `git push --force-with-lease`가 필요합니다.
     이는 히스토리를 덮어쓰므로 **반드시 사용자 승인 후** 실행합니다.

3. **PR 존재 확인**:
   ```bash
   gh pr view --json title,body,number
   ```
   - **없으면** → 4단계(신규 생성), **있으면** → 5단계(업데이트).

4. **PR 신규 생성**: 아래 본문을 구성해 보고하고 **승인 후** 생성합니다.
   ```bash
   gh pr create --base develop --title "{제목}" --body "{본문}"
   ```
   - **리뷰어는 배정하지 않습니다.**

5. **기존 PR 업데이트**: 기존 PR 이후의 새 커밋 변경분을 각 섹션에 반영해 `gh pr edit`으로 수정합니다.

6. **병합 시 브랜치 자동 삭제 설정**: 저장소의 "Automatically delete head branches" 설정을 확인합니다.
   ```bash
   gh repo view --json deleteBranchOnMerge -q .deleteBranchOnMerge
   ```
   - 이미 켜져 있으면 그대로 넘어갑니다.
   - 꺼져 있으면 사용자에게 활성화 여부를 물어보고, **승인 후에만** 실행합니다.
     ```bash
     gh repo edit --delete-branch-on-merge
     ```

## PR 본문 형식 (PULL_REQUEST_TEMPLATE.md)

```markdown
## 🛠️ 설명 (Description)

{어떤 작업을 했는지 설명}

## 변경 사항 요약 (Summary)

- {주요 변경 1}
- {주요 변경 2}

## 관련 이슈 (Related Issues)

- Closes #{이슈번호}

## 👀 리뷰어를 위한 참고 사항 (Notes for Reviewers)

- {리뷰어가 집중해서 볼 로직·특이사항}

## ➕ 추가 정보 (Additional Information)

- {있으면 기재, 없으면 생략}
```

- 제목: `#{이슈번호} {간단한 요약}` 형태로 제안합니다.
- 관련 이슈가 여러 개면 `Closes #N`을 줄마다 나열합니다.

## 중요 제약 사항

- **base는 develop 고정**: 다른 base로 PR을 만들지 않습니다.
- **force push 승인 필수**: rebase 후 force push는 사용자 승인 없이 실행하지 않습니다.
- **충돌 자동 해결 금지**: rebase 충돌은 사용자에게 넘깁니다.
- **리뷰어 미배정**: PR에 리뷰어를 자동 등록하지 않습니다.
