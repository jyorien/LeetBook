package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
)

var Supabase *SupabaseDB

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	client := &http.Client{}
	Supabase = NewSupabaseDB(os.Getenv("SUPABASE_ANON_KEY"), os.Getenv("SUPABASE_URL"), client)

	mux := http.NewServeMux()
	mux.HandleFunc("/auth/login", HandleLogin)
	mux.HandleFunc("/auth/refresh", HandleRefresh)
	mux.HandleFunc("/api/submit", HandleSubmit)

	port := fmt.Sprintf(":%s", os.Getenv("PORT"))
	extDomain := fmt.Sprintf("chrome-extension://%s", os.Getenv("EXTENSION_ID"))
	handler := http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
		res.Header().Set("Access-Control-Allow-Origin", extDomain) // may have more whitelists in the future
		res.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		res.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if req.Method == http.MethodOptions {
			res.WriteHeader(http.StatusNoContent)
			return
		}
		mux.ServeHTTP(res, req)
	})
	fmt.Printf("Server running on: http://localhost%s \n", port)
	log.Fatal(http.ListenAndServe(port, handler))
}
