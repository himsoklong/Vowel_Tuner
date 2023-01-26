let audioContext;
let recorder;
let audioStream;
let audioInit;
let audioBlob;
let currentTab;
let speakerGender;
let previousPhoneme;
let wordsEndWithR;
let currentSeries;
let seriesIndex;
let vowelSeries;
let wordSeries;
let wordSeriesProbasNN;
let wordSeriesPredNN;
let wordSeriesProbasLG;
let wordSeriesPredLG;
let totalSeries;
let vowel_dict = {
    // X-SAMPA, user notation, IPA, words (text, user notation, IPA, previous phoneme, ends with /R/, simple example, more examples), successes, tries
    "a": ["a", "a", [
        ["la", "l-a", "la", "l", false],
        ["ma", "m-a", "ma", "m", false],
        ["pas", "p-a", "pa", "p", false],
        ["sa", "s-a", "sa", "s", false],
        ["ta", "t-a", "ta", "t", false],
    ], "la", "b<b>a</b>s, m<b>â</b>t", 0, 0],
    "i": ["i", "i", [
        ["lit", "l-i", "li", "l", false],
        ["mis", "m-i", "mi", "m", false],
        ["pi", "p-i", "pi", "p", false],
        ["si", "s-i", "si", "s", false],
        ["ti", "t-i", "ti", "t", false],
    ], "lit", "d<b>i</b>re, f<b>i</b>lle", 0, 0],
    "u": ["ou", "u", [
        ["loup", "l-ou", "lu", "l", false],
        ["mou", "m-ou", "mu", "m", false],
        ["pou", "p-ou", "pu", "p", false],
        ["sous", "s-ou", "su", "s", false],
        ["tout", "t-ou", "tu", "t", false],
    ], "tout", "l<b>ou</b>p, c<b>oû</b>t, igl<b>oo</b>", 0, 0],
    "E": ["è", "ɛ", [
        ["l'air", "l-è-r", "lɛʁ", "l", true],
        ["mer", "m-è-r", "mɛʁ", "m", true],
        ["père", "p-è-r", "pɛʁ", "p", true],
        ["serre", "s-è-r", "sɛʁ", "s", true],
        ["terre", "t-è-r", "tɛʁ", "t", true],
    ], "père", "g<b>è</b>le, m<b>e</b>r, b<b>ê</b>te, f<b>ai</b>te", 0, 0],
    "o": ["ô", "o", [
        ["lot", "l-ô", "lo", "l", false],
        ["mot", "m-ô", "mo", "m", false],
        ["pot", "p-ô", "po", "p", false],
        ["seau", "s-ô", "so", "s", false],
        ["tôt", "t-ô", "to", "t", false],
    ], "mot", "t<b>ô</b>t, l<b>o</b>t, f<b>au</b>x, b<b>eau</b>", 0, 0],
    "y": ["u", "y", [
        ["lu", "l-u", "ly", "l", false],
        ["mu", "m-u", "my", "m", false],
        ["pu", "p-u", "py", "p", false],
        ["su", "s-u", "sy", "s", false],
        ["tu", "t-u", "ty", "t", false],
    ], "tu", "v<b>u</b>, r<b>ue</b>", 0, 0],
    "O": ["o (open)", "ɔ", [
        ["lors", "l-o (open)-r", "lɔʁ", "l", true],
        ["mort", "m-o (open)-r", "mɔʁ", "m", true],
        ["porc", "p-o (open)-r", "pɔʁ", "p", true],
        ["sort", "s-o (open)-r", "sɔʁ", "s", true],
        ["tort", "t-o (open)-r", "tɔʁ", "t", true],
    ], "fort", "s<b>o</b>l, p<b>o</b>rc", 0, 0],
    "e": ["é", "e", [
        ["les", "l-é", "le", "l", false],
        ["mes", "m-é", "me", "m", false],
        ["pé", "p-é", "pe", "p", false],
        ["ses", "s-é", "se", "s", false],
        ["tes", "t-é", "te", "t", false],
    ], "les", "n<b>é</b>, nou<b>ée</b>, m<b>es</b>", 0, 0],
    "2": ["eu", "ø", [
        ["le", "l-eu", "lø", "l", false],
        ["me", "m-eu", "mø", "m", false],
        ["peu", "p-eu", "pø", "p", false],
        ["se", "s-eu", "sø", "s", false],
        ["te", "t-eu", "tø", "t", false],
    ], "me", "c<b>e</b>, p<b>eu</b>, d<b>eu</b>x", 0, 0],
    "9": ["eu (open)", "œ", [
        ["leur", "l-eu (open)-r", "lœʁ", "l", true],
        ["meurt", "m-eu (open)-r", "mœʁ", "m", true],
        ["peur", "p-eu (open)-r", "pœʁ", "p", true],
        ["sœur", "s-eu (open)-r", "sœʁ", "s", true],
        ["teur", "t-eu (open)-r", "tœʁ", "t", true],
    ], "peur", "s<b>eu</b>l, n<b>eu</b>f", 0, 0]
};

