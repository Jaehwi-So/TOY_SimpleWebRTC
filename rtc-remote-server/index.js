const express = require('express');
const SocketIO = require('socket.io');


const app = express();

app.get('/view', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})


var server_port = 5004;
const server = app.listen(server_port, () => {
    console.log("Started on : "+ server_port);
})

var io = SocketIO(server, {
    cors: {
      origin: "*"
    }
});



const maxClientsPerRoom = 2;
const roomMasterCounts = {}; // 방(Room)별 클라이언트 수를 추적하는 객체
const roomSlaveCounts = {};
const roomCounts = {};

io.on('connection', (socket) => {

    socket.on("join-master", (roomId) => {
        // 클라이언트가 방(Room)에 조인하려고 할 때, 클라이언트 수를 확인하고 제한합니다.
        if (roomMasterCounts[roomId] === undefined) {
            roomMasterCounts[roomId] = 1;
        } 
        else if (roomMasterCounts[roomId] < maxClientsPerRoom) {
            roomMasterCounts[roomId]++;
        } 
        else {
            // 클라이언트 수가 제한을 초과하면 클라이언트를 방(Room)에 입장시키지 않습니다.
            socket.emit('room-full', roomId);
            console.log("room full" + roomMasterCounts[roomId]);
            return;
        }
        socket.join(roomId);
        console.log("User joined in a room : " + roomId + " count:" + roomMasterCounts[roomId]);


        // 클라이언트가 방(Room)을 떠날 때 클라이언트 수를 업데이트합니다.
        socket.on('disconnect', () => {
            roomMasterCounts[roomId]--;
            console.log("disconnect, count:" + roomMasterCounts[roomId]);
        });
    })

    socket.on("join-slave", (roomId) => {
        // 클라이언트가 방(Room)에 조인하려고 할 때, 클라이언트 수를 확인하고 제한합니다.
        if (roomSlaveCounts[roomId] === undefined) {
            roomSlaveCounts[roomId] = 1;
        } 
        else if (roomSlaveCounts[roomId] < maxClientsPerRoom) {
            roomSlaveCounts[roomId]++;
        } 
        else {
            // 클라이언트 수가 제한을 초과하면 클라이언트를 방(Room)에 입장시키지 않습니다.
            socket.emit('room-full', roomId);
            console.log("room full" + roomSlaveCounts[roomId]);
            return;
        }
        socket.join(roomId);
        console.log("User joined in a room : " + roomId + " count:" + roomSlaveCounts[roomId]);


        // 클라이언트가 방(Room)을 떠날 때 클라이언트 수를 업데이트합니다.
        socket.on('disconnect', () => {
            roomSlaveCounts[roomId]--;
            console.log("disconnect, count:" + roomSlaveCounts[roomId]);
        });
    })



    socket.on("join", (roomId) => {
        // 클라이언트가 Room에 조인하려고 할 때, 클라이언트 수를 확인하고 제한.
        if (roomCounts[roomId] === undefined) {
            roomCounts[roomId] = 1;
        } 
        else if (roomCounts[roomId] < maxClientsPerRoom) {
            roomCounts[roomId]++;
        } 
        else {
            // 클라이언트 수가 제한을 초과하면 클라이언트를 Room에 입장시키지 않음.
            socket.emit('room-full', roomId);
            console.log("room full" + roomCounts[roomId]);
            return;
        }
        socket.join(roomId);
        console.log("User joined in a room : " + roomId + " count:" + roomCounts[roomId]);


        // 클라이언트가 Room을 떠날 때 클라이언트 수를 업데이트
        socket.on('disconnect', () => {
            roomCounts[roomId]--;
            console.log("disconnect, count:" + roomCounts[roomId]);
        });
    })



    socket.on("rtc-message", (data) => {
        var room = JSON.parse(data).roomId;
        socket.broadcast.to(room).emit('rtc-message', data);
    })

    socket.on("remote-event", (data) => {
        var room = JSON.parse(data).roomId;
        socket.broadcast.to(room).emit('remote-event', data);
    })
   
})