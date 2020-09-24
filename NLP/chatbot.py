# -*- coding: utf-8 -*-
"""vcoah

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1OJr3E2R91jqwEN-l3sYZjrAiQTfmX3Hm
"""



#@title Load the Universal Sentence Encoder's TF Hub module
# from absl import logging

import tensorflow as tf


tf.get_logger().setLevel('INFO')

import tensorflow_hub as hub
import numpy as np
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 
import csv
import pandas as pd
import re
import time
import sentencepiece as spm
from sklearn.metrics.pairwise import cosine_similarity

production = True
try:
  if os.environ['ENV'] == 'test':
    production = False
    import tensorflow.compat.v1 as tf
    tf.disable_v2_behavior()
except Exception as e:
  print(e)


if production:
  module_url = "https://tfhub.dev/google/universal-sentence-encoder-large/5" #@param ["https://tfhub.dev/google/universal-sentence-encoder/4", "https://tfhub.dev/google/universal-sentence-encoder-large/5"]
  model = hub.load(module_url)
  print ("module %s loaded" % module_url)
  def embed(input):
    return model(input)
else:
  module = hub.Module("https://tfhub.dev/google/universal-sentence-encoder-lite/1")
  input_placeholder = tf.sparse_placeholder(tf.int64, shape=[None, None])
  encodings = module(
      inputs=dict(
          values=input_placeholder.values,
          indices=input_placeholder.indices,
          dense_shape=input_placeholder.dense_shape))

  with tf.Session() as sess:
    spm_path = sess.run(module(signature="spm_path"))

  sp = spm.SentencePieceProcessor()
  sp.Load(spm_path)
  print("SentencePiece model loaded at {}.".format(spm_path))


  def process_to_IDs_in_sparse_format(sp, sentences):
    # An utility method that processes sentences with the sentence piece processor
    # 'sp' and returns the results in tf.SparseTensor-similar format:
    # (values, indices, dense_shape)
    ids = [sp.EncodeAsIds(x) for x in sentences]
    max_len = max(len(x) for x in ids)
    dense_shape=(len(ids), max_len)
    values=[item for sublist in ids for item in sublist]
    indices=[[row,col] for row in range(len(ids)) for col in range(len(ids[row]))]
    return (values, indices, dense_shape)  

  def embed(messages):

    # Reduce logging output.
    # logging.set_verbosity(logging.ERROR)

    with tf.Session() as session:
      values, indices, dense_shape = process_to_IDs_in_sparse_format(sp, messages)
    
      session.run([tf.global_variables_initializer(), tf.tables_initializer()])
      message_embeddings = session.run(
          encodings,
          feed_dict={input_placeholder.values: values,input_placeholder.indices: indices,input_placeholder.dense_shape: dense_shape})

      return message_embeddings

# time.time()

def plot_similarity(labels, features, rotation):
  corr = np.inner(features, features)
  sns.set(font_scale=1.2)
  g = sns.heatmap(
      corr,
      xticklabels=labels,
      yticklabels=labels,
      vmin=0,
      vmax=1,
      cmap="YlOrRd")
  g.set_xticklabels(labels, rotation=rotation)
  g.set_title("Semantic Textual Similarity")

def run_and_plot(messages_):
  message_embeddings_ = embed(messages_)
  plot_similarity(messages_, message_embeddings_, 90)



# flname = "vcoach.csv"
# flname = "Case_updated2.csv"
# flname = "caseupdate.csv"
flname = "case1.csv"

messages = [
  "How much have our profits declined by?",
  "What is the decline in our profits?",
  "Do we know how much our profits have decreased by?",
  "How much is the decrease in our profits?",
  "How much have profits have decreased by?",
  "What is the decrease in our profits?",

  "Does vCoach Academy makes this?",
  "Is this a chatbot?",

  "For how long has the company been experiencing this decline?",
  "Since when has the company faced this decline?",
  "Since when has the company been experiencing this decline in profits?",
  "Since when have we seen a decline in profits?",
  "For how long have we been seeing this decline?",
  "Since when have we observed a decrease in profits?",
  "Since when have we been facing this problem?"
]

# print(embed(messages))

debug = True



