const io = require('socket.io-client');

const ipcRenderer = require('electron').ipcRenderer;
const { desktopCapturer } = require("electron");

var socket;
var room;



// 미디어와 관련된 변수를 선언해요 myFace는 element를 받고 myStream엔 영상 내용을 담을거에요
var myFace = document.getElementById("myFace");
var myStream;

// 먼저 RTC객체를 만들어요 구글 stun 서버로 부터 나의 정보를 가져올게요
var configuration = {
    "iceServers" : [{
        "url" : "stun:stun.l.google.com:19302"
    }]
}
var myPeerConnection = new RTCPeerConnection(configuration);


socket = io.connect('http://172.30.1.29:5004');

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

socket.on('room-full', async (message) => {
    alert("입장 인원 초과");
    location.reload(true);
})
socket.on('rtc-message', async (message) => {

    var content = JSON.parse(message);
    console.log("메세지가 왔어요" + content);
    // 누군가가 오퍼를 보냄
    if (content.event == "offer") {
        console.log("오퍼가 왔어요", content.data);
        var offer = content.data;
        myPeerConnection.setRemoteDescription(offer);   //Offer -> Remote Description 등록 

        // 오퍼를 받는 쪽 -> 상대에게 자신의 미디어 트랙을 추가시켜줌
        await getMedia();
        myStream.getTracks().forEach((track) => 
            myPeerConnection.addTrack(track, myStream)
        );
        var answer = await myPeerConnection.createAnswer();
        myPeerConnection.setLocalDescription(answer);   //LocalDescription 설정 -> onicecandidate 트리거 -> Candidate를 Socket에 Answer로 보냄
        console.log("앤서를 보낼게요");
        send({
            event: "answer",
            data: answer
        })
    } 
    // 오퍼를 보내고 나서 응답이 옴 
    else if (content.event == "answer") {
        console.log("앤서가 왔어요");
        answer = content.data;
        myPeerConnection.setRemoteDescription(answer);
    } 
    
    else if (content.event == "candidate") {
        console.log("캔디데이트가 왔어요");
        // 이 메서드를 통해 리모트 디스크립션에 설정되어있는 피어와의 연결방식을 결정해요
        console.log(content.data);
        myPeerConnection.addIceCandidate(content.data);
    }
})

// 앞으로 소켓으로 메세지를 보낼 땐 이 함수를 쓸 생각이에요
async function send(message) {
    const data = {
        roomId: room,
        ...message
    }
    socket.emit("rtc-message", JSON.stringify(data));

}



// 내가 나의 캔디데이트(너가 나를 연결하는 방법들의 후보)를 등록하면(즉 로컬디스크립션을 설정하면)
// 트리거 되는 메서드에요
myPeerConnection.onicecandidate = function(event) {
    console.log("나의 캔디데이트를 보낼게요");
    send({
        event: "candidate",
        data: event.candidate
    })
}
// 연결이 되서 피어의 스트림이 내 RTC객체에 등록되면 시작되는 메서드에요
myPeerConnection.addEventListener("addstream", handleAddStream);

function handleAddStream(data) {
    console.log("스트리밍 데이터를 받아왔어요");

    var peerVideo = document.getElementById("peerVideo");
    peerVideo.srcObject = data.stream;
}


// '오퍼를 생성해요'라는 버튼을 눌렀을 때 이 메서드가 실행되요
async function createOffer() {
    console.log("오퍼를 보내볼게요");

    //일단 카메라를 킬게요 키면서 myStream에도 미디어 정보를 담아와요
    await getMedia();

    // getMedia에서 가져온 audio, video 트랙을 myPeerConnection에 등록해요
    myStream.getTracks().forEach((track) => myPeerConnection.addTrack(track, myStream));
    
    // RTC객체도 만들었고 나의 미디어도 RTC객체에 담았으니 오퍼를 생성해볼게요
    var offer = await myPeerConnection.createOffer();
    console.log("오퍼를 전송시작해요!")
    // 이제 send함수를 통해 소켓으로 나의 offer를 전송해 볼게요
    await send({
        event: "offer",
        data: offer
    })
    console.log("오퍼 전송을 완료했어요")
    myPeerConnection.setLocalDescription(offer);
}


const myCustomGetDisplayMedia = async () => {
    const sources = await desktopCapturer.getSources({
      types: ["screen"],
    });
  
    // you should create some kind of UI to prompt the user
    // to select the correct source like Google Chrome does
    const selectedSource = sources[0]; // this is just for testing purposes
  
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
        },
      },
    });
  
    return stream;
};

//미디어 내용을 받기 시작하는 함수에요
async function getMedia() {
    try {
        // myStream = await navigator.mediaDevices.getUserMedia({
        //     audio: true,
        //     video: true,
            
        // });
        myStream = await navigator.mediaDevices.getDisplayMedia({
            video: { displaySurface: 'monitor' } 
        })
        console.log(myStream)

        // let displaySurface = myStream.getVideoTracks()[0].getSettings().displaySurface;
        // if (displaySurface !== 'monitor') {
        //     throw 'Selection of entire screen mandatory!';
        // }

        console.log(myStream);
        myFace.srcObject = myStream;
        // myMedia.srcObject = myMediaStream;
    } catch (e) {
        console.log("미디어를 가져오는 중 에러가 발생했어요", e.message);
    }
}        
