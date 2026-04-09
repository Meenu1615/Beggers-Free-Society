var express = require("express");
var mysql = require("mysql2");
var fileuploader = require("express-fileupload");
var cloudinary = require("cloudinary").v2;

var app = express();

const bcrypt = require("bcrypt"); // Password Security -------------

app.listen(2006, function () {
  console.log("Hello connected to port 2006");
});

app.use(express.static("public"));
app.use(fileuploader());

app.use(express.json());

app.get("/", function (req, resp) {
  let filename = __dirname + "/public/index.html";
  resp.sendFile(filename);
});

app.get("/volunteer", function (req, resp) {
  let filename = __dirname + "/public/VolunteerProfile.html";
  resp.sendFile(filename);
});

app.get("/admindash", function (req, resp) {
  let fullPath = __dirname + "/public/admin-dash.html";
  resp.sendFile(fullPath);
});

app.get("/allusers", function (req, resp) {
  let fullPath = __dirname + "/public/all-users.html";
  resp.sendFile(fullPath);
});

app.get("/allvolunteer", function (req, resp) {
  let fullPath = __dirname + "/public/all-volunteer.html";
  resp.sendFile(fullPath);
});

app.get("/allcitizens", function (req, resp) {
  let fullPath = __dirname + "/public/all-citizens.html";
  resp.sendFile(fullPath);
});

app.get("/allbeggers", function (req, resp) {
  let fullPath = __dirname + "/public/all-beggers.html";
  resp.sendFile(fullPath);
});


app.get("/voldash", function (req, resp) {
  let fullPath = __dirname + "/public/dash-vol-ngo.html";
  resp.sendFile(fullPath);
});

app.get("/Begger-Details", function (req, resp) {
  let fullPath = __dirname + "/public/detailBegger.html";
  resp.sendFile(fullPath);
});

app.get("/findWorker", function (req, resp) {
  let fullPath = __dirname + "/public/find-worker.html";
  resp.sendFile(fullPath);
});

let url =
  "mysql://avnadmin:AVNS_3tb3vkChMWtcfXgAqkD@mysql-2bef2a39-maltimannu24-2c97.j.aivencloud.com:23505/defaultdb";
let MysqlCon = mysql.createConnection(url);
MysqlCon.connect(function (err) {
  if (err == null) console.log("SQL Connected");
  else console.log(err.message);
});

cloudinary.config({
  cloud_name: "dpnpiejmx",
  api_key: "682254368965365",
  api_secret: "djM8HmXFoKtKhUuAkGTmkmL1Pzs", // Click 'View API Keys' above to copy your API secret
});

//--------------------------AI----------------------------------------------
const { GoogleGenerativeAI } = require("@google/generative-ai");

//add ur key
const genAI = new GoogleGenerativeAI("AIzaSyDeNTcSdPf5Nfs2TOM2_fCZPckuqART2T0");

const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

app.use(express.urlencoded({ extended: true }));

// for index,html reach us page
app.get("/contact-process", function (req, res) {
  let name = req.query.name;
  let email = req.query.email;
  let message = req.query.message;

  console.log(name, email, message);

  res.send("Message Received");
});

// for Sign-up page

// app.get("/signup-process", function (req, resp) {
//   let email = req.query.txtEmail;
//   let pwd = req.query.txtPwd;
//   let utype = req.query.txtUtype;

//   // const secPwd = await bcrypt.hash(pwd, 10);

//   MysqlCon.query(
//     "INSERT INTO Users (emailid, pwd, utype) VALUES (?,?,?)",
//     [email, pwd, utype],
//     function (callBackErr) {
//       if (callBackErr == null) {
//         resp.send("Record Saved");
//       } else resp.send("callBackerr.message");
//     },
//   );
// });

// for Sign-up page

