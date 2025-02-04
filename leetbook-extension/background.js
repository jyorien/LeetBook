chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action == "submit") {
        const {problemNumber, problemName, topics, link, problemDifficulty, confidence, comment} = message.payload

        chrome.storage.local.get(null, (data) => {
            const accessToken = data["accessToken"]
            const expiresAt = Number(data["expiresAt"])
            const refreshToken = data["refreshToken"]
            if (!accessToken) {
                console.error("No access token found. Please log in.")
                return
            }

            const currentTime = Date.now()
            const bufferTime = 55 * 60 * 1000 // 5 mins

            if (expiresAt*1000 - currentTime <= bufferTime) { // refresh token first
                refresh(accessToken, refreshToken)
                    .then(() => { 
                        submit(accessToken, problemNumber, problemName, topics, link, problemDifficulty, confidence, comment, sendResponse)})
                
            } else { // just send
                submit(accessToken, problemNumber, problemName, topics, link, problemDifficulty, confidence, comment, sendResponse)
            }

            

        })

        return true
    }
})

function submit(accessToken, problemNumber, problemName, topics, link, problemDifficulty, confidence, comment, sendResponse) {
    const body = JSON.stringify({
        "problemId": Number(problemNumber),
        "problemName": problemName,
        "problemTopics": topics,
        "problemUrl": link,
        "problemDifficulty": problemDifficulty,
        "problemConfidence": confidence,
        "problemComment": comment
    })
    console.log(body)
    fetch("http://localhost:3000/api/submit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
        body: body
    })
    .then((response) => response.json())
    .then((data) => {
        console.log("Submission successful:", data);
        sendResponse({ success: true, data });
    })
    .catch((error) => {
        console.error("Error during submission:", error.message);
        sendResponse({ success: false, error: error.message });
    });
}

function refresh(expiredAccessToken, refreshToken) {
    return fetch("http:/localhost:3000/auth/refresh", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${expiredAccessToken}`,
            "Refresh-Token": refreshToken
        }
    })
    .then(res => res.json()) 
    .then(data => {
        // TODO: receive token, update the ext storage, then submit with new token
        return new Promise((resolve, reject) => {
            chrome.storage.local.set({
                "accessToken": data["access_token"],
                "expiresAt": data["expires_at"],
                "refreshToken": data["refresh_token"]
            }, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError)
                }
                else {
                    resolve()
                }
            })
        })
    })

}

