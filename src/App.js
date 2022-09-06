import { useState } from "react";
import Reader from "./Components/Reader";

function App() {
  const [play, setPlay] = useState(false);
  const [resume, setResume] = useState(0);

  return (
    <div className="app">
      <h1>Easy Reader</h1>
      <button onClick={() => setPlay((p) => !p)}>
        {play ? "Stop" : "Start"}
      </button>
      {play && <Reader resume={resume} setResume={setResume} />}
    </div>
  );
}

export default App;
