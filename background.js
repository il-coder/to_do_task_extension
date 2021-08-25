var firebaseConfig = {
    apiKey: "AIzaSyA-EHaLJWzXfm-DdRSOM5jk2ipULnvZyuA",
    authDomain: "to-do-2f85c.firebaseapp.com",
    databaseURL: "https://to-do-2f85c-default-rtdb.firebaseio.com",
    projectId: "to-do-2f85c",
    storageBucket: "to-do-2f85c.appspot.com",
    messagingSenderId: "632616915576",
    appId: "1:632616915576:web:029fe2e490f233d4c9938d",
    measurementId: "G-FZLJSN10H3"
};

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.msg === "get_config") {
            sendResponse(firebaseConfig);
        }
    }
);