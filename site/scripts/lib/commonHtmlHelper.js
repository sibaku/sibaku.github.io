const genId = (() => {
    let id = 0;
    return () => {
        let i = id;
        id++;
        return i;
    }
})();

const makeContainer = (...children) => {
    const c = document.createElement("div");
    for (let child of children) {
        c.appendChild(child);
    }
    return c;
};

const makeElement = (tag, ...children) => {
    const c = document.createElement(tag);
    for (let child of children) {
        c.appendChild(child);
    }
    return c;
};

const makeCanvas = (width, height) => {
    const c = document.createElement("canvas");
    c.width = width;
    c.height = height;
    return c;
};



const makeSpan = (...children) => {
    const c = document.createElement("span");
    for (let child of children) {
        c.appendChild(child);
    }
    return c;
};
const makeTextField = (text) => {
    const span = makeSpan();
    span.textContent = text;
    return span;
};

const makeSlider = (min, max, value) => {
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = min;
    slider.max = max;
    slider.value = value;
    return slider;
};

function makeCheckbox(labelText, checked) {
    const checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    // checkbox.name = label;
    checkbox.value = "value";
    let id = genId();
    checkbox.id = id;
    checkbox.checked = checked;

    const label = document.createElement('label')
    label.htmlFor = id;
    label.appendChild(document.createTextNode(labelText));

    return [checkbox, label];

}


const makeCheckboxNoLabel = (checked) => {
    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = checked;
    return box;
};


const mapFrom = (v, min, max) => (v - min) / (max - min);
const mapTo = (v, min, max) => v * (max - min) + min;

const makeUpdateSlider = (cb, min = 0, max = 1, value = min, steps = 100, initialUpdate = true) => {
    const slider = makeSlider(1, steps,
        mapTo(mapFrom(value, min, max), 1, steps));

    Object.defineProperty(slider, "mappedValue", {
        get() {
            // convert slider value into [0,1]
            const t = mapFrom(parseInt(this.value), parseInt(this.min), parseInt(this.max));
            return mapTo(t, min, max);
        },
        set(x) {
            this.value = mapTo(mapFrom(x, min, max), parseInt(this.min), parseInt(this.max));
        }
    });

    slider.oninput = () => {
        const val = slider.mappedValue;
        const ret = cb(val, slider);
        if (ret !== undefined) {
            slider.mappedValue = ret;
        }
    };

    if (initialUpdate) {
        slider.oninput();
    }

    return slider;
}


const makeOptions = (options, selected = 0) => {
    const s = document.createElement("select");

    for (let i = 0; i < options.length; i++) {
        const option = document.createElement("option");
        option.setAttribute("value", i);
        const t = document.createTextNode(options[i]);
        option.appendChild(t);
        s.appendChild(option);
    }


    return s
}

const makeHeadline = (text, level = 1) => {
    const h = document.createElement(`h${level}`);
    h.textContent = text;
    return h;
}


export {
    makeContainer,
    makeElement,
    makeCanvas,
    makeCheckbox,
    makeCheckboxNoLabel,
    makeSpan,
    makeTextField,
    makeSlider,
    makeUpdateSlider, mapFrom, mapTo,
    makeOptions,
    makeHeadline,
    genId,
};