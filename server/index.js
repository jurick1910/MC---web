var express=require("express")
var bodyParser=require("body-parser")
var mongoose=require("mongoose")

const app=express()

app.use(bodyParser.json())
app.use(express.static('../client'))
app.use(bodyParser.urlencoded({
    extended:true
}))

mongoose.connect('mongodb://localhost:27017/Database')
var db=mongoose.connection
db.on('error',()=> console.log("Error in Connecting to Database"))
db.once('open',()=> console.log("Connected to Database"))

const symptomSchema = new mongoose.Schema({
    name: String
});

const Symptom = mongoose.model('Symptom', symptomSchema);

const noteSchema = new mongoose.Schema({
    content: String,
    date: { type: Date, default: Date.now }
});

const Note = mongoose.model('Note', noteSchema);

const dodatniSimptomiSchema = new mongoose.Schema({
    notes: String,
    date: { type: Date, default: Date.now }
});
const DodatniSimptomi = mongoose.model('DodatniSimptomi', dodatniSimptomiSchema);


app.post("/sign_up", (req,res) => {
    var username = req.body.username
    var name= req.body.name
    var l_name=req.body.l_name
    var email=req.body.email
    var password=req.body.password

    var data={
        "username":username,
        "name":name,
        "l_name":l_name,
        "email":email,
        "password":password
    }
    db.collection('users').insertOne(data,(err,collection) => {
        if(err){
            throw err;
        }
        console.log("Record Inserted Succesfully")
    })
    return res.redirect('index.html')
})

app.post("/sign_in",async (req,res) => {
    var username = req.body.username
    var password=req.body.password

    var data={
        "username":username,
        "password":password
    }
    const user = await db.collection('users').findOne(data,(err,collection) => {
        if(err){
            throw err;
        }})
    console.log(user)
    if (user) {
        return res.redirect('Kalendar.html')
    } else {
        return res.redirect('Naslovna stranica error.html')
    }

})

app.post("/update_password", async (req, res) => {
    var username = req.body.username;
    var email = req.body.email;
    var newPassword = req.body.newPassword;

    try {
        const user = await db.collection('users').findOne({ "username": username, "email": email });
        if (user) {
            await db.collection('users').updateOne({ "username": username, "email": email }, { $set: { "password": newPassword } });
            console.log("Password Updated Successfully");
            return res.status(200).redirect("Profil update.html");
        } else {
            return res.status(404).redirect("Profil error.html");
        }
    } catch (err) {
        console.error("Error updating password:", err);
        return res.status(500).send("Internal Server Error");
    }
})
app.post("/save_symptoms", async (req, res) => {
    const symptoms = req.body.symptoms;

    try {
        await Symptom.deleteMany({});

        const newSymptoms = await Promise.all(symptoms.map(symptom => {
            const newSymptom = new Symptom({
                name: symptom
            });
            return newSymptom.save();
        }));

        console.log("Symptoms saved:", newSymptoms);
        return res.status(200).json({ message: 'Symptoms saved successfully' });
    } catch (err) {
        console.error("Error saving symptoms:", err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/save_dodatni_simptomi', async (req, res) => {
    const { notes } = req.body;

    if (!notes) {
        return res.status(400).json({ error: 'Notes content is required' });
    }
    try {
        const newNote = new DodatniSimptomi({ notes });
        await newNote.save();
        res.status(200).json({ message: 'Notes saved successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save notes' });
    }
});

app.post("/save_notes", async (req, res) => {
    const notes = req.body.notes;

    try {
        const newNote = new Note({
            content: notes
        });
        await newNote.save();
        console.log("Notes saved:", newNote);
        return res.status(200).json({ message: 'Notes saved successfully' });
    } catch (err) {
        console.error("Error saving notes:", err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post("/save_symptoms", async (req, res) => {
    const notes = req.body.notes;
    
    try {
        const newSymp = new Symptoms({
            content: notes
        });
        await newSymp.save();

        console.log("Symptoms saved:", newSymp);
        return res.status(200).json({ message: 'Symptoms saved successfully' });
    } catch (err) {
        console.error("Error saving symptoms:", err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get("/",(req,res) => {
    res.set({
        "Allow-acces-Allow-Origin":'*'
    })
    return res.redirect('Registracija.html')
}).listen(3000);

console.log("Listening on port 3000")
