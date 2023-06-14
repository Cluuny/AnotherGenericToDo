import inquirer from "inquirer";
import DatePrompt from "inquirer-date-prompt";
import readline from "readline";

inquirer.registerPrompt("date", DatePrompt);
class IOHandler {
  ask = async ({
    type = "input", message = "Default Message", choices = []
  }) => {
    let question = {
      type: type,
      name: "response",
      message: message,
      choices: choices,
      format: { month: "short", hour: undefined, minute: undefined },
    };
    let option = await inquirer.prompt(question);
    return option.response;
  };

  writeLine = (prompt) => {
    console.log(prompt);
  };
  pause = (prompt) => {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question(prompt, (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  };
  clear = () => {
    console.clear();
  }
}

export default IOHandler;
