let audioContext;
let recorder;
let audioStream;
let audioInit;
let audioBlob;
let currentTab;
let speakerGender;
let previousPhoneme;
let wordsEndWithR;
let vowel;
let vowel_dict = {
    // X-SAMPA, user notation, IPA, words (text, user notation, IPA, previous phoneme, ends with /R/, simple example, more examples)
    "a": ["a", "a", [
        ["la", "l-a", "la", "l", false],
        ["ma", "m-a", "ma", "m", false],
        ["pas", "p-a", "pa", "p", false],
        ["sa", "s-a", "sa", "s", false],
        ["ta", "t-a", "ta", "t", false],
    ], "la", "b<b>a</b>s, m<b>â</b>t"],
    "i": ["i", "i", [
        ["lit", "l-i", "li", "l", false],
        ["mis", "m-i", "mi", "m", false],
        ["pi", "p-i", "pi", "p", false],
        ["si", "s-i", "si", "s", false],
        ["t'y", "t-i", "ti", "t", false],
    ], "lit", "d<b>i</b>re, f<b>i</b>lle"],
    "u": ["ou", "u", [
        ["loup", "l-ou", "lu", "l", false],
        ["mou", "m-ou", "mu", "m", false],
        ["pou", "p-ou", "pu", "p", false],
        ["sous", "s-ou", "su", "s", false],
        ["tout", "t-ou", "tu", "t", false],
    ], "tout", "l<b>ou</b>p, c<b>oû</b>t, igl<b>oo</b>"],
    "E": ["è", "ɛ", [
        ["l'air'", "l-è-r", "lɛʁ", "l", true],
        ["mer", "m-è-r", "mɛʁ", "m", true],
        ["père", "p-è-r", "pɛʁ", "p", true],
        ["serre", "s-è-r", "sɛʁ", "s", true],
        ["terre", "t-è-r", "tɛʁ", "t", true],
    ], "père", "g<b>è</b>le, m<b>e</b>r, b<b>ê</b>te, f<b>ai</b>te"],
    "o": ["ô", "o", [
        ["lot", "l-ô", "lo", "l", false],
        ["mot", "m-ô", "mo", "m", false],
        ["pot", "p-ô", "po", "p", false],
        ["seau", "s-ô", "so", "s", false],
        ["tôt", "t-ô", "to", "t", false],
    ], "mot", "t<b>ô</b>t, l<b>o</b>t, f<b>au</b>x, b<b>eau</b>"],
    "y": ["u", "y", [
        ["lu", "l-u", "ly", "l", false],
        ["mu", "m-u", "my", "m", false],
        ["pu", "p-u", "py", "p", false],
        ["su", "s-u", "sy", "s", false],
        ["tu", "t-u", "ty", "t", false],
    ], "tu", "v<b>u</b>, r<b>ue</b>"],
    "O": ["o (open)", "ɔ", [
        ["lors'", "l-o (open)-r", "lɔʁ", "l", true],
        ["mort", "m-o (open)-r", "mɔʁ", "m", true],
        ["porc", "p-o (open)-r", "pɔʁ", "p", true],
        ["sort", "s-o (open)-r", "sɔʁ", "s", true],
        ["tort", "t-o (open)-r", "tɔʁ", "t", true],
    ], "fort", "s<b>o</b>l, p<b>o</b>rc"],
    "e": ["é", "e", [
        ["les", "l-é", "le", "l", false],
        ["mes", "m-é", "me", "m", false],
        ["pet", "p-é", "pe", "p", false],
        ["ses", "s-é", "se", "s", false],
        ["tes", "t-é", "te", "t", false],
    ], "les", "n<b>é</b>, nou<b>ée</b>, m<b>es</b>"],
    "2": ["eu", "ø", [
        ["le", "l-eu", "lø", "l", false],
        ["me", "m-eu", "mø", "m", false],
        ["peu", "p-eu", "pø", "p", false],
        ["se", "s-eu", "sø", "s", false],
        ["te", "t-eu", "tø", "t", false],
    ], "me", "c<b>e</b>, p<b>eu</b>, d<b>eu</b>x"],
    "9": ["eu (open)", "œ", [
        ["leur'", "l-eu (open)-r", "lœʁ", "l", true],
        ["meurt", "m-eu (open)-r", "mœʁ", "m", true],
        ["peur", "p-eu (open)-r", "pœʁ", "p", true],
        ["sœur", "s-eu (open)-r", "sœʁ", "s", true],
        ["-teur", "t-eu (open)-r", "tœʁ", "t", true],
    ], "peur", "s<b>eu</b>l, n<b>eu</b>f"]
};

const _AudioFormat = "audio/wav";

function Initialize() {
    try {
        // Monkeypatch for AudioContext, getUserMedia and URL
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        navigator.getUserMedia = ( navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia);
        window.URL = window.URL || window.webkitURL;

        audioContext = new AudioContext;
        console.log('Audio context is ready !');
        console.log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
    } catch (e) {
        alert('Unfortunately, your browser does not support web audio. This website will not function!');
    }
}

function startRecording() {
    $("#wait").show();
    $("#speak").hide();
    $("#start-btn").hide();
    $("#stop-btn").show();
    $("#predict-div").hide();

	if (!audioInit) {
		Initialize();
		audioInit = true;
	}
	
    navigator.getUserMedia({ audio: true }, function (stream) {
        audioStream = stream; // Expose the stream to be accessible globally
        const input = audioContext.createMediaStreamSource(stream);
        console.log('Media stream created');

        recorder = new Recorder(input);
        console.log('Recorder initialized');

        recorder && recorder.record();
        console.log('Recording...');

        $("#wait").hide();
        $("#speak").show();
    }, function (e) {
        console.error('No live audio input: ' + e);
    });
}