app.get("/signup-process", function (req, resp) {
  let email = req.query.txtEmail;
  let pwd = req.query.txtPwd;
  let utype = req.query.txtUtype;

  MysqlCon.query(
    "insert into Users(emailid, pwd, utype) values (?, ?, ?)",
    [email, pwd, utype],
    function (callBackErr) {
      if (callBackErr == null)
         resp.send("Record Saved");
      else
         resp.send(callBackErr.message);
    },
  );
});

// for login page

app.get("/login-process", function (req, resp) {
  let emailid = req.query.txtEmail;
  let pwd = req.query.txtPwd;

  MysqlCon.query(
    "select * from Users where emailid=? and pwd=?",
    [emailid, pwd],
    function (err, tableInJsonArray) 
    {
      console.log(tableInJsonArray[0]);
      if (err) 
        resp.send("Server Error");

      if (tableInJsonArray.length === 0)
        resp.send("Invalid Email ID or Password");

      if (tableInJsonArray.length == 1) 
        resp.send("Login Successfully as " + tableInJsonArray[0].utype);
        
    },
  );
});

// for fetch

app.get("/findone", function (req, resp) {
  let emailid = req.query.txtEmail;
  MysqlCon.query(
    "select * from volProfile where emailid=?",
    [emailid],
    function (err, tableInJsonArray) {
      if (tableInJsonArray.length == 1) resp.send(tableInJsonArray);
      else resp.send("Invalid User/Email ID");
    },
  );
});

// for vounteer submit

app.post("/volunteer-process", async function (req, resp) {
  let jsonObjStr = JSON.stringify(req.body);
  console.log(req.body);

  let filename1 = "user.jpg";
  let filename2 = "No_Pic.jpg";

  if (req.files != null && req.files.aadharPic) {
    filename1 = req.files.aadharPic.name;
    let fullPath = __dirname + "/uploads/" + filename1;
    req.files.aadharPic.mv(fullPath);

    await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
      filename1 = picUrlResult.url;
      console.log("////////////");
      console.log(filename1);
    });
  }

  if (req.files != null && req.files.profilePic) {
    filename2 = req.files.profilePic.name;
    let fullPath = __dirname + "/uploads/" + filename2;
    req.files.profilePic.mv(fullPath);

    await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
      filename2 = picUrlResult.url;
      console.log("***************");
      console.log(filename2);
    });
  }

  let emailid = req.body.txtEmail;
  let name = req.body.txtName;
  let contact = req.body.txtMob;
  let address = req.body.txtAdd;
  let city = req.body.txtCity;
  let gender = req.body.txtGen;
  let occupation = req.body.txtOcc;
  let vtype = req.body.txtvtype;
  let acardnourl = filename1;
  let picurl = filename2;
  let ngoNo = req.body.ngono;

  MysqlCon.query(
    "insert into volProfile values(?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)",
    [
      emailid,
      name,
      contact,
      address,
      city,
      gender,
      occupation,
      vtype,
      acardnourl,
      picurl,
      ngoNo,
    ],
    function (callBackErr) {
      if (callBackErr == null) resp.send(" Volunteer Record Saved");
      else resp.send(callBackErr.message);
    },
  );
});

// for volunteer update

app.post("/volunteer-process", async function (req, resp) {
  console.log(req.body);

  let filename1;
  let filename2;
  if (req.files != null && req.files.aadharPic) {
    filename1 = req.files.aadharPic.name;
    let fullPath = __dirname + "/uploads/" + filename1;
    req.files.aadharPic.mv(fullPath);

    await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
      filename1 = picUrlResult.url;
      console.log("////////////");
      console.log(filename1);
    });
  }

  if (req.files != null && req.files.profilePic) {
    filename2 = req.files.profilePic.name;
    let fullPath = __dirname + "/uploads/" + filename2;
    req.files.profilePic.mv(fullPath);

    await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
      filename2 = picUrlResult.url;
      console.log("***************");
      console.log(filename2);
    });
  }

  let emailid = req.body.txtEmail;
  let name = req.body.txtName;
  let contact = req.body.txtMob;
  let address = req.body.txtAdd;
  let city = req.body.txtCity;
  let gender = req.body.txtGen;
  let occupation = req.body.txtOcc;
  let vtype = req.body.txtvtype;
  let acardnourl = filename1;
  let picurl = filename2;
  let ngoNo = req.body.ngono;

  MysqlCon.query(
    "update volProfile set name=?,contact=?,address=?,city=?,gender=?,occupation=?,vtype=?,acardnourl=?,picUrl=?,ngoNo=? where emailid=?",
    [
      name,
      contact,
      address,
      city,
      gender,
      occupation,
      vtype,
      acardnourl,
      picurl,
      ngoNo,
      emailid,
    ],
    function (callBackErr) {
      if (callBackErr == null) resp.send("volunteer Record updated");
      else resp.send(callBackErr.message);
    },
  );
});

