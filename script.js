const API_KEY = "5a851cb2792b43a0850b6825f6370ebf";
let scriptID = "";
async function fetchAndPlayAudio(name, price, description) {
  const scriptOptions = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify({
      scriptText: `
   <<soundSegment::intro>>
   <<sectionName::intro>>
   ${name}
   <<soundSegment::main>>
   <<sectionName::main>>
   ${price}<break time = '1s'/>
   <<soundSegment::outro>>
   <<sectionName::outro>>
   ${description}
   `,
      projectName: "e-comm-accessible",
      moduleName: "mymodule",
      scriptName: "comm-script",
      scriptId: "12345",
    }),
  };

  let speech;
  fetch("https://v1.api.audio/script", scriptOptions)
    .then((resp) => resp.json())
    .then((script) => {
      scriptId = script["scriptId"];
      const speechOptions = {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({
          scriptId,
          voice: "Aria",
          speed: "100",
          silence_padding: 0,
        }),
      };
      fetch("https://v1.api.audio/speech", speechOptions)
        .then((resp) => resp.json())
        .then((resp) => {
          const masteringOptions = {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "x-api-key": API_KEY,
            },
            body: JSON.stringify({
              scriptId,
              public: false,
              vast: false,
            }),
          };

          fetch("https://v1.api.audio/mastering", masteringOptions)
            .then((response) => response.json())
            .then((response) => {
              console.log("mastering: ", response);
              const audio = new Audio(response.url);
              audio.play();
            })
            .catch((err) => console.error(err));
        })
        .catch((err) => console.error(errr));
    })
    .catch((err) => console.error(err));
}

const productMap = new Map();
// Storing all the cards container divs.
const cardID = document.querySelectorAll(".container");

function getAudioForCard(cardId) {
  const { name, price, description } = productMap.get(cardId);
  (async function () {
    await fetchAndPlayAudio(name, price, description);
  })();
}

function sayBye(cardId) {
  console.log("Bye: ");
}

// Selecting the ID of the card which is being hovered
for (let idx = 0; idx < cardID.length; idx++) {
  if (cardID[idx].matches(".container")) {
    const cardName = document.querySelector(`#card${idx}`);
    cardName.addEventListener("mouseenter", () =>
      getAudioForCard(`card${idx}`)
    );
    cardName.addEventListener("mouseleave", () => sayBye(`card${idx}`));
    const productName = cardName.querySelector("h4").textContent;
    const productDescription = cardName.querySelector("p").textContent;
    const productPrice = cardName.querySelector("h3").textContent;
    productMap.set(`card${idx}`, {
      name: productName,
      price: productPrice,
      description: productDescription,
    });
  }
}
