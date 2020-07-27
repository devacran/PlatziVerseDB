const inquirer = require("inquirer");
const args = process.argv[2];
//Para lanzar un prompt al usuario en la consola
const prompt = inquirer.createPromptModule();

async function setup(flag) {
  flag === "--y" ? true : false;
  if (!flag) {
    const answer = await prompt([
      {
        type: "confirm",
        name: "setup",
        message: "This will destroy your database, are you sure?"
      }
    ]);
    if (!answer.setup) {
      return console.log("Nothing happened :)");
    }
  }
  console.log("me ejecute asi nomas");
}
setup(args);
