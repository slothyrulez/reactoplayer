// WORKER FETCHING SONGS

import Reactosock from "../networking/reactosock"
import { WS_SERVER_HOST, WS_SERVER_ENDPOINT } from "../settings"

var reactosock = new Reactosock(WS_SERVER_HOST, WS_SERVER_ENDPOINT);
const TEST_UUID = "52635571-3e25-475f-8e79-219af57e41e4";

self.addEventListener('message', function(e) {
  let cmd = e.data.cmd;
  console.log("WORKER CMD", cmd);

  if (cmd === "start") {
    reactosock.open(function() {
      self.postMessage({cmd: "worker_ready"});
    });
  }
  if (cmd === "start_fetching") {
    let song_uuid = e.data.uuid;
    // song_uuid = TEST_UUID;
    reactosock.getSingle("song-router", {"uuid": song_uuid}, fileHandler, fileHandlerError);
    console.log("ENDE start FETCHING??");
  }
}, false);

function fileHandler(eve, data) {
  let datarray = new Uint8Array(data.song_file);
  let mime = data.mime_type;
  let file = new File([datarray.buffer], "", {type : mime });
  let url = URL.createObjectURL(file);
  console.log("FILE HANDLEHANDLER -------------s", url);
  self.postMessage({
    cmd: "end_fetch",
    dataUrl: url,
    uuid: data.uuid,
  });
}

function fileHandlerError(eve, data) {
  self.postMessage({
    cmd: "error_fetch",
    data: data,
  });
}
