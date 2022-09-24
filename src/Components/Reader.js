import { useState, useEffect } from "react";

function Reader(props) {
  const [captions, setCaptions] = useState("");
  const [textArray, setTextArray] = useState([]);
  const [storageArray, setStorageArray] = useState([]);

  const [storageCheck, setStorageCheck] = useState("");
  const [play, setPlay] = useState(false);
  const [delay, setDelay] = useState(1000);
  const [factor, setFactor] = useState(0.5);
  const [miniNum, setMiniNum] = useState(0);
  const [clear, setClear] = useState(false);

  const { resume, setResume, save, setSave } = props;

  const handleChange = (e) => {
    setCaptions(e.target.value);
  };

  const count = (word) => {
    word = word.toLowerCase();
    word = word.replace(/(?:[^laeiouy]|ed|[^laeiouy]e)$/, "");
    word = word.replace(/^y/, "");
    let syl = word.match(/[aeiouy]{1,2}/g);
    if (syl) {
      return syl.length;
    }
  };

  const renderStorage = () => {
    let toggler = true;
    const currentArray =
      storageArray?.length > 0
        ? storageArray
        : textArray?.length > 0
        ? textArray
        : [];

    return currentArray?.length > 0
      ? storageArray.map((sentence, idx) => {
          const color = toggler === true ? "red" : "skyblue";
          if (sentence.includes("¶")) {
            toggler = !toggler;
          }
          return (
            <div
              key={idx}
              className={idx + 1 < storageArray.length ? "hidden" : "sentence"}
              style={{ backgroundColor: color }}
            >
              {sentence.replace("¶", "")}
            </div>
          );
        })
      : "nothing";
  };

  useEffect(() => {
    if (clear) {
      setSave(false);
      setResume(-1);
      setClear(false);
    }
    // eslint-disable-next-line
  }, [clear]);

  useEffect(() => {
    let resumePoint;
    if (localStorage.getItem("resumePoint") == null) {
      resumePoint = resume;
    } else {
      resumePoint = localStorage.getItem("resumePoint");
    }

    const interval = play
      ? setInterval(() => {
          const storageLength = Object.keys(localStorage).length;
          if (resumePoint < storageLength) {
            setResume((r) => (r += 1));
            let current = localStorage.getItem(resumePoint);
            let currentWords = current.split(" ");
            let countArray = currentWords.map((word) => count(word));
            const filteredArray = countArray.filter((x) => {
              return x !== undefined;
            });
            const sum = filteredArray.reduce(
              (partialSum, a) => partialSum + a,
              0
            );
            let tempDelay = sum * 1000;
            let factoredDelay = Math.floor(tempDelay * factor);
            setDelay(factoredDelay);
            setStorageArray((arr) => [
              ...arr,
              localStorage.getItem(resumePoint),
            ]);
          } else {
            return;
          }
        }, delay)
      : null;

    return () => {
      localStorage.setItem("resumePoint", resume);
      clearInterval(interval);
    };
    // eslint-disable-next-line
  }, [play, resume, delay, factor]);

  useEffect(() => {
    const firstItem = localStorage.getItem(0);
    setStorageCheck(firstItem);
  }, [clear, save]);

  useEffect(() => {
    if (save) {
      const removeLineBreaks = captions
        .replace(/(\r\n|\n|\r)/gm, " ")
        .replace(/(. ")/g, '.|"')
        .replace(/(\? ")/g, '?|"')
        .replace(/(! ")/g, '!|"')
        .replace(/([.?!¶])\s*(?=[A-Z"])(")*/g, "$1$2|")
        .split("|");
      setTextArray(removeLineBreaks);
    } else if (!save) {
      localStorage.clear();
      setStorageArray([]);
    }
  }, [save, captions]);

  useEffect(() => {
    textArray.forEach((sentence, idx) => {
      return localStorage.setItem(idx, sentence);
    });
  }, [textArray, save, clear]);

  useEffect(() => {
    const miniInterval = play
      ? setInterval(() => {
          let tempMiniNum = miniNum;
          tempMiniNum = ++tempMiniNum;
          if (play) {
          }
          setMiniNum(tempMiniNum);
        }, 1000)
      : null;

    return () => clearInterval(miniInterval);
  }, [storageArray, play, miniNum]);

  useEffect(() => {
    setMiniNum(0);
  }, [storageArray, play]);

  return (
    <div className="reader">
      <button onClick={() => setClear(true)}>Clear</button>
      <h2>Reader</h2>
      {!save && !storageCheck && (
        <textarea
          placeholder="Input Book Chapter..."
          onChange={handleChange}
          value={captions}
        />
      )}
      <button onClick={() => setPlay((p) => !p)}>
        {play ? "Pause" : "Play"}
      </button>
      {!save && <button onClick={() => setSave((s) => !s)}>Save</button>}
      {renderStorage()}
      <div>{miniNum}</div>
      <div>{Math.floor(delay / 1000)}</div>
      <input
        type="range"
        min={0.1}
        max={0.9}
        step={0.1}
        value={factor}
        onChange={(e) => setFactor(e.target.value)}
      />
    </div>
  );
}

export default Reader;
