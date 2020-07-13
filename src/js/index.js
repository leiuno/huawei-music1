console.log("music")
import './icons.js'
import Swiper from './swiper.js'

class Player  {
  constructor(node) {
    console.log(node)
    this.root = typeof node === 'string' ? document.querySelector(node) : node  //传递一个字符串或者dom节点
    this.$ = selector => document.querySelector(selector)
    this.$$ = selector => document.querySelectorAll(selector)
    this.songList = []  //空数组，获取到播放列表放进去
    this.currentIndex = 0  //音乐下标，默认是0
    this.audio = new Audio()  //创建了一个new Audio对象
    this.newArr = []
    this.lyricIndex = -1
    this.start()
    this.bind()
  }
  //获取数据，放在songList里
  start(){
    //fetch('/Users/leiuno/Works/www/huawei-music1/music.json')
    fetch('https://jirengu.github.io/data-mock/huawei-music/music-list.json')
    .then(res => res.json())
    .then(data => {
      console.log(data)
      this.songList = data
      //this.audio.src = this.songList[this.currentIndex].url
      this.renderSong()
    })
  }
  bind() {
    let self = this  //外面的this赋值给self，里面的this代表这个按钮
    //获取播放按钮节点，并绑定事件
    this.$('.btn-play-pause').onclick = function(){
      if(this.classList.contains('playing')){
        self.audio.pause()
        this.classList.remove('playing')
        this.classList.add('pause')
        this.querySelector('use').setAttribute('xlink:href','#icon-play')  //修改dom的属性
      }else if(this.classList.contains('pause')){
        self.audio.play()
        this.classList.remove('pause')
        this.classList.add('playing')
        this.querySelector('use').setAttribute('xlink:href','#icon-pause')
      }
    }
    this.$('.btn-pre').onclick = function(){
      console.log('pre')
      self.playPreSong()
      self.renderSong()
    }
    this.$('.btn-next').onclick = function(){
      console.log('next')
      self.playNextSong()
      self.renderSong()
    }
    this.audio.ontimeupdate = function(){
      self.locatedLyrics()
      self.setProgerssBar()
    }
    let swiper = new Swiper(this.$('.panels'))
    swiper.on('swipLeft',function(){
      console.log(this)
      this.classList.remove('panels1')
      this.classList.add('panels2')
    })
    swiper.on('swipRight',function(){
      console.log(this)
      this.classList.remove('panels2')
      this.classList.add('panels1')
    })
  }

  playSong(){
    this.audio.play()
  }
  renderSong(){
    let songObj = this.songList[this.currentIndex]
    this.$('.header h1').innerText = songObj.title
    this.$('.header p').innerText = songObj.author + '-' + songObj.albumn
    this.audio.src = songObj.url
    this.audio.onloadedmetadata = () => this.$('.time-end').innerText = this.formateTime(this.audio.duration)
    this.loadlyrics()
  }
  //播放上一首
  playPreSong(){
    this.currentIndex = (this.songList.length + this.currentIndex - 1) % this.songList.length
    this.audio.src = this.songList[this.currentIndex].url
    //this.audio.oncanplaythrough = () => this.audio.play()
    this.audio.play()  //音乐没有加载好会报错
  }
  //播放下一首
  playNextSong(){
    this.currentIndex = (this.songList.length + this.currentIndex + 1) % this.songList.length
    this.audio.src = this.songList[this.currentIndex].url
    //this.audio.oncanplaythrough = () => this.audio.play()
    this.audio.play()
  }
  //加载歌词
  loadlyrics(){
    fetch(this.songList[this.currentIndex].lyric)
      .then(res => res.json())
      .then(data => {
        //console.log(data.lrc.lyric)
        this.setLyrics(data.lrc.lyric)
        window.lyrics = data.lrc.lyric
    })
  }
  //解析歌词
  //把歌词对象变成一个数组，index0时间，index1歌词
  setLyrics(lyrics){
    this.lyricsIndex = 0
    let fragment = document.createDocumentFragment()  //创建文档片段，将元素附加到文档片段，然后将文档片段附加到DOM树
    //定义一个新数组，传入二维数组，0是时间，1是歌词
    let newArr = []
    this.newArr = newArr
    //字符串转换为数组，换行切割
    let lyricsArr = lyrics.split(/\n/)
    
    for(let i=0; i<lyricsArr.length; i++){
      let t = lyricsArr[i].match(/\[\d{2}:\d{2}((\.|\:)\d{2})\]/g)
      let str = lyricsArr[i].replace(/\[\d{2}:\d{2}((\.|\:)\d{2})\]/g,"")
      if(t != null){
        for(let j=0; j<t.length; j++){
          let t_s=t[j];
          let min = Number(String(t_s.match(/\[\d{2}/i)).slice(1));
          let sec = parseFloat(String(t_s.match(/\d{2}\.\d{2}/i)));
          //换算时间
          let _t = Math.round((min * 60 + sec)*1000);
          //把时间和对应的歌词保存到数组
          newArr.push([_t,str]);
         }
      }
    }
    this.newArr.sort(function(a,b){
      return (a[0] - b[0])
    })
    console.log(newArr)
    this.newArr.forEach(value => {
      let node = document.createElement('p')
      node.setAttribute('data-time',value[0])
      node.innerHTML= value[1]
      fragment.appendChild(node)
    })
    this.$('.panel-lyrics .container').innerHTML = ''
    this.$('.panel-lyrics .container').appendChild(fragment)
  }
  //定位歌词
  locatedLyrics(){
    
    let currentTime = this.audio.currentTime*1000
    let nextLineTime = this.newArr[this.lyricIndex+1][0]
    console.log(currentTime,nextLineTime)
    if(currentTime > nextLineTime && this.lyricIndex < this.newArr.length - 1) {
      this.lyricIndex++
      let node = this.$('[data-time="'+this.newArr[this.lyricIndex][0]+'"]')
      if(node) this.setLyricToCenter(node)
      this.$$('.panel-effect .lyrics p')[0].innerText = this.newArr[this.lyricIndex][1]
      this.$$('.panel-effect .lyrics p')[1].innerText = this.newArr[this.lyricIndex+1] ? this.newArr[this.lyricIndex+1][1] : ''
    }
  }
  //选中歌词到屏幕中间
  setLyricToCenter(node){
    console.log(node)
    let offset = node.offsetTop - this.$('.panel-lyrics').offsetHeight / 2
    offset = offset > 0 ? offset : 0
    console.log(offset)
    this.$('.panel-lyrics .container').style.transform = `translateY(-${offset}px)`
    this.$$('.panel-lyrics p').forEach((node) => node.classList.remove('current'))
    node.classList.add('current')
  }
  //设置进度条
  setProgerssBar() {
    let percent = (this.audio.currentTime * 100 /this.audio.duration) + '%'
    console.log(percent)
    this.$('.bar .progress').style.width = percent
    this.$('.time-start').innerText = this.formateTime(this.audio.currentTime)
    console.log(this.$('.bar .progress').style.width)
  }
  formateTime(secondsTotal) {
    let minutes = parseInt(secondsTotal/60)
    minutes = minutes >= 10 ? '' + minutes : '0' + minutes
    let seconds = parseInt(secondsTotal%60)
    seconds = seconds >= 10 ? '' + seconds : '0' + seconds
    return minutes + ':' + seconds
  }
}

window.p = new Player('#player')

//循环播放，顺序播放，自动执行下一曲，检查若循环，下一曲还是index，
//音乐列表