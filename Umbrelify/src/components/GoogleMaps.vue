<template>
  <main id="map">
    <div class="container">
      <GoogleMap id="map" :api-key="apiKey" style="width: 100%; height: 400px" :center="{ lat: 1.3521, lng: 103.8198 }"
        :zoom="10.7">
        <Marker :options="{
          position: {
            lat: Number(currentMarker.lat),
            lng: Number(currentMarker.lng),
          },
        }">
          <InfoWindow class="text-center">
            <p>Activity: {{ currentMarker.activityName }}</p>
            <p>Location: {{ currentMarker.location }}</p>
            <p>Weather: {{ currentMarker.weather }}</p>
            <b class="bg-warning" v-if="currentMarker.isRain == 1">Please bring an umbrella out!</b>
          </InfoWindow>
        </Marker>
      </GoogleMap>
      <div v-if='markerArr.length > 0' class="container bg-dark p-1">
        <h5 class="text-center text-light">Click event timing to see weather forecast</h5>
        <div class="d-flex justify-content-center">
          <div v-if="markerArr">
            <button v-for="(activityInfo, index) in markerArr" :key="index" type="button" class="btn btn-primary m-2"
              @click="forecast(index)">{{ activityInfo.startTime }} - {{ activityInfo.endTime }}</button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>



<script>
import { GoogleMap, Marker, InfoWindow } from "vue3-google-map";
import { db } from "@/firebase";
import { auth } from "../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import axios from "axios";

var user = auth.currentUser;
var email = user.email;

export default {
  data() {
    return {
      apiKey: "AIzaSyAkfyeLx1NBJBiwnnN55ES06fqIZHDKZO0",
      markers: [],
      dateStr: "",
      qty: 0,
      center: { lat: Number(this.lat), lng: Number(this.lng) },
      currentMarker: {},
      markerArr: [],
      periods: [],
      worstScenario: ""
    };
  },
  methods: {
    forecast(index) {
      this.currentMarker = this.markerArr[index];
      console.log(
        `index: ${index}, startTime: ${this.currentMarker.startTime}, endTime: ${this.currentMarker.endTime}, region: ${this.currentMarker.region}`
      );
      const parsedStartTime = `${this.dateStr}T${this.currentMarker.startTime}:00`
      const parsedEndTime = `${this.dateStr}T${this.currentMarker.endTime}:00`
      const currentRegion = this.currentMarker.region.toLowerCase()
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
          var res = {};
          // convert ISO8601 date to milliseconds elapsed since the ECMAScript epoch
          const activityStart = Date.parse(parsedStartTime);
          const activityEnd = Date.parse(parsedEndTime);

          var hasStarted = false;
          var hasEnded = false;
          for (const period in this.periods) {

            const periodStart = Date.parse(this.periods[period].time.start);
            const periodEnd = Date.parse(this.periods[period].time.end);

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
            res[period] = this.periods[period];

            // filter forecast based on region
            for (const region in this.periods[period].regions) {
              if (region == currentRegion) {

                // create a new object to store selected region and its weather
                let regionRes = {};
                regionRes[region] = this.periods[period].regions[region];
                res[period].regions = regionRes;
              }
            }

            // if hasStarted is true and hasEnded is true, add current block and stop iterating
            if (hasStarted && hasEnded) {
              this.periods =  [res[period]];
              this.getWorstScenario()
              return;
            }
          }
        })
    },
    getWorstScenario() {
      // compute worst scenario if there are more than 2 types of weather within single activity
      var weatherArr = [{ "rank": 1, weather: "Thundery Showers" }, { "rank": 2, weather: "Showers" }, { "rank": 3, weather: "Light Rain" }, { "rank": 4, weather: "Cloudy" }]
      var currentRank = Number.MAX_VALUE
      const region = this.currentMarker.region.toLowerCase()
      // when there is only one time block
      if (Object.keys(this.periods).length == 1) {
        this.worstScenario = this.periods[0].regions[region]
      } else {
        // iterate through time blocks
        for (const period in this.periods) {
          for (const item of weatherArr) {
            if (item.rank < currentRank && item.weather == this.periods[period].regions[region]) {
              currentRank = item.rank
              this.worstScenario = item.weather
            }
          }
        }
      }
      this.currentMarker.weather = this.worstScenario
    },
  },
  components: {
    GoogleMap,
    Marker,
    InfoWindow,
  },
  async created() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    var month = currentDate.getMonth() + 1;
    var day = currentDate.getDate();

    if (month.len !== 2) {
      month = "0" + month
    }

    if (day.len !== 2) {
      day = "0" + day
    }
    this.dateStr = `${year}-${month}-${day}`;
    const usersRef = collection(db, email);
    let infoArr = [];
    const querySnapshot = await getDocs(
      query(
        collection(usersRef, this.dateStr, "activities"),
        orderBy("startTime", "asc")
      )
    );
    querySnapshot.forEach((doc) => {
      infoArr.push({
        id: doc.id,
        startTime: doc.data().startTime,
        endTime: doc.data().endTime,
        lat: doc.data().lat,
        lng: doc.data().lng,
        location: doc.data().location,
        activityName: doc.data().activityName,
        region: doc.data().region,
        isRain: doc.data().isRain
      });
        this.markerArr = infoArr;
    });
    this.qty = Object.keys(this.markerArr).length;
  },
};
</script>