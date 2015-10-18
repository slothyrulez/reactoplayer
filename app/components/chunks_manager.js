// Chunk manager helps fetching large files

export default class ChunksManager {
  constructor() {
    this.dataStore = {};
  }
  _compose_chunk(blob) {
    return new Promise(function(resolve, reject) {
      let reader = new FileReader();
      reader.onloadend = function() {
        console.log("INSIDE PROMISE, ONLOADEND ", this, reader);
        console.log("RESOLVE _ARRAY", this.result);
        resolve(this);
      }
      reader.readAsArrayBuffer(blob);
    });
  }
  _del_chunk(id) {
    console.log("DELETE");
    delete this.dataStore[id];
  }
  newChunk(id, chunk_data, chunk_num, chunk_total,  chunk_info) {
    let _array = new Array(chunk_total);
    _array[0] = new Uint8Array(chunk_data);
    this.dataStore[id] = {
      chunks: _array.slice(),
      chunk_total: chunk_total,
      chunk_fetched: chunk_num,
      info: chunk_info,
    };
  }
  addToChunk(id, chunk_data, chunk_num, chunk_total) {
    this.dataStore[id].chunk_num += 1;
    this.dataStore[id].chunks[chunk_num] = new Uint8Array(chunk_data);
  }
  delChunk(id) {
    this._del_chunk(id);
  }
  composeChunk(id) {
    let info = this.dataStore[id].info;
    let mime = this.dataStore[id].info.mime_type;
    let blob = new Blob(this.dataStore[id].chunks,{type : mime });
    return this._compose_chunk(blob)
      .then(function(data) {
        return new File([data.result], "", {type : mime });
      }).then(function(file){
        return URL.createObjectURL(file);
      }).then(function(url){
        return  {
          info: info,
          data: url,
        };
      });
  }
}
//
// {
//   chunk_id: "",
//   chunks_fetched: "",
//   chunks_size: "",
//   chunks: [],
//   chunk_info: {
//    ...
//   }
// }
