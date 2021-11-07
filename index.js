
const express= require('express');
const app =express();
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
var  mongooseDynamic = require ('mongoose-dynamic-schemas');

mongoose.connect('mongodb://localhost:27017/NotesDb');


const subjectPostSchema=new mongoose.Schema({
  name:String,
  subject:String,
  title:String,
  para:String
});

const userSchema=new mongoose.Schema({
  name:String,
  email:String,
  password:String,
  subject:[],
});

const Users=new mongoose.model('User',userSchema);
const SubjectPost=new mongoose.model('subjectPost',subjectPostSchema);

app.use(express.static('public'));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));


let userName;
let subjectName;
let isAuth=false;



app.get('/',(req,res)=>{
    isAuth=false;
    res.render("login",{});
});

app.get('/home',(req,res)=>{

  if(isAuth){
      Users.findOne({name:userName},(err,foundList)=>{
        if(!err){
          res.render('home.ejs',{newItem:foundList.subject ,userName:userName});
        }
        else{ console.log(err);  }
      });
    }
})

app.get('/subject',(req,res)=>{

  SubjectPost.find({name:userName,subject:subjectName},(err,list)=>{

    if(!err){
      const x=list.filter(a=>a.name===userName && a.subject===subjectName);
        res.render('post',{contents:x,subject:subjectName});}
   });
})

app.get('/postsubmit',(req,res)=>{
    if(isAuth) res.render('postsubmit');
    else res.redirect('/');
})



app.post('/home',(req,res)=>{
let name=req.body.name;
 if(req.body.item){
    Users.updateOne({name: name},{ $push:{subject:req.body.item}},(err)=>{
        if(!err){console.log('updated');}
        else{console.log(err);}
      })
     res.redirect('/home');
   }
 else if(req.body.delete){
  Users.updateOne({name:name},{$pull:{subject:req.body.delete}},(err)=>{
    if(!err){
    SubjectPost.deleteMany({name:name,subject:req.body.delete},err=>{if(!err){console.log('post delete');}});
    res.redirect('/home');}
  })
 }
else if(req.body.item===''){res.redirect('/home');}
else{
   subjectName=req.body.subject;
   res.redirect('/subject');
}
})




app.post('/subject',(req,res)=>{
  postsubjectName=req.body.name;
   res.redirect('/postsubmit');
})

app.post('/deletePost',(req,res)=>{

    SubjectPost.deleteOne({name:userName,title:req.body.title,para:req.body.para},(err)=>{
    if(!err){  res.redirect('/subject');}
    else{console.log(err);}
  });
})


app.post('/postsubmit',(req,res)=>{

     const x=new SubjectPost({name:userName,subject:postsubjectName,title:req.body.title, para:req.body.contentOftitle});
      x.save();
     res.redirect("/subject");
});

app.post('/',(req,res)=>{
    res.redirect('/home');
});

app.post('/signUp',(req,res)=>{



   Users.find({name:req.body.name},(err,list)=>{
     if(!err){
       if(list.length===0){

       const user=new Users ({
          name:req.body.name,
          email:req.body.email,
          password:req.body.password
        });

        user.save();
        userName=req.body.name;
        isAuth=!isAuth;
        res.redirect('/home');
         }
       else{
         res.render('alert');
        }
     }
    else{console.log(err);}
  });


});

app.post('/login',(req,res)=>{

 Users.find({name:req.body.name,password: req.body.password},(err,foundList)=>{
      if(!err){
        isAuth=!isAuth;
        userName=req.body.name;
        res.redirect('/home');
      }
      else{
        console.log(err);
      }
    })
});



app.listen('3000',(req,res)=>{
    console.log("server is running on port 3000");
});
