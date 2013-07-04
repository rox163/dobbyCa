package main

import (
	"fmt"
	//"html/template"
	"log"
	"net/http"
	"code.google.com/p/gorest"
)

type Walker struct {
	Name     string
	Phone    string
	Email 	 string
	Postcode string
}

const lenSearchPath = len("/walkers")


func main() {
	gorest.RegisterService(new(WalkerService))
	//http.Handle("/", http.FileServer(http.Dir("public")))
	http.Handle("/", gorest.Handle())
	http.HandleFunc("/dobby", Dobby)

	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Printf("Error in webserver: %v", err)
	}

}

type WalkerService struct {
	gorest.RestService 'root:"/dogwalkers/"'
	listWalkers gorest.EndPoint 'method:"GET" path:"/walkers/{postcode:string}" output:"[]string"'

}

func Dobby(w http.ResponseWriter, r *http.Request) {
	name := r.URL.Path[1:]
	fmt.Fprintf(w, "Hello %s", name)
}

func(serv WalkerService) ListWalkers(postcode string) []string{
	//return the walkers in a 5km radius around the postcode
	return "Hello" + postcode
}
