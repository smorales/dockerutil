class Str
{
	static capitalize(name)
	{
		return name.replace(/\b\w/g, l => l.toUpperCase());
		// return name
		// 	.replace(/([a-z])([A-Z])/g, '$1 $2')
		// 	.charAt(0)
		// 	.toUpperCase() + name.slice(1);
	}
	
	static toSeparatedWords(name)
	{
		name = name.replace(/[_\-\+]/g, ' ');
		return name.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
	}
	
	static toCase(input, join)
	{
		return input
			.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
			.map(x=>x.toLowerCase())
			.join(join)
	}
}

module.exports= Str;