app.get("/findrecord", function (req, resp) {
  let emailid = req.query.txtEmail;
  MysqlCon.query(
    "select * from volProfile where emailid=?",
    [emailid],
    function (err, tableInJsonArray) {
      if (tableInJsonArray.length == 1) resp.send(tableInJsonArray);
      else resp.send(err.message);
    },
  );
});

//------------------------------------------Begger Details page------------------------------------------

app.post("/Begger-Details", async function (req, resp) {
  let jsonObjStr = JSON.stringify(req.body);
  console.log(req.body);

  let fileProof = "NO_PIC.jpg";
  let aiJsonData; //------------AI----------------

  if (req.files != null) {
    fileProof = req.files.baggFileProof.name;
    let fullPath = __dirname + "/uploads/" + fileProof;
    req.files.baggFileProof.mv(fullPath);

    await cloudinary.uploader
      .upload(fullPath)
      .then(async function (picUrlResult) {
        fileProof = picUrlResult.url;
        console.log("Proof pic uploaded:", fileProof);
        aiJsonData = await aiHelper(picUrlResult.url);
      });
  }

  let filePic = "NO_PIC.jpg";

  if (req.files != null) {
    filePic = req.files.baggFilePic.name;
    let fullPath = __dirname + "/uploads/" + filePic;
    req.files.baggFilePic.mv(fullPath);

    await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
      filePic = picUrlResult.url;
      console.log("bagger pic uploaded:", filePic);
    });
  }

  let email = req.body.volRefId;
  let address = req.body.baggAddress;
  let city = req.body.baggCity;
  let work = req.body.baggWork;
  let contact = req.body.baggNumber;
  // let proof=req.body.baggProof;        //not needed

  let proofPic = fileProof;
  let pic = filePic;
  //---------------------------gettig by AI----------------------------------
  let name = aiJsonData.name;
  let dob = aiJsonData.dob;
  let gender = aiJsonData.gender;
  let adharno = aiJsonData.adhaar_number;

  MysqlCon.query(
    "insert into beggars values(?,?,?,?,?,?,?,?,?,?,?)",
    [
      email,
      name,
      dob,
      gender,
      address,
      city,
      work,
      contact,
      adharno,
      proofPic,
      pic,
    ],
    function (callBackerr) {
      if (callBackerr == null) resp.send("beggar record is saved");
      else resp.send(callBackerr.message);
    },
  );
});
//-----------------------------Delete Begger record------------------------------
app.delete("/begger/:adharNo", function (req, res) {
  let adharNo = req.params.adharNo;

  MysqlCon.query(
    "DELETE FROM beggars WHERE adharNo = ?",
    [adharNo],
    function (err, result) {
      if (err) {
        res.status(500).send("Database error");
      } else if (result.affectedRows == 0) {
        res.send("No record found");
      } else {
        res.send("Record Deleted Successfully");
      }
    },
  );
});
//--------------------------------------------------------------------------------------------------------------------
async function aiHelper(imgurl) {
  const myprompt = `
Extract Aadhaar card details from the image.

Return ONLY valid JSON.
Do NOT add explanation.
Do NOT add backticks.

Use this format strictly:
{
  "adhaar_number": "",
  "name": "",
  "gender": "",
  "dob": ""
}
`;
  const imageResp = await fetch(imgurl).then((response) =>
    response.arrayBuffer(),
  );

  const result = await model.generateContent([
    {
      inlineData: {
        data: Buffer.from(imageResp).toString("base64"),
        mimeType: "image/jpeg",
      },
    },
    myprompt,
  ]);
  console.log(result.response.text());

  const cleaned = result.response.text().replace(/json|/g, "").trim();
  const jsonData = JSON.parse(cleaned);
  console.log(jsonData);

  return jsonData;
}