const _AudioFormat = "audio/wav";
const seriesLength = 10;

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
    $("#error-banner").hide();
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


function shuffle(array) {
  const newArray = [...array]
  const length = newArray.length

  for (let start = 0; start < length; start++) {
    const randomPosition = Math.floor((newArray.length - start) * Math.random())
    const randomItem = newArray.splice(randomPosition, 1)
    newArray.push(...randomItem)
  }

  return newArray
}

function welcomeClick() {
    let gender = $("#gender :selected").text();
    if (gender !== 'Select your gender') {
        speakerGender = gender;
        changeTab('vowel_recording');
        currentSeries = shuffle(Object.keys(vowel_dict));
        for (let vowel of currentSeries) {
            const word_arr = vowel_dict[vowel][2];
            wordSeries.push(word_arr[Math.floor(Math.random() * word_arr.length)])
            vowelSeries.push(vowel);
        }
        nextVowel();
    } else {
        $("#no_gender").show();
    }
}


function nextVowel() {
    $("#processing").hide();
    if (seriesIndex < totalSeries * seriesLength + seriesLength - 1) {
        seriesIndex += 1;
        const word = wordSeries[seriesIndex];
        $("#cnt").html(seriesIndex % seriesLength + 1);
        $("#word-id").html(word[0]);
        previousPhoneme = word[3];
        wordsEndWithR = word[4];
    } else {
        totalSeries += 1;
        $("#series-cnt").html(totalSeries);
        $("#predict-div").show();
        changeTab('series_done');
    }
}


function red(txt) {
    return "<span style='color: #8B0000;'>" + txt + "</span>";
}


function green(txt) {
    return "<span style='color: #006400;'>" + txt + "</span>";
}


function displayResults() {
    changeTab("results");
    $("#data-nn").html(wordSeriesProbasNN);
    $("#data-lg").html(wordSeriesProbasLG);
    let lgCorrect = 0;
    let nnCorrect = 0;
    let total = 0;

    for (let i in vowelSeries) {
        let tr = "<tr>";
        tr += "<td>" + i + "</td>";
        tr += "<td>" + wordSeries[i][0] + "</td>";
        tr += "<td>" + vowelSeries[i] + "</td>";
        total += 1;

        let txt = wordSeriesPredNN[i];
        if (txt === vowelSeries[i]) {
            txt = green(txt);
            nnCorrect += 1;
        } else {
            txt = red(txt);
        }
        tr += "<td>" + txt + "</td>";

        txt = wordSeriesPredLG[i];
        if (txt === vowelSeries[i]) {
            txt = green(txt);
            lgCorrect += 1;
        } else {
            txt = red(txt);
        }
        tr += "<td>" + txt + "</td>";

        tr += "<td>";
        for (const val of wordSeriesProbasNN[i]) {
            tr += val.toFixed(4) + ", ";
        }
        tr = tr.slice(0, -2)
        tr += "</td>";
        tr += "<td>";
        for (const val of wordSeriesProbasLG[i]) {
            tr += val.toFixed(4) + ", ";
        }
        tr = tr.slice(0, -2)
        tr += "</td>";
        tr += "</tr>";
        $("#result-table").append(tr);
    }
    $("#result-table").append("<tr><td>Total</td><td>"
        + speakerGender[0] + "</td><td></td><td>"
        + (100*nnCorrect/total).toFixed(2) + " %</td><td>"
        + (100*lgCorrect/total).toFixed(2) + " %</td><td></td><td></td></tr>");
}


function predictionDone(data) {
    if ("error" in data) {
        $("#error-message").html(data["error"]);
        $("#error-banner").show();
    } else {
        wordSeriesProbasNN.push(data["probas_nn"]);
        wordSeriesPredNN.push(data["pred_nn"]);
        wordSeriesProbasLG.push(data["probas_lg"]);
        wordSeriesPredLG.push(data["pred_lg"]);
        nextVowel();
    }
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
    totalSeries = 0;
    wordSeriesProbasNN = [];
    wordSeriesPredNN = [];
    wordSeriesProbasLG = [];
    wordSeriesPredLG = [];
    wordSeries = [];
    vowelSeries = [];
    seriesIndex = -1;

    changeTab(currentTab);

    $("#start-btn").click(startRecording);
    $("#stop-btn").click(stopRecording);
    $("#welcome-btn").click(welcomeClick);
    $("#continue-btn").click(welcomeClick);
    $("#display-btn").click(displayResults);
    $("#gender").change(function() { $("#no_gender").hide(); })
    $("#cnt-total").html(seriesLength);

    $("#predict-btn").click(async function () {
        $("#predict-div").hide();
        $("#processing").show();
        const b64 = await blobToBase64(audioBlob);
        fetch('/predict', {
            method: "POST",
            body: JSON.stringify({
                'audio': b64,
                'gender': speakerGender,
                'r_word': wordsEndWithR,
                'prev_phoneme': previousPhoneme,
                'des_vowel': currentSeries[seriesIndex]
            })
        }).then(function (response) {
            return response.json();
        }).then(predictionDone);
    })
});