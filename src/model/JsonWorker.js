import { promises as fs } from "fs";

class JsonWorker {
  loadTasks = async () => {
    try {
      let data = await fs.readFile("./../data/tasks.json", "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return error;
    }
  };
  saveTask = async (taskToUpdate) => {
    try {
      let tasksArray = await this.loadTasks();
      let taskExists = false;
      for (const task of tasksArray) {
        if (task.id === taskToUpdate.id) {
          taskExists = true;
          let taskIndex = tasksArray.indexOf(task);
          tasksArray[taskIndex] = taskToUpdate;
        }
      }
      if (!taskExists) {
        tasksArray.push(taskToUpdate);
      }
      await fs.writeFile("./../data/tasks.json", JSON.stringify(tasksArray));
      return true;
    } catch (error) {
      return error;
    }
  }
  deleteTaskFromJSON = async (taskID) => {
    try {
      let tasksArray = await this.loadTasks();
      let taskIndex = tasksArray.findIndex((task) => task.id === taskID);
      tasksArray.splice(taskIndex, 1);
      await fs.writeFile("./../data/tasks.json", JSON.stringify(tasksArray));
      return true;
    } catch (error) {
      return error;
    }
  }
}

export default JsonWorker;
