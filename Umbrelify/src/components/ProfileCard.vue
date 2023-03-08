<template>
  <main id="profile_card" class="vertical-center">
    <div class="container bg-dark rounded-5 opacity-75" style="max-height: 85vh;">
      <div class="row">
        <div class="col-12 col-md-6 p-3 d-flex justify-content-center">
          <img v-bind:src=src style="max-width: 50%;">
        </div>
        <div class="col-12 col-md-6 text-light align-self-center">
          <h1 class="text-center text-md-start">
            @{{ username }}
            <span v-if="rank == 1 && gender == 'Male'" class="badge rounded-pill text-bg-warning">Rain Kor Kor</span>
            <span v-else-if="rank == 1 && gender == 'Female'" class="badge rounded-pill text-bg-warning">Rain Jie Jie</span>
          </h1>
          <h4 id="email" class="text-center text-md-start">{{ email }}</h4>
          <h4 class="text-center text-md-start">Rain Count: {{ raincount }}</h4>
          <h4 class="text-center text-md-start">Ranking: {{rank}}</h4>
        </div>
      </div>
    </div>

    <!-- <div>
      <h1 style="color:white;">Look at past records</h1>

      <select name="" id="">
        <option value=""></option>
      </select>

    </div> -->
  </main>
</template>

<script>
import {
  collection,
  doc,
  query,
  getDoc,
  getDocs
} from "firebase/firestore";
import { db } from "@/firebase";
import { auth } from "../firebase";

export default {
  data() {
    return {
      username: '',
      email: '',
      raincount: '',
      rank: '',
      gender: '',
      img: '',
      activityArr: [],
      src: ''
    }
  },
  async created() {
    var user = auth.currentUser;
    var userId = user.uid;
    var email = user.email;
    const docRef = doc(db, "UserInfo", userId);
    const docSnap = await getDoc(docRef)
    this.username = docSnap.data().username
    this.raincount = docSnap.data().rain_event_count
    this.rank = docSnap.data().ranking
    this.gender = docSnap.data().gender
    this.email = email
    if (this.gender == 'Male') {
      this.src = require('../assets/male.png')
    }
    else {
      this.src = require('../assets/female.png')
    }

    const q = query(collection(db, email))
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, " => ", doc.data());
    });


  },
}
</script>
