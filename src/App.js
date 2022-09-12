import { useState, useEffect } from "react";
import Reader from "./Components/Reader";

function App() {
  const [start, setStart] = useState(false);
  const [resume, setResume] = useState(-1);
  const [save, setSave] = useState(false);

  useEffect(() => {
    const resumePoint = localStorage.getItem("resumePoint");
    if (save && !start) {
      if (resumePoint != null) {
        console.log("cool");
        localStorage.setItem("resumePoint", resumePoint - 2);
        setResume((r) => (r -= 2));
      }
    }
  }, [start]);

  return (
    <div className="app">
      <h1>Easy Reader</h1>
      <button onClick={() => setStart((p) => !p)}>
        {start ? "Stop" : "Start"}
      </button>
      {start && (
        <Reader
          resume={resume}
          setResume={setResume}
          save={save}
          setSave={setSave}
        />
      )}
    </div>
  );
}

export default App;
