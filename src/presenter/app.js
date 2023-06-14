import IOHandler from "../view/IOHandler.js";
import TasksWorker from "../model/TaskWorker.js";
import "colors";
class App {
  constructor(ioHandler, tasksWorker) {
    this.ioHandler = ioHandler;
    this.tasksWorker = tasksWorker;
    this.mainMenuChoices = [
      {
        name: "1. Crear Tarea",
        value: 1,
      },
      {
        name: "2. Listar Tareas",
        value: 2,
      },
      {
        name: "3. Listar Tareas Completadas",
        value: 3,
      },
      {
        name: "4. Listar Tareas Pendientes",
        value: 4,
      },
      {
        name: "5. Completar Tarea(s)",
        value: 5,
      },
      {
        name: "6. Borrar Tarea",
        value: 6,
      },
      {
        name: "7. Limpiar el terminal",
        value: 7,
      },
      {
        name: "0. Salir",
        value: 0,
      },
    ];
    this.welcomeMessage =
      "\n======================".green +
      "\n" +
      "       TODO APP       ".cyan +
      "\n" +
      "======================".green +
      "\n";
  }

  init = async () => {
    let exitFlag = false;
    do {
      this.ioHandler.writeLine(this.welcomeMessage);
      let option = await this.ioHandler.ask(
        {
          type: "list",
          message: `${"Bienvenido... Selecciona una opción: ".yellow} \n`.yellow,
          choices: this.mainMenuChoices,
        }
      );
      if (option === 0) {
        this.exit()
        exitFlag = true;
      } else {
        await this.ioHandler.pause(`\nPresiona ${"ENTER".blue} para continuar...`);
        await this.runServices(option);
      }
    } while (!exitFlag);
  };
  exit = () => {
    this.ioHandler.writeLine(`\n${"¡Hasta luego!".yellow + "\n"}`);
    process.exit(0);
  }
  runServices = async (option) => {
    let taskTitlesArray = [];
    let tasksArray = [];
    let tasksIDs = []
    switch (option) {
      case 1:
        let wasCreated;
        let title = await this.ioHandler.ask({
          type: "input",
          message: "Título de la tarea: "
        });
        let whitDueDate = await this.ioHandler.ask({
          type: "confirm",
          message: "¿Deseas agregar una fecha de vencimiento?: "
        })
        if (whitDueDate) {
          let dueDate = await this.ioHandler.ask({
            type: "date",
            message: "Fecha de vencimiento: "
          })
          wasCreated = await this.tasksWorker.createTask({
            title: title,
            dueDate: dueDate.toLocaleDateString()
          })
        } else {
          wasCreated = await this.tasksWorker.createTask({
            title: title,
          });
        }
        wasCreated
          ? this.ioHandler.writeLine("Tarea creada con exito".black.bgGreen)
          : this.ioHandler.writeLine("No se pudo crear la tarea".black.bgRed);
        break;
      case 2:
        let tasks = await this.tasksWorker.listTasks();
        this.ioHandler.writeLine("Todas las tareas: ".black.bgGreen + "\n");
        for (const task of tasks) {
          this.ioHandler.writeLine(`${task.title}`.yellow + ` -> ${task.done ? "Completada".black.bgGreen : "Pendiente".black.bgRed}` + `:: ${task.dueDate ? task.dueDate : "Sin fecha de vencimiento"}`.cyan);
        }
        break;
      case 3:
        let doneTasks = await this.tasksWorker.listTasks("done");
        if (doneTasks.length === 0) this.ioHandler.writeLine("No hay tareas completadas".black.bgRed);
        for (const task of doneTasks) {
          this.ioHandler.writeLine(`${task.title}`.yellow + ` -> ` + `Completada el: ${task.completedOn}`.green);
        }
        break;
      case 4:
        let pendingTasks = await this.tasksWorker.listTasks("pending");
        if (pendingTasks.length === 0) this.ioHandler.writeLine("No hay tareas pendientes".black.bgGreen);
        for (const task of pendingTasks) {
          this.ioHandler.writeLine(`${task.title}` + ` -> ` + `Pendiente para el: ${task.dueDate ? task.dueDate : "Sin fecha de vencimiento"}`.red);
        }
        break;
      case 5:
        tasksArray = await this.tasksWorker.loadTasks();
        tasksArray = tasksArray.filter((task) => !task.done);
        tasksArray.forEach((task) => {
          taskTitlesArray.push({
            name: `${task.title} -> ${task.dueDate ? task.dueDate : "Sin fecha de vencimiento"}`,
            value: task.id,
          });
        });
        tasksIDs = await this.ioHandler.ask({ type: "checkbox", message: "Selecciona la(s) tarea(s) a completar: ", choices: taskTitlesArray });
        for (const ID of tasksIDs) {
          let wasCompleted = await this.tasksWorker.completeTask(ID);
          this.ioHandler.writeLine(`${"Tarea: ".yellow + ID} -> ${wasCompleted ? "Completada".black.bgGreen : "No se pudo completar".black.bgRed}`)
        }
        break;
      case 6:
        tasksArray = await this.tasksWorker.loadTasks();
        tasksArray.forEach((task) => {
          taskTitlesArray.push({
            name: `${task.title} -> ${task.dueDate ? task.dueDate : "Sin fecha de vencimiento"}`,
            value: task.id,
          })
        })
        tasksIDs = await this.ioHandler.ask({ type: "checkbox", message: "Selecciona la(s) tarea(s) a borrar: ", choices: taskTitlesArray });
        for (const ID of tasksIDs) {
          let wasDeleted = await this.tasksWorker.deleteTask(ID);
          this.ioHandler.writeLine(`${"Tarea: ".yellow + ID} -> ${wasDeleted ? "Borrada".black.bgRed : "No se pudo borrar".white.bgRed}`)
        }
        break;
      case 7:
        this.ioHandler.clear();
        await this.init();
        break;
    }
  };
}
let app = new App(new IOHandler(), new TasksWorker());
app.init();
