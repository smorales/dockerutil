const shell = require('shelljs')
const Env = require('../Env')

class Setup
{
	getProjectEnvFile()
	{
		return process.cwd()+'/.env';
	}
	
	updateEnvFile(input)
	{
		let env = this.getProjectEnvFile();
		if(!shell.test('-f', env)) shell.touch(env)
		
		// DATABASE
		Env.setProperty(env, 'DB_HOST',`db.${input.containerName}`);
		Env.setProperty(env, 'DB_DATABASE', input.database.name);
		Env.setProperty(env, 'DB_PORT', input.database.port);
		Env.setProperty(env, 'DB_CONNECTION', input.database.connection);
		Env.setProperty(env, 'DB_USERNAME','docker');
		Env.setProperty(env, 'DB_PASSWORD','secret');
		
		// CACHE
		Env.setProperty(env, 'MEMCACHED_HOST',`cache.${input.containerName}`);
		Env.setProperty(env, 'REDIS_HOST',`cache.${input.containerName}`);
	}
}

module.exports = new Setup();