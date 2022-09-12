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

  // const renderCaptions = () => {
  //   return textArray
  //     ? textArray.map((sentence, idx) => (
  //         <div key={idx}>{sentence.replace("¶", "")}</div>
  //       ))
  //     : "nothing";
  // };

  // const renderCaptions = () => {
  //   let toggler = true;
  //   return textArray
  //     ? textArray.map((sentence, idx) => {
  //         const color = toggler === true ? "red" : "skyblue";
  //         if (sentence.includes("¶")) {
  //           toggler = !toggler;
  //         }
  //         return (
  //           <div
  //             key={idx}
  //             className={idx + 1 < textArray.length ? "hidden" : "sentence"}
  //             style={{ backgroundColor: color }}
  //           >
  //             {sentence.replace("¶", "")}
  //           </div>
  //         );
  //       })
  //     : "nothing";
  // };

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
    const currentArray =
      storageArray?.length > 0
        ? storageArray
        : textArray?.length > 0
        ? textArray
        : [];
    console.log("storageArray: ", storageArray);
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
  }, [clear]);

  useEffect(() => {
    let resumePoint;
    if (localStorage.getItem("resumePoint") == null) {
      resumePoint = resume;
    } else {
      resumePoint = localStorage.getItem("resumePoint");
    }
    console.log("resumePoint: ", resumePoint);

    const interval = play
      ? setInterval(() => {
          const storageLength = Object.keys(localStorage).length;
          if (!play) {
            console.log("true pause");
          } else if (resumePoint < storageLength) {
            setResume((r) => (r += 1));
            let current = localStorage.getItem(resumePoint);
            console.log("current: ", current);
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
            setStorageArray((arr) => {
              console.log("resume: ", resume);
              console.log(
                "Pushing to storageArray: ",
                localStorage.getItem(resumePoint)
              );
              return [...arr, localStorage.getItem(resumePoint)];
            });
          } else {
            console.log("doing nothing");
            return;
          }
        }, delay)
      : null;

    return () => {
      localStorage.setItem("resumePoint", resume);
      clearInterval(interval);
    };
  }, [play, resume, delay, factor]);

  useEffect(() => {
    const firstItem = localStorage.getItem(0);
    setStorageCheck(firstItem);
  }, [clear, save]);

  useEffect(() => {
    if (save) {
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
      // setSave(false);
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
      <button onClick={() => setSave((s) => !s)}>Save</button>
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
