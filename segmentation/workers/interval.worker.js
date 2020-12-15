
let working = false;
let handle = null;

function runner() {
    if (!working) {
        working = true;
        postMessage('');
    }
}

onmessage = (e) => {
    const msg = e.data.msg;
    if (msg === 1) {
        working = true;
    }
    else if (msg === 2) {
        working = false;
    } else if (msg === 3) {
        if (handle === null) {
            setInterval(() => {
                runner();
            }, 1 / 24);;
        }
    } else if (msg === 4) {
        if (handle !== null) {
            clearInterval(handle);
        }
    }

}


