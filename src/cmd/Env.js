const shell = require('shelljs');

module.exports = class Env
{
	static setProperty(file, key, value)
	{
		key = key.toUpperCase();
		
		if(Env.hasKey(file, key))
		{
			let regExp = new RegExp(`${key}=.*`, 'g');
			shell.sed('-i', regExp, `${key}=${value}`, [file]);
		}
		else
		{
			Env.newLine(`${key}=${value}`).toEnd(file);
		}
	}
	
	static newLine(str)
	{
		return shell.ShellString(str+"\n");
	}
	
	static hasKey(file, key)
	{
		if(!shell.test('-e', file))
			return false;
		
		return shell.grep(key+'=', file).toString() != '\n';
	}
}