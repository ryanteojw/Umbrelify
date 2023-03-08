<script>
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase";
import { auth } from "../firebase";
import axios from "axios";
import { ref, onMounted, onUnmounted } from "vue";

export default {
  data() {
    return {
      location: "",
      startTime: null,
      endTime: null,
      activityName: "",
      dbCollec: [],
      toDoEmpty: false,
      dateStr: "",
      region: "",
      todos: null,
      user: null,
      periods: []

    };
  },
  mounted() {

    const autocomplete = new google.maps.places.Autocomplete(this.$refs["locationRef"], {
      componentRestrictions: { country: "SG" },
      types: ["establishment"],
      fields: ["address_components"],
    });


    // Handles invalid address
    let place = {
      address_components: [],
      ...autocomplete.getPlace(),
    };

    onUnmounted(() => {
      if (autocomplete) {
        google.maps.event.clearInstanceListeners(autocomplete);
      }
    });
  },
  created() {
    this.todos = ref([]);
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    var month = currentDate.getMonth() + 1;
    var day = currentDate.getDate();

    month = month.toString()
    day = day.toString()

    if (month.len !== 2) {
      month = "0" + month
    }

    if (day.len !== 2) {
      day = "0" + day
    }

    this.dateStr = `${year}-${month}-${day}`;

    this.user = auth.currentUser;

    const usersRef = collection(db, this.user.email);
    const todosCollectionQuery = query(
      collection(usersRef, this.dateStr, "activities")
      // orderBy("startTime", "asc")
    );

    onSnapshot(todosCollectionQuery, (querySnapshot) => {
      const fbTodos = [];
      if (querySnapshot.empty) {
        this.toDoEmpty = true;
      } else {
        querySnapshot.forEach((doc) => {
          const todo = {
            id: doc.id,
            startTime: doc.data().startTime,
            endTime: doc.data().endTime,
            location: doc.data().location,
            lat: doc.data().lat,
            lng: doc.data().lng,
            activityName: doc.data().activityName,
            done: doc.data().done,
          };
          fbTodos.push(todo);
        });
        this.todos.value = fbTodos;
      }
    });

  },
  methods: {
    // update rain count when every time user creates an activity
    async addRainCount() {
      var user = auth.currentUser;
      var userId = user.uid;
      const docRef = doc(db, "UserInfo", userId);
      const docSnap = await getDoc(docRef)
      var rainCount = docSnap.data().rain_event_count
      rainCount += 1
      updateDoc(doc(db, "UserInfo", userId), {
        rain_event_count: rainCount
      })
    },
    async deleteRainCount(id) {
      var user = auth.currentUser;
      var userId = user.uid;
      const userRef = collection(db, this.user.email)
      const docRef = doc(collection(userRef, this.dateStr, "activities"), id);

      const docSnap = await getDoc(docRef)
      var didRain = docSnap.data().isRain

      if (didRain == 1) {
        const docRef = doc(db, "UserInfo", userId);
        const docSnap = await getDoc(docRef)
        var rainCount = docSnap.data().rain_event_count
        rainCount -= 1
        updateDoc(doc(db, "UserInfo", userId), {
          rain_event_count: rainCount
        })
      }

      deleteDoc(doc(collection(userRef, this.dateStr, "activities"), id));
    },
    handleLocation() {
      // Access ref with "$refs" property
      this.getData();
      const message = this.$refs.locationRef.value;
      this.location = `${message.toUpperCase()}`;
      let addr = document.getElementById("pac-input").value;
      var key = "AIzaSyAkfyeLx1NBJBiwnnN55ES06fqIZHDKZO0";
      var url = "https://maps.googleapis.com/maps/api/geocode/json?";
      axios
        .get(url, {
          params: {
            address: addr,
            key: key,
          },
        })
        .then((resp) => {
          //   var user = auth.currentUser;
          const lat = resp.data.results[0].geometry.location.lat;
          const lng = resp.data.results[0].geometry.location.lng;
          this.region = this.getRegion(lat, lng)

          var isRainValue = null

          const parsedStartTime = `${this.dateStr}T${this.startTime}:00`
          const parsedEndTime = `${this.dateStr}T${this.endTime}:00`
          //   const currentRegion = this.region.toLowerCase()
          // retrieve forecast related to the start and end
          axios
            .get(
              "https://api.data.gov.sg/v1/environment/24-hour-weather-forecast",
              {
                params: {
                  date_time: parsedStartTime,
                },
              }
            )
            .then((response) => {
              this.periods = response.data.items[0].periods;
              console.log(response.data)
              var res = {};
              // convert ISO8601 date to milliseconds elapsed since the ECMAScript epoch
              const activityStart = Date.parse(parsedStartTime);
              const activityEnd = Date.parse(parsedEndTime);

              var hasStarted = false;
              var hasEnded = false;
              for (let i = 0; i < this.periods.length; i++) {
                const periodStart = Date.parse(this.periods[i].time.start);
                const periodEnd = Date.parse(this.periods[i].time.end);

                if (periodStart <= activityStart && activityStart < periodEnd) {
                  hasStarted = true;
                }

                if (periodStart < activityEnd && activityEnd <= periodEnd) {
                  hasEnded = true;
                }

                // activity doesn't start before the period ends, skip this period
                if (!hasStarted) {
                  continue
                }

                // add period
                res[i] = this.periods[i];

                // filter forecast based on region
                for (const region in this.periods[i].regions) {
                  if (region == this.region) {

                    // create a new object to store selected region and its weather
                    let regionRes = {};
                    regionRes[region] = this.periods[i].regions[region];
                    res[i].regions = regionRes;
                  }
                }

                // if hasStarted is true and hasEnded is true, add current block and stop iterating
                if (hasStarted && hasEnded) {
                  this.periods = [res[i]];
                  isRainValue = this.getWorstScenario()
                }
              }
              if (
                this.invalidInterval(this.startTime, this.endTime) &&
                this.startTimeChecker(this.startTime) &&
                this.endTimeChecker(this.endTime)
              ) {
                const usersRef = collection(db, this.user.email);
                addDoc(collection(usersRef, this.dateStr, "activities"), {
                  startTime: this.startTime,
                  endTime: this.endTime,
                  location: this.location,
                  activityName: this.activityName,
                  lat,
                  lng,
                  region: this.region,
                  date: Date.now(),
                  isRain: isRainValue
                });

                if (isRainValue == 1) {
                  this.addRainCount()
                }
                this.startTime = "";
                this.endTime = "";
                document.getElementById("pac-input").value = "";
                this.activityName = "";
                this.toDoEmpty = false
              }
            })
        })
        .catch((error) => {
          console.log(error.message);
        });
    },
    getRegion(userlat, userlng) {
      const northPoint = [1.45, 103.82]
      const eastPoint = [1.37, 103.97]
      const southPoint = [1.28, 103.82]
      const westPoint = [1.35, 103.68]
      const centralPoint = [1.38, 103.79]
      var region = ""
      function distance(lat1, lat2, lon1, lon2) {
        // The math module contains a function
        // named toRadians which converts from
        // degrees to radians.
        lon1 = lon1 * Math.PI / 180;
        lon2 = lon2 * Math.PI / 180;
        lat1 = lat1 * Math.PI / 180;
        lat2 = lat2 * Math.PI / 180;

        // Haversine formula
        let dlon = lon2 - lon1;
        let dlat = lat2 - lat1;
        let a = Math.pow(Math.sin(dlat / 2), 2)
          + Math.cos(lat1) * Math.cos(lat2)
          * Math.pow(Math.sin(dlon / 2), 2);

        let c = 2 * Math.asin(Math.sqrt(a));

        // Radius of earth in kilometers. Use 3956
        // for miles
        let r = 6371;
        return (c * r);
      }

      let compareNorth = distance(userlat, northPoint[0], userlng, northPoint[1])
      let compareEast = distance(userlat, eastPoint[0], userlng, eastPoint[1])
      let compareSouth = distance(userlat, southPoint[0], userlng, southPoint[1])
      let compareWest = distance(userlat, westPoint[0], userlng, westPoint[1])
      let compareCentral = distance(userlat, centralPoint[0], userlng, centralPoint[1])

      let maxDist = Math.min(compareNorth, compareEast, compareSouth, compareWest, compareCentral)

      if (compareNorth == maxDist) {
        region = "North"

      } else if (compareEast == maxDist) {
        region = "East"

      } else if (compareSouth == maxDist) {
        region = "South"


      } else if (compareWest == maxDist) {
        region = "West"

      } else {
        region = "Central"
      }
      return region
    },
    getData() {
      const usersRef = collection(db, this.user.email);
      onSnapshot(
        collection(usersRef, this.dateStr, "activities"),
        (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const todo = {
              id: doc.id,
              startTime: doc.data().startTime,
              endTime: doc.data().endTime,
            };
            this.dbCollec.push(todo);
          });
        }
      );
    },

    getWorstScenario() {
      // compute worst scenario if there are more than 2 types of weather within single activity
      var weatherArr = [{ "rank": 1, weather: "Thundery Showers" }, { "rank": 2, weather: "Showers" }, { "rank": 3, weather: "Light Rain" }, { "rank": 4, weather: "Cloudy" }]
      var currentRank = Number.MAX_VALUE
      const region = this.region.toLowerCase()

      var worstScenario = ""
      // when there is only one time block
      if (Object.keys(this.periods).length == 1) {
        worstScenario = this.periods[0].regions[region]
      } else {
        // iterate through time blocks
        for (const period in this.periods) {
          for (const item of weatherArr) {
            if (item.rank < currentRank && item.weather == this.periods[period].regions[region]) {
              currentRank = item.rank
              worstScenario = item.weather
            }
          }
        }
      }
      if (worstScenario.toLowerCase().includes("showers") || worstScenario.toLowerCase().includes("rain")) {
        return 1
      } else {
        return 0
      }

    },
    deleteActivity(id) {
      this.deleteRainCount(id)
    },
    invalidInterval(startTime, endTime) {
      if (endTime < startTime) {
        alert("Invalid input, End Time is earlier than Start Time");
        return false;
      }
      return true;
    },
    startTimeChecker(startTime) {
      for (let i in this.dbCollec) {
        if (startTime === this.dbCollec[i].startTime) {
          alert("Crashing Start Time");
          return false;
        }
      }
      return true;
    },
    endTimeChecker(endTime) {
      for (let i in this.dbCollec) {
        if (endTime === this.dbCollec[i].endTime) {
          alert("Crashing End Time");
          return false;
        }
      }
      return true;
    },
    allInputsFilled() {
      if (this.startTime == null) {
        return false
      }
      if (this.endTime == null) {
        return false
      }
      if (document.getElementById('pac-input').value.length == 0) {
        return false
      }
      if (this.activityName == '') {
        return false
      }
      return true
    }
  },
};
</script>

