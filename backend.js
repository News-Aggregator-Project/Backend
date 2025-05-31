const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const{UserModel} = require("./db");
const {z} = require("zod");
const bcrypt = require("bcrypt");
require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
// const { readBuilderProgram } = require("typescript");

const MONGODB_URI = process.env.MONGODB_URI;

const JWT_SECRET = process.env.JWT_SECRET;

mongoose.connect(MONGODB_URI);


require('dotenv').config();
// Require the cloudinary library
const multer = require('multer');
const { isFunctionLike } = require("typescript");
const cloudinary = require('cloudinary').v2;

const storage = multer.memoryStorage();
const upload = multer({ storage });


// Return "https" URLs by setting secure: true
cloudinary.config({
  secure: true
});
cloudinary.config();

// Log the configuration





const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.post("/signup", async function (req, res){
    const bodyContent = z.object({

        email : z.string().min(3).max(320).email().refine(async (email) => {
            const existingemail = await UserModel.findOne({email : email.toLowerCase()});
            return !existingemail;
        }, {
            message : "There is already an account with this email"
        }),
        name: z.string().min(3).max(50),
        password: z.string().min(8).max(20)
    }).strict();

    const check = await bodyContent.safeParseAsync(req.body);

    if(!check.success){
        res.status(400).json({
            message: "incorrect format",
            error: check.error
        });
        return;
    }

    const {name, email, password} = req.body;

    try{
        const hashedPassword = await bcrypt.hash(password, 5);

        await UserModel.create({
            name: name,
            email: email,
            password: hashedPassword
        });

        res.json({
            message: "user created"
        })
    }
    catch(e){
        res.json({
            message: "user exist",
            error: e
        });
    }
});

app.post("/topics", async function (req, res){
    const {email, topics} = req.body;

    try{
        const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.topics = topics; 
    await user.save();    

    res.status(200).json({ message: "Topics updated", user });
  } catch (err) {
    res.status(500).json({ message: "Failed to update topics", error: err });
  }
})

app.post("/signin", async function (req, res) {
    const {email, password} = req.body;

    const user = await UserModel.findOne({email});

    if(!user){
        res.json({
            message: "user not found"
        });
    }

    const compare = await bcrypt.compare(password, user.password);

    if(compare){
        const token = jwt.sign({
            id: user._id.toString()
        },  JWT_SECRET);
        res.json({
            user: user,
            message: "user signed in successfully",
            token: token
        });
    }
    else{
        res.status(404).send("incorrect password");
    }
})


function auth(req, res, next){
    const token = req.headers.authorization;

    if(token){
        const user = jwt.verify(token, JWT_SECRET);
        if(user){
            req.userId = user.id;
            const userId = user.id;
            console.log(userId);
            req.ObjectId = userId;
            next();
        }
        else{
            res.status(404).send("user not found");
        }
    }
    else{
        res.status(404).send("no token found");
    }
}


app.use(auth);



const scrapeRSS = async (url) => {
    try {
      const { data: xml } = await axios.get(url);
  
      const $ = cheerio.load(xml, { xmlMode: true });
  
      const items = [];
      $('item').each((i, el) => {
        const title = $(el).find('title').text();
        const description = $(el).find('description').text();
        const link = $(el).find('link').text();
  
        items.push({ title, link, description });
      });
  
      console.log(items);
      return items;
    } catch (error) {
      console.error('Error fetching or parsing RSS:', error.message);
    }
  };



  