class Chatbot:
  def __init__(self, filename,uname,uid,simVal=6,debug=True,threshold=0.5,mode="dev"):
    self.name = filename
    self.simVal = simVal
    self.debug = debug
    self.threshold = threshold
    self.StandardStatement = "We don’t have any information on this."
    self.mode = mode
    self.base = 10
    self.prelimPenalty = 0.5
    self.prelimAdd = 0
    self.prelimAsked = -1
    self.uname = uname
    self.uuid=uid


    self.reccoPenalty = 0.5
    self.reccoNeeded = 3 # can be changed

    self.hintLocation = -1
    self.lastHint = 'Hint'

    # runing internal methods for preprocessing and data handling
    self.loadfile()
    self.analyze()
    self.optimize()
    self.embedData()

  def loadfile(self):
    self.df = pd.read_csv(self.name,header=1,engine='python')
    self.problem = open(self.name,'r',encoding='utf-8', errors='ignore')
    reader = csv.reader(self.problem)
    self.problem = [x for x in reader]
    self.problem = self.problem[0]
    self.simVal = int(self.problem[0])

  def analyze(self):
    self.problemStatement = self.problem[1]
    simAr = [ "Similar "+str(i+1) for i in range(self.simVal)]
    # @dev handle it better here if possible
    simAr = ["Question"] + simAr
    if self.debug:
      print(simAr)
    self.dfSimilar = self.df[simAr]
    self.lister = self.dfSimilar.values.tolist()
    print("Totale Question class bank prepared : ",len(self.lister))

    self.qending = [x[0] for x in self.df[["Question Ending"]].values.tolist()]

    self.answers = [x[0] for x in self.df[["Answer"]].values.tolist()]
    print("Answers added to bank")

    self.scoringInfo = self.df[["Question Importance","Question Class","Level"]]
    print("QI and QClass all set")
    
    self.prelimSection = self.df[["Question Importance","Question Class","Level","Question","Answer"]].loc[(self.df["Question Class"] < 1)]
    self.prelimImpQuesNum = self.prelimSection.loc[((self.prelimSection["Question Importance"] < 1) & (self.prelimSection["Question Importance"] > -1))].shape[0]
    self.prelimTotQuesNum = self.prelimSection.shape[0]
    self.prelimLoc = []
    index = 0
    for x in self.df["Question Class"]:
      if pd.isna(x):
        index += 1
        continue
      if x < 1 and self.df["Question Importance"][index] < 1 and self.df["Question Importance"][index] > -1:
        self.prelimLoc.append(index)
      index += 1
    print("Prelim Section all set")

    self.analyzeSection = self.df[["Question Importance","Question Class","Level","Question","Answer"]].loc[( (self.df["Question Class"] < 2) & (self.df["Question Class"] >0))]
    self.analyzeImpQuesNum = self.analyzeSection.loc[((self.analyzeSection["Question Importance"] < 1) & (self.analyzeSection["Question Importance"] > -1))].shape[0]
    self.analyzeTotQuesNum = self.analyzeSection.shape[0]
    self.analyzeLoc = []
    index = 0
    for x in self.df["Question Class"]:
      if pd.isna(x):
        index += 1
        continue
      if x < 2 and x > 0 and self.df["Question Importance"][index] < 1 and self.df["Question Importance"][index] > -1:
        self.analyzeLoc.append(index)
      index += 1
    print("Analyze Section all set")

    self.reccoSection = self.df[["Question Importance","Question Class","Level","Question","Answer"]].loc[(self.df["Question Class"] > 1)]
    self.reccoImpQuesNum = self.reccoSection.loc[((self.reccoSection["Question Importance"] < 1) & (self.reccoSection["Question Importance"] > -1))].shape[0]
    self.reccoTotQuesNum = self.reccoSection.shape[0]
    self.reccoLoc = []
    index = 0
    for x in self.df["Question Class"]:
      if pd.isna(x):
        index += 1
        continue
      if x > 1 and self.df["Question Importance"][index] < 1 and self.df["Question Importance"][index] > -1:
        self.reccoLoc.append(index)
      index += 1
    print("Analyze Section all set")

  def optimize(self):
    self.allQues = [] # list of all questions
    self.classer = {} # class -> questions map
    self.clsReg = {}  # ques -> class
    self.quesLoc = {} # ques -> id in allQues
    count=1
    for x in self.lister:
      self.classer[count] = []
      for ques in x:
        if not pd.isna(ques):
          self.classer[count].append(ques)
          self.allQues.append(ques)
          self.clsReg[ques]=count
          self.quesLoc[ques]=len(self.allQues)-1
      count +=1
    self.classNum = count-1

  def embedData(self):
    # for fast scoring
    self.allEmbeds = embed(self.allQues)

    self.embedHash = {}
    cnt = 0
    for ques in self.allQues:
      self.embedHash[ques] = self.allEmbeds[cnt]
      cnt+=1
    self.matrixMap = np.inner(self.allEmbeds,self.allEmbeds)

  def SimilarityScore(self,q1,q2):
    """
      cosine similartiy between questions using USE4/5
    """
    qEmbeddings = embed([q1,q2])

    return cosine_similarity([qEmbeddings[0]],[qEmbeddings[1]])[0][0]


  def getClass(self,ques):
    """
    Single class checker
    """
    cls=0
    score=0
    for i in range(self.classNum):
      if len(classer[i+1])!=0:
        repQues = classer[i+1][0]
        val = matrixMap[quesLoc[ques]][quesLoc[repQues]]
        if val > score:
          score = val
          cls = i+1

    return cls,score

  def simScore(self,ques):
    embedQues = embed([ques])
    emb = np.array(self.allEmbeds)
    # print(len(emb))
    # print(len(embedQues))
    emb = np.concatenate((np.array(embedQues),emb))
    mt =  np.inner(emb,emb)

    return mt[0][1:]

  def chooseBest(self,ques,predCls,predScore):
      if predCls[1] == -1:
        return predCls[0],predScore[0]

      if abs(predScore[0]-predScore[1] > 0.2):
        # gap so might not need interventions
        if predScore[0] > predScore[1]:
          return predCls[0],predScore[0]
        else:
          return predCls[1],predScore[1]

      ## additive knowledge model for now
      mergeQues1 = ""
      mergeQues2 = ""
      for x in self.classer[predCls[0]]:
        mergeQues1 += " "+x
      for x in self.classer[predCls[1]]:
        mergeQues2 += " "+x

      embedQues = embed([ques,mergeQues1,mergeQues2])
      mt = np.inner(embedQues,embedQues)
      if mt[0][1] > mt[0][2]:
        return predCls[0],predScore[0]
      else:
        return predCls[1],predScore[1]


  def getClass2(self,ques):
    clsScores = [0 for i in range(self.classNum)]
    simscores =self.simScore(ques)

    loc = 0
    for val in simscores:
      if val > clsScores[self.clsReg[self.allQues[loc]]-1]:
        clsScores[self.clsReg[self.allQues[loc]]-1] = val
      loc+=1

    # Best 2 class for tfidf or better word matching system
    # ---- this part under imporvement ---
    predCls = [-1,-1] #inital predCls
    predScore = [0,0] #intial predScores

    loc = 1
    for x in clsScores:
      if x > predScore[0]:
        if predScore[0] > predScore[1]:
          predScore[1] = predScore[0]
          predCls[1] = predCls[0]
        predScore[0] = x
        predCls[0] = loc
      elif x > predScore[1]:
        predScore[1] = x
        predCls[1] =loc
      loc +=1
    
    return self.chooseBest(ques,predCls,predScore)
  def start(self):
    """
    initialize variable and send problem statement and then use interact 
    """
    self.hasStarted = True
    self.history = []
    self.startTime = self.getTime()
    self.classChecks = [False for x in range(self.classNum)]
    self.cat = 0 #initially cat prelim
    self.blankhints = 0
    self.hints = 0

    lineBreak = "\n"
    output = [self.problemStatement]

    output.append("Special Instructions\n")
    for x in self.problem[2:]:
      if not x.strip() == "":
        output[1]+= x.strip()+ lineBreak
    return  output

  def getSectionChangeData(self,old,new):
    res = []
    self.prelimMissed = []
    if old==0:
      self.prelimAsked = 0
      for loc in self.prelimLoc:
        if not self.classChecks[loc]:
          self.prelimMissed.append(self.df["Question"][loc])
          res.append("Question : "+self.df["Question"][loc]+"\n\nAnswer : "+self.df["Answer"][loc])
        else:
          self.prelimAsked +=1
    
    return res



  def catUpdate(self,cat):
    if isinstance(cat, int):
      if cat == 0 or cat ==1 or cat == 2:
        if self.cat < cat:
          msg = self.getSectionChangeData(self.cat,cat)
          if len(msg) > 0:
            msg = ["You changed section but didn't ask this crucial information."]+msg
          if cat == 2 and len(self.reccoLoc) == 0:
            return False,["You do not need to provide recommendations in this case."]

          if cat == 1 and self.cat == 0:
            msg.append("Please state your next step in one statement.")

          if cat == 2 and self.cat == 1:
            msg.append("Please provide 3 recommendations in one line statements. Please refrain from asking questions or making irrelevant statements")

          self.cat = cat
          return True , msg
        elif self.cat == cat:
          return False, ["Already in given section."]
        else:
          return False, ["Can't return to previous section."]
      else:
        return False ,["Not 0,1 or 2"]
    else:
      return False, ["Not instance of integer"]

  def restart(self):
    self.hasStarted = False
    return self.start()

  def getTotalTime(self):
    if self.hasStarted:
      return self.getTime() - self.startTime
    else:
      return -1

  def end(self):
    if self.hasStarted:
      self.totaleTime = self.getTotalTime()
    self.hasStarted = False
    # if self.result
    self.result = self.prepareReport()
    return self.result

  def swappingScore(self):
    questionAsked = []
    questionAskedC = []
    for x in self.history:
      if int(x[2]) == 0 or int(x[2]) == 1:
        # making sure to not take orderless parts
        if int(x[3]) != 0:
          questionAsked.append([x[3],x[7],x[4]])
          questionAskedC.append([x[3],x[7],x[4]])

    questionAskedC.sort()
    if debug:
      print(questionAsked)
      print(questionAskedC)
    swaps = 0
    size = len(questionAsked)
    for i in range(size):
      for j in range(size-i-1):
        if int(questionAsked[j][0]) > int(questionAsked[j+1][0]):
          swaps += 1
          questionAsked[j],questionAsked[j+1] = questionAsked[j+1],questionAsked[j]
    print("swaps : ",swaps,"  max swaps : ",(size*(size+1))/2)
    if size > 0:
      return swaps / ((size*(size+1))/2)
    else:
      return 0


  def prepareReport(self):
    """
      calculating all different scoring metrics and stats
    """
    result = {}
    
    # prelim scoring

    result["prelimQNum"] = self.prelimImpQuesNum 
    if self.prelimAsked == -1:
      self.prelimAsked = 0
      self.prelimMissed = []
      for loc in self.prelimLoc:
        if self.classChecks[loc]:
          self.prelimAsked +=1
        else:
          self.prelimMissed.append(self.df["Question"][loc])

    result["prelimQAsk"] = self.prelimAsked
    result["prelimWrong"] = 0
    result["prelimWrongQuestions"] = []
    result["prelimSemiImp"] = 0
    result["prelimSemiImpQuestions"] = []
    result["totalQuestions"] = len(self.history)
    result["irrelevantQuestions"] = 0
    result["outoforderQuestions"] = 0
    for x in self.history:
      if int(x[0]) == 0:
        if  int(x[1]) != int(x[0]):
          result["prelimWrong"] += 1
          result["prelimWrongQuestions"].append(x[4])
        elif int(x[1]) == int(x[0]) and int(x[2])==1:
          result["prelimSemiImp"] += 1
          result["prelimSemiImpQuestions"].append(x[4])
      if int(x[1]) != int(x[0]):
        result["irrelevantQuestions"] += 1
    if result["totalQuestions"] == 0:
      result["questionScore"] = 0
    else:
      result["questionScore"] = int((1-((result["irrelevantQuestions"]+result["outoforderQuestions"])/result['totalQuestions']))*100)
    
    result["prelimMissedQuestions"] = self.prelimMissed

    result["prelimScore"] = max(self.base*(self.prelimAsked/self.prelimImpQuesNum) - self.prelimPenalty*result["prelimWrong"] + self.prelimAdd*result["prelimSemiImp"],0)
    
    # analyze section
    result["analyzeQNum"] = self.analyzeImpQuesNum
    result["analyzeQAsk"] = 0
    result["analyzeWrong"] = 0
    result["analyzeWrongQuestions"] = []
    for x in self.history:
      if int(x[0]) == 1 and int(x[1]) == 1 and int(x[2]) == 0:
        # analyze category important question at right place
        result["analyzeQAsk"] += 1
      elif int(x[0]) == 1 and int(x[1]) != 1:
        result["analyzeWrong"] += 1
        result['analyzeWrongQuestions'].append(x[4])

    result["analyzeScore"] = max(self.base*(result["analyzeQAsk"]/result["analyzeQNum"]) - self.prelimPenalty*result["analyzeWrong"], 0)

    # reccomendation
    result["reccoQNum"] =  self.reccoImpQuesNum
    result["reccoQAsk"] = 0
    result["reccoWrong"] = 0
    for x in self.history:
      if int(x[0]) == 2 and int(x[1])==2 and int(x[2])==0:
        # recco category q asked at right place and being important
        result["reccoQAsk"] += 1
      if int(x[0]) == 2 and int(x[1]) != 2:
        result["reccoWrong"] += 1
    
    result["reccoScore"] = 0
    if result["reccoQAsk"] > self.reccoNeeded :
      result["reccoScore"] = self.base
    else:
      result["reccoScore"] = self.base*(result["reccoQAsk"]/self.reccoNeeded)
    # adding penalty
    result["reccoScore"] = result["reccoScore"] - self.reccoPenalty*result["reccoWrong"]


    # others
    result["totalQues"] = len(self.history)
    result["orderScore"] = (1-self.swappingScore())*self.base
    result["hintTaken"] = self.hints
    result["usefulHint"] = self.hints - self.blankhints
    if result['totalQues'] == 0:
      result['hintScore'] = 0
    else:
      result["hintScore"] = max(0,(1-int((result["usefulHint"]/result["totalQues"]))*100))   
    result["totaleTime"] = self.totaleTime
    if len(self.history) == 0:
      result["timePerQues"] = 0
    else:
      result["timePerQues"] = int(self.totaleTime/len(self.history))
    result["idealTime"] = 20
    result["timeScore"] = 0
    result["timePerImpQues"] = 1000
    if result["analyzeQAsk"]+result["reccoQAsk"]+result["prelimQAsk"] > 0:
      result["timePerImpQues"] = result["totaleTime"]/(result["analyzeQAsk"]+result["reccoQAsk"]+result["prelimQAsk"])
    if result["timePerImpQues"] <= 1*60:
      result["timeScore"] = 100
    elif result["timePerImpQues"] >=3*60:
      result["timeScore"] = 0
    else:
      result["timeScore"] = int((3-(result["timePerImpQues"]/60))*50)
    result["totaleTime"] = int(result["totaleTime"]/60)

    lastprelimTime = -1
    firstAnalyzeTime = -1
    for x in self.history:
      if int(x[0])==0:
        lastprelimTime = x[6]
      if int(x[0])==1 and firstAnalyzeTime==-1:
        firstAnalyzeTime = x[6]
    if lastprelimTime > -1 and firstAnalyzeTime > -1:
      result["sectionSwitchTime"] = firstAnalyzeTime - lastprelimTime

    return result

  def getHint(self):
    # if case has already been ended
    if not self.hasStarted:
      return "Either problem has not been started or it has already been completed/Ended So hint is not allowed."
    if len(self.history) == self.hintLocation:
      return self.lastHint


    self.hintKey = "Question"
    res = ""
    hinttext ="Below is your hint question, please ask it in chatbox:\n\n"
    historyCopy = self.history
    self.hints +=1
    # analyze for prelim
    if self.cat == 0 :
      # check if all important question asked
      for loc in self.prelimLoc:
        if not self.classChecks[loc]:
          res = hinttext+self.df[self.hintKey][loc]
          break
      if res == "":
        self.blankhints+=1
        res = "Please move to the next section."
    # analyze for analyze     # analyze for recommendation

    elif self.cat  == 1 or self.cat == 2:
      locater = []
      if self.cat == 1:
        locater = self.analyzeLoc
      else:
        locater = self.reccoLoc

      for loc in locater:
        if not self.classChecks[loc]:
          # check if partial order present using level
          currentLevel = str(self.df["Level"][loc]).split(".")
          if currentLevel[1] == "0":
            # only entry for given level
            res = hinttext + self.df[self.hintKey][loc]
            break
          elif currentLevel[1] == "1":
            # check forward
            location = loc + 1
            prob = False
            while currentLevel[0] == str(self.df["Level"][location]).split(".")[0]:
              if self.classChecks[location]:
                prob = True
                break
              location += 1
            if not prob:
              res = hinttext+ self.df[self.hintKey][loc]
              break
          else:
            # some back ques matched so level invalidated
            continue

      if res == "" and self.cat == 1: 
        self.blankhints+=1
        res = "Please move to next section."
      elif res == "" and self.cat == 2:
        self.blankhints+=1
        res = "You have already completed this Scenario." 

    self.hintLocation = len(self.history)
    self.lastHint  =  res

    return res


  def getTime(self):
    return time.time()

  def interaction(self,ques):
    """
      history contains history of communication - (time,ques,class,level,res)
    """
    if not self.hasStarted:
      return self.hasStarted,"Either problem has not been started or it has already been completed/Ended."

    cls,score = self.getClass2(ques)
    res  = None
    qend = -1
    catReal = -1
    QI = -1
    level = -1
    if score < self.threshold:
      res = self.StandardStatement
      # cat is not as irrelevant question
      cls = -1
    else:
      res = self.answers[cls-1]
      qend = self.qending[cls-1]
      if qend == 1:
        self.totaleTime = self.getTotalTime()
        self.hasStarted = False
      catReal = self.scoringInfo["Question Class"][cls-1] 
      QI = self.scoringInfo["Question Importance"][cls-1]
      level = self.scoringInfo["Level"][cls-1]
    

    #check for repeats here
    if QI >=0:
      if self.classChecks[cls-1]:
        # it means question of this category asked again
        # changin QI and level to -1
        QI = -1
        level = -1
        cls = -1
      else:
        self.classChecks[cls-1] = True

    self.history.append([self.cat,catReal,QI,level,ques,res,self.getTotalTime(),cls-1])

    return self.hasStarted,res

  def sampleHead(self):
    print("DF head")
    print(self.df.head())

