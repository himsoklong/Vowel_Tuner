var audio_context;
var recorder;
var audio_stream;
var initialized;
var audio_blob;

function Initialize() {
    try {
        // Monkeypatch for AudioContext, getUserMedia and URL
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        navigator.getUserMedia = ( navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia);
        window.URL = window.URL || window.webkitURL;

        audio_context = new AudioContext;
        console.log('Audio context is ready !');
        console.log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
    } catch (e) {
        alert('No web audio support in this browser!');
    }
}

function startRecording() {
	if (!initialized) {
		Initialize();
		initialized = true;
	}
	
    navigator.getUserMedia({ audio: true }, function (stream) {
        audio_stream = stream; // Expose the stream to be accessible globally
        var input = audio_context.createMediaStreamSource(stream);
        console.log('Media stream succesfully created');

        recorder = new Recorder(input);
        console.log('Recorder initialised');

        recorder && recorder.record();
        console.log('Recording...');

        document.getElementById("start-btn").disabled = true;
        document.getElementById("stop-btn").disabled = false;
    }, function (e) {
        console.error('No live audio input: ' + e);
    });
}

function stopRecording(callback, AudioFormat) {
    recorder && recorder.stop();
    console.log('Stopped recording.');

    audio_stream.getAudioTracks()[0].stop();

    document.getElementById("start-btn").disabled = false;
    document.getElementById("stop-btn").disabled = true;

    if(typeof(callback) == "function"){
        recorder && recorder.exportWAV(function (blob) {
            callback(blob);

            // createDownloadLink();

            //var file= new File(recorder,"audio.wav",{type: })
            //saveAs(recorder)

            recorder.clear();
        }, (AudioFormat || "audio/wav"));
    }
}

window.onload = function(){
    initialized = false;

    document.getElementById("start-btn").addEventListener("click", function(){
        startRecording();
    }, false);

    document.getElementById("stop-btn").addEventListener("click", function(){
        var _AudioFormat = "audio/wav";

        stopRecording(function(AudioBLOB){
			audio_blob = AudioBLOB;
			/*
            var url = URL.createObjectURL(AudioBLOB);
            var li = document.createElement('li');
            var au = document.createElement('audio');
            var hf = document.createElement('a');

            au.controls = true;
            au.src = url;
            hf.href = url;
            hf.download = new Date().toISOString() + '.wav';
            hf.innerHTML = hf.download;
            li.appendChild(au);
            li.appendChild(hf);
            recordingslist.appendChild(li);
			*/
        }, _AudioFormat);
    }, false);
	
	document.getElementById("predict-btn").addEventListener("click", function(){
		fetch('/upload', {
            method: "POST",
            body: audio_blob
        }).then((response) => response.json()).then((data) => console.log(data));
    })
};