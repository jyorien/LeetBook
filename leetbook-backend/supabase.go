package main

import (
	"bytes"
	"encoding/json"
	"net/http"
)

type SupabaseDB struct {
	AnonKey    string
	BaseUrl    string
	HttpClient *http.Client
}

func NewSupabaseDB(anonKey, baseUrl string, httpClient *http.Client) *SupabaseDB {
	return &SupabaseDB{
		anonKey,
		baseUrl,
		httpClient,
	}
}

func (db *SupabaseDB) Insert(table string, authToken string, data map[string]interface{}) (*http.Response, error) {
	url := db.BaseUrl + "rest/v1/" + table
	// serialize map to JSON
	jsonData, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}
	// convert to bytes
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+authToken)
	req.Header.Set("apikey", db.AnonKey)

	return db.HttpClient.Do(req)
}
