import {Router} from "./router.js";
import 'bootstrap/dist/css/bootstrap.min.css';
import {CustomHttp} from "./services/custom-http";
import config from "../config/config";
import {Auth} from "./services/auth";


class App {
    constructor() {
        this.router = new Router();

        window.addEventListener('DOMContentLoaded', this.handleRouteChanging.bind(this));

        window.addEventListener('popstate', this.handleRouteChanging.bind(this));

        this.signOutElement = document.getElementById('sign-out');

    }

    handleRouteChanging(){
        this.router.openRoute();
    }


}

(new App());