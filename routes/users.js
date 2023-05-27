var express = require('express');
const { MongoClient } = require('mongodb')
var router = express.Router();
const { dbUrl,mongodb } = require('../Config/dbConfig')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//get all the students data
router.get("/all-students",async(req,res)=>{
  const client = await MongoClient.connect(dbUrl);
  try {
      const db = client.db("StudentMentor");
      //finding all data present in student collection
      const user = await db.collection("student").find().toArray();//finding all data present in student collection
      res.status(200).send(user);
  } catch (error) {
      res.json(error);
  }
})

// getting all mentor data
router.get("/all-mentors",async(req,res)=>{
  const client = await MongoClient.connect(dbUrl);
  try {

      const db = client.db("StudentMentor");
      //finding all mentors in the mentor collection
      const user = await db.collection("mentor").find().toArray();
      if(user){
        res.status(200).send({user,message:"mentor created"});
      }
      else{
        res.status(400).send({message:"mentor not created"})
      }
      
  } catch (error) {
      res.json(error);
  }
})

// getting the mentor details of a particular student
router.post("/mentor",async(req,res)=>{
  const client = await MongoClient.connect(dbUrl);
  try {
      const db = client.db("StudentMentor");
      const user = await db.collection("student").findOne({"studentName":req.body.studentName});
      res.status(200).json(user);
  } catch (error) {
      res.json(error);
  }
  
})

//getting the students details of a particular mentor
router.post("/students",async(req,res)=>{ 
  const client = await MongoClient.connect(dbUrl);
  try {
      const db = client.db("StudentMentor");
      const user = await db.collection("mentor").findOne({"mentorName":req.body.mentorName});
      res.status(200).json(user);
  } catch (error) {
      res.json(error);
  }
})

//creating a new mentor with or without students data
router.post("/add-mentor",async(req,res)=>{
  const client = await MongoClient.connect(dbUrl);
  try {
      const db = client.db("StudentMentor");
      //creating mentor in dataBase
      console.log(req.body)
      const user = db.collection("mentor").insertOne(req.body);
     
      //if mentor have students while creating we have to add this mentor to those students in student collection
      if(req.body.mentorStudents){
        req.body.mentorStudents.map(async(e)=>{
          const stu = await db.collection("student").updateOne({"studentName":e},{$set:{"studentMentor":req.body.mentorName}});
        })
      }
      res.status(200).json({
        message:"Mentor Added Successfully!"
      })
  } catch (error) {
      res.status(500).json(error);
  }
  
})

// creating a student with or without mentor
router.post("/add-student",async(req,res)=>{
  const client = await MongoClient.connect(dbUrl);
  try {
      const db = client.db("StudentMentor");
      //creating new student
      const user = db.collection("student").insertOne(req.body);
      //if mentor exist we have to update the student to the corresponding mentor in mentor collection
      if(req.body.studentMentor){
        const men = await db.collection("mentor").findOne({"mentorName":req.body.studentMentor});
        //mentor students is a array hence we are extracting it and pushing the new member and updating the same
        men.mentorStudents.push(req.body.studentName);
        const update = await db.collection("mentor").updateOne({"mentorName":req.body.studentMentor},{$set:{"mentorStudents":men.mentorStudents}});
      }
      res.status(200).json({
        message:"Student Added Successfully"
      })
  } catch (error) {
      res.status(500).json(error);
  } 
})

// select one mentor and add multiple students
router.post("/assign-students",async(req,res)=>{
  const client = await MongoClient.connect(dbUrl);
  try {
      const db = client.db("StudentMentor");
      //updating mentor Name for all selected students
      if(req.body.mentorStudents){
        req.body.mentorStudents.map(async(e)=>{
          const stu = await db.collection("student").updateOne({"studentName":e},{$set:{"studentMentor":req.body.mentorName}});
        })
      }
      //updating students name for selected mentor
      if(req.body.mentorName){
        const men = await db.collection("mentor").findOne({"mentorName":req.body.mentorName});
        // console.log(men.mentorStudents);
        //pushing all the students newly assigned to the selected mentor
        req.body.mentorStudents.map((i)=>{
          men.mentorStudents.push(i);
        })
        // console.log(men.mentorStudents);
        const update = await db.collection("mentor").updateOne({"mentorName":req.body.mentorName},{$set:{"mentorStudents":men.mentorStudents}});
      }
      res.status(200).json({
        message:"Mentor and Students Mapped Successfully!"
      })
  } catch (error) {
      res.status(500).json(error);
  }
})

//change the existing mentor to new mentor
router.post("/change-mentor",async(req,res)=>{

  //  We are getting Student Name, mentor Name and Old mentor from frontend
 
  const client = await MongoClient.connect(dbUrl);
  try {
      const db = client.db("StudentMentor");
        // Find the oldmentor and remove this student as the student mentor is changing
      const men = await db.collection("mentor").findOne({"mentorName":req.body.oldMentor});
        //  The deleting of student takes place with the help of splice()
      men.mentorStudents.splice(men.mentorStudents.indexOf(req.body.studentName),1);
        //  After deleting updating the array of students for old mentor
      const update = await db.collection("mentor").updateOne({"mentorName":req.body.oldMentor},{$set:{"mentorStudents":men.mentorStudents}});
       // Update the new mentor name for the selected student
      const user = await db.collection("student").updateOne({"studentName":req.body.studentName},{$set:{"studentMentor":req.body.mentorName}});
      // Find the new mentor details and update the student array with this new student.
      const newmen = await db.collection("mentor").findOne({"mentorName":req.body.mentorName});
      newmen.mentorStudents.push(req.body.studentName);//6
      const newupdate = await db.collection("mentor").updateOne({"mentorName":req.body.mentorName},{$set:{"mentorStudents":newmen.mentorStudents}});//6
      res.status(200).json({
        message:"Mentor Changed Successfully!"
      })
  } catch (error) {
      res.status(500).json(error);
  }
})

module.exports = router;
