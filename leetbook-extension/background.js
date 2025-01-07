chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action == "submit") {
        const {problemNumber, problemName, topics, link, problemDifficulty, confidence, comment} = message.payload

        chrome.storage.local.get("accessToken", (data) => {
            const accessToken = data.accessToken
            if (!accessToken) {
                console.error("No access token found. Please log in.")
                return
            }
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

        })

        return true
    }
})

