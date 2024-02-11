let express = require("express");
let app = express();
const schema = require ("./schema/schema.json")
const {redisConnection} = require ("./controllers/redisConnection")
const Ajv = require("ajv");
const { generatedEtag } = require("./utils/generateEtag");
const ajv = new Ajv();
let client =''

const validate = ajv.compile(schema);

app.use(express.json());

app.post("/plan", async(req,res) => {
    const { body } = req;
    const validCheck = validate(body);
    if(!validCheck){
        res.sendStatus(400).send("Invalid request");
    }
    else{
        const redisData = await client.set(
          req.body.objectType + ":" + req.body.objectId,
          JSON.stringify(req.body)  
        );
        let storedJsonData = await client.get(
            req.body.objectType + ":" + req.body.objectId
        );
        console.log("stored Json data",storedJsonData);

        res.sendStatus(200);
            
    }
} );

app.get("/plan/:id", async(req, res) =>{
    const data = JSON.parse(await client.get(req.params.id));
    if(!data){
        res.sendStatus(404);
    }
    const storedEtag = generatedEtag(data);
    console.log("Etag",storedEtag);
    if(storedEtag == null){
        res.send(data);
    }else{
        const clientEtag = req.headers["if-none-match"];
        console.log("clientetag",clientEtag);
        if(clientEtag && clientEtag.trim() == storedEtag.trim()){
            res.sendStatus(304);
        }else{
            res.send(data);
        }
    }
});

app.get("/plan", async(req, res) =>{
    try{
        console.log("hitting here")
        const keys = await client.keys("*");
        console.log("the keys", keys)
        const values = await Promise.all(
            keys.map(async (key) => {
                return JSON.parse(await client.get(key))
            })
        );
        console.log("values",values);
        if(values.length == 0){
            res.sendStatus(204);
        } else{
            res.status(200).send(values);
        }   
    }catch(error){
        res.sendStatus(500);
    }

});

app.delete("/plan/:id", async(req,res) =>{
    const deleteData = await client.del(req.params.id);
    console.log("delete data",deleteData);
    if(deleteData){
        res.sendStatus(204);
    }
    else{
        res.sendStatus(404);
    }
});


let server = app.listen(8080, async function (req, res) {
  console.log("the server is up and running on port 8080");
  client = await redisConnection();
});

