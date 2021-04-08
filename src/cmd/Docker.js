const shell = require('shelljs');
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
		Config.setEnvProperty('env', 'test');
		shell.cd(Config.dockerutilDir());
		let projectName = Config.getValue('PROJECT_NAME');
		
		let child = shell.exec(`docker-compose -p test_${projectName} up --build --exit-code-from test test`);
		
		let removeVolumes = options.removeVolumes ? '-v' : ''
		shell.exec(`docker-compose -p test_${projectName} down ${removeVolumes}`);
		
		process.exit(child.code);
	}
	
	down(options, command)
	{
		let projectName = Config.getValue('PROJECT_NAME');
		shell.cd(Config.dockerutilDir());
		shell.exec(this.buildCommand(command, projectName));
	}
	
	up(target, options, command)
	{
		if(!target) target = 'dev';
		
		let projectName = Config.getValue('PROJECT_NAME');
		let cmd = this.buildCommand(command, projectName, target);
		
		Config.setEnvProperty('env', target);
		shell.cd(Config.dockerutilDir());
		
		shell.exec(cmd, {async:true});
		process.on('SIGINT', () =>
		{
			shell.exec(`docker-compose -p ${projectName} down`);
		})
	}
	
	buildCommand(command, projectName, appendix = '')
	{
		return `docker-compose -p ${projectName} `+command.parent.args.join(' ')+' '+appendix;
	}
	
}

module.exports = new Docker();