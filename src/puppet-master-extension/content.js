chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.text) {
        alert(request.text);
    }
});
