import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { downloadTextFile, readTextFile } from "./utils/file";
import { exportToPDF } from "./utils/pdf";
import { getSpeechRecognition } from "./utils/speech";

const STORAGE_KEY_TEXT = "voicenotepad:text";
const STORAGE_KEY_THEME = "voicenotepad:theme";

export default function App() {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  const [text, setText] = useLocalStorage(STORAGE_KEY_TEXT, "");
  const [theme, setTheme] = useLocalStorage(STORAGE_KEY_THEME, "light");

  const textRef = useRef(text);
  const inactivityTimerRef = useRef(null);

  const isListeningRef = useRef(false);
  const manualStopRef = useRef(false); // ✅ if user stops, don't auto-restart
  const shouldAutoRestartRef = useRef(false); // ✅ dictation mode ON/OFF

  const [status, setStatus] = useState("Ready");
  const [listening, setListening] = useState(false);
  const [lang, setLang] = useState("en-IN");

  const recognition = useMemo(() => getSpeechRecognition(), []);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    setStatus("Saved (autosave) ✅");
    const t = setTimeout(() => setStatus("Ready"), 900);
    return () => clearTimeout(t);
  }, [text]);

  // -----------------------------
  // Inactivity auto-stop
  // -----------------------------
  function clearInactivityTimer() {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }

  function resetInactivityTimer() {
    clearInactivityTimer();
    inactivityTimerRef.current = setTimeout(() => {
      stopDictation(true); // auto stop on 7s inactivity
    }, 5000);
  }

  // -----------------------------
  // Insert at cursor (append)
  // -----------------------------
  function insertAtCursor(insertText) {
    const el = editorRef.current;
    if (!el) return;

    const start = el.selectionStart ?? textRef.current.length;
    const end = el.selectionEnd ?? textRef.current.length;

    const current = textRef.current;

    const before = current.slice(0, start);
    const after = current.slice(end);

    const finalInsert = insertText;
    const newText = before + finalInsert + after;

    setText(newText);

    requestAnimationFrame(() => {
      el.focus();
      const pos = start + finalInsert.length;
      el.selectionStart = el.selectionEnd = pos;
    });
  }

  // -----------------------------
  // Speech Recognition setup
  // -----------------------------
  useEffect(() => {
    if (!recognition) return;

    recognition.continuous = true;
    recognition.interimResults = true;

    let bufferFinal = "";

    recognition.onstart = () => {
      isListeningRef.current = true;
      setListening(true);
      setStatus("Listening... 🎙️");
      resetInactivityTimer();
    };

    recognition.onresult = (event) => {
      resetInactivityTimer(); // activity detected

      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) bufferFinal += transcript + " ";
        else interim += transcript;
      }

      if (bufferFinal.trim().length > 0) {
        insertAtCursor(bufferFinal);
        bufferFinal = "";
      }

      if (interim.trim()) setStatus("Listening... (" + interim + ")");
      else setStatus("Listening... 🎙️");
    };

    recognition.onerror = (e) => {
      isListeningRef.current = false;
      setListening(false);
      clearInactivityTimer();
      setStatus("Speech error: " + e.error);
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      setListening(false);
      clearInactivityTimer();

      // ✅ If dictation mode is ON and user didn't stop manually -> restart
      if (shouldAutoRestartRef.current && !manualStopRef.current) {
        setStatus("Resuming... 🔁");
        // small delay helps Chrome
        setTimeout(() => {
          try {
            recognition.lang = lang;
            recognition.start();
          } catch {
            // ignore start errors
          }
        }, 250);
      } else {
        setStatus("Stopped");
      }
    };

    return () => {
      try {
        recognition.stop();
      } catch {}
      clearInactivityTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recognition, lang]);

  // -----------------------------
  // Dictation controls
  // -----------------------------
  function startDictation() {
    if (!recognition) {
      alert("SpeechRecognition not supported. Use Chrome/Edge.");
      return;
    }

    manualStopRef.current = false;          // ✅ not manual stop
    shouldAutoRestartRef.current = true;    // ✅ dictation mode ON

    try {
      recognition.lang = lang;

      // if already running, do nothing
      if (isListeningRef.current) return;

      recognition.start();
    } catch {
      // ignore
    }
  }

  function stopDictation(isAutoStop = false) {
    if (!recognition) return;

    clearInactivityTimer();

    // If inactivity auto-stop, treat it as manual stop (don’t restart)
    manualStopRef.current = true;
    shouldAutoRestartRef.current = false;

    try {
      recognition.stop();
    } catch {}

    setStatus(isAutoStop ? "Auto-stopped (7s inactivity) ⏸️" : "Stopped ⏹️");
  }

  // -----------------------------
  // Notepad actions
  // -----------------------------
  function handleNew() {
    if (confirm("Clear the document?")) {
      setText("");
      setStatus("New document");
    }
  }

  function handleSaveTxt() {
    downloadTextFile("notes.txt", textRef.current);
    setStatus("Downloaded notes.txt ✅");
  }

  async function handleOpenFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const content = await readTextFile(file);
    setText(content);
    setStatus("File opened ✅");
    e.target.value = "";
  }

  function handleExportPDF() {
    exportToPDF(textRef.current);
    setStatus("Exported PDF ✅");
  }

  function toggleTheme() {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }

  // -----------------------------
  // Hotkeys
  // Ctrl+L => start listening
  // Ctrl+P => stop listening
  // -----------------------------
  useEffect(() => {
    function onKeyDown(e) {
      if (e.ctrlKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        startDictation();
      }
      if (e.ctrlKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        stopDictation(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  return (
    <>
      <header>
        <button onClick={handleNew}>New</button>

        <button onClick={() => fileInputRef.current?.click()}>Open</button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt"
          style={{ display: "none" }}
          onChange={handleOpenFile}
        />

        <button onClick={handleSaveTxt}>Save (.txt)</button>
        <button onClick={handleExportPDF}>Export PDF</button>

        <select value={lang} onChange={(e) => setLang(e.target.value)}>
          <option value="en-IN">English (India)</option>
          <option value="en-US">English (US)</option>
          <option value="hi-IN">Hindi (India)</option>
        </select>

        <button className="primary" onClick={startDictation} disabled={listening}>
          🎤 Start (Ctrl+L)
        </button>
        <button className="danger" onClick={() => stopDictation(false)} disabled={!listening}>
          ⏹ Stop (Ctrl+P)
        </button>

        <button onClick={toggleTheme}>
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>

        <div className="status">{status}</div>
      </header>

      <textarea
        ref={editorRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Start typing... (Autosave enabled)"
      />
    </>
  );
}
