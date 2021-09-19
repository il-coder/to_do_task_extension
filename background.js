var firebaseConfig = {
    apiKey: "-",
    authDomain: "-",
    databaseURL: "-",
    projectId: "-",
    storageBucket: "-",
    messagingSenderId: "-",
    appId: "-",
    measurementId: "-"
};

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.msg === "get_config") {
            sendResponse(firebaseConfig);
        }
    }
);
