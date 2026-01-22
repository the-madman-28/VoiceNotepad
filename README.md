# VoiceNotepad 🎙️📝 (Web Speech API Version)

VoiceNotepad is a lightweight **Notepad clone built using React + Vite** that supports:

✅ Normal typing  
✅ Speech-to-Text dictation (browser-based)  
✅ Auto-save  
✅ Export to PDF  
✅ Save/Open `.txt` files  
✅ Dark / Light mode  
✅ Keyboard shortcuts for dictation  

> ⚠️ This version uses the **Browser Web Speech API (SpeechRecognition)** — not Whisper API.

---

## ✨ Features

### 📝 Editor
- Simple Notepad-style text editor
- Text is inserted/appended **at the cursor position** (does not overwrite existing text)

### 🎙️ Speech to Text
- Uses browser **Web Speech API**
- Dictation inserts text into the editor
- Works best with **Chrome / Edge**

### 💾 Auto Save
- Automatically saves editor content in browser `localStorage`
- Notes remain saved even after refresh/reopen

### 📄 Export
- Export to **PDF** (via `jsPDF`)
- Download as **.txt** file
- Open `.txt` file

### 🌗 Theme Support
- Toggle **Dark Mode / Light Mode**

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---------|--------|
| **Ctrl + L** | Start Listening |
| **Ctrl + P** | Stop Listening |

---

## 🧩 Tech Stack
- **React** (Vite)
- **Web Speech API** (`SpeechRecognition`)
- **jsPDF** (PDF export)
- **localStorage** (autosave)

---

## 📌 Requirements
- Node.js **18+ recommended**
- Supported browsers:
  - ✅ Google Chrome (Best)
  - ✅ Microsoft Edge (Best)
  - ⚠️ Firefox: SpeechRecognition usually not supported

---

## 📂 Project Structure


---

## 🌍 Deployment

You can deploy this project as a static web app on:

- **Vercel**
- **Netlify**
- **GitHub Pages** (with minor config)

---

## ⚠️ Notes / Limitations

Speech recognition depends on:
- Mic quality
- Internet connection
- Browser’s speech model

Web Speech API may stop after silence (**browser behavior**).

---

## 🔮 Future Upgrade

To use a real ML transcription model:
- Integrate **OpenAI Whisper API**
- Add backend `/transcribe` endpoint


## 📂 Project Structure

voicenotepad/
│ index.html
│ package.json
│ vite.config.js
│
└─ src/
│ main.jsx
│ App.jsx
│ styles.css
│
├─ hooks/
│ useLocalStorage.js
│
└─ utils/
file.js
pdf.js
speech.js



---

## 🌍 Deployment

You can deploy this project as a static web app on:

- **Vercel**
- **Netlify**
- **GitHub Pages** (with minor config)

---

## ⚠️ Notes / Limitations

Speech recognition depends on:
- Mic quality
- Internet connection
- Browser’s speech model

Web Speech API may stop after silence (**browser behavior**).

---

## 🔮 Future Upgrade

To use a real ML transcription model:
- Integrate **OpenAI Whisper API**
- Add backend `/transcribe` endpoint
