const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.je2pvxf.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const blogCollection = client.db("blogDB").collection("blogs");
    const commentCollection = client.db("blogDB").collection("comments");

    //blog api
    app.post("/allBlogs", async (req, res) => {
      try {
        const blogData = req.body;
        console.log(blogData);
        const result = await blogCollection.insertOne(blogData);
        res.send(result);
      } catch (error) {
        res.status(500).send("Internal Server Error");
      }
    });
    app.get("/allBlogs", async (req, res) => {
      try {
        const result = await blogCollection.find().toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send("Internal Server Error");
      }
    });

    app.get("/blog/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await blogCollection.findOne(query);
        if (!result) {
          res.status(404).send("Recipe not found");
          return;
        }
        res.send(result);
      } catch (error) {
        res.status(500).send("Internal Server Error");
      }
    });

    app.delete("/blog/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await blogCollection.deleteOne(query);
        if (result.deletedCount === 0) {
          res.status(404).send("blog not found");
          return;
        }
        res.send(result);
      } catch (error) {
        res.status(500).send("Internal Server Error");
      }
    });

    app.put("/blog/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const blog = req.body;
        const query = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updateBlog = {
          $set: {
            ...blog,
          },
        };
        const result = await blogCollection.updateOne(
          query,
          updateBlog,
          options
        );
        if (result.matchedCount === 0) {
          res.status(404).send("blog not found");
          return;
        }
        res.send(result);
      } catch (error) {
        res.status(500).send("Internal Server Error");
      }
    });

    //comment api
    app.post("/comments", async (req, res) => {
      try {
        const commentData = req.body;
        console.log(commentData);
        const result = await commentCollection.insertOne(commentData);
        res.send(result);
      } catch (error) {
        res.status(500).send("Internal Server Error");
      }
    });
    app.get("/comments", async (req, res) => {
      try {
        const result = await commentCollection.find({}).toArray();
        console.log(result);
        res.send(result);
      } catch (error) {
        res.status(500).send("Internal Server Error");
      }
    });
    app.get("/comments/:blogID", async (req, res) => {
      try {
        const blogID = req.params.blogID;
        const result = await commentCollection.find({ blogID }).toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send("Internal Server Error");
      }
    });
    app.delete("/comment/:commentID", async (req, res) => {
      try {
        const id = req.params.commentID;
        const query = { commentID: Number(id) };
        const result = await commentCollection.deleteOne(query);
        if (result.deletedCount === 0) {
          res.status(404).send("comment not found");
          return;
        }
        res.send(result);
      } catch (error) {
        res.status(500).send("Internal Server Error");
      }
    });
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("blog Server is running");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
