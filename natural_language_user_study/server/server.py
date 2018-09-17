from flask import Flask, jsonify, request

import oneToOnePractice as OneToOnePractice
import oneToOneSetOne as OneToOneSetOne
import oneToOneSetTwo as OneToOneSetTwo

app = Flask(__name__, static_folder='../static', static_url_path="")

@app.route("/")
def root():
    return app.send_static_file("index.html")

@app.route("/trainClassifier/", methods=["POST"])
def trainClassifier():
    global classifierName

    data = request.get_json()
    classifierName = data["classifierName"]

    if classifierName == "oneToOnePractice":
        OneToOnePractice.initTokenChecker()
        OneToOnePractice.trainClassifier()
    if classifierName == "oneToOneSetOne":
        OneToOneSetOne.initTokenChecker()
        OneToOneSetOne.trainClassifier()
    if classifierName == "oneToOneSetTwo":
        OneToOneSetTwo.initTokenChecker()
        OneToOneSetTwo.trainClassifier()

    return "success"

@app.route("/classify/")
def getValueList():
    sentence = request.args["sentence"]
    predictedQuestion = None
    predictedProb = None
    hasAllRequiredTokens = None
    result = {}

    # classify the question
    if classifierName == "oneToOnePractice":
        [ predictedQuestion, predictedProb ] = OneToOnePractice.classify(sentence)
        [ hasAllRequiredTokens, rulesMissed ] = OneToOnePractice.checkIfContainsAllRequiredTokens(predictedQuestion, sentence)
    if classifierName == "oneToOneSetOne":
        [ predictedQuestion, predictedProb ] = OneToOneSetOne.classify(sentence)
        [ hasAllRequiredTokens, rulesMissed ] = OneToOneSetOne.checkIfContainsAllRequiredTokens(predictedQuestion, sentence)
    if classifierName == "oneToOneSetTwo":
        [ predictedQuestion, predictedProb ] = OneToOneSetTwo.classify(sentence)
        [ hasAllRequiredTokens, rulesMissed ] = OneToOneSetTwo.checkIfContainsAllRequiredTokens(predictedQuestion, sentence)

    # return results
    result["predictedQuestion"] = predictedQuestion
    result["predictedProb"] = predictedProb
    result["hasAllRequiredTokens"] = hasAllRequiredTokens
    result["rulesMissed"] = rulesMissed

    return jsonify(result)

if __name__ == "__main__":
    app.run()