const scrapeRSSTOIimg = async (url) => {
    try {
      const { data: xml } = await axios.get(url);

      const $ = cheerio.load(xml, { xmlMode: true });

      const items = [];
      $('item').each((i, el) => {
        const title = $(el).find('title').text();
        const olddescription = $(el).find('description').text();
        const $olddescription = cheerio.load(olddescription);
        const img = $olddescription('img').attr('src');
        $olddescription('img').remove;
        const description = $olddescription.text();
        const link = $(el).find('link').text();
  
        items.push({ title, link, description, img });
      });
  
      console.log(items);
      return items;
    } catch (error) {
      console.error('Error fetching or parsing RSS:', error.message);
    }
  };
  
  
  
  
  
  const scrapeRSSTOIa = async (url) => {
    try {
      const { data: xml } = await axios.get(url);
  
      const $ = cheerio.load(xml, { xmlMode: true });
  
      const items = [];
      $('item').each((i, el) => {
        const title = $(el).find('title').text();
        const olddescription = $(el).find('description').text();
        const $olddescription = cheerio.load(olddescription);
        const img = $olddescription('img').attr('src');
        $olddescription('img').remove;
        $olddescription('a').remove;
        const description = $olddescription.text();
        const link = $(el).find('link').text();
  
        items.push({ title, link, description, img });
      });
  
      console.log(items);
      return items;
    } catch (error) {
      console.error('Error fetching or parsing RSS:', error.message);
    }
  };



  
  
  const scrapeRSSTOIvideo = async (url) => {
    try {
      const { data: xml } = await axios.get(url);
  
      const $ = cheerio.load(xml, { xmlMode: true });
  
      const items = [];
      $('item').each((i, el) => {
        const title = $(el).find('title').text();
        const olddescription = $(el).find('description').text();
        const $olddescription = cheerio.load(olddescription);
        const img = $olddescription('img').attr('src');
        $olddescription('img').remove;
        $olddescription('a').remove;
        const description = $olddescription.text();
        const link = $(el).find('link').text();
        const video = $(el).find('[expression="full"]').attr('url')
  
        items.push({ title, link, description, img , video});
      });
  
      console.log(items);
      return items;
    } catch (error) {
      console.error('Error fetching or parsing RSS:', error.message);
    }
  };



  
const scrapeRSSTOITopStories = async (url) => {
    try {
      const { data: xml } = await axios.get(url);
  
      const $ = cheerio.load(xml, { xmlMode: true });
  
      const items = [];
      $('item').each((i, el) => {
        const title = $(el).find('title').text();
        const description = $(el).find('description').text();
        const link = $(el).find('link').text();
        const img = $(el).find('enclosure').attr('url')
  
        items.push({ title, link, description, img });
      });
  
      console.log(items);
      return items;
    } catch (error) {
      console.error('Error fetching or parsing RSS:', error.message);
    }
  };
  
  
  
  
  
  
  const scrapeRSSTOIUS = async (url) => {
    try {
      const { data: xml } = await axios.get(url);
  
      const $ = cheerio.load(xml, { xmlMode: true });
  
      const items = [];
      $('item').each((i, el) => {
        const title = $(el).find('title').text();
        const link = $(el).find('link').text();
        const olddescription = $(el).find('description').text();
        const $olddescription = cheerio.load(olddescription);
        const img = $olddescription('img').attr('src');
        $olddescription('img').remove;
        $olddescription('a').remove;
        const description = $olddescription.text();
  
  
        items.push({ title, link, description, img });
      });
  
      console.log(items);
      return items;
    } catch (error) {
      console.error('Error fetching or parsing RSS:', error.message);
    }
  };
  
  
  



  

const scrapeRSSBBC = async (url) => {
    try {
      const { data: xml } = await axios.get(url);
  
      const $ = cheerio.load(xml, { xmlMode: true });
  
      const items = [];
      $('item').each((i, el) => {
        const title = $(el).find('title').text();
        const description = $(el).find('description').text();
        const link = $(el).find('link').text();
        const img = $(el).find('[width="240"]').attr('url')
        items.push({ title, link, description, img });
      });
  
      console.log(items);
      return items;
    } catch (error) {
      console.error('Error fetching or parsing RSS:', error.message);
    }
  };
  
  
  
  
  
  
  const scrapeRSSNYT = async (url) => {
    try {
      const { data: xml } = await axios.get(url);
  
      const $ = cheerio.load(xml, { xmlMode: true });
  
      const items = [];
      $('item').each((i, el) => {
        const title = $(el).find('title').text();
        const description = $(el).find('description').text();
        const link = $(el).find('link').text();
        const img = $(el).find('[medium="image"]').attr('url')
        items.push({ title, link, description, img });
      });
  
      console.log(items);
      return items;
    } catch (error) {
      console.error('Error fetching or parsing RSS:', error.message);
    }
  };
  




  app.get("/newsvideo", async function (req, res) {
    const items1 = await scrapeRSSTOIvideo('https://timesofindia.indiatimes.com/rssfeedsvideo/3812907.cms');

    res.json({
        items1,
    })
  })





  