app.post("/picreader", async function (req, resp) {
  let fileName;
  if (req.files != null) {
    //const myprompt = "Read the text on picture and tell all the information";
    //  const myprompt = "Read the text on picture in JSON format";
    fileName = req.files.baggFileProof.name;
    let locationToSave = __dirname + "/public/uploads/" + fileName; //full ile path

    req.files.baggFileProof.mv(locationToSave); //saving file in uploads folder

    //saving ur file/pic on cloudinary server
    try {
      await cloudinary.uploader
        .upload(locationToSave)
        .then(async function (picUrlResult) {
          //sending pic to Gemini for reading
          let jsonData = await aiHelper(picUrlResult.url);

          //use information from json for saving inside insert quiery
          resp.send(jsonData);
        });

      //var respp=await run("https://res.cloudinary.com/dfyxjh3ff/image/upload/v1747073555/ed7qdfnr6hez2dxoqxzf.jpg", myprompt);
      // resp.send(respp);
      // console.log(typeof(respp));
    } catch (err) {
      resp.send(err.message);
    }
  }
});

//---------------------setting modal in dashBoard---------------------
app.get("/updatePass", function (req, resp) {
  let email = req.query.settingEml;
  let oldPass = req.query.oldPwd;
  let newPass = req.query.newPwd;

  MysqlCon.query(
    "select * from Users where emailid=? and pwd=?",
    [email, oldPass],
    function (err, result) {
      if (err) resp.send(err.message);
      else if (result.length == 0) resp.send("invail mail or pass");
      else {
        MysqlCon.query(
          "update Users set pwd=? where emailid=?",
          [newPass, email],
          function (callBackerr) {
            if (callBackerr == null) resp.send("vol pass updated");
            else resp.send(callBackerr.message);
          },
        );
      }
    },
  );
});

//--------------------ADMIN DASHBOARD------------------------------------

//-------------------------ANGUlar------------------------------

app.get("/angular-fetchUsers", function (req, resp) {
  MysqlCon.query("select * from Users", function (err, tableInJsonArray) {
    resp.send(tableInJsonArray);
  });
});

app.get("/angular-userBlock", function (req, resp) {
  let email = req.query.txtEmail;

  MysqlCon.query(
    "update Users set txtStatus=0 where emailid=?",
    [email],
    function (callBackerr) {
      if (callBackerr == null) resp.send("blocked");
      else resp.send(callBackerr.message);
    },
  );
});

app.get("/angular-userResume", function (req, resp) {
  let email = req.query.txtEmail;

  MysqlCon.query(
    "update Users set txtStatus=1 where emailid=?",
    [email],
    function (callBackerr) {
      if (callBackerr == null) resp.send("resumed");
      else resp.send(callBackerr.message);
    },
  );
});

app.get("/angular-fetchBeggers", function (req, resp) {
  MysqlCon.query("select * from beggars", function (err, tableInJsonArray) {
    resp.send(tableInJsonArray);
  });
});

app.get("/angular-fetchVolantiers", function (req, resp) {
  MysqlCon.query("select * from volProfile", function (err, tableInJsonArray) {
    resp.send(tableInJsonArray);
  });
});

app.get("/angular-fetchCitizens", function (req, resp) {
  MysqlCon.query("select * from citizenProfile", function (err, tableInJsonArray) {
    resp.send(tableInJsonArray);
  });
});
// -----------------------citizen kii profileeeeeeeeeeeee-------------------

