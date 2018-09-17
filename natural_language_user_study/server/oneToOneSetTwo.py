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
            { 'rule': 'Locale=Remote Rural', 'tokens': [ 'remote' ] },
            { 'rule': 'Locale=Distant Rural', 'tokens': [ 'distant' ] },
            { 'rule': 'Completion Rate', 'tokens': [ 'complet' ] }
        ],
        'Q2': [
            { 'rule': 'Region=Great Lakes', 'tokens': [ 'great lakes' ] },
            { 'rule': '23<=Average Age of Entry<=34.06999969', 'tokens': [ 'age', 'entry', 'enter', 'year' ] },
            { 'rule': 'Region=Far West', 'tokens': [ 'far west' ] },
            { 'rule': 'Expenditure Per Student', 'tokens': [ 'expenditure', 'spend' ] },
        ],
        'Q3': [
            { 'rule': 'Control=Private', 'tokens': [ 'private' ] },
            { 'rule': '0.1119<=Completion Rate<=0.5', 'tokens': [ 'complet' ] },
            { 'rule': 'Region = Outlying Areas', 'tokens': [ 'outlying' ] },
            { 'rule': 'Control=Public', 'tokens': [ 'public' ] },
            { 'rule': '% Full-time Faculty', 'tokens': [ 'full' ] },
            { 'rule': 'Poverty Rate', 'tokens': [ 'poverty', 'poor' ] }
        ],
        'Q4': [
            { 'rule': 'Region=Southeast', 'tokens': [ 'southeast' ] },
            { 'rule': 'Locale=Large City', 'tokens': [ 'large' ] },
            { 'rule': '0.2<=% Part-time Undergrads<=0.8799', 'tokens': [ 'great', '>', 'large', 'high', 'more', 'big', 'above', 'up' ] },
            { 'rule': 'Name=Georgia State University', 'tokens': [ 'georgia' ] },
            { 'rule': 'Region=Far West', 'tokens': [ 'far west' ] },
            { 'rule': 'Locale=Small City', 'tokens': [ 'small' ] },
            { 'rule': '0.0003<=% Part-time Undergrads<=0.2', 'tokens': [ 'les', 'small', 'few', '<', 'low', 'below' ] },
            { 'rule': 'Name=Oregon State University', 'tokens': [ 'oregon' ] },
            { 'rule': 'Median Family Income', 'tokens': [ 'family', 'income' ] },
            { 'rule': 'Poverty Rate', 'tokens': [ 'poverty', 'poor' ] }
        ]
    }

def trainClassifier():
    global classifier
    global vectorizer
    global path

    # read data
    path = "../trainingSet/oneToOneSetTwo.csv"
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