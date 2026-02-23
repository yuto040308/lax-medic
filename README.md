# Lax Medic

医療データの管理・活用を目的としたモダンなウェブアプリケーションです。
このリポジトリは、Next.js (App Router) と Go (Gin) を組み合わせたフルスタックの開発環境を提供します。

## 🚀 システム構成

本プロジェクトは Docker Compose を利用して、ローカルでフロントエンドとバックエンドを同時に実行します。

- **Frontend**: Next.js (App Router) + TypeScript
- **Backend**: Go (Gin)
- **Infrastructure**: Docker Compose

## 🛠 テクノロジースタック

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (v14+)
- **Language**: TypeScript
- **Styling**: Vanilla CSS / Tailwind CSS

### Backend
- **Framework**: [Gin](https://github.com/gin-gonic/gin)
- **Language**: Go (v1.25+)
- **Hot Reload**: [air](https://github.com/air-verse/air)

## 📋 セットアップ手順

### 前提条件
- Docker / Docker Compose がインストールされていること

### 起動方法
1. インフラの起動：
   ```bash
   docker compose up --build
   ```

2. 以下のURLでアクセス可能になります：
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:8080/api/hello](http://localhost:8080/api/hello)

### 開発時の便利な機能
- **ホットリロード**: 
  - フロントエンド：ソース変更時に自動的にブラウザが更新されます。
  - バックエンド：`air` により、`.go` ファイルの変更を検知して自動ビルド・再起動が行われます。
- **エディタでの型認識**: 
  - `frontend/node_modules` はホスト側と同期されているため、VS Code などのエディタで型補完が効きます。

## 📂 ディレクトリ構成

```text
.
├── docker-compose.yml       # Dockerサービス定義
├── .gitignore               # Git除外設定
├── frontend/                # Next.js アプリケーション
│   ├── app/                 # App Router
│   ├── Dockerfile           # 開発用Dockerfile
│   └── package.json
└── backend/                 # Go アプリケーション
    ├── main.go              # APIエントリーポイント
    ├── Dockerfile           # 開発用Dockerfile
    └── .air.toml            # ホットリロード設定
```

## 🔐 API 疎通と CORS
- フロントエンド（`localhost:3000`）からバックエンド（`localhost:8080`）への API リクエストは、Gin の CORS ミドルウェアによって許可されています。
- 現在、`GET /api/hello` を通じて疎通確認が可能です。
