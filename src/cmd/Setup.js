const chalk = require('chalk');
const figlet = require('figlet');
const pkg = require('../../package.json');
const shell = require('shelljs');
const inquirer = require('inquirer');
const userInput = require('./UserInput');
const ora = require('ora');
const Str = require('../util/Str');
const Config = require('./Config');


class Setup
{
	destroy()
	{
		shell.rm('-rf', Config.dockerutilDir());
	}
	
	start()
	{
		let test = false;
		
		if(test)
		{
			let input = { 
				projectName: 'Laravel Test',
				framework: { 
					name: 'PHP/Laravel',
					isLaravel: true,
					isLumen: false,
					isElixir: false 
				},
				phpVersion: '8.0',
				_usesDatabase: false,
				database: { 
					type: 'PostgreSQL',
					port: 5432,
					connection: 'pgsql',
					isPostgres: true,
					isMysql: false,
					name: 'laravel_test' 
				},
				_usesCache: true,
				cache: 'Redis',
				imageName: 'laravel-test',
				containerName: 'laravel-test',
				runMigrateOnStartup: true
			}
			
			this.destroy();
			this.init(input);
		}
		else
		{
			if(shell.test('-d', Config.dockerutilDir()))
			{
				console.error( chalk.red('Seems like that there is already a folder named `dockerutil`.') );
				console.error( chalk.red('Rename the folder or run `dockerutil destroy` first if you want to start over.') );
				process.exit(1);
			}
			
			userInput.init()
				.then(input => input ? this.init(input) : this.start())
				.catch(error => {});
		}
		
	}
	
	init(input)
	{
		let funcs = [
			this.copyTemplateFiles, 
			this.updateConfigurationFiles, 
			this.updateProjectEnvironmentFile, 
			this.setFrameworksContainerPort,
			this.setDatabaseConfigs,
			this.setCacheConfigs, 
			this.updateDockerComposeFileProperties, 
			this.updateDockerfileProperties, 
			this.cleanUpComposerFile, 
		];
		this.runNextFunction(funcs, input);
	}
	
	runNextFunction(funcs, input, spinner=null)
	{
		let fn = funcs.shift();
		let description = Str.capitalize(Str.toSeparatedWords(fn.name));
		if(!spinner) spinner =  ora();
		spinner.start(description);
		fn.apply(this, [input]);
		
		setTimeout(()=>{
			spinner.succeed();
			if(funcs.length > 0) this.runNextFunction(funcs, input, spinner);
		}, 300);
		
	}
	
	cleanUpComposerFile()
	{
		let file = shell.cat(this.getDockerComposeFile());
		let newContent = file.replace(/^\s*[\r\n]/gm, '');
		shell.ShellString(newContent).to(this.getDockerComposeFile());
	}
	
	getDockerComposeFile()
	{
		return Config.dockerutilDir()+'/docker-compose.yml';
	}
	
	updateDockerComposeFileProperties(input)
	{
		let composeFile = this.getDockerComposeFile();
		shell.sed('-i', /__DOCKER_UTIL_DIR__/g, Config.dockerutilDirName(), composeFile);
	}
	
	updateDockerfileProperties(input)
	{
		let dockerDir = Config.dockerutilDir();
		let baseImage = this.getBaseImage(input);
		let devDockerfile = dockerDir+'/dev/Dockerfile';
		let prodDockerfile = dockerDir+'/prod/Dockerfile';
		let testDockerfile = dockerDir+'/test/Dockerfile';
		shell.sed('-i', /.*__BASE_IMAGE__.*/g, baseImage, [devDockerfile, prodDockerfile, testDockerfile]);
		shell.sed('-i', /__RUN_MIGRATE_ON_STARTUP__/g, input.runMigrateOnStartup ? 1 : 0, [devDockerfile, prodDockerfile]);
		
		let phoenixVersion = input.usePhoenixVersion ? input.usePhoenixVersion : '';
		shell.sed('-i', /__PHOENIX_VERSION__/g, phoenixVersion, [devDockerfile, prodDockerfile, testDockerfile]);
		shell.sed('-i', /__DOCKER_UTIL_DIR__/g, Config.dockerutilDirName(), [devDockerfile, prodDockerfile, testDockerfile]);
	}
	
