const express = require('express');

const app = express();

app.use(express);

app.get('/',(request,response)=>{
    return response.json({message: "Servidor funcionando"});
})

app.post('/teste',(request,response)=>{
    const {name,date} = request.body;

    return response.json({name,date});
})

app.listen(3333)