app.get("/topstories", async function(req, res){
    const items1 = await scrapeRSSTOITopStories('https://timesofindia.indiatimes.com/rssfeedstopstories.cms');
    const items2 = await scrapeRSSBBC('https://feeds.bbci.co.uk/news/rss.xml');

    res.json({
        items1,
        items2
    });
})




app.get("/trending", async function(req, res){
    const items1 = await scrapeRSSNYT('https://www.hindustantimes.com/feeds/rss/trending/rssfeed.xml')

    res.json({
        items1
    });
})



app.get("/latest", async function(req, res){
    const items1 = await scrapeRSS('https://timesofindia.indiatimes.com/rssfeedmostrecent.cms');//no images
    const items2 = await scrapeRSSNYT('https://www.hindustantimes.com/feeds/rss/latest/rssfeed.xml')

    res.json({
        items1,
        items2
    });
})



app.get("/india", async function(req, res){
    const items1 = await scrapeRSSTOIimg('https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms');
    const items2 = await scrapeRSSNYT('https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml');


    res.json({
        items1,
        items2
    });
})




// app.get("/world", async function(req, res){
//     const items1 = await scrapeRSSTOIimg('https://timesofindia.indiatimes.com/rssfeeds/296589292.cms');
//     const items2 = await scrapeRSSBBC('https://feeds.bbci.co.uk/news/world/rss.xml');
//     const items3 = await scrapeRSSNYT('https://rss.nytimes.com/services/xml/rss/nyt/World.xml')

//     res.json({
//         items1,
//         items2,
//         items3
//     });
// })





app.get("/business", async function(req, res){
    const items1 = await scrapeRSSTOIimg('https://timesofindia.indiatimes.com/rssfeeds/1898055.cms');
    const items2 = await scrapeRSSBBC('https://feeds.bbci.co.uk/news/business/rss.xml');
    const items3 = await scrapeRSSNYT('https://rss.nytimes.com/services/xml/rss/nyt/Business.xml')

    res.json({
        items1,
        items2,
        items3
    });
})





// app.get("/uk", async function(req, res){
//     const items1 = await scrapeRSSBBC('https://feeds.bbci.co.uk/news/uk/rss.xml');

//     res.json({
//         items1
//     });
// })




app.get("/asia", async function(req, res){
    const items1 = await scrapeRSSNYT('https://rss.nytimes.com/services/xml/rss/nyt/AsiaPacific.xml');
    const items2 = await scrapeRSSBBC('https://feeds.bbci.co.uk/news/world/asia/rss.xml')

    res.json({
        items1,
        items2
    });
})




app.get("/africa", async function(req, res){
    const items1 = await scrapeRSSNYT('https://rss.nytimes.com/services/xml/rss/nyt/Africa.xml');
    const items2 = await scrapeRSSBBC('https://feeds.bbci.co.uk/news/world/africa/rss.xml')

    res.json({
        items1,
        items2
    });
})



app.get("/europe", async function(req, res){
    const items1 = await scrapeRSSNYT('https://rss.nytimes.com/services/xml/rss/nyt/Europe.xml');
    const items2 = await scrapeRSSBBC('https://feeds.bbci.co.uk/news/world/europe/rss.xml')

    res.json({
        items1,
        items2
    });
})


app.get("/latinamerica", async function(req, res){
    const items1 = await scrapeRSSNYT('https://rss.nytimes.com/services/xml/rss/nyt/Americas.xml');
    const items2 = await scrapeRSSBBC('https://feeds.bbci.co.uk/news/world/latin_america/rss.xml')

    res.json({
        items1,
        items2
    });
})




