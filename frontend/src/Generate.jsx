import React, { useState, useEffect } from "react";
import "./components/generate/generate.css";
import { auth } from "./Firebase";

import { BsFileImage } from "react-icons/bs";
import { BsImage } from "react-icons/bs";

import { BiFullscreen } from "react-icons/bi";
import { BiListUl } from "react-icons/bi";

const Generate = ({ callBack }) => {
  const [userInput, setUserInput] = useState("");
  const [credits, setCredits] = useState(() => {
    const savedCredits = localStorage.getItem("credits");
    console.log(savedCredits);
    return savedCredits !== null ? JSON.parse(savedCredits) : 10;
  });

  useEffect(() => {
    localStorage.setItem("credits", JSON.stringify(credits));
  }, [credits]);

  const handleUserInput = (e) => {
    const value = e.target.value;
    setUserInput(value);
    // console.log(value);
  };

  /* This handle user is signedIn or not */
  const [userStatus, setUserStatus] = useState(false);
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUserStatus(true);
      } else {
        setUserStatus(false);
      }
    });
  }, []);

  function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function clearImageGrid() {
    const imageGrid = document.getElementById("image-grid");
    imageGrid.innerHTML = "";
  }

  const birdKeywords = [
    "bird",
    "sparrow",
    "eagle",
    "parrot",
    "pigeon",
    "owl",
    "crow",
    "peacock",
    "penguin",
    "falcon",
    "canary",
    "robin",
    "swallow",
    "seagull",
    "woodpecker",
  ];

  const checkBird = (input) => {
    return birdKeywords.some((keyword) =>
      input.toLowerCase().includes(keyword)
    );
  };

  const handleImages = async (input) => {
    clearImageGrid();
    if (userStatus) {
      if (input !== "") {
        const imageUrls = [];
        const maxImages = 1;
        const apiKey = "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";

        for (let i = 0; i < maxImages; i++) {
          const randomNumber = getRandomNumber(1, 10000);
          const propmt = `${input} ${randomNumber}`;

          if (!checkBird(input)) {
            alert("I am trained to generate only birds images..");
            setUserInput("");
          } else {
            const response = await fetch(
              "https://api-inference.huggingface.co/models/prompthero/openjourney",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({ inputs: propmt }),
              }
            );

            if (!response.ok) {
              alert("Failed to generate");
            } else {
              setCredits((prevCredits) => prevCredits - 2);
            }
            const blob = await response.blob();
            const imgUrl = URL.createObjectURL(blob);
            /* ----------------- */
            const j = 0;
            if (j === i) {
              addHistory(imgUrl, input);
            }
            /* ----------------- */
            imageUrls.push(imgUrl);

            const img = document.createElement("img");
            img.src = imgUrl;
            img.alt = `art-${i + 1}`;

            document.getElementById("image-grid").appendChild(img);
          }
        }
      } else {
        alert("Text Field should not be empty");
      }
    } else {
      alert("User Not Logged In");
    }
  };

  const addHistory = async (imgUrl, input) => {
    if (userStatus) {
      const userEmail = localStorage.getItem("email");
      const img_path = imgUrl;
      const img_desc = input;

      const data = {
        userEmail,
        img_path,
        img_desc,
      };

      const url = "http://127.0.0.1:5000/addHistory";
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      };

      const response = await fetch(url, options);
      if (response.status !== 201 && response.status !== 200) {
        const data = await response.json();
        alert(data.message);
      } else {
        callBack();
        setUserInput("");
      }
    } else {
      alert("You need to signed in First");
      return;
    }
  };

  return (
    <>
      <section id="generate">
        <h5 className="credits">Credits: {credits}</h5>
        <div className="left">
          <div className="describe__image">
            <label htmlFor="describe">Describe your image</label>
            <br />
            <textarea
              name="describe"
              id="describe"
              onChange={handleUserInput}
              value={userInput}
              placeholder="A yellow bird"
              rows="5"
            ></textarea>
            <br />
            <p style={{ opacity: "0.5" }}>
              Each image generation cost 2 credits
            </p>
            <button
              style={{
                borderRadius: "20px",
                width: "150px",
                border: "2px solid var(--button--background--color)",
                float: "right",
                clear: "both",
                position: "relative",
                right: "0px",
                marginTop: "11px",
              }}
              className="sign__in__btn"
              type="button"
              onClick={() => handleImages(userInput)}
            >
              Generate
            </button>
          </div>
        </div>
        <div className="right">
          <div className="inner__right">
            <p className="title">
              {" "}
              <span>
                <BiFullscreen />
              </span>{" "}
              Dimensions
            </p>
            <input
              id="dimension__range"
              type="range"
              min={0}
              max={256}
              value={256}
              disabled
            />
            <br />
            <div className="resourse">
              <BsFileImage />
              <BsImage />
            </div>
            <p className="dimensions">256 x 256</p>

            <hr className="horizontal__row" />

            <p className="title model__type">
              <span>
                <BiListUl size={20} />
              </span>{" "}
              Model Type
            </p>
            <p style={{ opacity: "1", marginTop: "0" }} className="title">
              stGAN Model
            </p>
          </div>
        </div>
      </section>

      <div id="image-grid"></div>
    </>
  );
};

export default Generate;