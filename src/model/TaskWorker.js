import JsonWorker from "./JsonWorker.js";
import crytpo from "crypto";
let jsonWorker = new JsonWorker();

class TasksWorker {
  hashCreator = (data) => {
    const hash = crytpo.createHash("sha256");
    hash.update(data);
    return hash.digest("hex");
  }
  createTask = async ({
    title = "Default Title", dueDate = undefined
  }) => {
    let task = {
      title: title,
      dueDate: dueDate,
      done: false,
      id: this.hashCreator(title),
      createdOn: new Date().toLocaleString(),
    };
    await jsonWorker.saveTask(task);
    return true;
  };
  loadTasks = async () => {
    let tasksArray = await jsonWorker.loadTasks();
    return tasksArray;
  }
  listTasks = async (by = "all") => {
    let tasksArray = await jsonWorker.loadTasks();
    if (by === "done") {
      tasksArray = tasksArray.filter((task) => {
        if (task.done) {
          return task;
        }
      });
    } else if (by === "pending") {
      tasksArray = tasksArray.filter((task) => {
        if (!task.done) {
          return task;
        }
      });
    }
    return tasksArray;
  }
  completeTask = async (taskID) => {
    let tasksArray = await jsonWorker.loadTasks();
    let found = false;
    for (const task of tasksArray) {
      if (task.id === taskID) {
        task.done = true;
        found = true;
        task.completedOn = new Date().toLocaleString();
        await jsonWorker.saveTask(task);
      }
    }
    return found;
  }
  deleteTask = async (taskID) => {
    let tasksArray = await jsonWorker.loadTasks();
    let found = false;
    for (const task of tasksArray) {
      if (task.id === taskID) {
        found = true;
        await jsonWorker.deleteTaskFromJSON(taskID);
      }
    }
    return found;
  }
  getTaskByID = async (taskID) => {
    let tasksArray = await jsonWorker.loadTasks();
    let foundTask;
    for (const task of tasksArray) {
      if (task.id === taskID) {
        foundTask = task;
        break;
      }
    }
    return foundTask;
  }
}

export default TasksWorker;
