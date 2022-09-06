import { useState, useEffect } from "react";

function Reader(props) {
  const [captions, setCaptions] = useState("");
  const [textArray, setTextArray] = useState([]);
  const [storageArray, setStorageArray] = useState([]);
  const [save, setSave] = useState(false);
  const [storageCheck, setStorageCheck] = useState("");
  const [play, setPlay] = useState(false);
  const [delay, setDelay] = useState(1000);
  const [factor, setFactor] = useState(0.5);
  const [miniNum, setMiniNum] = useState(0);

  const { resume, setResume } = props;

  const handleChange = (e) => {
    setCaptions(e.target.value);
  };

  const handleSave = () => {
    setSave(true);
  };

  const renderCaptions = () => {
    return textArray
      ? textArray.map((sentence, idx) => (
          <div key={idx}>{sentence.replace("¶", "")}</div>
        ))
      : "nothing";
  };

  const count = (word) => {
    word = word.toLowerCase();
    word = word.replace(/(?:[^laeiouy]|ed|[^laeiouy]e)$/, "");
    word = word.replace(/^y/, "");
    //return word.match(/[aeiouy]{1,2}/g).length;
    let syl = word.match(/[aeiouy]{1,2}/g);
    // console.log(syl);
    if (syl) {
      //console.log(syl);
      return syl.length;
    }
  };

  // useEffect(() => {
  //   console.log(storageArray);
  // }, [storageArray]);

  const renderStorage = () => {
    let toggler = true;
    return storageArray
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
    let num = resume;
    const interval = setInterval(() => {
      const storageLength = Object.keys(localStorage).length;
      if (num < storageLength) {
        if (!play) {
          // console.log("paused");
        } else {
          num = ++num;
          let current = localStorage.getItem(num);
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
          // console.log(filteredArray);
          // console.log("sum: ", sum);
          // console.log("factored: ", Math.floor(factoredDelay / 1000));
          setResume(num);
          setStorageArray((arr) => [...arr, localStorage.getItem(num)]);
        }
      } else {
        return;
      }
    }, delay);

    return () => clearInterval(interval);
  }, [play, resume, setResume, delay, factor]);

  useEffect(() => {
    const firstItem = localStorage.getItem(1);
    setStorageCheck(firstItem ? firstItem : "");
  }, []);

  // useEffect(() => {
  //   console.log(storageCheck);
  // }, [storageCheck]);

  useEffect(() => {
    if (save) {
      localStorage.clear();
      // const splitIntoParagraphs = captions.split("¶");
      // console.log(splitIntoParagraphs);
      const removeLineBreaks = captions
        .replace(/(\r\n|\n|\r)/gm, " ")
        .replace(/(. ")/g, '.|"')
        .replace(/(\? ")/g, '?|"')
        .replace(/(! ")/g, '!|"')
        .replace(/([.?!¶])\s*(?=[A-Z"])(")*/g, "$1$2|")
        .split("|");
      setTextArray(removeLineBreaks);
      setSave(false);
    }
  }, [save, captions]);

  useEffect(() => {
    textArray.forEach((sentence, idx) => {
      return localStorage.setItem(idx, sentence);
    });
  }, [textArray]);

  // useEffect(() => {
  //   console.log(textArray);
  // }, [textArray]);

  useEffect(() => {
    const miniInterval = play
      ? setInterval(() => {
          let tempMiniNum = miniNum;
          tempMiniNum = ++tempMiniNum;
          if (play) {
            // console.log("Time: ", tempMiniNum);
          }
          setMiniNum(tempMiniNum);
        }, 1000)
      : null;

    return () => clearInterval(miniInterval);
  }, [storageArray, play, miniNum]);

  useEffect(() => {
    setMiniNum(0);
  }, [storageArray, play]);

  useEffect(() => {
    console.log("factor: ", factor);
  }, [factor]);

  return (
    <div className="reader">
      <h2>Reader</h2>
      <textarea placeholder="Input Book Chapter..." onChange={handleChange} />
      <button onClick={() => setPlay((p) => !p)}>
        {play ? "Pause" : "Play"}
      </button>
      <button onClick={handleSave}>Save</button>
      {storageCheck
        ? renderStorage()
        : !storageCheck && textArray
        ? renderCaptions()
        : ""}
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
