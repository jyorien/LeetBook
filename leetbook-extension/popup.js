document.addEventListener("DOMContentLoaded", (e) => {
    if (window.location.hash && window.location.hash.includes("access_token")) {
        const hash = window.location.hash
        const params = new URLSearchParams(hash.slice(1))
        const jwt = params.get("access_token")
        const refreshToken = params.get("refresh_token")
        const expiresIn = params.get("expires_in")
        const currentDate = new Date()
        const expiryTime = new Date(currentDate.getTime() + expiresIn*1000)
        
        chrome.storage.local.set({
            "accessToken" : jwt,
            "refreshToken": refreshToken,
            "expiryTime": expiryTime
        }, () => {
            const successtText = document.createElement("p")
            successtText.textContent = "Login success to LeetBook! You may now close the tab."
            document.body.appendChild(successtText)
        }
    )
    
    } else {
        const loginBtn = document.createElement("button")
        loginBtn.textContent = "Login with GitHub"
        loginBtn.addEventListener("click", (e) => {
            window.open("http://localhost:3000/auth/login", "_blank")
        })
        document.body.appendChild(loginBtn)
    
    }
})

