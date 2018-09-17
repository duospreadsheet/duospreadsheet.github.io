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
            { 'rule': 'Region=New England', 'tokens': [ 'new england' ] },
            { 'rule': 'Region=Southeast', 'tokens': [ 'southeast', 'east' ] },
            { 'rule': 'Average Cost', 'tokens': [ 'cost' ] }
        ],
        'Q2': [
            { 'rule': 'Control=Private', 'tokens': [ 'private' ] },
            { 'rule': '16277.49<=Average Family Income<=35000', 'tokens': [ '3', 'three', 'thir' ] },
            { 'rule': '90000<=Average Family Income<=134101.78', 'tokens': [ '9', 'nin' ] },
            { 'rule': 'Control=Public', 'tokens': [ 'public' ] },
            { 'rule': 'Average Faculty Salary', 'tokens': [ 'salary', 'faculty' ] },
        ],
        'Q3': [
            { 'rule': 'Locale=Large City', 'tokens': [ 'large' ] },
            { 'rule': '0.8<=Admission Rate<=1', 'tokens': [ 'admission', 'admi' ] },
            { 'rule': 'Control=Private', 'tokens': [ 'private' ] },
            { 'rule': 'Locale=Small City', 'tokens': [ 'small' ] },
            { 'rule': 'Expenditure Per Student', 'tokens': [ 'expenditure', 'spend' ] },
            { 'rule': 'Average Cost', 'tokens': [ 'cost' ] }
        ],
        'Q4': [
            { 'rule': 'Control=Private', 'tokens': [ 'private' ] },
            { 'rule': 'Region=New England', 'tokens': [ 'new england' ] },
            { 'rule': '0.1423<=% Full-time Faculty<=0.5', 'tokens': [ '5' ] },
            { 'rule': 'Name=Albany State University', 'tokens': [ 'albany' ] },
            { 'rule': 'Control=Public', 'tokens': [ 'public' ] },
            { 'rule': 'Region=Southeast', 'tokens': [ 'southeast', 'east' ] },
            { 'rule': '0.8<=% Full-time Faculty<=1', 'tokens': [ '8' ] },
            { 'rule': 'Name=Georgia Institute of Technology', 'tokens': [ 'georgia' ] },
            { 'rule': 'Undergrad Population', 'tokens': [ 'undergrad' ] },
            { 'rule': 'Average Age of Entry', 'tokens': [ 'age' ] }
        ]
    }

def trainClassifier():
    global classifier
    global vectorizer
    global path

    # read data
    path = "../trainingSet/oneToOneSetOne.csv"
    sentences = pd.read_csv(path, header=0, names=['label', 'sentence'])

    # convert label to a numerical variable
    sentences['label_num'] = sentences.label.map({'Q1': 1, 'Q2': 2, 'Q3': 3, 'Q4': 4})

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
    if predictedClass == 4:
        predictedQuestion = 'Q4'

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