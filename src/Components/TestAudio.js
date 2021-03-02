import React, {useRef,useState,useEffect} from 'react';
import beat1 from '../assets/beatOne.m4a'
import lamejs from 'lamejs'

function TestAudio(props) {

    const [recordings,setRecordings] = useState([])
    const [totalRecs,setTotalRecs] = useState(0);
    const [check,setCheck] = useState();

    function recordAudio(){
        let myReq; //animation frame ID
    function detectSilence(
        stream,
        onSoundEnd = _=>{},
        onSoundStart = _=>{},
        silence_delay = 200,
        min_decibels =-80
        ) {
        const ctx = new AudioContext();
        const analyser = ctx.createAnalyser();
        const streamNode = ctx.createMediaStreamSource(stream);
        

        streamNode.connect(analyser);
        analyser.minDecibels = min_decibels;
      
        const data = new Uint8Array(analyser.frequencyBinCount); // will hold our data
        let silence_start = performance.now();
        let triggered = false; // trigger only once per silence event
      
        function loop(time) {
          myReq=requestAnimationFrame(loop); // we'll loop every 60th of a second to check
          analyser.getByteFrequencyData(data); // get current data
          if (data.some(v => v)) { // if there is data above the given db limit
            if(triggered){
              triggered = false;
              onSoundStart();
              }
            silence_start = time; // set it to now
          }
          if (!triggered && time - silence_start > silence_delay) {
            onSoundEnd();
            triggered = true;
          }
        }
        loop();
      }


      
      function onSilence() {
        console.log('silence');
      }
      function onSpeak() {
        console.log('speaking');
      }
      
      navigator.mediaDevices.getUserMedia({
          audio: true
        })
        .then(stream => {
          detectSilence(stream, onSilence, onSpeak);
          
          // do something else with the stream
          


        // const mediaRecorder = new MediaRecorder(stream)


        // document.getElementById('record').onclick= function(){
        //     mediaRecorder.start()
        //     console.log('started recording')
        // }
        // let chunks = [];

        // mediaRecorder.ondataavailable = function(e) {
        // chunks.push(e.data);
        // }

        // mediaRecorder.onstop = function(e) {
        //     console.log("recorder stopped");

        //     const clipName = prompt("What is the name of your recording",`recording ${totalRecs}`)
        
        //     setTotalRecs(totalRecs+1)
        //     const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
        //     chunks = [];
        //     const audioURL = window.URL.createObjectURL(blob);

            console.log(stream)
        //     mergeTracks(audioURL,beat1,clipName)
            
        
       
    
          var audio = document.getElementById('song').captureStream()
         
        //   var context = new(window.AudioContext || window.webkitAudioContext)(),
        //     source = context.createMediaStream(audio);
        //   console.log(source);
            console.log(audio)

          mergeStreams(stream,audio)
            
        //   }

       document.getElementById('stop').onclick=function(){
            // mediaRecorder.stop()
            console.log('stopped recording')
            cancelAnimationFrame(myReq)
        }

        })
        .catch(console.error);
    }

//add recording to list 
const addRec =(blobby,name)=>{
    const copyRec= [...recordings]
    copyRec.push((<audio src={blobby} id={name} key={name} title={name} controls ></audio>))
    setRecordings(copyRec)
}

const checkBuffer=()=>{
    console.log(check)
}

//delete recording from list

//convert file to mp3

const convertFile = (stuffToConvert,name)=> {
    console.log(stuffToConvert)
    function audioBufferToWav(aBuffer) {
        console.log(aBuffer)
      let numOfChan = aBuffer.numberOfChannels,
          btwLength = aBuffer.length * numOfChan * 2 + 44,
          btwArrBuff = new ArrayBuffer(btwLength),
          btwView = new DataView(btwArrBuff),
          btwChnls = [],
          btwIndex,
          btwSample,
          btwOffset = 0,
          btwPos = 0;
      setUint32(0x46464952); // "RIFF"
      setUint32(btwLength - 8); // file length - 8
      setUint32(0x45564157); // "WAVE"
      setUint32(0x20746d66); // "fmt " chunk
      setUint32(16); // length = 16
      setUint16(1); // PCM (uncompressed)
      setUint16(numOfChan);
      setUint32(aBuffer.sampleRate);
      setUint32(aBuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
      setUint16(numOfChan * 2); // block-align
      setUint16(16); // 16-bit
      setUint32(0x61746164); // "data" - chunk
      setUint32(btwLength - btwPos - 4); // chunk length
  
      for (btwIndex = 0; btwIndex < aBuffer.numberOfChannels; btwIndex++)
          btwChnls.push(aBuffer.getChannelData(btwIndex));
  
      while (btwPos < btwLength) {
          for (btwIndex = 0; btwIndex < numOfChan; btwIndex++) {
              // interleave btwChnls
              btwSample = Math.max(-1, Math.min(1, btwChnls[btwIndex][btwOffset])); // clamp
              btwSample = (0.5 + btwSample < 0 ? btwSample * 32768 : btwSample * 32767) | 0; // scale to 16-bit signed int
              btwView.setInt16(btwPos, btwSample, true); // write 16-bit sample
              btwPos += 2;
          }
          btwOffset++; // next source sample
      }
      let wavHdr = lamejs.WavHeader.readHeader(new DataView(btwArrBuff));
      let wavSamples = new Int16Array(btwArrBuff, wavHdr.dataOffset, wavHdr.dataLen / 2);
    

      let data = new Int16Array(btwArrBuff, wavHdr.dataOffset, wavHdr.dataLen / 2);
      let leftData = [];
      let rightData = [];
      for (let i = 0; i < data.length; i += 2) {
                   leftData.push(data[i]);
                   rightData.push(data[i + 1]);
      }
      var left = new Int16Array(leftData);
      var right = new Int16Array(rightData);



      wavToMp3(wavHdr.channels, wavHdr.sampleRate, wavSamples,left,right);
  
      function setUint16(data) {
          btwView.setUint16(btwPos, data, true);
          btwPos += 2;
      }
  
      function setUint32(data) {
          btwView.setUint32(btwPos, data, true);
          btwPos += 4;
      }
    }
  
  
  
    function wavToMp3(channels, sampleRate, samples,left,right) {
      var buffer = [];
      var mp3enc = new lamejs.Mp3Encoder(channels, sampleRate, 128);
      var remaining = samples.length;
      var samplesPerFrame = 1152;
      for (var i = 0; remaining >= samplesPerFrame; i += samplesPerFrame) {
        var leftChunk = left.subarray(i, i + samplesPerFrame);
        var rightChunk = right.subarray(i, i + samplesPerFrame);
          var mp3buf = mp3enc.encodeBuffer(leftChunk, rightChunk);
          if (mp3buf.length > 0) {
              buffer.push(new Int8Array(mp3buf));
          }
          remaining -= samplesPerFrame;
      }
      var d = mp3enc.flush();
      if(d.length > 0){
          buffer.push(new Int8Array(d));
      }
  
      var mp3Blob = new Blob(buffer, {type: 'audio/mp3'});
      var bUrl = window.URL.createObjectURL(mp3Blob);
      addRec(bUrl,name)
   //put mp3url into addrec
  
  }
 
  audioBufferToWav(stuffToConvert)

  }

function mergeStreams(stream1,stream2){
    const audioContext = new AudioContext();
        // audioParams_01 = {
        //     deviceId: "default",
        // }
        // audioParams_02 = {
        //     deviceId: "7079081697e1bb3596fad96a1410ef3de71d8ccffa419f4a5f75534c73dd16b5",
        // }

        // mediaStream_01 = await navigator.mediaDevices.getUserMedia({ audio: audioParams_01 });
        // mediaStream_02 = await navigator.mediaDevices.getUserMedia({ audio: audioParams_02 });

       let audioIn_01 = audioContext.createMediaStreamSource(stream1);
        let audioIn_02 = audioContext.createMediaStreamSource(stream2);

        let dest = audioContext.createMediaStreamDestination();

        audioIn_01.connect(dest);
        audioIn_02.connect(dest);

        const recorder = new MediaRecorder(dest.stream);
        recorder.start(5000)
        let chunks = [];
        console.log(recorder)
        recorder.onstart = async (event) => {
            console.log(chunks)
        }

        recorder.ondataavailable = (event) => {       
            chunks.push(event.data); 
            console.log(chunks)
            go(chunks[0])
        }

        recorder.onstop = async (event) => {
            console.log(chunks)
        }
       // setTimeout(()=>recorder.stop(),10000)
        
}

function go(blob){
const downloadButton = document.querySelector('button#download');
downloadButton.addEventListener('click', () => {
 
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'test.webm';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
});
}






function mergeTracks(linkToRec,chosenTrack,name){

        var sources = [linkToRec, chosenTrack];    
       
        
        var audio = new OfflineAudioContext(2,10*44100,44100);
   
        var merger = audio.createChannelMerger(2);
        
        // var splitter = audio.createChannelSplitter(2);
        // var mixedAudio = audio.createMediaStreamDestination();
        
        // var context;
       
        var audioDownload;

        

        function get(src) {
        return fetch(src)
            .then(function(response) {
            return response.arrayBuffer()
            })
        }

       

        Promise.all(sources.map(get)).then(function(data) {
            return Promise.all(data.map(function(buffer, index) {
                return audio.decodeAudioData(buffer)
                .then(function(bufferSource) {
                    var source = audio.createBufferSource();
                    source.buffer = bufferSource;
                    return source
                })
            }))
            .then(function(audionodes) {
                audionodes[0].connect(merger);
                audionodes[1].connect(merger);
                merger.connect(audio.destination);
                
   

                audio.startRendering()
                audio.oncomplete=async function(e){
                    let convertToAB = new Float32Array()
                    console.log(e.renderedBuffer,e.renderedBuffer.getChannelData(0))
                    e.renderedBuffer.copyFromChannel(convertToAB,0)
                 
                    let promise = new Promise((resolve, reject)=>{
                        setTimeout(() => resolve('done'),2000)
                    })
                    promise.then(res => console.log(res))
                    console.log(convertToAB)
                    setTimeout(() => console.log(convertToAB),5000) 
                    
                  
                }

                })
           
        })
        .catch(function(e) {
            console.log(e)
        });
        }

const record = useRef()
const stop= useRef()


const startRecording=()=>{
    document.getElementById('song').play()
   
}

const stopRecording=()=>{
    document.getElementById('song').pause()
    document.getElementById('song').currentTime=0
}



    return (
        <div>
        <button id='download'>download</button>
            <audio  id='song' src={beat1} loop={true} ></audio>
            <button id='record' ref={record} onClick={startRecording}>Start recording</button>
            <button id='stop' ref={stop} onClick={stopRecording}>Stop recording</button>
            <button onClick={recordAudio}> Please </button>
            <div>
                {recordings}
            </div>
        </div>
    );
}

export default TestAudio;