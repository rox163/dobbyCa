package main

import (
	"fmt"
	//"html/template"
	"log"
	"net/http"
)

type Walker struct {
	Name     string
	Phone    string
	Postcode string
}

const lenSearchPath = len("/walkers")

func Dobby(w http.ResponseWriter, r *http.Request) {
	name := r.URL.Path[1:]
	fmt.Fprintf(w, "Hello %s", name)
}

func searchHandler(w http.ResponseWriter, r *http.Request) {
	//params := r.URL.Path[lenSearchPath:]

}

func main() {
	http.Handle("/", http.FileServer(http.Dir("public")))
	http.HandleFunc("/dobby", Dobby)
	http.HandleFunc("/walkers", searchHandler)

	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Printf("Error in webserver: %v", err)
	}

}
