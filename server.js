import express from "express";
import bodyParser from "body-parser";
import http from "http";
import {Server} from "socket.io";


const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json({ type: 'application/*+json' }))

const server = http.createServer(app);
const io = new Server(server);
let i = 0
const Devices = []

const port = 3000

io.on('connection', (socket) => {
  socket.on('auth',(data)=>{
    const device = Devices.find((device)=>device.name == data.name)
    if(!device){
      console.log('connecter a ',data.name,socket.id)
      Devices.push({name:data.name,id:socket.id})
    }else{
      device.id = socket.id
    }
  })
  socket.on('event', (data) => {
    console.log('Données reçues du client :', data);
    // Vous pouvez émettre une réponse ou effectuer d'autres actions ici
  });

  socket.on('sensor', (data) => {
    //console.log(data)
    const mobile = Devices.find((device)=>device.name == 'mobile-app')
    if(mobile){
      socket.to(mobile.id).emit('capteur',(parseInt(data.sensor)/1024))
    }else{
      console.log('veuillez connecter le téléphone')
    }
  });
  socket.on('on/off',(data)=>{
    console.log(data)
    const controlleur = Devices.find((device)=>device.name == 'ParfaitPC')
    if(controlleur){
      socket.to(controlleur.id).emit('emit',data?1:0)
    }else{
      console.log('veuillez connecter le capteur')
    }
  })



  socket.on('disconnect', (socket) => {
    const device = Devices.find((device)=>device.id == socket.id)
    if(device)
    console.log('Client',device.name,'déconnecté','ID',device.id);
  });
});

app.get('/', (req, res) => {
  console.log("appel",req.query)
  res.send({'bien':'cool'})
})

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})