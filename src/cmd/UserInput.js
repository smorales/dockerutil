const inquirer = require('inquirer');
const Table = require('cli-table');
const Str = require('../util/Str');

class UserInput
{
	init()
	{
		return new Promise((resolve, reject) => {
			this.getChoices()
				.then(input => {
					
					this.confirmChoices(input);
					
					inquirer.prompt([{
							type: 'confirm',
							name: 'confirmed',
							message: 'Are those settings ok (just hit enter for YES)?',
							default: true,
						}])
						.then((answers) => {
							if (!answers.confirmed) {
								resolve();
							} else {
								this.normalizeInput(input);
								resolve(input);
							}
						});
					
				})
				.catch(error => {
					reject(error);
				});
		});
	}
	
	getProjectName()
	{
		let name = process.cwd().split('/');
		name = name[name.length-1];
		return Str.capitalize(Str.toSeparatedWords(name));
	}
	
	normalizeInput(input)
	{
		if(input.framework == 'Elixir/Phoenix') input.framework = 'elixir';
		else if(input.framework == 'PHP/Laravel') input.framework = 'laravel';
		
		input._usesCache = input.usesRedis == 'yes';
		input._usesDatabase = input._usesDatabase == 'yes';
		input.runMigrateOnStartup = input.runMigrateOnStartup == 'yes';
		
		if(input._usesCache)
			input.cache = "Redis";
		
		if(input._usesDatabase)
		{
			input.databasePort = input.database == 'PostgreSQL' ? '5432' : '3306';
			input.databaseConn = input.database == 'PostgreSQL' ? 'pgsql' : 'mysql';
		}
	}
	
	confirmChoices(choices)
	{
		const options = {
			style: {head: ['yellow']}
		}
		let table = new Table(options);
		
		for(let choice in choices)
		{
			if(choice.substr(0, 1) != '_') 
			{
				let value = choices[choice];
				if(typeof value == 'boolean') value = value ? 'yes' : 'no';
				
				let obj = {};
				obj[ Str.toSeparatedWords(Str.capitalize(choice)) ] = value;
				table.push(obj);
			}
		}
		
		console.log("");
		console.log("Dockerutil will initialize project with following setup:");
		console.log(table.toString());
	}
	
	getChoices()
	{
		return new Promise( (resolve, reject) => {
			inquirer
				.prompt(this.getQuestions())
				.then((answers) => {
					resolve(answers);
				})
				.catch((errors) => {
					reject(errors);
				});
		});
	}
	
	getQuestions(target)
	{
		return [
			{
				type: 'input',
				name: 'projectName',
				message: "What's the project name?",
				default: this.getProjectName(),
				validate: function (val) {
					return val != null && val.length > 0;
				},
			},
			{
				type: 'list',
				name: 'framework',
				message: "What's the project type?",
				choices: ['Elixir/Phoenix','PHP/Laravel'],
			},
			{
				type: 'confirm',
				name: 'useLatestPhoenixVersion',
				message: 'Use latest Phoenix version?',
				default: true,
				when: function(answers) { return answers.framework == 'Elixir/Phoenix'; }
			},
			{
				type: 'input',
				name: 'usePhoenixVersion',
				message: 'Which phoenix version should be used?',
				when: function(answers) { return answers.framework == 'Elixir/Phoenix' && !answers.useLatestPhoenixVersion; },
				validate: function (val) {
					const semver = require('semver');
					return semver.valid(val) != null;
				},
			},
			{
				type: 'number',
				name: 'frameworksContainerPort',
				message: 'On which port should the frameworks container be exposed?',
				default: 4000,
				when: function(answers) { return answers.framework == 'Elixir/Phoenix'; },
				validate: function (val) {
					return Number.isInteger(val) && val > 0 && val <= 65535;
				},
			},
			{
				type: 'number',
				name: 'frameworksContainerPort',
				message: 'On which port should the frameworks container be exposed?',
				default: 80,
				when: function(answers) { return answers.framework == 'PHP/Laravel'; },
				validate: function (val) {
					return Number.isInteger(val) && val > 0 && val <= 65535;
				},
			},
			{
				type: 'list',
				name: 'phpVersion',
				message: 'Which PHP version should be used?',
				choices: ['8.0', '7.4', '7.0'],
				when: function(answers) { return answers.framework == 'PHP/Laravel'; },
			},
			{
				type: 'list',
				name: 'runMigrateOnStartup',
				message: 'Run `artisan migrate` on startup?',
				choices: ['Yes', 'No'],
				when: function(answers) { return answers.framework == 'PHP/Laravel'; },
				filter: function (val) { return val.toLowerCase(); },
			},
			{
				type: 'list',
				name: '_usesDatabase',
				message: 'Project uses a database?',
				choices: ['Yes', 'No'],
				filter: function (val) { return val.toLowerCase(); },
			},
			{
				type: 'list',
				name: 'database',
				message: 'Which database?',
				choices: ['PostgreSQL', 'MySQL'],
				when: function(answers) { return answers._usesDatabase == 'yes'; }
			},
			{
				type: 'input',
				name: 'databaseName',
				message: "What's the database name?",
				when: function(answers) { return answers._usesDatabase == 'yes'; },
				default: function (answers) {
					return Str.toCase(answers.projectName, '_');
				},
			},
			{
				type: 'number',
				name: 'databaseContainerPort',
				message: 'On which port should PostgreSQLs container be exposed?',
				default: 5432,
				when: function(answers) { return answers._usesDatabase == 'yes' && answers.database == 'PostgreSQL'; },
				validate: function (val) {
					return Number.isInteger(val) && val > 0 && val <= 65535;
				},
			},
			{
				type: 'number',
				name: 'databaseContainerPort',
				message: 'On which port should MySQLs container be exposed?',
				default: 3306,
				when: function(answers) { return answers._usesDatabase == 'yes' && answers.database == 'MySQL'; },
				validate: function (val) {
					return Number.isInteger(val) && val > 0 && val <= 65535;
				},
			},
			{
				type: 'list',
				name: 'usesRedis',
				message: 'Project uses Redis?',
				choices: ['Yes', 'No'],
				filter: function (val) { return val.toLowerCase(); },
			},
			// {
			// 	type: 'list',
			// 	name: 'cache',
			// 	message: 'Which type of cache?',
			// 	choices: ['Redis', 'Memcached'],
			// 	when: function(answers) { return answers._usesCache == 'yes'; }
			// },
			{
				type: 'input',
				name: 'imageName',
				message: "What should be the image name?",
				default: function (answers) {
					return Str.toCase(answers.projectName, '-');
				},
			},
			{
				type: 'input',
				name: 'containerName',
				message: "What should be the container name?",
				default: function (answers) {
					return Str.toCase(answers.projectName, '-');
				},
			},
		];
	}
}

module.exports = new UserInput();