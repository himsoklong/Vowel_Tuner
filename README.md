# Vowel Tuner
This is the respository for the 2022-2023 Software Project (UE905 EC1) at IDMC (Nancy), under the supervision of Ajinkya KULKARNI, Esteban Marquer and Prof. Miguel Couceiro. The main objective of this project is building an application to help French learners to improve thier pronunciation. 

### Team members
This project involved four students in the second year of the Master's degree in Natural Language Processing:
- Soklong HIM
- Nora LINDVALL
- Maxime MÉLOUX
- Jorge VASQUEZ-MERCADO

## Abstract
In this project, we aim to create a tool that can help learners of French to improve their pronunciation
of French vowels. This was done by creating an application that allows users to record vowels. A
classifier then determines whether the vowel is pronounced correctly or not. If the pronunciation
is incorrect, the user is provided with personalized feedback. In order to find a good classifier, we
implemented two approaches: a linguistic one, based on formant extraction, and a deep learning one,
based on mel-spectrograms and using a convolutional neural network architecture. After initially
testing both models on the All Vowels corpus, consisting of 5,755 vowels, we built a web application
and tested it in real-life conditions. The linguistic model proved more robust to real-life recording
conditions and achieved good performance in most cases.

## Repository structure
- [`README.md`](README.md): this file contains important information for our project (you are here!).
- [`Articles`](Articles): this folder contain all the research papers we used for the literature review at the start of the project.
- [`Code`](Code): this folder contains the Python code we used for our experiments and web application, in the form of Jupyter notebooks. In order of use:
    - [`examples`](Code/examples) contains sample recordings.
    
    The following are auxillary/working files:
    - [`vowel_plot.ipynb`](Code/vowel_plot.ipynb) generates plots of vowels in formant space in our informal corpus.
    - [`extract_formant.ipynb`](Code/extract_formant.ipynb) extracts formants from a given audio file.
    - [`Formant_vowel_prediction.ipynb`](Code/Formant_vowel_prediction.ipynb) predicts a vowel from a set of formants, using reference formant values
    - [`vowel_feedback_function.ipynb`](Code/vowel_feedback_function.ipynb) generates feedback based on a perceived vs desired vowel.
    - [`Audio_Spectrogram.ipynb`](Code/Audio_Spectrogram.ipynb) generates standard and mel-spectrograms from a given input file.
    
    The following are the full implementation of our models:
    - [`linguistic_model_reference_formants.ipynb`](Code/linguistic_model_reference_formants.ipynb) implements the first full prediction model using reference formants. This approach was later abandoned.
    - [`all_vowel_extract.ipynb`](Code/all_vowel_extract.ipynb) extracts full words or vowels from the input dataset and stores them into individual files. Information about the vowel's quality, position and speaker are encoded into the file name.
    - [`generate_mel_spectrograms.ipynb`](Code/generate_mel_spectrograms.ipynb) generates all mel-spectrogram images from a given dataset.
    - [`audio_crop.ipynb`](Code/audio_crop.ipynb) contains the implementation of the neural vowel extractor, which takes as input the full recording of a word (with possible leading/trailing silence) and outputs a cropped vowel only.
    - [`linguistic_model.ipynb`](Code/linguistic_model.ipynb) implements the final formant-based classifiers, and compares their results.
    - [`neural_network.ipynb`](Code/neural_network.ipynb) implements the final neural-based classifier, and displays its results.
    - [`Demo.ipynb`](Code/Demo.ipynb) combines all the elements above to get a vowel prediction from a full recording based on the chosen model.
    - [`results_exploration.ipynb`](Code/results_exploration.ipynb) generates quantitative data from the results of the final experimental setup.
    
