from flask import Flask, render_template, request, jsonify
from joblib import load
import math
import numpy as np
import wave
import contextlib
from processing import extract_formant
from feedback import vowel_feedback, pron_hack

app = Flask(__name__)


@app.route('/upload', methods=[ 'POST'])
def upload():
    f = open("file.wav", 'wb')
    f.write(request.data)
    f.close()
    return jsonify(message='Bon Week-end')




@app.route('/')
def index():
    return render_template("index.html")

clf = load('models/rule_based.joblib') # The classifier
scaler = load('models/scaler.joblib') # The scaler, transforms formants so that they have a mean of 0 and a variance of 1

input_file = 'uploads/I.wav'
target_vowel = 'y' # Possible values: 'a', 'e', 'E', 'i', 'o', 'O', 'u', 'y', '2', '9'
speaker_gender = 'm' # Possible values: 'f' or 'm'
previous_phoneme = 'm' # Possible values: 'l', 'm', 'p', 's', 't' or 't1' (last one shouldn't be used)

@app.route('/predict_rule', methods=['GET'])
def predict_rule():
    idx2key = ['2', '9', 'a', 'a~', 'e', 'E', 'i', 'O', 'o', 'o~', 'u', 'U~+', 'y']  # All possible vowels
    valid = [0, 1, 2, 4, 5, 6, 7, 8, 10, 12]  # Vowels we consider here (depends on the classifier)

    with contextlib.closing(wave.open(input_file, 'r')) as f:  # Open file
        frames = f.getnframes()
        rate = f.getframerate()
        duration = frames / float(rate)

        # Extract formants
        try:
            formants = extract_formant(input_file, start_time=0, end_time=duration,
                                       f0min=math.ceil(3 / duration + 0.000001), n_formants=4)
        except ZeroDivisionError:
            print('The file is too short to analyze!')

        # Add additional features (gender, previous phoneme)
        features = formants
        features.append(speaker_gender == 'f')
        for prev in 'lmpst':
            features.append(previous_phoneme == prev)
        features.append(previous_phoneme == 't1')

        # Rescale formants
        features[:4] = scaler.transform(np.array(features[:4]).reshape(1, -1))[0]

        # Prediction with probabilities
        pred = clf.predict_proba([features])  # Probabilities
        final_vowel = np.argmax(pred)
        final_confidence = pred[0][final_vowel]  # Best score
        final_vowel = idx2key[valid[final_vowel]]  # Actual prediction

        print('Vowel ', 'Confidence')
        print('-' * 25)
        for i in range(len(valid)):
            vowel = idx2key[valid[i]]
            print(f'{vowel:<6} {pred[0][i]:.3f}', '=' * int(pred[0][i] * 100))

        print(f'Prediction: /{final_vowel}/, confidence: {final_confidence:.3f}')

        n_feedback, r_feedback, o_feedback, f_feedback = vowel_feedback(target_vowel,final_vowel)
        fb = [n_feedback, r_feedback, o_feedback, f_feedback]
        print(fb)

        ph = pron_hack(target_vowel,final_vowel)
        print(ph)
    return render_template("old_index.html", final_vowel=final_vowel, final_confidence=final_confidence, fb=fb, ph=ph)


def rule_base(input_file,target_vowel,speaker_gender,previous_phoneme):
    pass


if __name__ == '__main__':
    app.run(debug=True)
