const express = require ("express");
const bodyParser = require("body-parser");
// const mongodb = require("./mongodb");
const mongoose = require("mongoose");

const db = mongoose.connect('mongodb://127.0.0.1:27017/myRepo', { useNewUrlParser: true }) //actual url hidden

const ordermodel = require('./models/order');
// const productmodel = require('./models/product');

const path = require ("path");

const server = express();

server.set("view engine", "ejs");
server.set("views",
[path.join(__dirname, "./views")])


server.use(bodyParser.urlencoded({extended: true}));
server.use(bodyParser.json());

server.listen(3000);
server.get("/", (req,res)=>{
    // res.send("Hi, you're connected to Express MVC");
    res.render("home");
})
server.get("/orderform/", (req, res)=>{
    res.render("orderform_part1"); //send products list in products json file
})

server.get("/admin/", (req, res)=>{

    ordermodel.find({}, (err,data)=>{
        if(err) {
            console.log(err);
            res.send(err);
        } else{
            const now = Date.now()
            let status
            let d0
            let sec
            const orders = data.map( order => {
                //console.log("order ****** ", order)
                d0 = Number(order.orderdate)
                sec = (now - d0)/1000
                if (sec<86400)        status = "In Progress"
                else if (sec>172800)  status = "Delivered"
                else                  status = "Dispatched"
                
                //console.log(d0)
                const d = new Date(d0).toLocaleDateString()
                console.log(d)
                order["orderdate"] = d
                order["order_status"] = status
                return order
            })
            console.log("orders ==> ", orders)
            res.render("admin_part2", {data: orders}); //send all orders in data json file
        }
    })
})

server.post("/neworder/", (req, res)=>{ //Working
    //post new order in db
    //Schema check first
    const order = Object.assign({}, req.body, {orderdate: Date.now()});
    ordermodel.create(order, (err,data)=>{
        if(err){
            console.log(err);
            res.send(err);
        }
        else{
            res.send(`Inserted ... ${data} `)
        }
    })

})

require('dotenv').config()
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
// console.log(process.env)

server.get("/sendEmail/:email", (req, res)=>{

    const email = req.params.email
    ordermodel.find({email}, (err,data)=>{
        if(err) {
            console.log(err);
            res.send(err);
        }
        else{
            const now = Date.now()
            let status
            let d0
            let sec
            const orders = data.map( order => {
                d0 = Number(order.orderdate)
                sec = (now - d0)/1000
                if (sec<86400)        status = "In Progress"
                else if (sec>172800)  status = "Delivered"
                else                  status = "Dispatched"
                
                const d = new Date(d0).toLocaleDateString()
                order["orderdate"] = d
                order["order_status"] = status
                return order
            })
            const contentText = JSON.stringify(orders, null, 4)
            const contentHtml = "<div><hr><h3>" + contentText + "</h3></div>"
            const msg = {
                to: email,
                from: 'chuni.1998@gmail.com',
                subject: 'Order Status',
                text: contentText,
                html: contentHtml,
            };
            sgMail.send(msg);
            //console.log("msg ==> ", msg)
            res.send("Email sent to " + email)
        }
    })
})

console.log("Server listening at 3k");