app.get("/middleeast", async function(req, res){
    const items1 = await scrapeRSSNYT('https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml');
    const items2 = await scrapeRSSBBC('https://feeds.bbci.co.uk/news/world/middle_east/rss.xml')

    res.json({
        items1,
        items2
    });
})




app.get("/uscanada", async function(req, res){
    // const items1 = await scrapeRSSTOIUS('https://timesofindia.indiatimes.com/rssfeeds_us/72258322.cms');
    const items1 = await scrapeRSSNYT('https://rss.nytimes.com/services/xml/rss/nyt/US.xml')
    const items2 = await scrapeRSSBBC('https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml')

    res.json({
        // items1,
        items1,
        items2
    });
})





// app.get("/cricket", async function(req, res){
//     const items1 = await scrapeRSSTOIimg('https://timesofindia.indiatimes.com/rssfeeds/54829575.cms');

//     res.json({
//         items1
//     });
// })



app.get("/sports", async function(req, res){
    const items1 = await scrapeRSSTOIimg('https://timesofindia.indiatimes.com/rssfeeds/4719148.cms');

    res.json({
        items1
    });
})





app.get("/science", async function(req, res){
    const items1 = await scrapeRSSTOIimg('https://timesofindia.indiatimes.com/rssfeeds/-2128672765.cms');
    const items2 = await scrapeRSSBBC('https://feeds.bbci.co.uk/news/science_and_environment/rss.xml');
    const items3 = await scrapeRSSNYT('https://rss.nytimes.com/services/xml/rss/nyt/Science.xml');

    res.json({
        items1,
        items2,
        items3
    });
})


app.get("/environment", async function(req, res){
    const items1 = await scrapeRSSTOIimg('https://timesofindia.indiatimes.com/rssfeeds/2647163.cms');
    const items2 = await scrapeRSSBBC('https://feeds.bbci.co.uk/news/science_and_environment/rss.xml');
    const items3 = await scrapeRSSNYT('https://rss.nytimes.com/services/xml/rss/nyt/EnergyEnvironment.xml');

    res.json({
        items1,
        items2,
        items3
    });
})




app.get("/technology", async function(req, res){
    const items1 = await scrapeRSSTOIa('https://timesofindia.indiatimes.com/rssfeeds/66949542.cms');
    const items2 = await scrapeRSSBBC('https://feeds.bbci.co.uk/news/technology/rss.xml');
    const items3 = await scrapeRSSNYT('https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml');

    res.json({
        items1,
        items2,
        items3
    });
})



app.get("/education", async function(req, res){
    const items1 = await scrapeRSSTOIa('https://timesofindia.indiatimes.com/rssfeeds/913168846.cms');
    const items2 = await scrapeRSSBBC('https://feeds.bbci.co.uk/news/education/rss.xml');
    const items3 = await scrapeRSSNYT('https://rss.nytimes.com/services/xml/rss/nyt/Education.xml');

    res.json({
        items1,
        items2,
        items3
    });
})



app.get("/entertainment", async function(req, res){
    const items1 = await scrapeRSSTOIimg('https://timesofindia.indiatimes.com/rssfeeds/1081479906.cms');
    const items2 = await scrapeRSSBBC('https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml');

    res.json({
        items1,
        items2
    });
})



app.get("/lifestyle", async function(req, res){
    const items1 = await scrapeRSSTOIimg('https://timesofindia.indiatimes.com/rssfeeds/2886704.cms');
    const items2 = await scrapeRSSNYT('https://rss.nytimes.com/services/xml/rss/nyt/FashionandStyle.xml');

    res.json({
        items1,
        items2
    });
})




app.get("/most_viewed", async function(req, res){
    const items1 = await scrapeRSS('https://timesofindia.indiatimes.com/rssfeedmostread.cms');//no images
    const items2 = await scrapeRSSNYT('https://rss.nytimes.com/services/xml/rss/nyt/MostViewed.xml')

    res.json({
        items1,
        items2
    });
})





