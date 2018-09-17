from sklearn.feature_extraction.text import CountVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
import pandas as pd
import editdistance

from globalVariables import *

def initTokenChecker():
    global requiredTokens

    requiredTokens = {
        'Q1': [
            { 'rule': 'Origin=USA', 'tokens': [ 'US', 'U.S.', 'United States', 'amer' ] },
            { 'rule': 'Origin=Japan', 'tokens': [ 'Japan' ] },
            { 'rule': '50<=Horsepower<=230', 'tokens': [ 'horsepower' ] },
            { 'rule': 'Acceleration', 'tokens': [ 'acceleration' ] },
        ],
        'Q2': [
            { 'rule': 'Origin=Japan', 'tokens': [ 'Japan' ] },
            { 'rule': 'Origin=USA', 'tokens': [ 'US', 'U.S.', 'United States', 'amer' ] },
            { 'rule': 'Origin=Europe', 'tokens': [ 'Europe' ] },
        ],
        'Q3': [
            { 'rule': '4000<=Weight<=5140', 'tokens': [ '4', 'four' ] },
            { 'rule': '1613<=Weight<=2000', 'tokens': ['2', 'two'] },
            { 'rule': 'Name=Buick Skylark 320', 'tokens': [ 'Buick', 'Skylark' ] }
        ]
    }

def trainClassifier():
    global classifier
    global vectorizer
    global path

    # read data
    path = "../trainingSet/oneToOnePractice.csv"
    sentences = pd.read_csv(path, header=0, names=['label', 'sentence'])

    # convert label to a numerical variable
    sentences['label_num'] = sentences.label.map({'Q1': 1, 'Q2': 2, 'Q3': 3})

    # define X and y
    X = sentences.sentence
    y = sentences.label_num

    # vcectorize data
    vectorizer = CountVectorizer()
    vectorizer.fit(X)
    X_DTM = vectorizer.transform(X)

    # train a model
    classifier = LogisticRegression()
    classifier.fit(X_DTM, y)

def classify(sentence):
    # predict
    newExample_DTM = vectorizer.transform([ sentence ])
    predictedClass = classifier.predict(newExample_DTM)
    predictedProb = classifier.predict_proba(newExample_DTM)[0][predictedClass - 1][0]
    predictedQuestion = None

    # convert prediction to string
    if predictedClass == 1:
        predictedQuestion = 'Q1'
    if predictedClass == 2:
        predictedQuestion = 'Q2'
    if predictedClass == 3:
        predictedQuestion = 'Q3'

    return [ predictedQuestion, predictedProb ]

def checkIfContainsAllRequiredTokens(questionType, sentence):
    lowerCaseSentence = sentence.lower()
    sentenceLength = len(sentence)
    hasAllRequiredTokens = True
    rulesMissed = []

    for tokenListObject in requiredTokens[questionType]:
        containAnyOneTokenInTheList = False
        currentRule = tokenListObject['rule']
        tokenList = tokenListObject['tokens']

        for token in tokenList:
            lowerCaseToken = token.lower()
            tokenLength = len(lowerCaseToken)

            if tokenLength < 5:
                if lowerCaseToken in lowerCaseSentence:
                    containAnyOneTokenInTheList = True

            elif tokenLength >= 5:
                for i in range(0, sentenceLength - tokenLength + 1):
                    subSentence = lowerCaseSentence[i:i + tokenLength]
                    editDistance = editdistance.eval(lowerCaseToken, subSentence)

                    if editDistance <= 2:
                        containAnyOneTokenInTheList = True
                        break

            if containAnyOneTokenInTheList:
                break

        if not containAnyOneTokenInTheList:
            hasAllRequiredTokens = False

            if currentRule not in rulesMissed:
                rulesMissed.append(currentRule)

    return [ hasAllRequiredTokens, rulesMissed ]