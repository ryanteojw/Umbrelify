<template>
    <main>
        <div class="container-fluid">

            <div class="row">
                
                <div class="col col-0 col-md-6 col-lg-8 p-0">
                    <img id="login_img" src="../assets/rain_animation_2.gif" class="img-fluid"/>
                </div>

                <div class="col col-12 col-md-6 col-lg-4 bg-dark">
                    
                    <div class="login">
                        <h1 class="text-center text-light mt-5">Umbrellify</h1>
                        
                        <form @submit.prevent="login">
                            <div v-bind:class="emailClass">
                                <label for="email" class="form-label text-light">Email</label>
                                <input type="email" class="form-control" id="email" placeholder="Email" v-model="login_form.email" required>
                            </div>
                        
                            <div v-bind:class="pwdClass">
                                <label for="password" class="form-label text-light">Password</label>
                                <input type="password" class="form-control" id="password" placeholder="Password" v-model="login_form.password" required>
                            </div>
                        
                            <div class="col-12 p-2">
                                <input class="btn btn-primary w-100 mb-3 text-white" type="submit" value="Sign In">
                            </div>
                            <div class="row justify-content-center">
                                <div class="col text-center text-light">
                                    Don't have an account?
                                    <a href="/register">Register here</a>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        
    </main>
  </template>
  
  <script>
  import { ref } from "vue"
  import { useStore } from "vuex"
  
  export default {
      setup() {
          const login_form = ref({})
          const store = useStore()
  
          const login = async () => {
              store.dispatch("login", login_form.value)
          }
  
          return {
              login_form,
              login
          }
      },
    data(){
          return{
              emailClass: "col-12 p-2",
              pwdClass: "col-12 p-2"

          }
      }
  }
  </script>
  
  