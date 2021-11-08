
const express= require('express');
const app =express();
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
const  mongooseDynamic = require ('mongoose-dynamic-schemas');
const bcrypt=require('bcrypt');


mongoose.connect('mongodb+srv://admin-zaki:test123@cluster0.joxaz.mongodb.net/NotesDb');


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

const saltRounds=10;
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
         bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
              if(!err){
                const user=new Users ({
                    name:req.body.name,
                    email:req.body.email,
                    password:hash
                  });

                user.save();
                userName=req.body.name;
                isAuth=!isAuth;
                res.redirect('/home');
               }

            else{ console.log(err);}
        });
      }
       else{
         res.render('alert',{message:'OOPs! ☹ Try different UserName'});
        }
     }
    else{console.log(err);}
  });


});

app.post('/login',(req,res)=>{


 Users.findOne({name:req.body.name},(err,foundList)=>{
      if(!err){
        if(foundList===null){res.render('alert',{message:'sorry! ☹ Your Username is incorrect'});}
        else{
        bcrypt.compare(req.body.password, foundList.password, function(err, result) {
          if(result){
            isAuth=!isAuth;
            userName=foundList.name;
            res.redirect('/home');
          }
         else{
          res.render('alert',{message:'OOPs! ☹ Your Password is incorrect'});
         }
        });

      }}
      else{
        console.log(err);
      }
    })
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port,(req,res)=>{
    console.log("server has started successfully");
});
