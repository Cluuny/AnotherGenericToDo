import IOHandler from "../view/IOHandler.js";
import TasksWorker from "../model/TaskWorker.js";
import chalk from "chalk";
class App {
  constructor() {
    this.ioHandler = new IOHandler();
    this.tasksWorker = new TasksWorker();
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
    this.welcomeMessage = "\n\tAnother Generic To-Do App\n"
  }

  init = async () => {
    let exitFlag = false;
    do {
      this.ioHandler.writeLine(chalk.underline.magenta.bold(this.welcomeMessage));
      let option = await this.ioHandler.ask(
        {
          type: "list",
          message: chalk.yellowBright.bold("Selecciona una opción: "),
          choices: this.mainMenuChoices,
        }
      );
      if (option === 0) {
        this.exit()
        exitFlag = true;
      } else {
        await this.ioHandler.pause(chalk.bold(`\nPresiona ${chalk.bgBlueBright("ENTER")} para continuar...\n`));
        await this.runServices(option);
      }
    } while (!exitFlag);
  };
  exit = () => {
    this.ioHandler.writeLine(chalk.yellowBright.bold("\n\tHasta luego!\n"));
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
          message: chalk.bold("Título de la tarea: ")
        });
        let whitDueDate = await this.ioHandler.ask({
          type: "confirm",
          message: chalk.bold("¿Deseas agregar una fecha de vencimiento?: ")
        })
        if (whitDueDate) {
          let dueDate = await this.ioHandler.ask({
            type: "date",
            message: chalk.bold("Fecha de vencimiento: ")
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
          ? this.ioHandler.writeLine(chalk.underline.greenBright("Tarea creada con exito"))
          : this.ioHandler.writeLine(chalk.underline.redBright("No se pudo crear la tarea"));
        break;
      case 2:
        let tasks = await this.tasksWorker.listTasks();
        this.ioHandler.writeLine(chalk.underline.greenBright("Todas las tareas:\n"));
        for (const task of tasks) {
          this.ioHandler.writeLine(`${chalk.white(task.title)} -> ${task.done ? chalk.greenBright("Completada") : chalk.redBright("Pendiente")} :: ${chalk.yellowBright(task.dueDate ? task.dueDate : "Sin fecha de vencimiento")}`);
        }
        break;
      case 3:
        let doneTasks = await this.tasksWorker.listTasks("done");
        if (doneTasks.length === 0) this.ioHandler.writeLine(chalk.bgRedBright("No hay tareas completadas"));
        for (const task of doneTasks) {
          this.ioHandler.writeLine(`${chalk.white(task.title)} -> ${chalk.greenBright("Completada el: ")} ${chalk.yellowBright(task.completedOn)}`);
        }
        break;
      case 4:
        let pendingTasks = await this.tasksWorker.listTasks("pending");
        if (pendingTasks.length === 0) this.ioHandler.writeLine(chalk.bgGreenBright("No hay tareas pendientes"));
        for (const task of pendingTasks) {
          this.ioHandler.writeLine(`${chalk.white(task.title)} -> ${chalk.redBright("Pendiente para el: ")} ${chalk.yellowBright(task.dueDate)}`);
        }
        break;
      case 5:
        tasksArray = await this.tasksWorker.loadTasks();
        tasksArray = tasksArray.filter((task) => !task.done);
        tasksArray.forEach((task) => {
          taskTitlesArray.push({
            name: `${chalk.underline.yellowBright(task.title)} -> ${task.dueDate ? task.dueDate : "Sin fecha de vencimiento"}`,
            value: task.id,
          });
        });
        tasksIDs = await this.ioHandler.ask({ type: "checkbox", message: "Selecciona la(s) tarea(s) a completar: ", choices: taskTitlesArray });
        for (const ID of tasksIDs) {
          let wasCompleted = await this.tasksWorker.completeTask(ID);
          let task = await this.tasksWorker.getTaskByID(ID);
          this.ioHandler.writeLine(`${chalk.white(task.title)} -> ${wasCompleted ? chalk.greenBright("Completada") : chalk.redBright("No se pudo completar")}`)
        }
        break;
      case 6:
        tasksArray = await this.tasksWorker.loadTasks();
        tasksArray.forEach((task) => {
          taskTitlesArray.push({
            name: `${chalk.underline.yellowBright(task.title)} -> ${task.dueDate ? task.dueDate : "Sin fecha de vencimiento"}`,
            value: task.id,
          })
        })
        tasksIDs = await this.ioHandler.ask({ type: "checkbox", message: "Selecciona la(s) tarea(s) a borrar: ", choices: taskTitlesArray });
        for (const ID of tasksIDs) {
          let task = await this.tasksWorker.getTaskByID(ID);
          let wasDeleted = await this.tasksWorker.deleteTask(ID);
          this.ioHandler.writeLine(`${chalk.white(task.title)} -> ${wasDeleted ? chalk.redBright("Eliminada") : chalk.underline.redBright("No se pudo eliminar")}`)
        }
        break;
      case 7:
        this.ioHandler.clear();
        await this.init();
        break;
    }
  };
}
let app = new App();
app.init();
