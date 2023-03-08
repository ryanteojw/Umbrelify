<script>
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase";

export default {
  data() {
    return {
      users: [],
    };
  },
  async created() {

    // TODO: get the rank, sort results by rain_event_count
    const usersCollectionQuery = query(
      collection(db, "UserInfo"),
      orderBy("rain_event_count", "desc")
    );
    onSnapshot(usersCollectionQuery, (querySnapshot) => {
      if (querySnapshot.empty) {
        console.log("empty querySnapshot!")
      } else {
        let ranking = 0;
        querySnapshot.forEach((doc) => {
          ranking++;
          // write ranking to DB
          this.updateRanking(ranking, doc.id)
          const user = {
            username: doc.data().username,
            raincount: doc.data().rain_event_count,
            ranking: ranking,
            gender: doc.data().gender
          };
          this.users.push(user);
        });
      }
    });
  },
  methods: {
    updateRanking(ranking, id){
        updateDoc(doc(db, "UserInfo", id), {
            ranking: ranking,
        });
    }
  }
};
</script>

<template>
  <main id="input">
    <div class="container">
      <table class="table table-dark table-striped table-bordered text-center">
        <thead>
          <tr>
            <th scope="col">Rank</th>
            <th scope="col">Username</th>
            <th scope="col">Rain Event(s)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <th scope="row">{{ user.ranking }}</th>
            <td>
              <span v-if="user.ranking == 1 && user.gender == 'Male'" class="badge rounded-pill text-bg-warning">{{ user.username }} the Rain Kor Kor</span>
              <span v-else-if="user.ranking == 1 && user.gender == 'Female'" class="badge rounded-pill text-bg-warning">{{ user.username }} the Rain Jie Jie</span>
              <span v-else>{{ user.username }}</span>
            </td>
            <td>{{ user.raincount }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>