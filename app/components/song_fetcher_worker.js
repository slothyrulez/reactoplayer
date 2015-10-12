// WORKER FETCHING SONGS

import Reactosock from "../networking/reactosock"
import { WS_SERVER_HOST, WS_SERVER_ENDPOINT } from "../settings"

var reactosock = new Reactosock(WS_SERVER_HOST, WS_SERVER_ENDPOINT);

self.addEventListener('message', function(e) {
  let cmd = e.data.cmd;

  if (cmd === "start") {
    reactosock.open(function() {
      self.postMessage({cmd: "worker_ready"});
    });
  }
  if (cmd === "start_fetching") {
    let song_uuid = e.data.uuid;
    // song_uuid = TEST_UUID;
    reactosock.getSingle("song-router", {"uuid": song_uuid}, fileHandler, fileHandlerError);
  }
}, false);

function fileHandler(eve, data) {
  let datarray = new Uint8Array(data.song_file);
  let mime = data.mime_type;
  let file = new File([datarray.buffer], "", {type : mime });
  let url = URL.createObjectURL(file);
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
