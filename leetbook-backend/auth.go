package main

import (
	"fmt"
	"net/http"
	"os"
)

func HandleLogin(res http.ResponseWriter, req *http.Request) {
	supabaseURL := os.Getenv("SUPABASE_URL")
	oauthURL := fmt.Sprintf("%s/auth/v1/authorize?provider=github", supabaseURL)
	extID := os.Getenv(("EXTENSION_ID"))
	redirectURL := fmt.Sprintf("chrome-extension://%s/hello.html", extID)
	oauthURL += "&redirect_to=" + redirectURL
	http.Redirect(res, req, oauthURL, http.StatusTemporaryRedirect)
}
