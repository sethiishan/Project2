// var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
// var recognition = new SpeechRecognition();
// var io = require('socket.io-client')
var socket ;
var questionSelector = -1;
var radiobutton = '0';
var radioclick = '0';
//= io.connect('/',{reconnect:true});
var countDownDate = new Date().getTime();
var clk;

var clock = $(".timer").FlipClock(0, {
  countdown: false,
  clockFace: 'MinuteCounter',
  autoStart: false,
})   


console.log(localStorage.getItem('chatval'));
console.log(localStorage.getItem('chatemail'))
console.log(localStorage.getItem('chatvalid'));
var beginStatus = 0
// recognition.continuous = true;
// recognition.lang = 'en-US';
// recognition.interimResults = false;
// recognition.maxAlternatives = 1;

const synth = window.speechSynthesis;
const utterance = new SpeechSynthesisUtterance();

var chatbox = document.getElementById("chat-message-list");
var send = document.getElementById('send');
var mic = document.getElementById('mic');
var stop = document.getElementById('stop');
var abort = document.getElementById('abort');
var input = document.getElementById("my_message");
// add problem button
var addProblem = document.getElementById("add-problem")

var end = document.getElementById('endprob');
var begin = document.getElementById('resetprob');



addProblem.addEventListener('click',()=>{
  /*var z ={
    name : localStorage.getItem('chatval'),
    id : localStorage.getItem('chatvalid'),
    email : localStorage.getItem('chatemail'),
  };
  console.log(z);
    fetch("/order", {
        method: "POST",
        body: JSON.stringify(z),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
    })
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });*/
  window.open('/order')
    // var problemid = prompt("Please enter the problem Id:", "Reference Id");

})

mic.addEventListener('click',()=>{
    stop.style.display = 'inline-flex';
    abort.style.display = 'inline-flex';
    mic.style.display = 'none';
    send.style.display = 'none';
      recognition.start();
  })
  
  stop.addEventListener('click',()=>{
    recognition.stop();
    stop.style.display = 'none';
    abort.style.display = 'none';
    mic.style.display = 'inline-flex';
    send.style.display = 'inline-flex';
  })
  
abort.addEventListener('click',()=>{
    recognition.abort();
    stop.style.display = 'none';
    abort.style.display = 'none';
    mic.style.display = 'inline-flex';
    send.style.display = 'inline-flex';
    input.value = '';
    input.blur();
  })

send.addEventListener('click',sendMessage);
input.addEventListener('keydown', function(e){
  if(e.keyCode == 13 && !e.shiftKey){
    sendMessage();
  }
})


end.addEventListener('click',endproblem);
begin.addEventListener('click',beginproblem);



// Initialize Variables
var closePopup = document.getElementById("popupclose");
var overlay = document.getElementById("overlay");
var popup = document.getElementById("popup");
var button = document.getElementById("button");
var reportdiv = document.getElementById("report")

closePopup.onclick = function() {
        overlay.className = '';
        popup.className = '';
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function func(z) {
    console.log('pdf')
    fetch("/pdfc", {
        method: "POST",
        body: z,
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
    })
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });
}

