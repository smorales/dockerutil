const chalk = require('chalk');
const shell = require('shelljs');
const semver = require('semver');
const Config = require('./Config')

class Version
{
	version(releaseType, options)
	{
		if(releaseType)
		{
			let version = this.getVersion();
			version = semver.inc(version, releaseType);
			this.updateTo(version, options);
		}
		else if(!options.update) 
		{
			console.log(this.getVersion());
			return;
		}
		else if(semver.valid(options.update))
		{
			this.updateTo(options.update, options);
		}
		else
		{
			console.log(chalk.red("Error: Invalid semver format"));
		}
	}
	
	getVersion()
	{
		return Config.getValue('BUILD_NUM');
	}
	
	updateTo(version, options)
	{
		Config.setProperty('build_num', version);
		if(!options.silent) console.log(`Version updated to: ${chalk.yellow(version)}`);
	}
}

module.exports = new Version();