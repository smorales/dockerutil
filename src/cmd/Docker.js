const shell = require('shelljs');
const chalk = require('chalk');
const Project = require('../util/Project')
const Config = require('./Config')

class Docker {
	
	ps()
	{
		shell.exec('docker ps');
	}
	
	config()
	{
		shell.cd(Config.dockerutilDir());
		shell.exec('docker-compose config ');
	}
	
	test(options)
	{
		// let env = Config.dockerutilDir()+'/.env';
		// shell.sed('-i', /.*ENV=.*/g, `ENV=test`, env);
		
		Config.setEnvProperty('env', 'test');
		shell.cd(Config.dockerutilDir());
		
		let child = shell.exec('docker-compose up --build --exit-code-from test test');
		
		let removeVolumes = options.removeVolumes ? '-v' : ''
		shell.exec(`docker-compose down ${removeVolumes}`);
		
		process.exit(child.code);
	}
	
	down(options)
	{
		shell.cd(Config.dockerutilDir());
		shell.exec('docker-compose down '+this.getArgs());
	}
	
	up(target, options)
	{
		// if(!['dev', 'prod'].includes(target))
		// {
		// 	console.error(chalk.yellow('Invalid argument: '), chalk.red(target));
		// 	console.error(chalk.yellow('Valid values are'), chalk.green('dev'), chalk.yellow('or'), chalk.green('prod')+chalk.yellow('.'));
		// 	process.exit(1);
		// }
		
		// let env = process.cwd()+'/docker/.env';
		// shell.sed('-i', /.*ENV=.*/g, `ENV=${target}`, env);
		// shell.cd(Config.dockerutilDir());
		Config.setEnvProperty('env', target);
		
		shell.cd(Config.dockerutilDir());
		shell.exec('docker-compose up '+this.getArgs());
	}
	
	getArgs()
	{
		let args = '';
		for (let i = 3; i < process.argv.length; i++) {
			args += ' ' + process.argv[i];
		}
		return args;
	}
}

module.exports = new Docker();