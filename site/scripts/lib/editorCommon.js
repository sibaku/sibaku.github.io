import {
    Compartment,
    EditorState,
    EditorView, keymap,
    defaultKeymap,
    javascript, javascriptLanguage, localCompletionSource, scopeCompletionSource,
    basicSetup,
    autocompletion, CompletionContext,
    indentWithTab,
} from "../bundles/codeMirror.bundle.min.js";
import * as helper from "../lib/commonHtmlHelper.js";

import * as jsm from "../bundles/jsmatrix.bundle.min.js";

import {
    abcdef,
    abyss,
    androidStudio,
    andromeda,
    basicDark,
    basicLight,
    catppuccinMocha,
    cobalt2,
    forest,
    githubDark,
    githubLight,
    gruvboxDark,
    gruvboxLight,
    highContrastDark,
    highContrastLight,
    materialDark,
    materialLight,
    monokai,
    nord,
    palenight,
    solarizedDark,
    solarizedLight,
    synthwave84,
    tokyoNightDay,
    tokyoNightStorm,
    volcano,
    vsCodeLight,
    vsCodeDark,
} from "../bundles/codeMirror.bundle.min.js";


const themes = {
    abcdef,
    abyss,
    androidStudio,
    andromeda,
    basicDark,
    basicLight,
    catppuccinMocha,
    cobalt2,
    forest,
    githubDark,
    githubLight,
    gruvboxDark,
    gruvboxLight,
    highContrastDark,
    highContrastLight,
    materialDark,
    materialLight,
    monokai,
    nord,
    palenight,
    solarizedDark,
    solarizedLight,
    synthwave84,
    tokyoNightDay,
    tokyoNightStorm,
    volcano,
    vsCodeLight,
    vsCodeDark,

};

const editorClassNames = {
    container: "editorContainer",

    editor: "editor",

    controlsContainer: "editorControlsContainer",

    filesContainer: "editorFilesContainer",
    fileEntry: "editorFileEntry",
    selected: "editorSelected",
    filename: "editorFilename",

    lookAndFeelContainer: "editorLookAndFeelContainer",
    themeSelector: "editorThemeSelector",

    actionCotnainer: "editorActionContainer",

    hidden: "editorHidden",
};

const scriptRunClassNames = {
    runContainer: "scriptRunContainer",

    outputContainer: "scriptOutputContainer",
    output: "scriptOutput",
    outputErrorEntry: "scriptOutputErrorEntry",
    outputEntry: "scriptOutputEntry",

    contentContainer: "scriptContentContainer",
    twoColumn: "scriptTwoColumn",
    content: "scriptContent",
};

function createEditorState({
    autocompleteObjects = [window],
    autocompletionProviders = [],
    initialContent = "",
    extensions = [],
} = {}) {
    return EditorState.create({
        doc: initialContent,
        extensions: [
            basicSetup,
            javascript(),
            ...autocompleteObjects.map((el => {
                return javascriptLanguage.data.of({
                    autocomplete: scopeCompletionSource(el),
                })
            })),
            ...autocompletionProviders.map((el => {
                return javascriptLanguage.data.of({
                    autocomplete: el,
                })
            })),
            ...extensions,
            EditorView.lineWrapping,
        ],

    });
}
function createCodeEditor(containerId, {
    autocompleteObjects = [window],
    autocompletionProviders = [],
    initialContent = "",
    extensions = [],
} = {}) {
    const container = typeof containerId === "string" ? document.getElementById(containerId) : containerId;

    let startState = createEditorState({ autocompleteObjects, autocompletionProviders, initialContent, extensions });

    let view = new EditorView({
        state: startState,
        parent: container
    });
    return view;
}

class FileSource {
    name = "script.js";
    text = "";
    initialText = "";
    editable = true;
    show = true;

    constructor({
        name = "script.js",
        text = "",
        initialText = "",
        editable = true,
        show = true,
    } = {}) {
        this.name = name;
        this.text = text;
        this.initialText = initialText;
        this.editable = editable;
        this.show = show;
    }

    toString() {
        return JSON.stringify(this);
    }
}