<template>
  <main id="input">
    <!-- User input activity details -->
    <div class="container">
      <div class="row my-3">
        <!-- startTime input field -->
        <div class="my-1 col-12 col-md-6 col-lg-2">
          <input type="time" v-model="startTime" class="form-control" placeholder="Start Time" />
          <label class="text-light">Start Time</label>
        </div>

        <!-- endTime input field -->
        <div class="my-1 col-12 col-md-6 col-lg-2">
          <input type="time" v-model="endTime" class="form-control" placeholder="End Time" />
          <label class="text-light">End Time</label>
        </div>

        <!-- location input field -->
        <div class="my-1 col-12 col-md-6 col-lg-4">
          <input type="text" id="pac-input" class="form-control" placeholder="Location in Singapore"
            ref="locationRef" />
        </div>

        <!-- activityName input field -->
        <div class="my-1 col-12 col-md-6 col-lg-3">
          <input type="text" v-model="activityName" class="form-control" placeholder="Activity" />
        </div>
        <div class="my-1 col-12 col-lg-1 d-grid">
          <button @click="handleLocation" :disabled="!allInputsFilled()" class="btn btn-primary" style="height: 38px;">
            Add
          </button>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row">
        <div class="col" style="overflow-x:auto">
          <table v-if="toDoEmpty" class="table table-dark table-striped table-bordered">
            <thead>
              <tr scope="row">
                <th scope="col">There are no activities.</th>
              </tr>
            </thead>
          </table>
          <table v-else class="table table-dark table-striped table-bordered">
            <thead>
              <tr scope="row">
                <th scope="col" class="text-center">Start Time</th>
                <th scope="col" class="text-center">End Time</th>
                <th scope="col">Location in Singapore</th>
                <th scope="col">Activity</th>
                <th scope="col" class="text-center">Delete</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="todo in todos.value" :class="{ 'bg-success': todo.done }" :key="todo.activityName">
                <td scope="col" class="text-center">{{ todo.startTime }}</td>
                <td scope="col" class="text-center">{{ todo.endTime }}</td>
                <td scope="col">{{ todo.location }}</td>
                <td scope="col">{{ todo.activityName }}</td>
                <td scope="col" class="justify-content-center text-center align-self-center">
                  <button @click="deleteActivity(todo.id)" class="btn btn-danger">
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </main>
</template>

