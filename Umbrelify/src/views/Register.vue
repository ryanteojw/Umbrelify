<template>
    <main>
        <div class="container-fluid">

            <div class="row">
                <div class="col col-12 col-md-6 col-lg-4 bg-dark">
                    <div class="login">
                        <h1 class="text-center text-light mt-5">Register</h1>

                        <form class="needs-validation" novalidate @submit.prevent="register">
                            <!-- Username -->
                            <div v-bind:class="userNameClass">
                                <label for="userName" class="form-label text-light">Username</label>
                                <input type="text" class="form-control" id="userName" placeholder="Username" v-model="register_form.username" required>
                            </div>

                            <!-- Email -->
                            <div v-bind:class="emailClass">
                                <label for="email" class="form-label text-light">Email</label>
                                <input @keypress.once="validateEmail(email)" type="email" class="form-control" id="email" placeholder="Email" v-model="register_form.email" required>
                                <div class="invalid-feedback">
                                    Please enter a valid email address!
                                </div>
                            </div>
                                
                            <!-- PASSWORD -->
                            <div v-bind:class="pwdClass">
                                <label for="password" class="form-label text-light">Password</label>
                                <input @keypress.once="validatePwd(password)" type="password" class="form-control" id="password" placeholder="Password" v-model="register_form.password" required>
                                <div class="invalid-feedback">
                                    Please enter a password!
                                </div>
                            </div>

                            <!-- Gender -->
                            <div v-bind:class="genderClass">
                                <label for="gender" class="form-label text-light">Gender</label>
                                <select class="form-select" name="gender" id="gender" v-model="register_form.gender" required>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>


                            <div class="col-12 p-2">
                                <input class="btn btn-primary w-100 mb-3 text-white" type="submit" value="Register">
                            </div>

                            <div class="row justify-content-center">
                                <div class="col text-center text-light">
                                    Already have an account?
                                    <a href="/login">Login here</a>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <div class="col col-0 col-md-6 col-lg-8 p-0">
                    <img id="register_img" src="../assets/rain.jpg" class="img-fluid"/>
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
        const register_form = ref({})
        const store = useStore()

        const register = async () => {
            store.dispatch("register", register_form.value)
        }

        return {
            register_form,
            register
        }
    },
    data(){
            return{
                username: "",
                gender: null,
                emailClass: "col-12 p-2",
                pwdClass: "col-12 p-2",
                userNameClass: "col-12 p-2",
                genderClass: "col-12 p-2"

            }
        },
        methods: {
            validateEmail(email) {
                this.emailClass += " was-validated"    
            },

            validatePwd(password) {
                this.pwdClass += " was-validated"
            }
        }
}
</script>