	getBaseImage(input)
	{
		if(input.framework.isElixir) 
		{
			return 'FROM elixir:alpine';
		}
		else if(input.framework.isLaravel) 
		{
			return 'FROM catskillet/laravel-webstack:'+input.phpVersion;
		}
		
		console.error("Couldn't set docker base image.");
		process.exit(1);
	}
	
	setFrameworksContainerPort(input)
	{
		let composeFile = this.getDockerComposeFile();
		shell.sed('-i', /__FRAMEWORK_CONTAINER_PORT__/g, input.frameworksContainerPort, composeFile);
	}
	
	setDatabaseConfigs(input)
	{
		let composeFile = this.getDockerComposeFile();
		if(input._usesDatabase)
		{
			let template = shell.cat(__dirname+'/../templates/db/'+input.database.type.toLowerCase()+'.yml');
			let templateTest = shell.cat(__dirname+'/../templates/db/'+input.database.type.toLowerCase()+'_test.yml');
			let dependsOnDB = shell.cat(__dirname+'/../templates/db/depends-on.yml');
			let dependsOnTestDB = shell.cat(__dirname+'/../templates/db/depends-on-test.yml');
			shell.sed('-i', /.*__DB_TEMPLATE__.*/g, template, composeFile);
			shell.sed('-i', /.*__TEST_DB_TEMPLATE__.*/g, templateTest, composeFile);
			shell.sed('-i', /.*__depends_on_db__.*/g, dependsOnDB, composeFile);
			shell.sed('-i', /.*__depends_on_test_db__.*/g, dependsOnTestDB, composeFile);
			shell.sed('-i', /__db_name__/g, input.database.name, composeFile);
			shell.sed('-i', /__DATABASE_CONTAINER_PORT__/g, input.database.port, composeFile);
			shell.sed('-i', /__TEST_DATABASE_CONTAINER_PORT__/g, input.database.port, composeFile);
		}
		else
		{
			shell.sed('-i', /.*__DB_TEMPLATE__.*/g, '', composeFile);
			shell.sed('-i', /.*__TEST_DB_TEMPLATE__.*/g, '', composeFile);
			shell.sed('-i', /.*__depends_on_db__.*/g, '', composeFile);
			shell.sed('-i', /.*__depends_on_test_db__.*/g, '', composeFile);
		}
	}
	
	setCacheConfigs(input)
	{
		let composeFile = this.getDockerComposeFile();
		if(input._usesCache)
		{
			let template = shell.cat(__dirname+'/../templates/cache/'+input.cache.toLowerCase()+'.yml');
			let dependsOn = shell.cat(__dirname+'/../templates/cache/depends-on.yml');
			shell.sed('-i', /.*__CACHE_TEMPLATE__.*/g, template, composeFile);
			shell.sed('-i', /.*__depends_on_cache__.*/g, dependsOn, composeFile);
		}
		else
		{
			shell.sed('-i', /.*__CACHE_TEMPLATE__.*/g, '', composeFile);
			shell.sed('-i', /.*__depends_on_cache__.*/g, '', composeFile);
		}
		
		if(!input._usesCache && !input._usesDatabase)
		{
			shell.sed('-i', /.*depends_on:.*/g, '', composeFile);
		}
	}
	
	copyTemplateFiles(input)
	{
		try
		{
			let source = __dirname+'/../templates/'+input.framework.short+'/*';
			let destination = Config.dockerutilDir()+'/';
			shell.mkdir('-p', destination);
			shell.cp('-uR', source, destination);
		}
		catch (e)
		{
			console.error(e);
		}
	}
	
	updateConfigurationFiles(input)
	{
		Config.create(input);
	}
	
	updateProjectEnvironmentFile(input)
	{
		require(`./${input.framework.short}/Setup`).updateEnvFile(input);
	}
	
	
}

module.exports = new Setup();