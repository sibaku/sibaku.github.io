// This is the code editor!

// While not a complete IDE, it does have a few features like one, such as autocomplete, snippets, Undo/Redo and a saving mechanism

// If you want to output some debugging information, you can use the output object

output.log("This is a logging message");

// you can of course use any string

for (let i = 0; i < 5; i++) {
    output.log(`Looping: i = ${i}`);
}

// if you want to highlight an error, you can the error method

output.error("Oh no! An error occured!");

// you can also put generic html there, just be aware that it might take up too much space

const span = document.createElement("span");
span.style.fontSize = "32px";

span.textContent = "BIG TEXT";

output.html(span);


// You will be notified of errors when running a script, but it might not be the exact issue that happened, due to the way scripts are run... but it might help!