# flname



# # str(cb.df["Level"][25]).split(".")

# cb = Chatbot(flname)

# # cb.df[["Question Importance","Question Class","Level"]].iloc(0)
# # str(cb.df["Question Importance"][2])



# # cb.prelimLoc

# print(cb.start())

# cb.interaction("How much is the decline in profits?")

# cb.interaction("since when has the client facing this issue?")

# cb.interaction("what exactly are the sweets?")

# cb.interaction("Where else does the client lie in the value chain ?")

# cb.getHint()

# cb.interaction("where does the client operate from?")

# cb.interaction("what is the geography of sales?")

# cb.getHint()

# cb.interaction("How much have the client's profits declined by?")



# cb.catUpdate(1)

# cb.catUpdate(0)

# cb.interaction("I think we should split the client profits into revenue and cost.")

# cb.interaction("Have we seen any change in revenue or cost?")

# cb.interaction("Has the number of units sold decreased?")

# cb.interaction("I would like to benchmark client's toffee with other competitors?")

# cb.interaction("Is there any particular segment which has seen a decline in sales?")

# cb.getHint()

# cb.interaction("I would like to break this down into internal and external factors.")

# cb.getHint()

# cb.interaction("Is there any distribution issue?")

# cb.interaction("Is there any reduction in consumer demand?")

# cb.interaction("Are the pan shops not pushing our toffess?")

# cb.interaction("Are clients toffess less accessible than others")



# cb.end()

# run_and_plot(cb.allQues[137:])