app.post("/citizen-profile", async function (req, resp) {
  let jsonObjStr = JSON.stringify(req.body);
  console.log(req.body);

  let fileFront = "NO_PIC.jpg";

  if (req.files != null) {
    fileFront = req.files.fileAdharFront.name;
    let fullPath = __dirname + "/uploads/" + fileFront;
    req.files.fileAdharFront.mv(fullPath);

    await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
      fileFront = picUrlResult.url;
      console.log("Front pic uploaded:", fileFront);
    });
  }

  let fileBack = "NO_PIC.jpg";

  if (req.files != null) {
    fileBack = req.files.fileAdharBack.name;
    let fullPath = __dirname + "/uploads/" + fileBack;
    req.files.fileAdharBack.mv(fullPath);

    await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
      fileBack = picUrlResult.url;
      console.log("Back pic uploaded:", fileBack);
    });
  }

  let email = req.body.citizenEmail;
  let number = req.body.citizenNo;
  let name = req.body.citizenName;
  let adharNo = req.body.citizenAdharNo;
  let fatherName = req.body.citizenFather;
  let dob = req.body.citizenDob;
  let gender = req.body.citizenGender;
  let address = req.body.citizenAddress;
  let city = req.body.citizenCity;
  let frontpic = fileFront;
  let backpic = fileBack;

  MysqlCon.query(
    "insert into citizenProfile values(?,?,?,?,?,?,?,?,?,?,?)",
    [
      email,
      number,
      name,
      adharNo,
      fatherName,
      dob,
      gender,
      address,
      city,
      frontpic,
      backpic,
    ],
    function (callBackerr) {
      if (callBackerr == null) resp.send("Citizen record is saved");
      else resp.send(callBackerr.message);
    },
  );
});

//----------------------- Find worker ------------------------------

app.get("/angular-FindWorker", function (req, resp) {
  let fullpath = __dirname + "/public/find-Worker.html";
  resp.sendFile(fullpath);
});

app.get("/angular-FindWorker-work", function (req, resp) {
  MysqlCon.query(
    "select distinct worktype from beggars ",
    function (err, tableInJsonArray) {
      resp.send(tableInJsonArray);
    },
  );
});

app.get("/angular-FindWorker-city", function (req, resp) {
  MysqlCon.query(
    "select distinct city from beggars",
    function (err, tableInJsonArray) {
      resp.send(tableInJsonArray);
    },
  );
});

app.get("/fetchWorkers", function (req, resp) {
  let work = req.query.worktype;
  let city = req.query.city;

  let query = "SELECT * FROM beggars WHERE worktype=? AND city=?";

  MysqlCon.query(query, [work, city], function (err, result) {
    if (err) {
      resp.send(err);
    } else {
      resp.send(result);
    }
  });
});

//============== Begger Details in modal ==========================

app.get("/angular-fetchBaggers", function (req, resp) {
  MysqlCon.query("select * from beggars", function (err, tableInJsonArray) {
    resp.send(tableInJsonArray);
  });
});

//============================ citizen dash ==============================

app.get("/citizenDash", function (req, resp) {
  let fullPath = __dirname + "/public/citizen-dash.html";
  resp.sendFile(fullPath);
});

//=============setting modal in citizen dashBoard==================

app.get("/updateCitizenPass", function (req, resp) {
  let email = req.query.settingEml;
  let oldPass = req.query.oldPwd;
  let newPass = req.query.newPwd;

  MysqlCon.query(
    "select * from Users where emailid=? and pwd=?",
    [email, oldPass],
    function (err, result) {
      if (err) resp.send(err.message);
      else if (result.length == 0) resp.send("invailed mail or pass");
      else {
        MysqlCon.query(
          "update Users set pwd=? where emailid=?",
          [newPass, email],
          function (callBackerr) {
            if (callBackerr == null) resp.send("vol pass updated");
            else resp.send(callBackerr.message);
          },
        );
      }
    },
  );
});
