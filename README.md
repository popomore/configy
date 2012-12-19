# Configy

A configuration file parser supporting properties, ini, ymal.

---

You can get the property simply.

```
configy.file('sample.properties').get('name');
// => value of the name key
```

You can specify the type for configuration file.

```
var file = configy.file('sample.properties', 'properties');
file.set('name', 'popomore');
file.get('name'); // => popomore
```

Support types, properties by default 

- properties
- ini
- ymal(TODO)

Ini support section, you can

```
configy.file('sample.txt', 'ini').set('user.name', 'popomore');
```

And sample.txt will output

```
[user]
name = popomore
```

## API

### .file(file, type)

Read file and return a parser. You can use getter/setter, it will sync the file.

### .parse(str, type)

You can parse string to json。

```
var data = fs.readFileSync('sample.properties');
configy.parse(data.toString());
```

## LISENCE

MIT