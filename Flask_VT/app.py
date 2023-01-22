import base64
import json
import math

import librosa
import numpy as np
import parselmouth
import torch
import torch.nn as nn
from flask import Flask, render_template, request, jsonify
from joblib import load
from parselmouth import praat
from pydub import AudioSegment
from pydub.silence import detect_leading_silence
from scipy.io import wavfile
from skimage.transform import resize

from feedback import vowel_feedback, pron_hack

app = Flask(__name__)


# The neural regression definition
class CNNRegressor(nn.Module):
    def __init__(self):
        super(CNNRegressor, self).__init__()
        self.cnn_layer1 = nn.Sequential(nn.Conv2d(1, 16, kernel_size=3, padding='valid'), nn.ReLU(), nn.Dropout(0.1),
                                        nn.BatchNorm2d(16), nn.MaxPool2d(kernel_size=2))
        self.cnn_layer2 = nn.Sequential(nn.Conv2d(16, 32, kernel_size=3, padding='valid'), nn.ReLU(), nn.Dropout(0.2),
                                        nn.BatchNorm2d(32), nn.MaxPool2d(kernel_size=2))
        self.linear_layer1 = nn.Linear(32 * 30 * 6 + 8, 128)
        self.dropout1 = nn.Dropout(0.5)
        self.activ1 = nn.ReLU()
        self.linear_layer_p = nn.Linear(128, 64)
        self.dropout_p = nn.Dropout(0.5)
        self.activ_p = nn.ReLU()
        self.linear_layer2 = nn.Linear(64, 2)
        self.activ2 = nn.Sigmoid()

    def forward(self, images, features):
        cnn2 = self.cnn_layer2(self.cnn_layer1(images.unsqueeze(1)))
        cnn_vec = cnn2.reshape(cnn2.shape[0], -1)
        out = self.dropout1(self.activ1(self.linear_layer1(torch.cat((cnn_vec, features), dim=1))))
        return self.activ2(self.linear_layer2(self.activ_p(self.dropout_p(self.linear_layer_p(out)))))


# The neural classification model
class CNNClassifier(nn.Module):
    def __init__(self, num_classes=10):
        super(CNNClassifier, self).__init__()
        self.cnn_layer1 = nn.Sequential(nn.Conv2d(1, 16, kernel_size=3, padding='valid'), nn.ReLU(), nn.Dropout(0.1),
                                        nn.BatchNorm2d(16), nn.MaxPool2d(kernel_size=2))
        self.cnn_layer2 = nn.Sequential(nn.Conv2d(16, 32, kernel_size=3, padding='valid'), nn.ReLU(), nn.Dropout(0.2),
                                        nn.BatchNorm2d(32), nn.MaxPool2d(kernel_size=2))
        self.linear_layer1 = nn.Linear(32 * 30 * 3 + 7, 64)
        self.dropout1 = nn.Dropout(0.5)
        self.activ1 = nn.ReLU()
        self.linear_layer_p = nn.Linear(128, 64)
        self.dropout_p = nn.Dropout(0.5)
        self.activ_p = nn.ReLU()
        self.linear_layer2 = nn.Linear(64, num_classes)

    def forward(self, images, features):
        cnn2 = self.cnn_layer2(self.cnn_layer1(images.unsqueeze(1)))
        cnn_vec = cnn2.reshape(cnn2.shape[0], -1)
        out = self.dropout1(self.activ1(self.linear_layer1(torch.cat((cnn_vec, features), dim=1))))
        out2 = self.linear_layer2(self.activ_p(self.dropout_p(self.linear_layer_p(out))))
        return out2


rule_clf = load('models/rule_based.joblib')  # The rule-based classifier
nn_clf = torch.load('models/neural_classifier.pt', map_location=torch.device('cpu'))  # The neural classifier
scaler = load('models/scaler.joblib')  # The scaler, transforms formants so that they have a mean of 0 and a variance of 1
regressor = torch.load('models/neural_regressor.pt', map_location=torch.device('cpu'))  # The vowel detection model

rule_based = False

idx2key = ['2', '9', 'a', 'a~', 'e', 'E', 'i', 'O', 'o', 'o~', 'u', 'U~+', 'y']  # All possible vowels
valid = [0, 1, 2, 4, 5, 6, 7, 8, 10, 12]  # Vowels we consider here (depends on the classifier)
all_phonemes = ['l', 'm', 'p', 's', 't', 't1']  # Phonemes that can be before the vowel

tmp_wav = 'tmp_process.wav'
tmp_wav_2 = 'tmp_process_trimmed.wav'
max_w = 31  # Image width to resize to
max_w_2 = max_w if rule_based else 20


