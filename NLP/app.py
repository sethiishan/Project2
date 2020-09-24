# from keras import backend as K
# K.clear_session()

from chatbot import Chatbot

import urllib.request
import os
import shutil
import os.path
from flask import Flask,request,jsonify


app = Flask(__name__)

@app.route("/hello")
def hello():
	return "Hello World!"

users= {}
userToProblem= {}
problem = ["case1.csv","case2.csv","case3.csv"]

@app.route('/get-user', methods=["POST"])
def get_user():
	try:
		user_id = request.form['user_id']
		link = request.form['link']
		print('Beginning file download with urllib2...')

		# url = 'http://i3.ytimg.com/vi/J---aiyznGQ/mqdefault.jpg'
		# urllib.request.urlretrieve(link,str(user_id)+".csv")
		# urllib.request.urlretrieve(link,str(user_id)+".zip")

		# urllib.request.urlretrieve(link,str(user_id)+'.zip')
		# zip_ref = zipfile.ZipFile(str(user_id)+'.zip', 'r')
		# if os.path.exists(str(user_id)):
		#     shutil.rmtree(str(user_id))

		# zip_ref.extractall(str(user_id))
		# zip_ref.close()

		# print(user_id)


		# return jsonify({'status': '200 OK'})
		return jsonify({'score': score, 'status': '200'})
	except Exception as e:
		print(e)
		return jsonify({'status': '404'})

def interaction(uid,msg):
	status,response = users[uid].interaction(msg)
	if status:
		return jsonify({'status': '200',"message":[response]})
	else:
		return jsonify({'status': '504',"message":[response]})

def getHint(uid):
	hint = users[uid].getHint()
	return jsonify({'status': '200',"message":[hint]})

def gettime(uid):
	time = users[uid].getTotalTime()
	if time < 0:
		return jsonify({'status': '501','message':'not solving any problem'})
	else:
		return jsonify({'status': '200',"message":time})

def cat_update(uid, message):
	print(message)
	status,msg = users[uid].catUpdate(message)
	if status:
		return jsonify({'status':'200',"message":msg})
	else:
		return jsonify({'status':'502','message':msg})

def resetProblem(uid):
	try:
		msg = users[uid].restart()
		return jsonify({'status': '200','message':msg})
	except Exception as e:
		return jsonify({'status': '503','message':[e]})

def endproblem(uid):
	result = users[uid].end()
	chat = users[uid].history
	problem = users[uid].problemStatement
	return jsonify({'status':'200','message':{'result':result,'chat':chat,'problem':problem}})

def saveToDB(uid,msg):
	problem = users[uid].problemStatement
	chat = users[uid].history
	result = users[uid].end()
	uname = users[uid].uname
	uuid= users[uid].uuid
	if msg:
		print("user ",uid," popped from user list")
		users.pop(uid)
	return jsonify({'status': '200','chat':chat,'result':result,'problem':problem,'uname':uname,'uuid':uuid})

@app.route('/userconvo', methods=["POST"])
def userConversation():
	# print(request.get_json())
	json = request.get_json()
	user_id = ""
	msg = ""
	mode = -2
	# try:
	user_id = json['user_id']
	msg = json['message']
	mode = json['mode']
	# except Exception as e:
	# 	print(e)

	# return jsonify({'status':'200'})
	print(user_id)
	print(msg)
	if user_id in users:
		print("if true")
		if mode == -1:
			msg=str(msg)			
			msgx=msg.split("-")
			if msgi == userToProblem[user_id]:
				return resetProblem(user_id)
			else:
				users[user_id] = Chatbot(problem[msgi-1],msgx[1],msgx[2])
				userToProblem[user_id] = msgi
				# print("here---")
				response  = users[user_id].start()
				# print("start :: "+response)
				return jsonify({'status':'200','message':response})

		elif mode == 0:
			return interaction(user_id, msg)
		elif mode == 1:
			return getHint(user_id)
		elif mode == 2:
			return gettime(user_id)
		elif mode == 3:
			return cat_update(user_id,msg)
		elif mode == 4:
			return endproblem(user_id)
		elif mode == 5:
			# connection lost save and return
			return saveToDB(user_id,msg)
		else:
			return jsonify({'status': '500','message':'mode of communication error'})

	else:
		print("found in else")

		# return None
		if mode == -1:
			# response = "fdsfs"
			msg=str(msg)			
			msgx=msg.split("-")
			print(msgx)
			msgi = int(msgx[0])
			users[user_id] = Chatbot(problem[msgi-1],msgx[1],msgx[2])
			userToProblem[user_id] = msgi
			# print("here---")
			response  = users[user_id].start()
			# print("start :: "+response)
			return jsonify({'status':'200','message':response})
		else:
			return jsonify({'status':'500','message':['Please click on begin/reset problem']})

# @app.route('/user', methods=["GET"])
# def start():
# 	cb =Chatbot(problem)
# 	response = cb.start()
# 	return jsonify({'status':'200','message':response})


# def checker(mode,user_id):
# 	if mode == -1:
# 		users[user_id] = Chatbot(problem)
# 		response  = users[user_id].start()
# 		print(response)
# 		return response


if __name__ == '__main__':


	app.run(host= '0.0.0.0',debug=True,port=4000,threaded=False)