async function makeJsEditor(containerId, appContext, {
    files = [],
    openFileIndex = 0,
    iframeSourceDoc = null,
    populateOutputDocument = null,
    populateOutputContainerBeforeRun = null,
    runHeaderCodeString = "",
    autocompleteObjects = [],
    enableOutput = true,
    enableContent = true,
    maxScriptRunHeight = 600,
} = {}) {

    const currentStorageId = `${appContext.filePathStem}.${containerId}`;
    let themeName = localStorage.getItem("editorTheme");

    if (themeName === null) {
        themeName = "basicDark";
    }

    if (!(themeName in themes)) {
        const keys = Object.keys(themes);
        themeName = keys.length > 0 ? keys[0] : null;
    }

    // restore
    let storageDataJSON = localStorage.getItem(currentStorageId);
    let storageData = null;
    if (storageDataJSON == null) {

        const sf = [];
        files.forEach((el) => {
            sf.push({
                name: el.name,
                text: el.initialText,
                initialText: el.initialText,
                editable: el.editable,
                show: el.show,
            });
        });

        storageData = { storedFiles: sf, storedOpenFileIdx: openFileIndex };

    } else {
        try {
            storageData = JSON.parse(storageDataJSON);
        } catch (e) {
            console.error("Error reading saved file");
            localStorage.removeItem(currentStorageId);
            const sf = [];
            files.forEach((el) => {
                sf.push({
                    name: el.name,
                    text: el.initialText,
                    initialText: el.initialText,
                    editable: el.editable,
                    show: el.show,
                });
            });

            storageData = { storedFiles: sf, storedOpenFileIdx: openFileIndex };
        }
    }

    const themeCompartment = new Compartment;
    const tabIndentCompartment = new Compartment;

    let { storedFiles, storedOpenFileIdx } = storageData;
    if (storedFiles.length === 0) {
        storedFiles.push({
            name: "script.js",
            text: "",
            initialText: "",
            editable: true,
            show: true,

        });

        storedOpenFileIdx = 0;
    }


    const container = document.getElementById(containerId);
    container.classList.add(editorClassNames.container);

    const editorContainer = helper.makeContainer();
    editorContainer.id = "editor_" + helper.genId();
    editorContainer.classList.add(editorClassNames.editor);

    const filesContainer = helper.makeContainer();
    filesContainer.classList.add(editorClassNames.filesContainer);

    const saveCurrent = () => {
        storedFiles[storedOpenFileIdx].text = view.state.doc.toString();
        localStorage.setItem(currentStorageId, JSON.stringify(
            {
                storedFiles,
                storedOpenFileIdx
            })
        );
    }

    const resetCache = () => {
        localStorage.removeItem(currentStorageId);
    };


    const recreateButtons = () => {
        filesContainer.innerHTML = "";
        storedFiles.forEach((el, idx) => {
            const fc = helper.makeContainer();
            fc.classList.add(editorClassNames.fileEntry);
            if (idx === storedOpenFileIdx) {
                fc.classList.add(editorClassNames.selected);
            }
            const name = helper.makeSpan(helper.makeTextField(el.name));
            name.classList.add(editorClassNames.filename);
            fc.append(name);
            if (idx !== storedOpenFileIdx && storedFiles.length > 1) {
                const button = helper.makeElement("button");
                button.innerText = "Open";
                button.onclick = () => {
                    // saveCurrent();
                    storedOpenFileIdx = idx;
                    const editable = el.editable;
                    const newState = createEditorState({
                        autocompleteObjects: [window, autoCompleteDummy, ...autocompleteObjects],
                        initialContent: el.text,
                        extensions: [
                            EditorState.readOnly.of(!editable),
                            EditorView.editable.of(editable),
                            EditorView.contentAttributes.of({ tabindex: "0" }),
                            ...additionalExtensions,
                            themeCompartment.of(themes[themeName]),
                            tabIndentCompartment.of([]),
                        ]
                    });
                    view.setState(newState);
                    recreateButtons();
                }
                fc.append(button);
            }


            filesContainer.append(fc);

        });

    };

    recreateButtons();

    const controlsContainer = helper.makeContainer();
    controlsContainer.classList.add(editorClassNames.controlsContainer);

    container.append(controlsContainer);

    const themeSelector = document.createElement("select");
    themeSelector.classList.add(editorClassNames.themeSelector);

    const lookAndFeelContainer = helper.makeContainer();
    lookAndFeelContainer.classList.add(editorClassNames.lookAndFeelContainer);





    for (var k of Object.keys(themes)) {
        const option = document.createElement("option");
        option.value = k;
        option.text = k;
        themeSelector.append(option);
    }

    themeSelector.value = themeName;

    themeSelector.addEventListener("change", () => {

        themeName = themeSelector.value;
        localStorage.setItem("editorTheme", themeName);

        // and then later at some point in your app
        view.dispatch({
            effects: themeCompartment.reconfigure(themes[themeName])
        });
    });

    lookAndFeelContainer.append(
        helper.makeContainer(
            helper.makeSpan(helper.makeTextField("Select theme:")),
            themeSelector));


    const [checkTabIndent, checkTablIndentLabel] = helper.makeCheckbox("Indent with tab", false);
    const checkTabContainer = helper.makeContainer(checkTablIndentLabel, checkTabIndent);

    checkTabIndent.addEventListener("change", () => {
        // and then later at some point in your app
        if (checkTabIndent.checked) {
            view.dispatch({
                effects: tabIndentCompartment.reconfigure(keymap.of([indentWithTab]))
            });
        } else {
            view.dispatch({
                effects: tabIndentCompartment.reconfigure([])
            });
        }

    });

    lookAndFeelContainer.append(checkTabContainer);

    controlsContainer.append(filesContainer);
    controlsContainer.append(lookAndFeelContainer);



    container.append(editorContainer);

    const autoCompleteDummy = {
        renderLatex: function (str, el) { },
        matToLatex: function (x) { },
        output: {
            log: function (str) { },
            error: function (str) { },
            html: function (html) { },
        }
    };
    const initialFile = storedFiles[storedOpenFileIdx];
    const initialContent = storedFiles[storedOpenFileIdx].text;

    const additionalExtensions = [];



    const view = createCodeEditor(editorContainer, {
        autocompleteObjects: [window, { jsm }, autoCompleteDummy, ...autocompleteObjects],
        initialContent,
        extensions: [
            EditorState.readOnly.of(!initialFile.editable),
            EditorView.editable.of(initialFile.editable),
            EditorView.contentAttributes.of({ tabindex: "0" }),
            ...additionalExtensions,
            themeCompartment.of(themes[themeName]),
            tabIndentCompartment.of([]),

        ]
    });

    const actionContainer = helper.makeContainer();
    actionContainer.classList.add(editorClassNames.actionCotnainer);

    controlsContainer.append(actionContainer);

    const runButton = helper.makeElement("button");
    runButton.innerText = "Run";
    actionContainer.append(runButton);

    const saveButton = helper.makeElement("button");
    saveButton.innerText = "Save";
    actionContainer.append(saveButton);

    const resetFileButton = helper.makeElement("button");
    resetFileButton.innerText = "Reset File";
    resetFileButton.onclick = () => {
        const txt = files[openFileIndex].initialText;
        view.dispatch({
            changes: [{ from: 0, to: view.state.doc.length, insert: txt }],
        });
    };
    actionContainer.append(resetFileButton);


    const resetCacheButton = helper.makeElement("button");
    resetCacheButton.innerText = "Reset Cache";
    actionContainer.append(resetCacheButton);




    resetCacheButton.onclick = () => {
        let timerId = null;
        if (resetCacheButton.innerText === "Reset Cache") {
            resetCacheButton.innerText = "Click again";

            timerId = setTimeout(() => {
                resetCacheButton.innerText = "Reset Cache";
            }, 5000);
        } else {
            if (timerId !== null) {
                clearTimeout(timerId);
                timerId = null;
            }

            container.innerHTML = "";
            resetCache();

            makeJsEditor(containerId, appContext, {
                files,
                openFileIndex,
            });
        }

    }

    const iframe = document.createElement("iframe");
    iframe.classList.add(editorClassNames.hidden);


    iframe.sandbox = "allow-scripts allow-same-origin";
    const iframeContainer = helper.makeContainer(iframe);
    iframeContainer.classList.add(scriptRunClassNames.runContainer);

    container.append(iframeContainer);

    if (iframeSourceDoc !== null) {
        iframe.srcdoc = iframeSourceDoc;
    } else {
        iframe.srcdoc = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Script runner</title>
</head>
<body>

</body>
</html>
        `;
    }

    let iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

    iframeDocument = await new Promise((resolve) => {
        if (iframeDocument.readyState === "complete") {
            resolve(iframeDocument);
            return;
        }
        iframe.addEventListener("load", () => {
            const doc = iframe.contentDocument || iframe.contentWindow.document;

            resolve(doc);
            return;
        });

    });

    window.addEventListener('message', (event) => {
        const { data = {} } = event;
        const { type } = data;
        if (type === "finishedRunning") {
            iframe.style.height = Math.min(maxScriptRunHeight, iframeDocument.body.scrollHeight) + 'px';

        }
        console.log("Message received from the child: " + event.data); // Message received from child
    });


    const windowError = (e) => {
        console.error(`Error running script: ${e.message}`);
        if (enableOutput) {
            const outputContainer = iframeDocument.getElementById("output");
            outputContainer.innerHTML = "";
            const m = iframeDocument.createElement("div");
            m.classList.add(scriptRunClassNames.outputErrorEntry);
            m.append(iframeDocument.createTextNode(e.message));
            outputContainer.append(m);
        }
        e.preventDefault();
    };

    iframe.contentWindow.addEventListener("error", windowError);

    // populate with katex
    {
        const document = iframeDocument;

        const styleKatex = document.createElement("link");
        styleKatex.rel = "stylesheet";
        styleKatex.href = `${appContext.basePath}styles/extern/katex/katex.min.css`;

        const scriptKatex = document.createElement("script");
        scriptKatex.setAttribute("defer", "");
        scriptKatex.src = `${appContext.basePath}scripts/extern/katex/katex.min.js`;

        const scriptAutoRenderKatex = document.createElement("script");
        scriptAutoRenderKatex.setAttribute("defer", "");
        scriptAutoRenderKatex.src = `${appContext.basePath}scripts/extern/katex/contrib/auto-render.min.js`;


        const scriptOutputCss = document.createElement("link");
        scriptOutputCss.rel = "stylesheet";
        scriptOutputCss.href = `${appContext.basePath}styles/scriptOutput.css`;
        document.head.append(
            styleKatex,
            scriptKatex,
            scriptAutoRenderKatex,
            scriptOutputCss);

    }





    const halfWidth = enableOutput && enableContent;
    let iframeContent = null;
    if (enableOutput || enableContent) {
        iframeContent = iframeDocument.createElement("div");
        iframeContent.id = "runScript";

        iframeDocument.body.append(
            iframeContent
        );
    }


    if (enableContent) {
        const contentContainer = iframeDocument.createElement("div");
        contentContainer.id = "contentContainer";
        contentContainer.classList.add(scriptRunClassNames.contentContainer);

        if (halfWidth) {
            contentContainer.classList.add(scriptRunClassNames.twoColumn);
        }

        const content = iframeDocument.createElement("div");
        content.id = "scriptContent";
        content.classList.add(scriptRunClassNames.content);

        contentContainer.append(content);



        iframeContent.append(
            contentContainer
        );

        if (populateOutputDocument !== null) {
            populateOutputDocument(iframeDocument, content);
        }
    }

    if (enableOutput) {

        const outputContainer = iframeDocument.createElement("div");
        outputContainer.id = "outputContainer";
        outputContainer.classList.add(scriptRunClassNames.outputContainer);

        if (halfWidth) {
            outputContainer.classList.add(scriptRunClassNames.twoColumn);
        }

        const output = iframeDocument.createElement("div");
        output.id = "output";
        output.classList.add(scriptRunClassNames.output);

        const outputHeading = iframeDocument.createElement("h3");
        outputHeading.innerText = "Output";
        outputContainer.append(outputHeading, output);


        iframeContent.append(
            outputContainer
        );

    }

    iframe.style.height = Math.min(maxScriptRunHeight, iframeDocument.body.scrollHeight) + 'px';


    saveButton.onclick = () => {
        saveCurrent();
    };

    runButton.onclick = () => {
        const iframeDoc = iframeDocument;
        iframe.classList.remove(editorClassNames.hidden);

        const data = [storedFiles.length];

        for (let i = 0; i < storedFiles.length; i++) {
            if (i === storedOpenFileIdx) {
                continue;
            }
            const element = storedFiles[i];
            data[i] = element.text;
        }
        data[storedOpenFileIdx] = view.state.doc.toString();

        let currentScript = iframeDoc.getElementById("runnable");
        if (currentScript != null) {
            currentScript.remove();
            currentScript = null;
        }



        const s = createScript(iframeDocument, data, appContext, runHeaderCodeString);
        s.id = "runnable";

        s.addEventListener("error", (e) => {
            console.error(`Error running script: ${e.message}`);
            if (enableOutput) {
                const outputContainer = iframeDoc.getElementById("output");
                outputContainer.innerHTML = "";
                const m = iframeDoc.createElement("div");
                m.classList.add(scriptRunClassNames.outputErrorEntry);
                m.append(iframeDoc.createTextNode(e.message));
                outputContainer.append(m);
            }
        });

        s.addEventListener("load", () => {
            console.log("DID RUN SCRIPT");
        });
        if (enableOutput) {
            const outputContainer = iframeDoc.getElementById("output");
            outputContainer.innerHTML = "";
        }


        if (enableContent && populateOutputContainerBeforeRun !== null) {
            populateOutputContainerBeforeRun(iframeDocument, iframeDoc.getElementById("scriptContent"));
        }

        try {

            iframeDoc.body.append(s);
        } catch (e) {
            console.error(`Error running script: ${e.message}`);
            if (enableOutput) {
                const outputContainer = iframeDoc.getElementById("output");
                outputContainer.innerHTML = "";
                const m = iframeDoc.createElement("div");
                m.classList.add(scriptRunClassNames.outputErrorEntry);
                m.append(iframeDoc.createTextNode(e.message));
                outputContainer.append(m);
            }
        }


    };

}

function createScript(document, content, appContext, runHeaderCodeString) {
    const header = `
const jsm = await import("${appContext.basePath}scripts/bundles/jsmatrix.bundle.min.js");

    ${runHeaderCodeString !== null ? runHeaderCodeString : ""}
    `;
    const contentText = typeof content === "string" ? content : content.join("\n\n");
    const s = document.createElement("script");

    s.text = `
(async () => {
   
    const output = {
        log : (()=>{
                const c = document.getElementById("output");
                if(c === null){
                    return () => {};
                }
                return (msg) => {
                    if(msg === null || msg === undefined){
                        msg ="";
                    }
                    const m = document.createElement("div");
                    m.classList.add("${scriptRunClassNames.outputEntry}");
                    m.innerHTML  = msg.toString().replace(/\\r/g, '').replace(/\\n/g, '<br>');
                    c.append(m);
                };
            })(),
        error: (() => {
                const c = document.getElementById("output");
                if(c === null){
                    return () => {};
                }
                return (msg) => {
                    if(msg === null || msg === undefined){
                        msg ="";
                    }
                    const m = document.createElement("div");
                    m.classList.add("${scriptRunClassNames.outputErrorEntry}");
                    m.append(document.createTextNode(msg));    
                    c.append(m);
                };
        })(),
        html:  (() => {
                const c = document.getElementById("output");
                if(c === null){
                    return () => {};
                }
                return (msg) => {
                    if(msg === null || msg === undefined){
                        msg ="";
                    }
                    const m = document.createElement("div");
                    m.classList.add("${scriptRunClassNames.outputEntry}");
                    if(typeof msg === "string"){
                        m.append(document.createTextNode(msg)); 
                    }else{
                        m.append(msg);
                    }
                    c.append(m);
                    renderMathInElement(m, [
                        {left: "$$", right: "$$", display: true},
                        {left: "$", right: "$", display: false},
                        {left: "\\(", right: "\\)", display: false},
                        {left: "\\[", right: "\\]", display: true}
                    ]);

                };
        })(),
    };


    try{


        ${header}

        const renderLatex = (str, el) => {
            if(el === null || el === undefined){
                el = document.createElement("span");
            }

            katex.render(str, el, {
                throwOnError: false
            });
            return el;
        };
        const format = new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3
        });
        const matToLatex = (a) => {
            const f = x => x === undefined ? "\\\\_" : typeof (x) === 'number' ? format.format(x) : x;
            // const f = x => typeof(x);
            const mstr = jsm.map(a, f, jsm.MatAny.uninitialized(a.rows(), a.cols()));
        
            const rows = jsm.rowreduce(mstr, x => jsm.toArray(x).join(" & "), jsm.MatAny.uninitialized(a.rows(), 1));
        
            return '\\\\begin{pmatrix}' + jsm.toArray(rows).join("\\\\\\\\") + '\\\\end{pmatrix}';  
        };
    
        await (()=> {

${contentText}

            ;
        })();

    } catch(e){
        if(typeof e === "string"){
            output.error(e);
        }else {
            output.error(e.message);
        }
    } finally {
            window.parent.postMessage({type: 'finishedRunning'},"*" );
    }
    
})();
`;
    return s;
}


export {
    FileSource,
    themes,
    makeJsEditor,
    createCodeEditor,
    createEditorState,
};