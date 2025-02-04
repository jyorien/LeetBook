package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

type RefreshResponse struct {
	AccessToken  string `json:"access_token"`
	ExpiresAt    uint64 `json:"expires_at"`
	RefreshToken string `json:"refresh_token"`
}

func HandleLogin(res http.ResponseWriter, req *http.Request) {
	supabaseURL := os.Getenv("SUPABASE_URL")
	oauthURL := fmt.Sprintf("%s/auth/v1/authorize?provider=github", supabaseURL)
	extID := os.Getenv(("EXTENSION_ID"))
	redirectURL := fmt.Sprintf("chrome-extension://%s/hello.html", extID)
	oauthURL += "&redirect_to=" + redirectURL
	http.Redirect(res, req, oauthURL, http.StatusTemporaryRedirect)
}

func HandleRefresh(res http.ResponseWriter, req *http.Request) {
	supabaseURL := os.Getenv("SUPABASE_URL")
	refreshURL := fmt.Sprintf("%s/auth/v1/token?grant_type=refresh_token", supabaseURL)
	str := fmt.Sprintf(`{"refresh_token":"%s"}`, req.Header.Get("Refresh-Token"))
	data := []byte(str)
	refreshReq, err := http.NewRequest("POST", refreshURL, bytes.NewBuffer(data))
	if err != nil {
		fmt.Println(err)
		return
	}
	client := &http.Client{}
	// refreshReq.Header.Add("apikey", strings.TrimPrefix(req.Header.Get("Authorization"), "Bearer "))
	refreshReq.Header.Add("apikey", os.Getenv("SUPABASE_SERVICE_ROLE"))
	refreshRes, err := client.Do(refreshReq)
	if err != nil {
		fmt.Println(err)
	}
	defer refreshRes.Body.Close()
	body, err := io.ReadAll(refreshRes.Body)
	if err != nil {
		fmt.Println(err)
		return
	}
	var refreshResponse RefreshResponse
	err = json.Unmarshal(body, &refreshResponse)
	if err != nil {
		fmt.Println(err)
		return
	}
	resBody := map[string]string{
		"access_token":  refreshResponse.AccessToken,
		"expires_at":    string(refreshResponse.ExpiresAt),
		"refresh_token": refreshResponse.RefreshToken,
	}
	resJson, err := json.Marshal(resBody)
	if err != nil {
		fmt.Println(err)
		return
	}
	res.Header().Set("Content-Type", "application/json")
	res.WriteHeader(http.StatusOK)
	res.Write(resJson)
}
