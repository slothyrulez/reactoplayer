// WORKER FETCHING SONGS

import Reactosock from "../networking/reactosock"
import ChunksManager from "./chunks_manager"
import { WS_SERVER_HOST, WS_SERVER_ENDPOINT } from "../settings"

let reactosock = new Reactosock(WS_SERVER_HOST, WS_SERVER_ENDPOINT);
let chunksManager = new ChunksManager();

self.addEventListener('message', function(e) {
  let cmd = e.data.cmd;

  if (cmd === "start") {
    reactosock.open(function() {
      self.postMessage({cmd: "worker_ready"});
    });
  }
  if (cmd === "start_fetching") {
    let song_uuid = e.data.uuid;
    reactosock.getSingle("song-router", {"uuid": song_uuid}, fileHandler, fileHandlerError);
  }
}, false);

function fileHandler(eve, data) {
  if ("chunked_first" in data && data.chunked_first ||
      "chunked_middle" in data && data.chunked_middle ||
      "chunked_last" in data && data.chunked_last) {
    _fileHandlerChunked(data);
  } else {
    _fileHandlerCommon(data);
  }
}

function fileHandlerError(eve, data) {
  _fileHandlerCommonError(data);
  _fileHandlerChunkedError(data);
}


function _fileHandlerCommon(data) {
  console.log("COMMON ", data);
  // Handles incoming songs that comes with the whole song data
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

function _fileHandlerCommonError(data){
  self.postMessage({
    cmd: "error_fetch",
    data: data,
  });
}

function _fileHandlerChunked(data){
  if ("chunked_first" in data) {
    let _aux = data.chunked_response;
    let _info = {
      mime_type: data.mime_type,
      uuid: data.uuid,
    }
    chunksManager.newChunk(_aux.chunked_id, _aux.chunk, _aux.chunk_num, _aux.chunk_total, _info);
  }
  if ("chunked_middle" in data) {
    chunksManager.addToChunk(data.chunked_id, data.chunk, data.chunk_num, data.chunk_total);
  }
  if ("chunked_last" in data) {
    let _aux = chunksManager.composeChunk(data.chunked_id)
      .then(function(_aux){
        let _data = {
          song_file: _aux.data,
          mime_type: _aux.info.mime_type,
          uuid: _aux.info.uuid,
        }
        self.postMessage({
          cmd: "end_fetch",
          dataUrl: _data.song_file,
          uuid: _data.uuid,
        });        
      });
  }
}

function _fileHandlerChunkedError(data){
  self.postMessage({
    cmd: "error_fetch",
    data: data,
  });
}