function stopRecording() {
    $("#wait").hide();
    $("#speak").hide();

    recorder && recorder.stop();
    console.log('Stopped recording.');

    audioStream.getAudioTracks()[0].stop();

    $("#start-btn").show();
    $("#stop-btn").hide();
    $("#predict-div").show();

    recorder && recorder.exportWAV(function (blob) {
        audioBlob = blob;
        recorder.clear();
    }, _AudioFormat);
}

function changeTab(newTab) {
    $('#' + currentTab).hide();
    $('#' + newTab).show();
    currentTab = newTab;
    scroll();
}

function welcomeClick() {
    let gender = $("#gender :selected").text();
    if (gender !== 'Select your gender') {
        speakerGender = gender;
        changeTab('vowel_selection');
    } else {
        $("#no_gender").show();
    }
}

function vowelClick(newVowel) {
    changeTab('vowel_recording');

    vowel = newVowel;
    const text_vowel = vowel_dict[vowel][0];
    const ipa_vowel = vowel_dict[vowel][1];
    const word_arr = vowel_dict[vowel][2];
    const word = word_arr[Math.floor(Math.random()*word_arr.length)]
    const word_id = word[0];
    const word_txt = word[1];
    const word_ipa = word[2];
    previousPhoneme = word[3];
    wordsEndWithR = word[4];

    $("#vowel-id").html(text_vowel);
    $("#vowel-ipa").html(ipa_vowel);
    $("#word-id").html(word_id);
    $("#word-txt").html(word_txt);
    $("#word-ipa").html(word_ipa);
}

function predictionDone(data) {
    $("#predict-div").show();
    $("#processing").hide();
    console.log(data);
    if ("error" in data) {
        $("#error-message").html(data["error"]);
        changeTab('vowel_prediction_err');
    } else {
        let predicted_vowel = data['predicted_vowel'];
        if (predicted_vowel === vowel) {
            changeTab('vowel_prediction_good');
            $("#vowel-id-2").html(vowel);
            $("#score-good").html(+data['confidence'].toFixed(4)*100 + "%");
        } else {
            changeTab('vowel_prediction_bad');
            $("#vowel-id-3").html(vowel);
            $("#vowel-id-4").html(vowel);
            $('#video').attr('src', '../video/' + vowel + '.mp4'); // TODO test
            //$("#video")[0].load(); // TODO test
            let registered_vowel = vowel_dict[predicted_vowel];
            $("#reg1").html(registered_vowel[0]);
            $("#reg2").html(registered_vowel[1]);
            $("#reg3").html(registered_vowel[3]);
            $("#reg4").html(registered_vowel[4]);
            $("#score-bad").html(+data['confidence'].toFixed(4)*100 + "%");
            $("#feedback").html(data['feedback']);
            if ("add_feedback" in data && data["add_feedback"]) {
                $("#feedback-2").html(data['add_feedback']);
                $("#feedback-2-div").show();
            } else {
                $("#feedback-2-div").hide();
            }
        }
    }

    /*
    predicted_vowel='a',
    confidence=0.85,
    feedback="git gud",
    add_feedback
    */
}

function replayAudio() { // TODO test
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play().then(r => console.log('Replayed!'));
}

function playReferenceAudio() { // TODO test
    const audio = new Audio('../wav/' + vowel + '.wav');
    audio.play().then(r => console.log('Replayed!'));
}

// https://stackoverflow.com/a/61744566/2700737
function blobToBase64(blob) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = function () {
            resolve(reader.result);
        };
    });
}

$(function() {
    audioInit = false;

    currentTab = 'welcome';
    changeTab(currentTab);

    $("#start-btn").click(startRecording);
    $("#stop-btn").click(stopRecording);
    $("#welcome-btn").click(welcomeClick);
    $("#gender").change(function() { $("#no_gender").hide(); })
    $("#record-again-btn").click(function() { changeTab("vowel_recording"); $("#predict-div").hide(); })
    $("#select-again-btn").click(function() { changeTab("vowel_selection"); $("#predict-div").hide(); })
    $("#record-again-2-btn").click(function() { changeTab("vowel_recording"); $("#predict-div").hide(); })
    $("#select-again-2-btn").click(function() { changeTab("vowel_selection"); $("#predict-div").hide(); })
    $("#listen-self-btn").click(replayAudio);
    $("#listen-ref-btn").click(playReferenceAudio);
    $("#listen-self-2-btn").click(replayAudio);
    $("#listen-ref-2-btn").click(playReferenceAudio);
    $("#vowel-selection-btn").click(function() { changeTab("vowel_selection"); });

    for (let vowel of Object.keys(vowel_dict)) {
        $("#" + vowel + "-btn").click(function () { vowelClick(vowel); })
        $("#reg1-" + vowel).html(vowel_dict[vowel][0]);
        $("#reg2-" + vowel).html(vowel_dict[vowel][1]);
        $("#reg3-" + vowel).html(vowel_dict[vowel][3]);
        $("#reg4-" + vowel).html(vowel_dict[vowel][4]);
    }

	$("#predict-btn").click(async function () {
        $("#predict-div").hide();
        $("#processing").show();
        const b64 = await blobToBase64(audioBlob);
        fetch('/upload', {
            method: "POST",
            body: JSON.stringify({
                'audio': b64,
                'gender': speakerGender,
                'r_word': wordsEndWithR,
                'prev_phoneme': previousPhoneme,
                'des_vowel': vowel
            })
        }).then(function (response) {
            return response.json();
        }).then(predictionDone);
    })
});