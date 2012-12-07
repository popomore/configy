# Configr

A configuration file parser supporting .properties, .ini, .ymal.

---

You can get the property value Simply.

```
configr.file('sample.properties').param('name');
// => value of the name key
```

You can specify the type for configuration file.

```
var file = configr.file('sample.properties', 'properties');
file.param('name', 'popomore');
file.param('name'); // => popomore
```

Support types, properties by default 

- properties
- ini
- ymal

```
configr.file('sample.txt', 'ini').param('user.name', 'popomore');
```

And will output

```
[user]
name = popomore
```