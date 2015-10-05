export class Queue {
  constructor() {
    this.dataStore = [];
  }
  enqueue(element) {
    this.dataStore.push(element);
  }
  dequeue() {
    this.dataStore.shift();
  }
  front() {
    return this.dataStore[0];
  }
  back() {
    return this.dataStore[this.dataStore.length - 1];
  }
  empty() {
    return (this.dataStore.length === 0);
  }
}

export class PlayQueue extends Queue {
  constructor(...args) {
    super(...args);
  }
  addSong(song){
    this.enqueue(song);
  }
  nextSong(){
    return this.dequeue();
  }
  actualSong(){
    return this.front();
  }
}

export class List {
  constructor() {
    this.dataStore = [];
    this.pos = 0;
    this.listSize = 0;
  }
  append(element) {
    this.dataStore[this.listSize++] = element;
  }
  find(element) {
    this.dataStore.forEach((val, idx) => {
      if (val === element) {
        return idx;
      }
    });
    return -1;
  }
  remove(element) {
    let foundAt = this.find(element);
    if (foundAt > -1) {
      this.dataStore.splice(foundAt, 1);
      --this.listSize;
      return true;
    }
    return false;
  }
  length() {
    return this.listSize;
  }
  insert(element, after) {
    let insertPos = this.find(after);
    if (insertPos > -1) {
      this.dataStore.splice(insertPos+1, 0, element);
      ++this.listSize;
      return true;
    }
    return false;
  }
  clear() {
    delete this.dataStore;
    this.dataStore = [];
    this.listSize = this.pos = 0;
  }
  contains(element) {
    this.dataStore.forEach((val, idx) => {
      if (val === element) {
        return true;
      }
    });
    return false;
  }
  front() {
    this.pos = 0;
  }
  end() {
    this.pos = this.listSize - 1;
  }
  prev() {
    if (this.pos > 0) {
      --this.pos;
    }
  }
  next() {
    if (this.pos < this.listSize - 1) {
      ++this.pos;
    }
  }
  moveTo(position) {
    this.pos = position;
  }
  currPos(){
    return this.pos;
  }
  getElement() {
    return this.dataStore[this.pos];
  }
}

export class PlayList extends List {
  constructor(...args) {
    super(...args);
  }
  addSongs(song_list) {
    for (let song of song_list){
      this.addSong(song);
    }
  }
  actualSong() {
    return this.getElement();
  }
  addSong(song) {
    this.append(song);
  }
  nextSong(song) {
    this.next();
    return this.getElement();
  }
  prevSong(song) {
    this.prev();
    return this.getElement();
  }
}

export class Volume {
  constructor () {
    this.actual = 0;
    this.defaultValue = 0;
    this.min = 0;
    this.max = 10;
    this.step = 1;
  }
  up(val = 1) {
    let _ammount = val;
    while(this.actual >= 0) {
      this.actual += this.step;
      _ammount += this.step;
    }
  }
  down(val = 1) {
    let _ammount = val;
    while(this.actual >= 0) {
      this.actual -= this.step;
      _ammount -= this.step;
    }
  }
  mute() {
    this.actual = 0;
  }
}
