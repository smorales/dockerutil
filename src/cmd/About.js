const chalk = require('chalk');
const figlet = require('figlet');
const pkg = require('../../package.json');

class About
{
	version()
	{
		console.log(
			chalk.red(
				figlet.textSync('dockerutil', { horizontalLayout: 'full' })
			)
		);
		console.log("v", pkg.version);
		console.log(pkg.description);
		console.log("by", chalk.yellow(pkg.author.name));
	}
	
	print()
	{
		this.version();
	}
}

module.exports = new About();