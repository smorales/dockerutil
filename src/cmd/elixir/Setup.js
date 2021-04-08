const shell = require('shelljs')

class Setup
{
	getProjectEnvFile()
	{
		return process.cwd()+'/environment.env';
	}
	
	updateEnvFile(input)
	{
		let env = this.getProjectEnvFile();
		
		if(shell.test('-f', env)) 
		{
			// DATABASE
			shell.sed('-i', /DB_HOST=.*/g, `DB_HOST=db.${input.containerName}`, env);
			shell.sed('-i', /DB_DATABASE=.*/g, `DB_DATABASE=${input.databaseName}`, env);
			shell.sed('-i', /DB_PORT=.*/g, `DB_PORT=${input.databasePort}`, env);
			shell.sed('-i', /DB_CONNECTION=.*/g, `DB_CONNECTION=${input.databaseConn}`, env);
			shell.sed('-i', /DB_USERNAME=.*/g, 'DB_USERNAME=docker', env);
			shell.sed('-i', /DB_PASSWORD=.*/g, 'DB_PASSWORD=secret', env);
			
			// CACHE
			shell.sed('-i', /MEMCACHED_HOST=.*/g, `MEMCACHED_HOST=cache.${input.containerName}`, env);
			shell.sed('-i', /REDIS_HOST=.*/g, `REDIS_HOST=cache.${input.containerName}`, env);
		}
	}
}

module.exports = new Setup();