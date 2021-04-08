#!/usr/bin/env node

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const path = require('path');
const program = require('commander');
const pkg = require('./package.json');
const about = require('./src/cmd/About');

program
	.helpOption('-h, --help', 'Display help for command.')
    .version(pkg.version, '-V, --version', 'Output the current dockerutil version.')
    .description(pkg.description)

program
    .command('about')
    .description('Output details about dockerutil.')
    .action(() => {
	    about.print();
    })

program
    .command('init')
    .description('Initializes a new docker project.')
    .action(() => {
	    require('./src/cmd/Setup').start();
    })

program
    .command('destroy')
    .description('Removes all related docker files.')
    .action(() => {
	    require('./src/cmd/Setup').destroy();
    })

program
    .command('ps')
    .description('List running containers.')
    .action(() => {
	    require('./src/cmd/Docker').ps()
    })

program
    .command('config')
    .description('Validate and view the Compose file')
    .action(() => {
	    require('./src/cmd/Docker').config()
    })

program
    .command('down')
    .description('Stops containers and removes containers, networks, volumes, and images created by `up`.')
	.option('--rmi <type>', 'Remove images. Type must be one of:\n' +
		'                         \'all\': Remove all images used by any service.\n' +
		'                         \'local\': Remove only images that don\'t have a\n' +
		'                         custom tag set by the `image` field.')
	.option('-v, --volumes', 'Remove named volumes declared in the `volumes`\n' +
		'                         section of the Compose file and anonymous volumes\n' +
		'                         attached to containers.')
	.option('--remove-orphans', 'Remove containers for services not defined in the\n' +
		'                         Compose file')
	.option('-t, --timeout <TIMEOUT>', 'Specify a shutdown timeout in seconds.\n' +
		'                         (default: 10)')
    .action((options, command) => {
        // inquirer.prompt(questions).then((answers) =>  actions.addContact(answers))
	    require('./src/cmd/Docker').down(options, command)
    })

program
	.command('up [target]')
	.option('-d, --detach', 'Runs the container in detached mode.')
	.option('--build', 'Build images before starting containers.')
	.option('--exit-code-from <service>', 'Return the exit code of the selected service\n' +
		'                           container. Implies --abort-on-container-exit.')
	.option('--abort-on-container-exit', 'Stops all containers if any container was\n' +
		'                           stopped. Incompatible with --detach.')
	.description('Runs the application in a given environment, e.g dev or prod.')
	.action((target, options, command) => {
		require('./src/cmd/Docker').up(target, options, command)
	})
	.addHelpText('after', `\nExamples:
  $ dockerutil up dev
  $ dockerutil up prod`
	);

program
	.command('test')
	.option('-v, --remove-volumes', 'Removes volumes after finishing tests.')
	.description('Runs the tests.')
	.action((options) => {
		require('./src/cmd/Docker').test(options)
	})
	.addHelpText('after', `\nExamples:
  $ dockerutil test`
	);

program
	.command("version [release-type]")
	.option('-u, --update <version>', 'Updates the build number to the given version.')
	.option('-s, --silent', 'Runs in silent mode.')
	.description('Shows or updates the build number.')
	.action((releaseType, options) => {
		require('./src/cmd/Version').version(releaseType, options);
	})
	.addHelpText('after', `\nExamples:
  $ dockerutil version          # show the current version
  $ dockerutil version patch    # increments the patch number by one
  $ dockerutil version -u 1.2.3 # set the version to \`1.2.3\`
  `
	);

program.parse(process.argv)