const shell = require('shelljs');
const Str = require('../util/Str');

class Config
{
	static create(input)
	{
		Config.setProperty('env', 'dev');
		Config.setProperty('PROJECT_TYPE', input.framework.short);
		Config.setProperty('PROJECT_NAME', Str.toCase(input.projectName, '_'));
		Config.setProperty('BUILD_NUM', '0.0.1');
		Config.setProperty('IMAGE_NAME', input.imageName);
		Config.setProperty('CONTAINER_NAME', input.containerName);
		
		if(input._usesDatabase) 
		{
			Config.setProperty('TEST_DATABASE_NAME', `${input.database.name}_test`);
			Config.setProperty('TEST_DATABASE_HOST', `test.db.${input.containerName}`);
			Config.setProperty('TEST_DATABASE_PORT', input.database.port);
			
			Config.setProperty('DATABASE_NAME', input.database.name);
			Config.setProperty('DATABASE_HOST', `db.${input.containerName}`);
			Config.setProperty('DATABASE_PORT', input.database.port);
			
			if(input.framework.isElixir && input.database.isPostgres)
			{
				Config.setProperty('DATABASE_USERNAME', 'postgres');
				Config.setProperty('DATABASE_PASSWORD', 'postgres');
			}
			else
			{
				Config.setProperty('DATABASE_USERNAME', 'docker');
				Config.setProperty('DATABASE_PASSWORD', 'secret');
			}
		}
		
		if(input._usesCache) Config.setProperty('CACHE_HOST', `cache.${input.containerName}`);
	}
	
	static setProperty(key, value)
	{
		Config.setConfigProperty(key, value);
		Config.setEnvProperty(key, value);
	}
	
	static setConfigProperty(key, value)
	{
		key = key.toUpperCase();
		let config = Config.getPropertiesFile();
		
		if(Config.hasKey(key))
		{
			let regExp = new RegExp(`${key}=.*`, 'g');
			shell.sed('-i', regExp, `${key}=${value}`, [config]);
		}
		else
		{
			Config.newLine(`${key}=${value}`).toEnd(config);
		}
	}
	
	static setEnvProperty(key, value)
	{
		key = 'DOCKER_UTIL_'+key.toUpperCase();
		let env = Config.getEnvFile();
		
		if(Config.hasKey(key, 'env'))
		{
			let regExp = new RegExp(`^${key}=.*`, 'g');
			shell.sed('-i', regExp, `${key}=${value}`, [env]);
		}
		else
		{
			Config.newLine(`${key}=${value}`).toEnd(env);
		}
	}
	
	static hasKey(key, file='config')
	{
		let configFile = file == 'config' ? Config.getPropertiesFile() : Config.getEnvFile();
		
		if(!shell.test('-e', configFile))
			return false;
		
		let regExp = new RegExp(`^${key}=`, 'g');
		return shell.grep(regExp, configFile).toString() != '\n';
	}
	
	static getValue(key)
	{
		key = key.toUpperCase();
		let version = shell.grep(key, Config.getPropertiesFile());
		let regExp = new RegExp(`${key}=|\n`, 'g');
		return version.replace(regExp, '');
	}
	
	static newLine(str)
	{
		return shell.ShellString(str+"\n");
	}
	
	static dockerutilDir()
	{
		return process.cwd()+'/'+Config.dockerutilDirName();
	}
	
	static dockerutilDirName()
	{
		return 'dockerutil';
	}
	
	static getVersion()
	{
		let version = shell.grep('BUILD_NUM', Config.getPropertiesFile());
		return version.replace(/BUILD_NUM=|\n/g, '');
	}
	
	static getPropertiesFile()
	{
		return Config.dockerutilDir()+'/properties.conf';
	}
	
	static getEnvFile()
	{
		return Config.dockerutilDir()+'/.env';
	}
}

module.exports = Config;