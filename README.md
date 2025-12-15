This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 개발 환경 설정 (Development Setup)

새로운 컴퓨터에서 프로젝트를 설정하려면 다음 단계를 따르세요.

1.  **프로젝트 클론 (Clone):**
    터미널을 열고 원하시는 폴더로 이동한 후, GitHub에서 프로젝트를 내려받습니다.
    ```bash
    git clone https://github.com/visualog/techhub-app.git
    ```

2.  **프로젝트 폴더로 이동:**
    ```bash
    cd techhub-app
    ```

3.  **필요한 패키지 설치:**
    프로젝트에 필요한 모든 패키지를 설치합니다.
    ```bash
    npm install
    ```

4.  **`serviceAccountKey.json` 파일 생성:**
    이 파일은 보안상 Git에 포함되어 있지 않으므로 직접 생성해야 합니다.
    -   프로젝트 최상위 폴더(루트 디렉토리)에 `serviceAccountKey.json` 파일을 만듭니다.
    -   가지고 계신 Firebase 서비스 계정의 **JSON 키 내용 전체를 복사**하여 이 파일 안에 붙여넣고 저장합니다.

5.  **`.env.local` 파일 생성 및 설정:**
    이 파일 역시 Git에 포함되어 있지 않으므로 직접 생성해야 합니다.
    -   프로젝트 최상위 폴더에 `.env.local` 파일을 만듭니다.
    -   아래 내용을 복사하여 파일에 붙여넣습니다. **단, `FIREBASE_SERVICE_ACCOUNT_KEY_PATH`의 값은 사용자님의 환경에 맞게 수정해야 합니다.**

    ```
    # .env.local 파일 내용

    # 아래 경로를 사용자님의 컴퓨터에 있는 serviceAccountKey.json 파일의 '절대 경로'로 수정해주세요.
    # 예: /Users/your-username/Projects/techhub-app/serviceAccountKey.json
    FIREBASE_SERVICE_ACCOUNT_KEY_PATH="/path/to/your/serviceAccountKey.json"

    # 발급받은 Gemini API 키를 입력해주세요.
    GEMINI_API_KEY="your-gemini-api-key"
    ```
    **경로 수정 팁:** `serviceAccountKey.json` 파일을 터미널에 드래그 앤 드롭하면 절대 경로를 쉽게 복사할 수 있습니다.

### AI 요약 생성 스크립트 실행

환경 설정이 모두 끝났다면, 다음 명령어를 실행하여 AI 요약을 생성하고 데이터베이스에 저장할 수 있습니다.

```bash
npm run collect-feeds
```

- 이 명령어는 등록된 모든 블로그의 최신 글을 가져와 AI 요약을 생성한 후, Firestore 데이터베이스에 저장합니다.
- API 사용량 제한 오류를 피하기 위해 스크립트가 각 기사를 하나씩 순차적으로 처리하므로, 전체 실행 시간이 몇 분 정도 소요될 수 있습니다.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.