- [`Flask_VT`](Flask_VT): this folder is for our web application. It contains Python and JavaScript code for the web application. In particular:
    - [`models`](Flask_VT/models) contains the model files (same as in [`models`](models))
    - [`static`](Flask_VT/static) contains the front-end part of the application, such as `app.js` (final application) and `app_eval.js` (application module)
    - [`templates`](Flask_VT/templates) contains the HTML pages of the application, such as `index.html` (final interface), `eval.html` (application module) and `privacy.html` (Privacy policy)
    - [`app.py`](Flask_VT/app.py) and [`app_eval.py`](Flask_VT/app_eval.py) contain the Python code for the final application, based on `Code\Demo.ipynb`
- [`models`](models): This folder contains the binary files for our 2 main models, the neural network and linguistic models. The linguistic model is not included due to size limitations, but can be re-trained and saved using `Code\linguistic_model.ipynb`
- [`presentation`](presentations): In this folder are all the slides we presented during regular class sessions.
- [`report`](report): this folder contains our final report. If you want to check it on Overleaf. please click [here](https://www.overleaf.com/read/xqkbxvckrjmb)
- [`requirements.txt`](requirements.txt): this file contains all the libraries needed in order to run our code, including the web application.
- [`Demo.mp4`](Demo.mp4): this is a short video demo about our web application, based on our model.


## Install instructions
1. Clone our repository :
```sh
git clone https://github.com/himsoklong/Vowel_Tuner.git
```
2. In other to run our code, including in [Code](Code) or our Web app. we would recommend using a virtual environment. This can be done by following the instructions from the [Python website](https://packaging.python.org/en/latest/guides/installing-using-pip-and-virtual-environments/)
3. Go into the project folder and install the needed packages with:
```sh
pip install -r requirements.txt
```
4. Since the linguistic model is not small, you can either re-train it or download the pre-trained model from [here](https://drive.google.com/file/d/1nBFxNZoF8leMtTDfmYM7-CxfD_1kwddB/view?usp=share_link). After that, move the downloaded file to the [model](models) directory for notebooks, and to the [Flask_VT/models](Flask_VT/models) directory for the web application
.
## Usage
1. To see our development process, you can check our code in the `Code` directory.
You can run them from the terminal:
```sh
jupyter notebook
```

2. You also run our web application to try our model by going to [Flask_VT](Flask_VT) and typing the following command in your terminal:
```sh
flask run
```


## Dataset information
This project mostly uses the All Vowels dataset, a private dataset recorded at [LORIA](https://www.loria.fr/fr/).

This section contains additional corpora recorded from French speakers, for informative purposes. If you want to get access to them, please contact the owners.
### L1:
1. [CFPP2000: Parisian French corpus](https://cocoon.huma-num.fr/exist/crdo/meta/cocoon-8bc96a4e-9899-30e4-99be-c72d216eb38b)
2. [MPF: Multicultural Parisian French corpus](https://www.ortolang.fr/market/corpora/mpf/)
3. [CFPQ: Québec French corpus](https://applis.flsh.usherbrooke.ca/cfpq/)
4. Rhapsodie: Spoken French, annotated for prosody and syntax

### L2:
1. [The Dresden Corpus: 32 German children learning French](https://slabank.talkbank.org/access/French/Dresden.html)
2. [FLLOC: Dutch and English native speakers (teenagers) learning French](https://ota.bodleian.ox.ac.uk/repository/xmlui/handle/20.500.12024/2495)
3. [The Newcastle Corpus: British high schoolers learning French](https://slabank.talkbank.org/access/French/Newcastle.html)
4. [TCD Corpus: 5 L2 French children from different countries](https://slabank.talkbank.org/access/French/TCD.html)
5. [The Reading Corpus: 16-year-old Welsh pupils learning French](https://slabank.talkbank.org/access/French/Reading.html)
6. [PAROLE: 40 L2 French students from different countries](https://slabank.talkbank.org/access/English/PAROLE.html)

### Other:
1. [librivox](https://librivox.org/search?primary_key=2&search_category=language&search_page=1&search_form=get_results)
