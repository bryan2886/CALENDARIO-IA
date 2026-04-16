import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import  OpenAI  from "openai";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
    baseURL: process.env.API_URL,
    apiKey: process.env.API_KEY,
});

app.post("/calendar", async (req, res) => {
    const{day, month, year} = req.body;
    if(!day || !month || !year){
        return res.status(400).json({error: "Faltan datos requeridos"});
    }


    try {
        const userPrompt = `Dime una noticia resumida de máximo 500 caracteres sobre 
        algo que pasó el día ${day} 
        del mes ${month} 
        del año ${year}. 
        Tienes que retornal algo, investiga y busca cosas que pasaron.
        No hagas intrucciones,ni formalismo,ni preguntas, 
        ni nada que haga ver que eres una IA.
        Esto no es un chatbot, solo requiero una noticia de ese dia`;

        const completion = await client.chat.completions.create({
            model: process.env.MODEL,
            messages:[
                {role: "user", content: userPrompt}
            ],
        });

        let text = completion.choices[0].message.content.trim();
        return res.json({text});

    }catch (error) {
        res.status(500).json({error: "Error al obtener noticias"}); 
    }   
});

app.listen(3000, () => {
    console.log("Servidor corriendo en puerto 3000");
});