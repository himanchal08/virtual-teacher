import React, { useRef, useState } from 'react';
import { gsap } from 'gsap';
import './App.css';

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`;

function App() {
  const [fileData, setFileData] = useState({ mime_type: null, data: null });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");

  const fileInputRef = useRef();
  const imageRef = useRef();
  const outputRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result.split(",")[1];
      setFileData({ mime_type: file.type, data: base64 });
      setPreview(ev.target.result);
      setResponse("");
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleReset = () => {
    setFileData({ mime_type: null, data: null });
    setPreview(null);
    setResponse("");
    setLoading(false);
  };

  const generateResponse = async () => {
    if (!fileData.data) {
      alert("Please upload an image first.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: "solve the given problem with proper steps of solution and provide the answer in bold" },
              { inline_data: fileData }
            ]
          }]
        })
      });
      const data = await res.json();
      const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
      setResponse(answer || "No response received.");
      setTimeout(() => {
        gsap.fromTo(outputRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8 });
      }, 100);
    } catch (error) {
      console.error(error);
      setResponse("⚠️ Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>I'm Your Virtual Teacher</h1>

      <div className="upload-box">
        <div className="drop-area" onClick={handleUploadClick}>
          <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} />
          {preview ? (
            <img src={preview} alt="Preview" className="preview" ref={imageRef} />
          ) : (
            <>
              <img src="plus.svg" alt="Upload Icon" className="icon" />
              <span>Upload Image</span>
            </>
          )}
        </div>
        <div className="btn-group">
          <button onClick={generateResponse}>Answer</button>
          <button onClick={handleReset} className="reset">Reset</button>
        </div>
      </div>

      {loading && <img src="loading.gif" alt="Loading" className="loading" />}

      {response && (
        <div className="output" ref={outputRef}>
          <pre>{response}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
