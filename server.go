package main

import (
	"code.google.com/p/gorest"
	"log"
	"net/http"
	"strconv"
)

type WalkerType struct {
	Uid      string
	User     string
	Pwd string
	Phone    string
	Email    string
	Postcode string
	//LatLng   string
}

const lenSearchPath = len("/walkers")

var walker1 = WalkerType{"1", "Pam Beasley", "123", "8194561234", "asd@asd.com", "k1y4x8"}
var walker2 = WalkerType{"2", "Jim Halpert", "234", "6131234563", "TEST@test.com", "k2b8e5"}

var walkerData = []WalkerType{walker1, walker2}

func main() {
	gorest.RegisterService(new(WalkerService))
	http.Handle("/api/", gorest.Handle())
	http.Handle("/", http.FileServer(http.Dir("public")))

	// http.HandleFunc("/walkers", ListWalkers)
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Printf("Error in webserver: %v", err)
	}

}

type WalkerService struct {
	gorest.RestService `root:"/api/" consumes:"application/json" produces:"application/json"`

	listWalkers  gorest.EndPoint `method:"GET" path:"/walkers" output:"[]WalkerType"`
	addWalker    gorest.EndPoint `method:"POST" path:"/walkers" postdata:"WalkerType"`
	updateWalker gorest.EndPoint `method:"PUT" path:"/walkers/{uid:string}" postdata:"WalkerType"`
}

// ListWalkers returns the requested list of walkers
func (serv WalkerService) ListWalkers() []WalkerType {
	//return the walkers in a 5km radius around the postcode
	//test := []string{"hello", "there"}
	serv.ResponseBuilder().CacheMaxAge(0)
	return walkerData
}

// AddWalker adds the Walker obj posted by the client
func (serv WalkerService) AddWalker(postedObj WalkerType) {
	log.Printf("Walker: %+v", postedObj)
	if postedObj.Uid != "" {
		serv.ResponseBuilder().SetResponseCode(400)
		return
	}
	postedObj.Uid = strconv.Itoa(len(walkerData) + 1)
	// validate the data
	walkerData = append(walkerData, postedObj)
}

func (serv WalkerService) UpdateWalker(postedObj WalkerType, uid string) {

}
