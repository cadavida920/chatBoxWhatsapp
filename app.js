const { createBot, createProvider, createFlow, addKeyword, EVENTS, addAnswer } = require('@bot-whatsapp/bot')
require("dotenv").config

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
//const MockAdapter = require('@bot-whatsapp/database/monck')
const MongoAdapter = require('@bot-whatsapp/database/mongo')
const path = require('path')
const fs = require('fs')
const openai = require("./chatGPT.js")
const chat = require('./chatGPT.js')
const { handlerAI } = require("./whisper")


const menuPhat = path.join(__dirname, "mensajes", "menu.txt")
const menu = fs.readFileSync(menuPhat, "utf-8")

const PhatConsultas = path.join(__dirname, "mensajes", "promptConsultas.txt")
const PromptConsultas = fs.readFileSync(PhatConsultas, "utf-8")

const flowVoice = addKeyword(EVENTS.VOICE_NOTE).addAnswer("Esta es una nota de voz", null, async (ctx, ctxFn) => {
    try {
        const text = await handlerAI(ctx)
        const prompt = PromptConsultas
        const consulta = text
        const answer = await chat(prompt, consulta)
        await ctxFn.flowDynamic(answer.content)
    } catch (error) {
        console.log(error);
    }
})


const flowMenuRest = addKeyword(EVENTS.ACTION)
    .addAnswer('Tapete De Agua Sensorial Para Bebes', {
        media: "https://d39ru7awumhhs2.cloudfront.net/colombia/products/1242242/1727221083WhatsApp%20Image%202024-09-24%20at%206.30.07%20PM.jpeg"
    })
    .addAnswer(
        menu,
        { capture: true },
        async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
            console.log("entro");
            if (!["1", "2", "3", "0"].includes(ctx.body)) {
                return fallBack(
                    "Respuesta no valida, por favor selecciona una de las opciones."
                );
            }
            switch (ctx.body) {
                case "1":
                    return gotoFlow(flowMenuRest);
                case "2":
                    return gotoFlow(flowReservas);
                case "3":
                    return gotoFlow(flowConsultas);
    
                case "0":
                    console.log("salir");
                    return await flowDynamic(
                        "Saliendo.. Puedes volver a acceder a este menu escribiendo '*Menu*'"
                    );
            }
        }
    )
    

const flowReservas = addKeyword(EVENTS.ACTION)
    .addAnswer('Libro De Estudio Con Sonido Para Ninos', {
        media: "https://d39ru7awumhhs2.cloudfront.net/colombia/products/1220537/1726761073WhatsApp%20Image%202024-09-19%20at%2010.47.57%20AM.jpeg "
    })

const flowConsultas = addKeyword(EVENTS.ACTION)
    .addAnswer('bebe')
    .addAnswer("Hace tu consulta", { capture: true }, async (ctx, ctxFn) => {
        const prompt = promptConsultas
        const consulta = ctx.Body
        const answer = await chat(prompt, consulta)
        await ctxFn.flowDynamic(answer.content)
    })



const flowWelcom = addKeyword(EVENTS.WELCOME)
addAnswer("Este es un flujo welcome", {
    delay: 100,
    media: "link de la foto",
},
    async (ctx, ctxFun) => {
        console.log(ctx.body)
        await ctxFun.flowDynamic("Este es un flujo welcome")
    })

const menuFlow = addKeyword("Glow store", "Quiero mas informacion").addAnswer(
    menu,
    { capture: true },
    async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
        console.log("entro");
        if (!["1", "2", "3", "0"].includes(ctx.body)) {
            return fallBack(
                "Respuesta no valida, por favor selecciona una de las opciones."
            );
        }
        switch (ctx.body) {
            case "1":
                return gotoFlow(flowMenuRest);
            case "2":
                return gotoFlow(flowReservas);
            case "3":
                return gotoFlow(flowConsultas);

            case "0":
                console.log("salir");
                return await flowDynamic(
                    "Saliendo.. Puedes volver a acceder a este menu escribiendo '*Menu*'"
                );
        }
    }
)

const main = async () => {
    const adapterDB = new MongoAdapter({
        dbUri: process.env.MONGO_DB_URI,
        dbName: "GlowStore",
    })
    const adapterFlow = createFlow([flowWelcom, menuFlow, flowMenuRest, flowReservas, flowConsultas, flowVoice])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
