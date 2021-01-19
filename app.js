
const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-Manav:Test123@cluster0.z99qh.mongodb.net/todolistDB",{useNewUrlParser:true,useUnifiedTopology: true});
const itemsSchema={
  name:String
};
const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"Hello There!",
});


const defaultItems=[item1];
const listSchema={
  name:String,
  items:[itemsSchema]
};
const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {

Item.find({},function(err,foundItems){
  if(foundItems.length===0){
Item.insertMany(defaultItems,function(err){
if(err){
  console.Log(err);
}
else{
  console.log("Added");
}
});
res.redirect("/");
  }
  else{
    res.render("list", {listTitle: "Today", newListItems: foundItems}); 
  }
  
});
});
app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list=new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
    else{
      res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
    }
  }
  })
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item =new Item({
    name:itemName
  });
  if(listName==="Today"){
  item.save();
  res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
});

app.post("/delete",function(req,res){
  const checkedID=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.deleteOne({_id:checkedID},function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Deleted");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedID}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

})

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
