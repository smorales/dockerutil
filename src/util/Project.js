class Project
{
	static getEnvFile(framework)
	{
		if(framework == 'laravel') return process.cwd()+'/.env';
	}
}

module.exports=Project;