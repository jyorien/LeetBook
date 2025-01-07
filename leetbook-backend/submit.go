package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type Problem struct {
	ProblemId         int    `json:"problemId"`
	ProblemName       string `json:"problemName"`
	ProblemTopics     string `json:"problemTopics"`
	ProblemUrl        string `json:"problemUrl"`
	ProblemDifficulty string `json:"problemDifficulty"`
	ProblemConfidence string `json:"problemConfidence"`
	ProblemComment    string `json:"problemComment"`
}

func HandleSubmit(res http.ResponseWriter, req *http.Request) {
	if req.Method != http.MethodPost {
		http.Error(res, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}

	authToken := req.Header.Get("Authorization")
	if authToken == "" {
		http.Error(res, "Missing token", http.StatusUnauthorized)
		return
	}

	authToken = strings.Split(authToken, " ")[1]
	// TODO: verify auth token first
	token, err := jwt.Parse(authToken, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			fmt.Println("NOT HMAC TOKEN")
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(os.Getenv("JWT_SECRET")), nil
	})

	if err != nil {
		http.Error(res, "Invalid token", http.StatusUnauthorized)
		fmt.Println("Invalid token")
		fmt.Println(err)
		return
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		http.Error(res, "Invalid token", http.StatusUnauthorized)
		return
	}

	id := claims["sub"]

	var problem Problem
	err = json.NewDecoder(req.Body).Decode(&problem)
	if err != nil {
		http.Error(res, "Invalid JSON request", http.StatusBadRequest)
		fmt.Println(err)
		fmt.Println(problem)
		return
	}

	// TODO: save to supabase
	mapData := map[string]interface{}{
		"userId":            id,
		"ProblemUrl":        problem.ProblemUrl,
		"ProblemDifficulty": problem.ProblemDifficulty,
		"ProblemConfidence": problem.ProblemConfidence,
		"ProblemComment":    problem.ProblemComment,
		"ProblemId":         problem.ProblemId,
		"ProblemName":       problem.ProblemName,
		"ProblemTopics":     problem.ProblemTopics,
	}

	supabaseRes, err := Supabase.Insert(os.Getenv("TABLE_MAIN_DATA"), authToken, mapData)
	if err != nil {
		fmt.Println(err)
		http.Error(res, "Something went wrong with the request.", http.StatusBadRequest)
		return
	}
	if supabaseRes.StatusCode != 201 {
		http.Error(res, "Something went wrong with the database.", supabaseRes.StatusCode)
		return
	}

	res.Header().Set("Content-Type", "application/json")
	resBody := map[string]string{
		"message": "Submission successful",
	}

	json.NewEncoder(res).Encode(resBody)

}
