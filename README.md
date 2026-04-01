Made with AI as a simple, fun and functional project.

# 🌐 AI Translation Training Platform

A high-end, distraction-free web application designed strictly for language learners and translators. This platform allows users to paste raw text in any foreign language, intelligently analyzes it, and provides a beautiful, native translation canvas—while acting as a real-time linguistic professor.

## ✨ Features

- **🧠 Auto-Language Detection**: Simply paste text. The system uses a hidden AI layer to instantly and accurately detect the source language.
- **📚 Smart Floating Dictionary**: Click any word in the source panel to trigger an AI lookup that resolves context-aware meanings, IPA pronunciation, root conjugations (lemmas), and direct translations. The popovers are viewport-aware and dodge screen edges organically.
- **⚡ Local Dictionary Routing Cache**: A globally shared cache guarantees that clicking the same word 100 times never runs another API request, thus saving credits and optimizing speed.
- **🗓️ Contextual History Sidebar**: A sidebar actively tracks reading session metadata, elapsed time, and dynamically logs every single word you query into a scrollable dictionary history.
- **🎓 Final Grading Engine**: Upon completion, the application acts as an academic professor. It evaluates the translation and gives a comprehensive, formatted critique showcasing common pitfalls, grammatical corrections via tables, and native fluency tips using Markdown syntax.
- **🌙 Academic Dark Mode**: Designed beautifully using Inter and Lora fonts, equipped with a high-contrast dark mode for late-night linguistics.

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **AI Integration**: Google Gemini (`@google/generative-ai`) via the bleeding-edge `gemini-3.1-flash-lite-preview` model.
- **Markdown Rendering**: `react-markdown`, `remark-gfm`, `rehype-raw`

## 🚀 Getting Started

1. **Clone the repository** (or download the source code).
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Set up Environment Variables**:
   Create a `.env.local` file in the root directory and securely add your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
5. **Open your browser** and navigate to `http://localhost:3000`.

## 📂 Project Structure

- `/app`: Next.js App Router endpoints and primary layout routing.
- `/app/api`: Serverless API routes that protect the Gemini API Key from the client.
  - `/api/analyze`: Detects the source language of injected text.
  - `/api/dictionary`: Pulls context-aware data for user-clicked words.
  - `/api/evaluate`: Post-translation AI linguistic grader.
- `/components`: Dedicated React UI modules.
  - `SetupScreen.tsx`: The initial portal screen handling text injection.
  - `EditorLayout.tsx`: The primary 3-column split UI manager.
  - `SourcePanel.tsx`: Tokenizes root text into clickable spans with edge-clamping modal popups.
  - `TranslationCanvas.tsx`: A minimalist rich-text drafting area.
  - `ContextSidebar.tsx`: The active history manager and timer.
  - `ResultsScreen.tsx`: The Markdown rendering canvas for the final Professor grading.
