
import { wordData } from "./data.js"

function getRandom() {
    const r = Math.random();
    // min shouldnt be needed
    const ri = Math.min(Math.floor(r * wordData.length), wordData.length - 1);
    return wordData[ri];
}

const langNames = {
    "ger": "DE",
    "eng": "EN",
}

function updateEntry(entry, headline, meanings) {
    headline.textContent = `${entry.base_reading} (${entry.readings.join(", ")})`;

    meanings.textContent = "";

    for (let lang in entry.meanings) {
        const container = document.createElement("div");
        container.classList.add("langMeanings");

        const h = document.createElement("h3");

        if (lang in langNames) {

            h.textContent = langNames[lang];
        } else {
            h.textContent = lang;
        }

        container.append(h);

        const ul = document.createElement("ul");

        for (let m of entry.meanings[lang]) {
            const li = document.createElement("li");
            li.textContent = m;
            ul.append(li);
        }

        container.append(ul);

        meanings.append(container);
    }

}

function main() {
    const button = document.querySelector("#newWordButton");
    const headline = document.querySelector("#headline");
    const meanings = document.querySelector("#meanings");

    updateEntry(getRandom(), headline, meanings);

    button.onclick = () => {
        updateEntry(getRandom(), headline, meanings);
    }
}



if (document.readyState === "interactive" || document.readyState === "complete") {
    main();
} else {
    document.addEventListener("DOMContentLoaded", main);
}