app.get("/astrology", async function(req, res){
    const items1 = await scrapeRSSTOIimg('https://timesofindia.indiatimes.com/rssfeeds/65857041.cms');

    res.json({
        items1
    });
})



app.get("/politics", async function(req, res){
    const items1 = await scrapeRSSBBC('https://feeds.bbci.co.uk/news/politics/rss.xml');
    const items2 = await scrapeRSSNYT('https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml')

    res.json({
        items1,
        items2
    });
})



app.get("/health", async function(req, res){
    const items1 = await scrapeRSSBBC('https://feeds.bbci.co.uk/news/health/rss.xml');
    const items2 = await scrapeRSSNYT('https://rss.nytimes.com/services/xml/rss/nyt/Health.xml')

    res.json({
        items1,
        items2
    });
})




app.get("/automobiles", async function(req, res){
    const items1 = await scrapeRSSTOIimg('https://timesofindia.indiatimes.com/rssfeeds/74317216.cms');
    const items2 = await scrapeRSSNYT('https://rss.nytimes.com/services/xml/rss/nyt/Automobiles.xml')

    res.json({
        items1,
        items2
    });
})




/////////////////////////
// Uploads an image file
/////////////////////////
const uploadImage = async (imagePath) => {

    // Use the uploaded file's name as the asset's public ID and 
    // allow overwriting the asset with new versions
    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    };

    try {
      // Upload the image
      const result = await cloudinary.uploader.upload(imagePath, { 
        use_filename: true});
      console.log(result);
      return result.public_id;
    } catch (error) {
      console.error("the error is:",error);
    }
};


app.post("/avatar", async function(req, res){
    const ObjectId = req.ObjectId;
    // console.log('i am in profile');
    console.log(ObjectId);
    const user = await UserModel.findOne({_id: ObjectId});
    console.log(user);

    const {avatarUrl} = req.body; 

    try {
        

        const result = await cloudinary.uploader.upload(avatarUrl, {
        folder: 'avatars',
        });

        await UserModel.updateOne(
            {_id: ObjectId} , {$set:{ avatarUrl: result.secure_url}}
        )

        res.json({ url: result.secure_url });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: 'Failed to upload image' });
    }

   

})


app.get("/info", async function(req, res){
    const ObjectId = req.ObjectId;
    // console.log('i am in profile');
    console.log(ObjectId);
    const user = await UserModel.findOne({_id: ObjectId});
    console.log(user);
    if(user){
        res.json({
            user,
        })
    }
    else{
        res.send({
            error: "some error"
        })
    }
    
})



app.post("/profile", async function (req, res) {
    
    const ObjectId = req.ObjectId;
    // console.log('i am in profile');
    console.log(ObjectId);
    const user = await UserModel.findOne({_id: ObjectId});
    console.log(user);
    const bodyContent = z.object({
        name: z.string().min(3).max(50),
        password: z.string().min(8).max(20)
    }).strict();

    const check = await bodyContent.safeParse(req.body);

    if(!check.success){
        res.status(400).json({
            message: "incorrect format",
            error: check.error
        });
        return;
    }

    const {name, password} = req.body;

    try{
        const hashedPassword = await bcrypt.hash(password, 5);

        await UserModel.updateOne(
            {_id: ObjectId} , {$set:{ name: name, password: hashedPassword}}
        )

        res.json({
            message: "user updated"
        })
    }
    catch(e){
        res.json({
            message: "user not updated",
            error: e
        });
    }


    // res.json({
    //     // message: "i am in profile",
    //     // ObjectId: ObjectId
    // })

})


app.post("/logout", async function (req, res) {
    const ObjectId = req.ObjectId;
    // console.log('i am in profile');
    console.log(ObjectId);
    const user = await UserModel.findOne({_id: ObjectId});

    if(user){
        res.json({
            user,
        })
    }else{
        res.send({
            message:"some error occured"
        })
    }
})



app.listen(8000,  () => console.log('Running on port 8000'));