@app.route('/upload', methods=['POST'])
def upload():
    data = json.loads(request.data)
    speaker_gender = data['gender']
    audio = data['audio'][22:]
    des_vowel = data['des_vowel']
    previous_phoneme = data['prev_phoneme']
    word_ends_with_r = data['r_word']
    input_file = "input.wav"

    audio = base64.b64decode(audio)

    with open(input_file, 'wb') as f:
        f.write(audio)

    # Remove leading and trailing silences
    sound = AudioSegment.from_file(input_file)
    trim_leading_silence = lambda x: x[detect_leading_silence(x, silence_threshold=-40):]
    trimmed = trim_leading_silence(trim_leading_silence(sound).reverse()).reverse()
    trimmed.export(tmp_wav, format='wav', bitrate='768k')

    # Generate log-melspectrogram
    try:
        y, sr = librosa.load(tmp_wav)
    except ValueError:
        print('The file is too silent to analyze! Try speaking louder.')
        return jsonify(error='The file is too silent to analyze! Try speaking louder.')

    mels = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128, n_fft=512, hop_length=512)
    mels = np.log(mels + 1e-9)  # add small number to avoid log(0)

    # Rescale mel-spectrogram
    mels_std = (mels - mels.min()) / (mels.max() - mels.min())
    melspec = (mels_std * 255).astype(np.uint8)

    melspec = np.flip(melspec, axis=0)  # put low frequencies at the bottom in image
    melspec = 255 - melspec

    # Feed log-melspectrogram to regression model to predict start and and of the vowel
    melspec2 = resize(melspec, (melspec.shape[0], max_w_2), anti_aliasing=False)
    melspec = resize(melspec, (melspec.shape[0], max_w), anti_aliasing=False)
    input_tensor = torch.tensor(melspec).float()
    input_features = torch.tensor(
        [speaker_gender == 'f', not word_ends_with_r, *[previous_phoneme == x for x in all_phonemes]])
    pred = regressor(input_tensor.unsqueeze(0), input_features.unsqueeze(0))[0]
    vowel_start = pred[0].item()
    vowel_end = pred[1].item()
    if vowel_start >= vowel_end:
        print('The model predicted that the vowel has negative duration! Try again.')
        return jsonify(error='The model predicted that the vowel has negative duration! Try again.')

    # Trim file at start and end to only have the vowel
    sample_rate, wave_data = wavfile.read(tmp_wav)
    duration = len(wave_data) / sample_rate
    start_sample = int(duration * vowel_start * sample_rate)
    end_sample = int(duration * vowel_end * sample_rate)
    wavfile.write(tmp_wav_2, sample_rate, wave_data[start_sample:end_sample])
    duration = len(wave_data[start_sample:end_sample]) / sample_rate
    if duration < 0.01:
        print('The model predicted that the vowel is too short! Try speaking louder.')
        return jsonify(error='The model predicted that the vowel is too short! Try speaking louder.')

    if rule_based:
        # Extract formants
        sound = parselmouth.Sound(tmp_wav_2)
        point_process = praat.call(sound, "To PointProcess (periodic, cc)", math.ceil(3 / duration + 0.000001), 300)
        formants = praat.call(sound, "To Formant (burg)", 0, 5, 5000, 0.025, 50)
        num_points = praat.call(point_process, "Get number of points")
        f_lists = [[] for i in range(5)]
        for point in range(1, num_points + 1):
            t = praat.call(point_process, "Get time from index", point)
            for i in range(4):
                f_lists[i].append(praat.call(formants, "Get value at time", i + 1, t, 'Hertz', 'Linear'))
        f_lists = [[x for x in f_list if not math.isnan(x)] for f_list in f_lists]
        # Compute the average of formants
        formants = []
        try:
            for i in range(4):
                formants.append(sum(f_lists[i]) / len(f_lists[i]))
        except ZeroDivisionError:
            print('The file is too short/empty to analyze! Try speaking louder.')
            return jsonify(error='The file is too short/empty to analyze! Try speaking louder.')

        # Add additional features (gender, previous phoneme)
        input_features = torch.cat([input_features[0:1], input_features[2:]]).cpu()
        features = torch.cat((torch.tensor(formants), input_features)).numpy()

        # Rescale formants
        features[:4] = scaler.transform(np.array(features[:4]).reshape(1, -1))[0]

        # Prediction with probabilities
        pred = rule_clf.predict_proba([features])  # Probabilities
    else:
        # Neural network
        input_tensor = torch.tensor(melspec2).float()
        input_features = torch.cat([input_features[0:1], input_features[2:]])
        pred = nn.Softmax(dim=1)(nn_clf(input_tensor.unsqueeze(0), input_features.unsqueeze(0))).detach().numpy()

    final_vowel = np.argmax(pred)
    final_confidence = pred[0][final_vowel]  # Best score
    final_vowel = idx2key[valid[final_vowel]]  # Actual prediction

    print('Vowel ', 'Confidence')
    print('-' * 25)
    for i in range(len(valid)):
        vowel = idx2key[valid[i]]
        print(f'{vowel:<6} {pred[0][i]:.3f}', '=' * int(pred[0][i] * 100))

    print(f'Prediction: /{final_vowel}/, confidence: {final_confidence:.3f}')

    return jsonify(predicted_vowel=final_vowel,
                   confidence=float(final_confidence),
                   feedback=vowel_feedback(des_vowel, final_vowel),
                   add_feedback=pron_hack(des_vowel, final_vowel)
                   )

@app.route('/')
def index():
    return render_template("index.html")


@app.route('/privacy.html')
def privacy():
    return render_template("privacy.html")


if __name__ == '__main__':
    app.run(debug=True)
