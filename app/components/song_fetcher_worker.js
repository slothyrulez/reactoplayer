// WROKER FETCHING SONGS

self.addEventListener("message", function(eve){
  let data = eve.data;
  console.log("ON W DATA", data);
  self.postMessage('WORKER STARTED: ' + data);
});