function report(msg) {
  // show popup
  console.log(msg);
  data=msg['result'];
  overlay.className = 'show';
  popup.className = 'show';
  var zzz = JSON.stringify(msg);
  console.log(zzz);
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
  <input type="button" class="btn btn-primary btn-lg" value="Transcript" onclick="window.open('/pdf/Case`+questionSelector+`_Transcript.pdf')" />
  &nbsp;&nbsp;
  <input type="button" class="btn btn-primary btn-lg" id="hellobutton" value="My Transcript" />
  &nbsp;&nbsp;
  <input type="button" class="btn btn-primary btn-lg" value="Case Chart" onclick="window.open('/assets/images/caseChart`+questionSelector+`.jpeg')" />
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

// event listeners
// document.querySelector('#send').addEventListener('click',sendMessage);
// document.querySelector("#my_message").addEventListener('keydown', function(e){
//   if(e.keyCode == 13 && !e.shiftKey){
//     sendMessage();
//   }
// })


function problemSetter(mode){
  if (mode == 0){
    beginStatus =1
    begin.innerHTML = "Reset<br>Problem"
  }
  else if (mode == 1){
    beginStatus = 0
    begin.innerHTML = "Begin<br>Problem"
  }
}

// function generateMessage(message){
//     var today = new Date();
    
//     var messageTime = today.getHours()+":"+today.getMinutes()+" AM";
//     if(today.getHours()>12)
//     {
//       messageTime = (today.getHours()-12)+":"+today.getMinutes()+" PM";
//     }
//     chatbox.innerHTML+='<div class="message-row other-message">'+
//     '<div class="message-content">'+
//         '<img src="assets/images/robot-chat.jpg" alt="robot chat" />'+
//         '<div class="message-text">'+
//             message+
//         '</div>'+
//         '<div class="message-time">'+
//             messageTime+
//         '</div></div></div>'
// }

function sendResponse(mode,message){
  socket.emit('chat message',{message:message,mode:mode});
}

function endproblem(){
  // report({prelimMissedQuestions:[],prelimWrongQuestions:[],analyzeWrongQuestions:[]});
  if (questionSelector < 0)
    alert('Please select a question first!');
  else{
    sendResponse(4,'')
  }
}

function chatClear(){
  // clear chat when reset is called
  chatbox.innerHTML = '';
  document.getElementById('probdesc').innerHTML = 'Choose your problem and start by pressing "Begin Problem"';

}

function beginproblem(){
  if (questionSelector < 0){
    alert('Please select a question first!')
  }else{
    if(beginStatus==0){
      problemSetter(0)
      resetClock()
      chatClear()
      radioReload()
      sendResponse(-1,questionSelector+'-'+localStorage.getItem('chatval')+'-'+localStorage.getItem('chatvalid'))
    }
    else if(beginStatus==1){
      if(confirm("Are you sure you want to end this case?")){
        problemSetter(0)
        resetClock()
        chatClear()
        radioReload()
        sendResponse(-1,questionSelector+'-'+localStorage.getItem('chatval')+'-'+localStorage.getItem('chatvalid'))
      }
    }
  }
}



function catcheck(el){
  // console.log(el.value);
  radioclick = el.value;
  sendResponse(3,parseInt(el.value))
}

function gethint(){
  sendResponse(1,'')
}


function updateProblem(msg){
  document.getElementById('probdesc').innerHTML = msg;
  startClock()
}

function startConvo(cid){

  if(questionSelector < 0){
    // select question safely
    console.log("updating "+cid)
    questionSelector = cid;
    // make class active
    // var current = document.getElementsByClassName("active");
    // current[0].className = current[0].className.replace(" active", "");
    var cls = document.getElementById(cid)
    cls.className += " active";
  }else{
    
    if(questionSelector != cid){
      if(confirm("Are you sure you want to change question, all progress will be lost?")){
        console.log("updating "+cid)

        var cls = document.getElementById(questionSelector)
        cls.classList.remove("active");
        cls = document.getElementById(cid)
        cls.className += " active";

        questionSelector = cid;
        problemSetter(1)
        resetClock()
        chatClear()
        radioReload()

      }
    }
  }
}

function addConvo(data){
  var div = `<div id="`+data.cid+`" onclick=startConvo(this.id) class="conversation">
                <div id="cid" style="display:none;">
                  `+data.cid+`
                </div>
                <div class="title-text">
                    `+data.name+`
                </div>
                <div class="created-date">
                    `+data.type+`
                </div>
                <div class="conversation-message">
                    `+data.difficulty+`
                </div>
            </div>`
  document.getElementById('conversation-list').innerHTML+=div;


}
function addConvo2(){
  var div = `<div id="`+2+`" onclick=startConvo(this.id) class="conversation">
                <div id="cid" style="display:none;">
                  `+2+`
                </div>
                <div class="title-text">
                    Vodka
                </div>
                <div class="created-date">
                    Profitability                </div>
                <div class="conversation-message">
                    Intermediate
                </div>
                <div class = "lock-icon" > </div>
            </div>`
  document.getElementById('conversation-list').innerHTML+=div;


}

function radioReload(){
    radiobtn = document.getElementById("r0");
    radiobtn.checked = true;
    radiobtn = document.getElementById("r1");
    radiobtn.checked = false;
    radiobtn = document.getElementById("r2");
    radiobtn.checked = false;
}


function addConversationList(){

  console.log("here")
  $.post('/getconvolist')
  .done(function(data){
    if( Object.keys(data).length>2)
      addProblem.disabled = true;
    for(var i =0;i< Object.keys(data).length;i++)
      {
        addConvo(data[i])
      }
      addConvo2()
        
  })
}

var oldtext;
function init(){
  console.log("init")

  socket = io.connect('/',{reconnect:true});

    // add conversation list
  addConversationList()

  resetClock()
  chatClear()
  socket.on('bot reply', function(res) {
    replyText = res.message
    oldtext =res.message
    mode = res.mode
    console.log(res)
    if(mode == -1){
      updateProblem(replyText[0])
    }else if(mode == 3){
      if(res.status == '200'){
        radiobutton = radioclick
      }else{
        alert(replyText)
        radiobtn = document.getElementById("r"+radioclick);
        radiobtn.checked = false;
        radiobtn = document.getElementById("r"+radiobutton);
        radiobtn.checked = true;
        return
      }
    }else if(mode == 4){
      stopClock()
      report(replyText)
      return
    }else if(mode == 0){
      if(res.status != '200'){
        stopClock()
      }
    }
    console.log(replyText,messageTime);

    var today = new Date();
    var messageTime = today.getHours()+":"+today.getMinutes()+" AM";
    if(today.getHours()>12)
    {
      messageTime = (today.getHours()-12)+":"+today.getMinutes()+" PM";
    }
    console.log(replyText,messageTime);
    for(var i=0;i< replyText.length;i++)
      if(replyText[i] != "")
        addbotreply(replyText[i],messageTime);
    
    chatbox.scrollTop = chatbox.scrollHeight;
  // synthVoice(replyText);
  });

    // set radio button
  radioReload()


//   document.querySelector('#convo3').addEventListener('click', function(){
//     var num = 3;
//     startConvo(num);
// });
    // establish connection and get problem from backend
    // generateMessage("hi")
    // console.log(socket)
    // socket.emit('chat message',{name:"sunil"});

// Set the date we're counting down to





} 



function startClock(){
  // countDownDate = new Date().getTime();
  // // Update the count down every 1 second
  // clk = setInterval(function() {

  //   // Get today's date and time
  //   var now = new Date().getTime();

  //   // Find the distance between now and the count down date
  //   var distance = now - countDownDate;

  //   // Time calculations for days, hours, minutes and seconds
  //   var days = Math.floor(distance / (1000 * 60 * 60 * 24));
  //   var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  //   var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  //   var seconds = Math.floor((distance % (1000 * 60)) / 1000);

  //   // Display the result in the element with id="demo"
  //   // document.getElementById("demo").innerHTML = days + "d " + hours + "h "
  //   // + minutes + "m " + seconds + "s ";
  //   document.getElementById("demo").innerHTML = hours + "h "
  //   + minutes + "m " + seconds + "s ";


  //   // If the count down is finished, write some text
  //   if (distance < 0) {
  //     clearInterval(clk);
  //     document.getElementById("demo").innerHTML = "EXPIRED";
  //   }
  // }, 1000);

  // console.log("started Clock")
  clock.start();
}

function resetClock(){
    // clearInterval(clk) 
    // document.getElementById("demo").innerHTML =  "00" + "h "
    // + "00" + "m " + "00" + "s ";
    clock.stop();
    clock.setTime(0);
}

function stopClock(){
  // clearInterval(clk)
  clock.stop();
}

function sendMessage(){
  if (questionSelector < 0){
    alert("Please select a problem to solve")
    return false
  }

  var today = new Date();
  var messageTime = today.getHours()+":"+today.getMinutes()+" AM";
  if(today.getHours()>12)
  {
    messageTime = (today.getHours()-12)+":"+today.getMinutes()+" PM";
  }
//   console.log(input.value);
  var message = input.value.replace(/\n/g,' ').replace(/\s\s+/g,' ').trim();
  console.log(message);
  if(message == '')
  {
    alert("Kindly enter some text to send");
    input.value = '';
    input.blur();
  }
  else
  {
    //   console.log(input.value)
    var display_mess = input.value.trim().replace(/\n/g,'<br>').replace(/ /g,'&nbsp;');
    // console.log("chk1");
    console.log(display_mess);
    // console.log("chk2");
    chatbox.innerHTML ='<div class="message-row you-message">'+
    '<div class="message-content">'+
        '<div class="message-text">' + display_mess + '</div>'+
        '<div class="message-time">' + messageTime + '</div>'+
    '</div></div>'+ chatbox.innerHTML
    chatbox.scrollTop = chatbox.scrollHeight;
    
    var objDiv = document.getElementById("chat-area");
    objDiv.scrollTop = objDiv.scrollHeight;
    input.value = '';
    input.focus();
    console.log(message);
    socket.emit('chat message',{message:message,mode:0});

  }
}

recognition.onresult = function(e) {
    console.log(e.results);
    var text = e.results[0][0].transcript;
  
    for (var i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) {
        input.value += e.results[i][0].transcript;
      } else {
        input.value += e.results[i][0].transcript;
      }
      input.scrollTop = input.scrollHeight;
    }
  }
  

  function addbotreply(replyText,messageTime){
    replyText = replyText.trim().replace(/\n/g,'<br>')
 
     chatbox.innerHTML=`<div class="message-row other-message">
                <div class="message-content">
                    <img src="assets/images/robot-chat.jpg" alt="Daryl Duckmanton" />
                    <div class="message-text">`+replyText+ `</div>
                    <div class="message-time">`+messageTime+`</div></div></div>` + chatbox.innerHTML
  
    chatbox.scrollTop = chatbox.scrollHeight;
  
    var objDiv = document.getElementById("chat-area");
    objDiv.scrollTop = objDiv.scrollHeight;

  }

  function synthVoice(text) {  
    utterance.text = text;
    synth.speak(utterance);
  }

