
const express= require('express');
const app =express();
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
const  mongooseDynamic = require ('mongoose-dynamic-schemas');
const bcrypt=require('bcrypt');
const session=require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);


mongoose.connect('mongodb+srv://admin-zaki:test123@cluster0.joxaz.mongodb.net/NotesDb');

const store = new MongoDBStore({
  uri: 'mongodb+srv://admin-zaki:test123@cluster0.joxaz.mongodb.net/NotesDb',
  collection: 'mySessions',
});

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

app.use(express.static(__dirname+'/public'));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  store:store,
}));

const saltRounds=10;
const isAuth=(req,res,next)=>{
  req.session.isAuth?next():res.redirect('/');
}



app.get('/',(req,res)=>{
    req.session.destroy(err=>{
      if(err){console.log(err);}})
      res.render("login");
});

app.get('/home/:name',isAuth,(req,res)=>{
  let userName=req.params.name;
  if(isAuth){
      Users.findOne({name:userName},(err,foundList)=>{
        if(!err){
          res.render('home.ejs',{newItem:foundList.subject ,userName:userName});
        }
        else{ console.log(err);  }
      });
    }
})

app.get('/subject/:name/:subjectName',isAuth,(req,res)=>{

   let userName=req.params.name;
   let subjectName=req.params.subjectName;
  SubjectPost.find({name:userName,subject:subjectName},(err,list)=>{

    if(!err){
      const x=list.filter(a=>a.name===userName && a.subject===subjectName);
        res.render('post',{name:userName,contents:x,subject:subjectName});}
   });
})

app.get('/postsubmit/:name/:subject',(req,res)=>{
  let userName=req.params.name;
  let subject=req.params.subject;
    if(isAuth) res.render('postsubmit',{name:userName,subject:subject});
    else res.redirect('/');
})



app.post('/home',(req,res)=>{
 let name=req.body.name;
 if(req.body.item){
    Users.updateOne({name: name},{ $push:{subject:req.body.item}},(err)=>{
        if(!err){console.log('updated');}
        else{console.log(err);}
      })
     res.redirect(`/home/${name}`);
   }
 else if(req.body.delete){
  Users.updateOne({name:name},{$pull:{subject:req.body.delete}},(err)=>{
    if(!err){
    SubjectPost.deleteMany({name:name,subject:req.body.delete},err=>{if(!err){console.log('post delete');}});
    res.redirect(`/home/${name}`);}
  })
 }
else if(req.body.item===''){res.redirect(`/home/${name}`);}
else{
   subjectName=req.body.subject;
   res.redirect(`/subject/${name}/${subjectName}`);
}
})




app.post('/subject',(req,res)=>{
  let subject=req.body.subject;
  let name=req.body.name;
   res.redirect(`/postsubmit/${name}/${subject}`);
})

app.post('/deletePost',(req,res)=>{

    let userName=req.body.name;
    let subject=req.body.subject;
    SubjectPost.deleteOne({name:userName,title:req.body.title,para:req.body.para},(err)=>{
    if(!err){ res.redirect(`subject/${userName}/${subject}`);}
    else{console.log(err);}
  });
})


app.post('/postsubmit',(req,res)=>{

     let userName=req.body.name;
     let subject=req.body.subject;
     const x=new SubjectPost({name:userName,subject:subject,title:req.body.title, para:req.body.contentOftitle});
      x.save();
     res.redirect(`subject/${userName}/${subject}`);
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
                req.session.isAuth=true;
                res.redirect(`/home/${userName}`);
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
            userName=foundList.name;
            req.session.isAuth=true;
            res.redirect(`/home/${userName}`);
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
