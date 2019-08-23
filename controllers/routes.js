var express = require("express");
var router = express.Router();
var Note = require("../models/Note.js");
var Article = require("../models/Article.js");
var cheerio = require("cheerio");
var request = require("request");


router.get("/", function (req, res) {

  Article.find({})
    .populate("Notes")
    .exec(function (error, doc) {
      if (error) {
        console.log(error);
      }
      else {
        console.log("all article with Notes: " + doc);
        res.render("index", {
          articles: doc
        });
      }
    });

});

router.get("/scrape", function (req, res) {
  // First, we grab the body of the html with request
  request("http://www.npr.org/sections/national/", function (error, response, html) {

    var $ = cheerio.load(html);

    $(".has-image").each(function (i, element) {

      var result = {};
      result.link = $(element).children(".item-info").children(".title").children().attr("href");
      result.title = $(element).children(".item-info").children(".title").children().text();
      result.snipText = $(element).children(".item-info").children(".teaser").children("a").text();
      result.imageLink = $(element).children(".item-image").children(".imagewrap").children("a").children("img").attr("src");


      Article.findOne({
        title: result.title
      }, function (err, data) {
        if (!data) {
          var entry = new Article(result);

          entry.save(function (err, doc) {
            if (err) {
              console.log(err);
            }
            else {
              console.log("saving article, title: " + doc.title);
            }
          });

        } else {
          console.log("this aritcle is already in db: " + data.title);
        }
      });
    });

    $(".no-image").each(function (i, element) {
      var result = {};
      result.link = $(element).children(".item-info").children(".title").children().attr("href");
      result.title = $(element).children(".item-info").children(".title").children("a").text();
      result.snipText = $(element).children(".item-info").children(".teaser").children().text();
      result.imageLink = "no image";

      Article.findOne({
        title: result.title
      }, function (err, data) {
        if (!data) {
          var entry = new Article(result);

          entry.save(function (err, doc) {
            if (err) {
              console.log(err);
            }
            else {
              console.log("saving article, title: " + doc.title);
            }
          });

        } else {
          console.log("this aritcle is already in db: " + data.title);
        }
      });

    });

    res.redirect("/");
  });

});


router.get("/article/:id", function (req, res) {
  Article.findOne({
      "_id": req.params.id
    })
    .populate("Notes")
    .exec(function (error, doc) {
      if (error) {
        console.log(error);
      }
      else {
        res.json(doc);
      }
    });
});

router.get("/articles", function (req, res) {
  Article.find({}, function (error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(doc);
    }
  });
});

router.post("/article/:id", function (req, res) {
  var newNote = new Note(req.body);
  newNote.save(function (error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      Article.findOneAndUpdate({
        "_id": req.params.id
      }, {
        $push: {
          "Notes": doc._id
        }
      }, {
        new: true
      }, function (err, doc) {
        if (err) {
          console.log("add Note to article: " + err);
        } else {
          res.redirect("/");
        }

      });
    }

  });
});

module.exports = router;