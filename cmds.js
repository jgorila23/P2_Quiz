const {log, biglog, errorlog, colorize} = require("./out");
const model = require('./model');
const quizzes = require('./quizzes');
/**
 * Muestra la ayuda
 *
 * @param rl Objeto readline usando para implementar el CLI
 */
exports.helpCmd = rl => {
    log("Commandos:");
    log("  h|help - Muestra esta ayuda.");
    log("  list - Listar los quizzes existentes.");
    log("  show <id> - Muestra la pregunta y la respuesta del quiz indicado..");
    log("  add - Añadir un nuevo quiz interactivamente");
    log("  delete<id>  Borrar el quiz indicado.");
    log("  edit<id> - Borrar el quiz indicado.");
    log("  test<id> - Borrar el quiz indicado.");
    log("  p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
    log("  credits - Créditos.");
    log("  q|quit - Salir del programa.");
    rl.prompt();
};

/**
 * Lista todos los quizzes existentes en el modelo.
 * @param rl Objeto readline usando para implementar el CLI
 */
exports.listCmd = rl => {
    model.getAll().forEach((quiz, id) => {
        log(` [${colorize(id, 'magenta')}]: ${quiz.question}`);
    });
    rl.prompt();
};

/**
 * Muestra el quiz indicado en el parametro: la pregunta y la respuesta
 *
 * @param rl Objeto readline usando para implementar el CLI
 * @param id Clave del quiz a mostrar
 */
exports.showCmd = (rl, id) => {
    if (typeof id === "undefined"){
        errorlog(`Fata el parámetro id.`);
    } else{
        try{
            const quiz = model.getByIndex(id);
            log(` [${colorize(id, 'magenta')}]:   ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
        }catch(error){
            errorlog(error.message);
        }
    }
    rl.prompt();
};

/**
 * Añade un nuevo quiz al modelo.
 * Pregunta interactivamente por la pregunta y la respuesta.
 *
 * Hay que recordar que el funcionamiento de la función rl.question es asincrono.
 * El prompt hay que sacarlo cuando ya se ha terminado la interacción con el usuario,
 * es decir, la llamada rl.prompt() se debe hacer en la callback de la segunda
 * llamada a rl.question.
 *
 * @param rl Objeto readline usando para implementar el CLI
 */
exports.addCmd = rl => {
    rl.question(colorize('Introduzca una pregunta: ', 'red'), question => {

        rl.question(colorize(' Introduzca la respuesta ', 'red'), answer => {

            model.add(question, answer);
            log(` ${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>', 'magenta' )} ${answer}`);
            rl.prompt();
        });
    })

};

/**
 * Borra un quiz del modelo.
 *
 * @param rl Objeto readline usando para implementar el CLI
 * @param id Clave del quiz a borrar en el modelo.
 */
exports.deleteCmd = (rl,id) => {
    if (typeof id === "undefined"){
        errorlog(`Fata el parámetro id.`);
    } else{
        try{
            model.deleteByIndex(id);
        }catch(error){
            errorlog(error.message);
        }
    }
    rl.prompt();
};

/**
 * Edita un quiz del modelo.
 *
 * Hay que redcordar que el funcionamiento de la funcion rl.question es asíncrono.
 * El prompt hay que sacarlo cuando ya se ha terminado la interacción con el usuario,
 * es decir, la llamada a rl.prompt() se debe hacer en la callback de la segunda
 * llamada a rl.question.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 * @param id Clave del quiz a editar en el modelo.
 */
exports.editCmd = (rl, id) => {
    if (typeof id === "undefined"){
        errorlog(`Falta el parametro id.`);
        rl.prompt();
    }else{
        try{
            const quiz = model.getByIndex(id);

            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);
            rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {
                process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
                rl.question(colorize(' introduzca la respuesta ', 'red'), answer => {
                    model.update(id, question, answer);
                    log(` Se ha cambiado el quiz ${colorize(id, 'magenta')} por: ${question} ${colorize('=>', 'magenta' )} ${answer}`);
                    rl.prompt();
                });
            });
        } catch (error){
            errorlog(error.message);
            rl.prompt();
        }
    }
};

/**
 * Prueba un quiz, es decir, hace una preguntadel modelo a la que debemos de contestar.
 *
 * @param rl Objeto readline usando para implementar el CLI
 * @param id clave del quiz a probar.
 */
exports.testCmd = (rl,id) => {
    if (typeof id === "undefined"){
        errorlog(`El parámetro ID no se reconoce.`);
        rl.prompt();
    }

    else {

        try{

            const pregunta = model.getByIndex(id);
            rl.question(colorize(pregunta.question + '? ', 'red'), question => {
                if(question.toUpperCase().trim() === pregunta.answer.toUpperCase()){
                    log("Su respuesta es CORRECTA", 'green');
                    rl.prompt();

            }

            else {

                log("Su respuesta es INCORRECTA", 'red');
                rl.prompt();
            }
        });

        } catch (error){
            errorlog(error.message);
            rl.prompt();
        }
    }

};

/**
 * Pregunta todos los quizzes existentes en el modelo en orden aleatorio.
 * Se gana si se contesta a todos satisfactoriamente.
 *
 * @param rl Objeto readline usando para implementar el CLI
 */
exports.playCmd = rl => {

    let score = 0;
    let toBeResolve = [];
    let arrayPreguntas = [];
    arrayPreguntas = model.getAll();
    for (let i=0;i<model.count(); i++) {
        toBeResolve[i]=i;
    }

    const play = () => {
        if(toBeResolve.length === 0) {
            log('No hay nada más que preguntar.');
            log('Fin del juego. Aciertos: ' + score);
            biglog( score , 'magenta');
            rl.prompt();

        } else {
            try {
                let id = Math.floor(model.count()*Math.random());

                if(id > arrayPreguntas.length-1) {
                    play();
                }
                toBeResolve.splice(id,1);
                let quiz = "¿" + arrayPreguntas[id].question + "? ";
                rl.question (colorize (quiz, 'red'), respuesta => {
                    if( respuesta.toUpperCase().trim() === arrayPreguntas[id].answer.toUpperCase().trim()) {
                        score++;
                        arrayPreguntas.splice(id,1);
                        log('Correcto - LLeva ' + score + ' aciertos');
                        play();
                    } else {
                        log('Incorrecto');
                        log('Fin del juego - Aciertos: ' + score);
                        biglog(score, 'magenta');
                        rl.prompt();

                    }

                });

            } catch (error) {}

        }
    };

    play();


};





/**
 * Muestra los nombre de los autores de la practica.
 *
 * @param rl Objeto readline usando para implementar el CLI
 */
exports.creditsCmd = rl => {
    log('Autores de la practica:');
    log('victordepablo', 'green');
    log('marioesperalta', 'green');
    rl.prompt();
};


/**
 * Terminar el programa.
 *
 * @param rl Objeto readline usando para implementar el CLI
 */
exports.quitCmd = rl => {
    rl.close();
};
