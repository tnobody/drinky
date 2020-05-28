import Vue from "vue";
import App from "./App.vue";

let vh = window.innerHeight * 0.01;
// Then we set the value in the --vh custom property to the root of the document
document.documentElement.style.setProperty("--vh", `${vh}px`);

new Vue({ render: createElement => createElement(App) }).$mount("#app");
