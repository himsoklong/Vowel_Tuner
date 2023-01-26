# Vowel_Tuner
This is the respository for the 2022-2023 Software Project (UE905 EC1) at IDMC (Nancy), under the supervision of Ajinkya KULKARNI, Esteban Marquer and Prof. Miguel Couceiro. The main objective of this project is building an application to help French learners to improve thier pronunciation. 

##Team member
In this project involed by four students in M2 NLP:
- Soklong HIM
- Nora LINDVALL
- Maxime MÉLOUX
- Jorge VASQUEZ-MERCADO

## Abstract


## Repository structure
- [`README.md`](README.md): this file contain all important information for our project.
- [Articles](Articles): this folder contain all research paper which we used for literature review before we starting the project.
- [Code](Code): this foler contain all python code which we used for our experiment and web application.
- [Flask_VT](Flask_VT): this folder is for our web application. it contain python and javascript code for web app.
- [models](models): this folder contain 2 main models which are neural network and rule-based model.
- [presentation](presentations): In this folder, there are all our slide which we presented every session.
- [report](report): this folder, it contain our final report. if you want to check on report on overleaf. please click [here](https://www.overleaf.com/read/xqkbxvckrjmb)
- [requirements.txt](requirements.txt): this file contain all library you need to install in other to run our code even the web application.
- [Demo.mp4](Demo.mp4): this is a short video demo about our web application which based on our model.

## Dataset
Since we train our model based on corpus which we record form French native speakers. If you want to get access to dataset. please contact the owner.
### L1:
1. [CFPP2000: Parisian French corpus](https://cocoon.huma-num.fr/exist/crdo/meta/cocoon-8bc96a4e-9899-30e4-99be-c72d216eb38b) (done)
2. [MPF: Multicultural Parisian French corpus](https://www.ortolang.fr/market/corpora/mpf/) (need request)
3. [CFPQ: Québec French corpus](https://applis.flsh.usherbrooke.ca/cfpq/) (not found)
4. [Rhapsodie: Spoken French, annotated for prosody and syntax]()

### L2:
1. [The Dresden Corpus: 32 German children learning French](https://slabank.talkbank.org/access/French/Dresden.html) (can download but need to request)
2. [FLLOC: Dutch and English native speakers (teenagers) learning French](https://ota.bodleian.ox.ac.uk/repository/xmlui/handle/20.500.12024/2495) (so small need to check again)
3. [The Newcastle Corpus: British high schoolers learning French](https://slabank.talkbank.org/access/French/Newcastle.html) (can download but need to request)
4. [TCD Corpus: 5 L2 French children from different countries](https://slabank.talkbank.org/access/French/TCD.html) (can download but need to request)
5. [The Reading Corpus: 16-year-old Welsh pupils learning French](https://slabank.talkbank.org/access/French/Reading.html) (can download but need to request)
6. [PAROLE: 40 L2 French students from different countries](https://slabank.talkbank.org/access/English/PAROLE.html) (can download but need to request)

### Other (not yet discuss:
1. [librivox](https://librivox.org/search?primary_key=2&search_category=language&search_page=1&search_form=get_results) (audio book)
## Install instructions
1. Clone our repository :
```sh
git clone https://github.com/himsoklong/Vowel_Tuner.git
```
2. In other to run our code even in [Code](Code) or our Web app. we would recommend to using vitual environment. we can create python environment and activate it by following instruction from this [Python website](https://packaging.python.org/en/latest/guides/installing-using-pip-and-virtual-environments/)
3. Go into the project folder and install the needed packages with:
```sh
pip install -r requirements.txt
```
4. Since the rule-based model is not small. Please download the model from this here. [Rule-Based Model](https:example.com). after that pass the model into [model](models) directory and for web app, pass into [models](Flask_VT/models) directory.
## How to use
1. if you want to see our experiment please check our code in Code directory. with our ipynb file.
you can run the from the terminal:
```sh
jupyter notebook
```

2. You also run our web app to try our model by going to [Flask_VT](Flask_VT) and run the below command in your terminal:
```sh
flask run
```
