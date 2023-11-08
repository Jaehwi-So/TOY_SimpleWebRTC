const io = require('socket.io-client');
const { desktopCapturer } = require("electron");




// 미디어와 관련된 변수를 선언
var myFace = document.getElementById("myFace");
var myStream;   //영상 스트림

// RTC Connection : Google stun 서버로 부터 나의 Peer Connection 정보를 가져옴
var configuration = {
    "iceServers" : [{
        "url" : "stun:stun.l.google.com:19302"
    }]
}
var myPeerConnection = new RTCPeerConnection(configuration);


// 시그널링 서버 -> Socket.io
var socket;
var room;
socket = io.connect('http://13.125.231.93:5004');

// Socket Room Join
function submitRoomConnection(){
    room = document.getElementById('roomId').value;
    if(room && room != null){
        socket.emit("join-slave", room);
        console.log(room)
    }
    else{
        console.log("Empty")
    }
}

// Room Join -> 이미 접속한 Slave 존재
socket.on('room-full', async (message) => {
    alert("입장 인원 초과");
    location.reload(true);
})

socket.on('remote-event', async (message) => {

    // var content = JSON.parse(message);
    // robot.moveMouse(content.x, content.y);
    // console.log(content.x, content.y);
    // if(content.type = 'mousedown'){
    //     robot.mouseToggle("down", "left");
    // }
    // else if(content.type = 'mouseup'){
    //     robot.mouseToggle("up", "left");   
    // }
})

socket.on('rtc-message', async (message) => {

    var content = JSON.parse(message);
    // 누군가가 오퍼를 보냄
    if (content.event == "offer") {
        console.log("Receive Offer", content.data);
        var offer = content.data;
        myPeerConnection.setRemoteDescription(offer);   //Offer -> Remote Description 등록 

        // 오퍼를 받는 쪽 -> 상대에게 자신의 미디어 트랙을 추가시켜줌
        await getMedia();
        myStream.getTracks().forEach((track) => 
            myPeerConnection.addTrack(track, myStream)
        );
        var answer = await myPeerConnection.createAnswer();
        myPeerConnection.setLocalDescription(answer);   //LocalDescription 설정 -> onicecandidate 트리거 -> Candidate를 Socket에 Answer로 보냄
        console.log("Send Answer");
        send({
            event: "answer",
            data: answer
        })
    } 
    // 오퍼를 보내고 나서 응답이 옴 
    else if (content.event == "answer") {
        console.log("Receive Answer");
        answer = content.data;
        myPeerConnection.setRemoteDescription(answer);
    } 
    
    else if (content.event == "candidate") {
        console.log("Receive Candidate");
        console.log(content.data);
        myPeerConnection.addIceCandidate(content.data);  // Remote Description에 설정되어있는 Feer와의 연결방식을 결정
    }
})

// 시그널링 서버에 메세지를 보내는 메서드
async function send(message) {
    const data = {
        roomId: room,
        ...message
    }
    socket.emit("rtc-message", JSON.stringify(data));

}



// Local Candidate(상대가 나를 연결하는 방법들의 후보)를 등록하면(로컬디스크립션을 설정) 트리거되는 메서드
myPeerConnection.onicecandidate = function(event) {
    console.log("Send Candidate");
    send({
        event: "candidate",
        data: event.candidate
    })
}
// Connection이 이루어져 피어의 스트림이 내 RTC에 등록되면 시작되는 메서드
myPeerConnection.addEventListener("addstream", handleAddStream);

function handleAddStream(data) {
    console.log("Receive Streaming Data!");

    var peerVideo = document.getElementById("peerVideo");
    peerVideo.srcObject = data.stream;
}


// Offer 생성
async function createOffer() {
    //myStream에 미디어 정보 저장
    await getMedia();

    // getMedia에서 가져온 트랙을 myPeerConnection에 등록
    myStream.getTracks().forEach((track) => myPeerConnection.addTrack(track, myStream));
    
    // RTC Peer Connection으로 Offer 생성
    var offer = await myPeerConnection.createOffer();
    // 시그널링 서버로 Offer 전송
    await send({
        event: "offer",
        data: offer
    })
    console.log("Send Offer");
    myPeerConnection.setLocalDescription(offer);
}


const myCustomGetDisplayMedia = async () => {
    const sources = await desktopCapturer.getSources({
      types: ["screen"],
    });
  
    const selectedSource = sources[0]; //1번째 메인모니터
  
    console.log(sources);
    return selectedSource;
}

navigator.mediaDevices.getDisplayMedia = async () => {
    const selectedSource = await myCustomGetDisplayMedia();
  
    // create MediaStream
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: "desktop",
          chromeMediaSourceId: selectedSource.id,
          minWidth: 1280,
          maxWidth: 1280,
          minHeight: 720,
          maxHeight: 720,
          
        },
      },
    });
  
    return stream;
};

//미디어 Stream을 얻어냄
async function getMedia() {
    try {

        myStream = await navigator.mediaDevices.getDisplayMedia({
            video: { 
                displaySurface: 'monitor' 
            } 
        })
        console.log(myStream)


        console.log(myStream);
        myFace.srcObject = myStream;

    } catch (e) {
        console.log("Error occured to getMedia ", e.message);
    }
}        
