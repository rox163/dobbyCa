package main

import (
	"fmt"
	//"html/template"
	"log"
	"net/http"
)

type Walker struct {
	FirstName string
	LastName string
	Phone string
	//support more than one area?
	WalkingArea string
}

const lenSearchPath = len("/search/")

func Dobby(w http.ResponseWriter, r *http.Request) {
	name := r.URL.Path[1:]
	fmt.Fprintf(w, "Hello %s", name)
}

func searchHandler(w http.ResponseWriter, r *http.Request) {
	params := r.URL.Path[lenSearchPath:]

}

func main() {
	http.Handle("/", http.FileServer(http.Dir("public")))
	http.HandleFunc("/dobby", Dobby)
	http.HandleFunc("/search/", searchHandler)
	
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Printf("Error in webserver: %v", err)
	}

}
