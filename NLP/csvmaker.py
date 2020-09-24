import json
import pandas as pd
import csv
# fl = open('data.json').readlines()
# print(fl)
# dataDict = json.load(fl)

def opencsv():
	fl = open('data.csv','w')
	writer = csv.writer(fl, delimiter=",")
	return writer

def createCSV(fl,data,mode=1):
	if mode == 1:
		fl.writerow(data)
	if mode == 2:
		fl.writerows(data)
	return

with open('data.json') as f:
  dataDict = json.load(f)

# print(dataDict['data'])
# iterate over data
fl = opencsv()
for x in dataDict['data']:
	cid = x['cid']
	createdOn=x['createdAt']
	problem=x['problem']
	createCSV(fl,[cid,createdOn,problem,"question","answer","time"],mode=1)
	data= []
	for y in json.loads(x['chat'])['chat']:
		# print
		data.append(["","","",y[4],y[5],y[6]])
	createCSV(fl,data,mode=2)
	#results
	result = json.loads(x['result'])['result']
	data = []
	for i in result:
		data.append(["","",i,result[i]])
	# createCSV(fl,["","","result",result],mode=1)
	createCSV(fl,data,mode=2)

	createCSV(fl,[[],[],[]],mode=2)


# create dataframe
# df = pd.json_normalize(dataDict['data'])

# save to csv
# df.to_csv('test.csv', index=False, encoding='utf-8')

# createCSV(dataDict)