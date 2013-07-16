package main

import (
	"fmt"	
	"encoding/json"
	"log"
	"net/http"
	//"code.google.com/p/gorest"
)

type WalkerType struct {
	Name     string
	Phone    string
	Email 	 string
	Postcode string
	//LatLng   string
}

const lenSearchPath = len("/walkers")
var walker1 = WalkerType{"Pam Beasley", "8194561234", "asd@asd.com", "k1y4x8"}
var walker2 = WalkerType{"Jim Halpert", "6131234563", "TEST@test.com", "k2b8e5"}

var walkerData = []WalkerType{walker1, walker2}

func main() {
	//gorest.RegisterService(new(WalkerService))
	//http.Handle("/api", gorest.Handle())
	http.Handle("/", http.FileServer(http.Dir("public")))	
	http.HandleFunc("/walkers", ListWalkers)

	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Printf("Error in webserver: %v", err)
	}

}

// type WalkerService struct {
// 	gorest.RestService `root:"/gorest/" consumes:"application/json" produces:"application/json"`
// 	listWalkers gorest.EndPoint `method:"GET" path:"/walkers" output:"[]Walker"`

// 	addWalker gorest.EndPoint `method:"POST" path:"/walkers" postdata:"Walker"`	

// }

func ListWalkers(w http.ResponseWriter, r *http.Request) {
	if (r.Method == "GET") {
		w.Header().Set("Content-Type", "application/json")
		b, err := json.Marshal(walker1)
		log.Println(walker1)
		if err != nil {
                return
        }
		fmt.Fprint(w, string(b))

		return 
	}
	// name := r.URL.Path[1:]
	// fmt.Fprintf(w, "Hello %s", name)
}

// func(serv WalkerService) ListWalkers() []WalkerType{
// 	//return the walkers in a 5km radius around the postcode
// 	//test := []string{"hello", "there"}
// 	serv.ResponseBuilder().CacheMaxAge(60*60*24)
// 	return walkerData
// }

// func(serv WalkerService) AddWalker(postedObj WalkerType) {
	
	
// }