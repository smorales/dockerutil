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
		
		let removeVolumes = options.removeVolumes ? '-v' : ''
		let imageName = Config.getValue('IMAGE_NAME');
		
		shell.cd(Config.dockerutilDir());
		let child = shell.exec(`docker-compose -p test_${imageName} up --build --exit-code-from test test`);
		
		shell.exec(`docker-compose -p test_${imageName} down ${removeVolumes}`);
		
		process.exit(child.code);
	}
	
	down(options, command)
	{
		let imageName = Config.getValue('IMAGE_NAME');
		shell.cd(Config.dockerutilDir());
		shell.exec(this.buildCommand(command, imageName));
	}
	
	up(target, options, command)
	{
		if(!target) target = 'dev';
		else command.parent.args.pop();
		
		let imageName = Config.getValue('IMAGE_NAME');
		let cmd = this.buildCommand(command, imageName, target);
		
		Config.setEnvProperty('env', target);
		
		shell.cd(Config.dockerutilDir());
		shell.exec(cmd, {async:true});
		
		if(!options.detach)
		{
			process.on('SIGINT', () =>
			{
				let rmVolumes = options.removeVolumes ? '-v' : '';
				shell.exec(`docker-compose -p ${imageName} down ${rmVolumes}`);
			})
		}
	}
	
	buildCommand(command, imageName, appendix = '')
	{
		command.parent.args = command.parent.args.filter(flag => {
			if(flag == '-rm' || flag == '--remove-volumes')
				return false
			return true;
		});
		return `docker-compose -p ${imageName} `+command.parent.args.join(' ')+' '+appendix;
	}
	
}

module.exports = new Docker();