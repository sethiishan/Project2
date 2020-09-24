var closePopup = document.getElementById("popupclose");
var overlay = document.getElementById("overlay");
var popup = document.getElementById("popup");
var button = document.getElementById("button");
var reportdiv = document.getElementById("report")



if (x){
	console.log(x);
	var ctr=0;
	var txt='<table class="table table-dark table-hover table-bordered" style="table-layout: fixed;"><tbody>';
	for (i in x){
		console.log(i);
		txt+='<tr><th scope="row">'+x[i].time+'</th><td><button class="btn btn-primary" onclick="report('+i+')">Get Report</button></td></tr>'
	}
	txt+='</tbody></table>'
	document.getElementById("allrepo").innerHTML=txt;
                            
}


closePopup.onclick = function() {
        overlay.className = '';
        popup.className = '';
};

function report(idx) {
  // show popup
  var mesg = x[idx];
  var msg={
  	'result': mesg['result']['result'],
  	'chat' : mesg['chat']['chat'],
  	'problem' : mesg['prob']
  }
  console.log(msg);
  data=msg['result'];
  overlay.className = 'show';
  popup.className = 'show';
  
  var prelimWrongQuestions = ''
  var analyzeWrongQuestions = ''
  var prelimMissedQuestions = ''

  for(var i=0;i<data.prelimWrongQuestions.length;i++)
  {
    prelimWrongQuestions += `<li>`+data.prelimWrongQuestions[i]+`</li>`
  }
  for(var i=0;i<data.prelimMissedQuestions.length;i++)
  {
    prelimMissedQuestions += `<li>`+data.prelimMissedQuestions[i]+`</li>`
  }
 for(var i=0;i<data.analyzeWrongQuestions.length;i++)
  {
    analyzeWrongQuestions += `<li>`+data.analyzeWrongQuestions[i]+`</li>`
  }

  if(prelimMissedQuestions == '')
    prelimMissedQuestions = 'No Question Found'
  if(prelimWrongQuestions == '')
    prelimWrongQuestions = 'No Question Found'
  if(analyzeWrongQuestions == '')
    analyzeWrongQuestions = 'No Question Found'

  var recosection = ''

  if(data.reccoQNum > 0)
  {
    recosection += `
    <li><h3 class="sectionhead" style="text-align: center;"> Recommendation </h3><br>
    <table>
    <tr><th><h4 class="sectionsc"> Coverage :</h4></th><th><h4 class="sectionsc">`+data.reccoScore+`</h4></th></tr>
    </table></li>`
  }  

  reportdiv.innerHTML =`<ul><li><table>
  <tr><th class="tabhead"><h3 class="sectionhead">Time Score</h3></th><th><h3>`+data.timeScore+`%</h3></th></tr>
  <tr><th class="tabhead"><h4> Total time taken :</h4></th><th><h4>`+data.totaleTime+` mins</h4></th></tr>
  <tr><th class="tabhead"><h4> Average time per question :</h4></th><th><h4>`+data.timePerQues+` secs</h4></th></tr>
  <tr><th class="tabhead"><h4> Ideal length :</h4></th><th><h4>20 mins</h4></th></tr>
  </table></li><br>
  <li><table>
  <tr><th class="tabhead"><h3 class="sectionhead">Question Score</h3></th><th><h3>`+data.questionScore+`%</h3></th></tr>
  <tr><th class="tabhead"><h4> Total questions asked :</h4></th><th><h4>`+data.totalQuestions+`</h4></th></tr>
  <tr><th class="tabhead"><h4> Irrelevant questions asked :</h4></th><th><h4>`+data.irrelevantQuestions+`</h4></th></tr>
  <tr><th class="tabhead"><h4> Illogical and out-of-order questions asked :</h4></th><th><h4>`+data.outoforderQuestions+`</h4></th></tr>
  </table></li><br>
  <li><table>
  <tr><th class="tabhead"><h3><span class="sectionhead">Hint Score</span> (lower the better)</h3></th><th><h3>`+data.hintScore+`%</h3></th></tr>
  <tr><th class="tabhead"><h4> Useful hints taken :</h4></th><th><h4>`+data.hintTaken+`</h4></th></tr>
  <tr><th class="tabhead"><h4> Repeat/Unnecessary hints taken :</h4></th><th><h4>`+data.usefulHint+`</h4></th></tr>
  </table></li><br>
  <h2>Section-Wise Analysis</h2><br>
  <h3 class="sectionhead" style="text-align: center;"> Preliminary Section </h3>
  <ul class="outlist">
  <li>List of irrelevant questions
  <ol class="inlist">`+prelimWrongQuestions+
  `</ol></li><br>`+
  `<li>List of missed questions
  <ol class="inlist">`+prelimMissedQuestions+`</ol></li></ul><br>
  <table>
  <tr><th><h4 class="sectionsc"> Coverage :</h4></th><th><h4 class="sectionsc">`+data.prelimScore+`</h4></th></tr>
  </table></li><br>
  <li><h3 class="sectionhead" style="text-align: center;"> Analysis and Overall Strategy </h3><ul class="outlist">
  <li>List of irrelevant questions
<ol class="inlist">`+analyzeWrongQuestions+`</ol></ul><br>
  <table>
  <tr><th><h4 class="sectionsc"> Ordering :</h4></th><th><h4 class="sectionsc">`+data.orderScore+`</h4></th></tr>
  <tr><th><h4 class="sectionsc"> Coverage :</h4></th><th><h4 class="sectionsc">`+data.analyzeScore+`</h4></th></tr>
  </table></li><br>`+recosection+`</ul>
  <h4>
  Please share your experience and feedback. Help us to provide you best solution.</h4>

  <input style="align-items:center;" type="button" class="btn btn-primary btn-lg" value="feedback" onclick="window.open('https://forms.gle/rFHFBWUUkXRHyVXdA')" /><br><br>

  <div style="margin-left:170px; right;margin-bottom: 20px;display: flex;">
  &nbsp;&nbsp;
  <input type="button" class="btn btn-primary btn-lg" id="hellobutton" value="My Transcript" />
  &nbsp;&nbsp;
  </div>
  <script>
 

  </script>`

  document.getElementById("hellobutton").onclick = function func() {
        console.log('pdf')
        fetch("/pdfc", {
            // Adding method type
            method: "POST",

            // Adding body or contents to send
            body: JSON.stringify(msg),

            // Adding headers to the request
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        })
            .then(async res => ({
        filename: 'script.pdf',
        blob: await res.blob()
    })).then(resObj => {
        // It is necessary to create a new blob object with mime-type explicitly set for all browsers except Chrome, but it works for Chrome too.
        const newBlob = new Blob([resObj.blob], { type: 'application/pdf' });

        // MS Edge and IE don't allow using a blob object directly as link href, instead it is necessary to use msSaveOrOpenBlob
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(newBlob);
        } else {
            // For other browsers: create a link pointing to the ObjectURL containing the blob.
            const objUrl = window.URL.createObjectURL(newBlob);

            let link = document.createElement('a');
            link.href = objUrl;
            link.download = resObj.filename;
            link.click();

            // For Firefox it is necessary to delay revoking the ObjectURL.
            setTimeout(() => { window.URL.revokeObjectURL(objUrl); }, 250);
        }
    })
            .catch((err) => {
                console.log(err);
            });
    };
}