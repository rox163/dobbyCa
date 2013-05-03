package main

import (
	"fmt"
	//"html/template"
	"log"
	"net/http"
)

func Dobby(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello World")
}

func main() {
	http.Handle("/", http.FileServer(http.Dir("public")))
	http.HandleFunc("/dobby", Dobby)
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Printf("Error in webserver: %v", err)
	}

}
