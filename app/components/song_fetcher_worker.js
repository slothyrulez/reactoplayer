// WROKER FETCHING SONGS

import { SockJS } from "sockjs-client";

self.addEventListener("message", function(eve){
  let data = eve.data;
  sjs = new SockJS();
  console.log("ON W DATA", data);
  self.postMessage('WORKER STARTED: ' + data);
});
